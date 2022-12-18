/** 
 * Requiring express, bcrypt, & xss (don't forget to use it when passing input into the database!), 
 * and initializing the express router. 
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const xss = require('xss');
const data = require('../data');
const helpers = require('../helpers');
const { addFavorite } = require('../data/users');
const { ObjectId } = require('mongodb');
const userData = data.users;
const postData = data.posts;
/** Include any helper functions here. */

/**
 * List of potential routes (based on lecture code and project proposal):
 * GET / (takes us to the landing page; can have additional queries, like "?page=3")
 * GET /about (takes us to the "About" page)
 * GET /listings (takes us to the "Listings" page)
 * GET /listings/:postId (takes us to the "Individual Listing" page for the given post)
 * GET /account (takes us to the "Account Management" page)
 * GET /account/listings (takes us to the "My Listings" page)
 * GET /account/listings/:postId (takes us to the individual post under the "My Listings" page)
 * GET /login (takes us to the "Sign In" page [should redirect the user to landing page if they're 
 *             already signed in])
 * GET /register (takes us to the "Sign Up" page [should redirect the user to landing page if 
 *                they're already signed in])
 * GET /logout (deletes the cookie and takes us to the "Logout" page)
 * GET /admin (if logged in, redirects you to the listings route; else, you're not logged in, it 
 *             should redirect you to the login page)
 * 
 * NOTE: If we move forward with the moderation features, then the above route should be an admin 
 * login page, which can lead to more routes (e.g., ones for deleting posts or removing users).
 * 
 * GET /admin/listings (takes us to the main "Admin Management" [or "Moderation"] page)
 * GET /admin/listings/:postId (takes us to the individual post [+ some basic widgets for 
 *                              confirming the post and buttons for approval/denial] under the 
 *                              "Admin Management" page)
 * POST /listings (tries to create a new post with the given user info [should return an updated 
 *                 list of posts for additional ajax functionality])
 * POST /account/listings (tries to create a new post with the given user info [should return an 
 *                         updated list of posts for additional ajax functionality])
 * POST /login (tries to login with the given user info)
 * POST /register (tries to register with the given user info)
 * POST /favorite/:postId (favorites the given post)
 * POST /review/:postId (adds a review to the given post)
 * POST /comment/:postId (comments on the given post)
 * POST /admin/listings/:postId (either changes status to "accepted"/"denied" for the given post)
 * PUT /account (updates the phone number/email address/username/password)
*/

/** 
 * "GET /": 
 *   Takes us to the landing page.
 */
router.get('/', async (req, res) => {
    // If there is the user logged in, then enable them to logout.
    const loggedIn = typeof req.session.user !== 'undefined'; //reviewLater

    /** 
     * Insert code that, if the user is logged in, determines whether the user is an admin or not 
     * here. - Chance 
     */
    let isAdmin = false;
    if (loggedIn){
        isAdmin = req.session.user['isAdmin'];
        if (isAdmin) res.redirect('/admin')
    } 
    const allKeywords = [];
    // Render the landing page, with an "About" section and the 5 most recent postings.
    /** Insert the code for obtaining the 5 most recent postings here. 
     *  Use a function to get all of the postings, probably add it in mongoDB - Chance
     *  Then get the most recent five by checking their dates and comparing them - Nick 
    */
    try{
        let currentList = await postData.getAllPosts();
        currentList.sort(helpers.compareNumbers)
        currentList = await postData.getPostsByIndex(0, 5, currentList);
        res.render('pages/homeInfo', {
            scripts: ['/public/js/listings.js', '/public/js/pagination.js'],
            context: {
                posts: currentList,
                allKeywords: allKeywords,
                loggedIn: loggedIn,
                trunc: true,
                isAdmin: isAdmin,
                isHome: true
            }
        })
    } catch (e) {
        res.render('pages/homeInfo', {
            scripts: ['/public/js/listings.js', '/public/js/pagination.js'],
            context: {
                allKeywords: allKeywords,
                loggedIn: loggedIn,
                trunc: true,
                isAdmin: isAdmin,
                isHome: true,
                error: true,
                errors: ["Internal Server Error.", e]
            }
        })
    }
});

/**
 * "GET /about": 
 *   Takes us to the "About" page.
 */
// Feel free to change this however you see fit. - Chance
router.get('/about', async (req, res) => {
    /** 
     * Insert code that, if the user is logged in, determines whether the user is an admin or not 
     * here. - Chance 
     * Added the code as requested - Nick
     */
    let loggedIn = false;
    let isAdmin = false;
    if (req.session.user) {
        loggedIn = true;
        if (req.session.user.isAdmin === true) isAdmin = true;
    }
    res.render('pages/about', {
        context: {
            noPagination: true,
            loggedIn: loggedIn, 
            isAdmin: isAdmin 
        }
    });
});

/**
 * "GET /login":
 *   Takes us to the "Sign In" page;
 *   Should redirect the user to landing page if they're already signed in.
 * "POST /login": 
 *   Tries to login with the given user info.
 */
router
    .route('/login')
    .get(async (req, res) => {
        if (req.session.user) res.redirect('/'); 
        else res.render('pages/userLogin', {
            scripts: ['/public/js/userLogin.js'],
            context: {
                noPagination: true
            }
        });
    })
    .post(async (req, res) => {
        /** 
         * This function is pretty much free for the taking. If logging in throws any errors, render 
         * the page again with an object of 'error: true' and 'errors: <array of error strings>', 
         * and with a HTTP 400 (or 500 if it's likely a server/db error) status code. I guess if 
         * you're confused by what any of this means, you can look at the "PUT /account" route for 
         * reference. - Chance
         */
        //uncomment when ready reviewLater - Nick
        //req.body = xss(req.body);
        if (req.session.user) res.redirect('/');
        let errors = [];
        let emailInput = xss(req.body.emailInput);
        let passwordInput = xss(req.body.passwordInput);
        if (!emailInput || !passwordInput) errors.push("Email or password not provided.")
        else if (typeof emailInput !== "string" || typeof passwordInput !== "string") errors.push("Email or password is not a string.");
        if (typeof emailInput === "string" && typeof passwordInput === "string") {
            emailInput = emailInput.trim();
            emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; //Sourced from https://www.w3resource.com/javascript/form/email-validation.php for the regular expression -Nicholas Mule 
            if (emailInput.length === 0) errors.push( "Error: Email cannot be only whitespace.");
            if (!emailFormat.test(emailInput)) errors.push("Email is invalid format.");
            passwordInput = passwordInput.trim();
            if (passwordInput === "") errors.push("Error: Password cannot be only whitespace.")
            if (helpers.containsSpace(passwordInput)) errors.push( "Error: Password cannot contain a whitespace within.");
            if (passwordInput.length < 6) errors.push("Error: Password must be atleast 6 characters aside from bordering whitespace.");
            if (!helpers.containsUpper(passwordInput)) errors.push( "Error: Password must contain atleast one uppercase character.");
            if (!helpers.containsNum(passwordInput)) errors.push( "Error: Password must contain atleast one number.");
            if (!helpers.containsSpec(passwordInput) && !helpers.containsPunct(passwordInput)) errors.push( "Error: Password must contain atleast one special character.");
        }
        if (errors.length > 0) { //Login does not show this even if it occurs, not sure why. Might have to do with js script? - Nick
            res.status(400).render('pages/userLogin', {
                scripts: ['/public/js/userLogin.js'],
                context: { 
                    noPagination: true,
                    error: true,
                    errors: errors
                }
            });
            return;
        }
        
        let theUser = undefined;
        try {
            theUser = await userData.checkUser(emailInput, passwordInput); 
        }
        catch (e){ 
            errors.push(e); //This block is to catch the error of 'Either invalid password or username'
        } //theUser is now a whole user object after this part
        
        if (errors.length > 0) {
            res.status(400).render('pages/userLogin', {
                scripts: ['/public/js/userLogin.js'],
                context: { 
                    noPagination: true,
                    error: true,
                    errors: errors
                }
            });
            return;
        }

        else if (typeof theUser !== 'undefined'){
            req.session.user = theUser;
            res.redirect('/'); //Redirect to homepage if successfully logged in
        }

    });

/**
 * "GET /register": 
 *   Takes us to the "Sign Up" page;
 *   Should redirect the user to landing page if they're already signed in.
 * "POST /register": 
 *   Tries to register with the given user info.
 */
router
    .route('/register')
    .get(async (req, res) => {
        if (req.session.user) res.redirect('/listings')

        res.render('pages/userRegister', {
            scripts: ['/public/js/userRegister.js'],
            context: {
                noPagination: true
            }
        });
    })
    .post(async (req, res) => {
        if (req.session.user) {
            res.status(403).render('pages/userRegister', {
                scripts: ['/public/js/userRegister.js'],
                context: { 
                    noPagination: true,
                    error: true,
                    errors: ["You cannot register while logged in."]
                    }
                });
                return;
        }

        let errors = [];
        let firstName = req.body.firstInput
        let lastName = req.body.lastInput
        let username = req.body.usernameInput
        let password = req.body.passwordInput
        let email = req.body.emailInput
        //Error checking
        if(!firstName || !lastName || !email || !username || !password){
            errors.push( "to sign up need a first name, last name, email address, username, and password");
        }
        else if (typeof firstName!='string' || typeof lastName!='string' || typeof email!='string' ||
        typeof username!='string' || typeof password!='string'){
            errors.push( "inputs are not valid strings");
        }
        else{
            firstName.trim();
            lastName.trim();
            email.trim();
            username.trim();
            password.trim();
        } if (typeof firstName==='string' && typeof lastName==='string' && typeof email==='string' &&
        typeof username==='string' && typeof password==='string'){
            if (firstName.length === 0 || lastName.length === 0 || email.length === 0 || username.length === 0 || password.length === 0) errors.push("An element cannot be only whitespace.")
            if(firstName.length<3 || lastName.length<3){
                errors.push( "first name or last name are too short");
            }
            if(helpers.containsNum(firstName) || helpers.containsNum(lastName)){
                errors.push( "first name and last name cannot contain numbers");
            }
            const at = email.indexOf('@');
            if(at ==-1){
                errors.push( "not a proper email");
            }
            if(!email.includes('.', at)){
                errors.push( "not a proper email");
            }
            //username length of 5, no special characters only letters and numbers
            if(username.length<5 || helpers.containsSpec(username)){
                errors.push( "not a valid username");
            }
            let checker = await userData.checkForUser(username);
            if(checker){
                errors.push( "username already exists");
            }
            let checker2 = await userData.checkForEmail(email);
            if (checker2) errors.push("Email already in use")
            if(password.length<5){
                errors.push( "password is too short");
            }
            if(!(helpers.containsNum(password) || helpers.containsUpper(password) || 
            helpers.containsSpec(password)) || helpers.containsSpace(password)){
                errors.push( "password needs a number, special character, and uppercase with no spaces")
            }
        }
        if (errors.length > 0) { //Similar to login, error page is not shown for registration if there is an error reviewLater
            res.status(400).render('pages/userRegister', {
            scripts: ['/public/js/userRegister.js'],
            context: { 
                noPagination: true,
                error: true,
                errors: errors
                }
            });
            return;
        }
    

        try {
            const newUser = await userData.createUser(firstName, lastName, email, username, password);
            if (newUser['firstName'] === firstName) {
                res.redirect('/login'); 
            }
            else {
                errors.push("Internal Server Error");
                res.status(500).render('pages/userRegister', {
                    scripts: ['/public/js/userRegister.js'],
                    context: { 
                        noPagination: true,
                        error: true,
                        errors: errors
                        }
                    });
                    return;
            }
        } catch (e) {
            errors.push(e); 
            res.status(400).render('pages/userRegister', {
                scripts: ['/public/js/userRegister.js'],
                context: { 
                    noPagination: true,
                    error: true,
                    errors: errors
                    }
                });
                return;
        }
    });

/**
 * "GET /logout": 
 *   Deletes the cookie and takes us to the "Logout" page.
 */
router.get('/logout', async (req, res) => {
    if (req.session.user){
        req.session.destroy();
        res.render('pages/userLogout', {
            context: {
                noPagination: true
            }
        });
        return;
    }
    else{
        res.status(404).render('pages/soloListing', { //userLogout wouldnt display the message, and this does basically the same thing
            scripts: ['/public/js/soloListing.js'],
            context: {
                loggedIn: false,
                isAdmin: false,
                noPagination: true,
                error: true,
                errors: ["You must be logged in to log out."]
            }
        });
        return;
    }
});

/**
 * The following routes are POST actions triggered by event listeners from the page that either 
 * update the database (the ':postId' routes) or query the database based on the given keyword 
 * (the ':keyword' route).
 */

/**
 * "POST /favorite/:postId": 
 *   Favorites the given post.
 */
router.post('/favorite/:postId', async (req, res) => {
    let postId = req.params.postId; //use just favorite()
    /** 
     * Insert the code that appends the ObjectId (MongoDB) of the post to the user's list of 
     * favorites here.
     */
    /** 
     * This function is pretty much free for the taking. It's mostly just MongoDB. - Chance
     */
    //reviewLater nick
    let loggedIn = false;
    let isAdmin = false;
    if (req.session.user){
        loggedIn = true;
        if (req.session.user.isAdmin === true) isAdmin = true;
    }
    else{
        res.status(403).render('pages/soloListing', { //Maybe to the post's page?
            scripts: ['/public/js/soloListing.js'],
            context: { 
                error: true,
                errors: ["You must be logged in to favorite a post"],
                noPagination: true,
                LoggedIn: loggedIn,
                isAdmin: isAdmin
                }
            });
            return;
    }

    const userId = req.session.user['_id']; 
    let errors = [];

    if (!postId) errors.push("No postId given");
    else if (typeof postId !== "string") errors.push("PostId must be a string.")
    else {
        postId = postId.trim();
        if (postId.length === 0) errors.push("postId cannot be only whitespace");
        else if (!ObjectId.isValid(postId)) errors.push("Must be a valid postId");
    }

    if (errors.length > 0) { 
        res.status(400).render('pages/soloListing', {
        scripts: ['/public/js/soloListing.js'],
        context: { 
            error: true,
            errors: errors,
            noPagination: true,
            loggedIn: loggedIn,
            isAdmin: isAdmin
            }
        });
        return;
    }

    try{
        const result = await userData.favorite(userId, postId)
        if (result['favoriteInserted'] !== true){
            res.status(500).render('pages/soloListing', { //Maybe to the post's page?
                scripts: ['/public/js/soloListing.js'],
                context: { 
                    error: true,
                    errors: ["Internal Server Error"],
                    noPagination: true,
                    LoggedIn: loggedIn,
                    isAdmin: isAdmin
                    }
                });
                return;
        }
    } catch (e){
        errors.push(e);
        res.status(400).render('pages/soloListing', { //Maybe to the post's page?
            scripts: ['/public/js/soloListing.js'],
            context: { 
                error: true,
                errors: errors,
                noPagination: true,
                LoggedIn: loggedIn,
                isAdmin: isAdmin
                }
            });
            return;
        return;
    }
    
    res.redirect('/listings')
});

/**
 * "POST /review/:postId": 
 *   Adds a review to the given post.
 */
router.post('/review/:postId', async (req, res) => {  
    let postID = req.params.postId;
    /** 
     * Insert the code that updates the user's collection of reviews here.
     */
    /** 
     * This function is pretty much free for the taking. It's mostly just MongoDB. - Chance
     */
    //reviewLater nick
    let loggedIn = false;
    let isAdmin = false;
    if (req.session.user){
        loggedIn = true;
        if (req.session.user.isAdmin === true) isAdmin = true;
    }
    else{
        res.status(403).render('pages/soloListing', { //Maybe to the post's page?
            scripts: ['/public/js/soloListing.js'],
            context: { 
                error: true,
                errors: ["You must be logged in to rate a post"],
                noPagination: true,
                LoggedIn: loggedIn,
                isAdmin: isAdmin
                }
            });
            return;
    }

    const userId = req.session.user['_id'];
    let errors = [];
    let username = req.session.user.username;
    let comment = req.body['review-textarea'];
    let rating = req.body['review-rating'];
    rating = parseInt(rating);
    

    if(!postID || !username || !comment || !rating){
        errors.push( "missing info for review");
    }
    else if(typeof postID!='string' || typeof username!='string' || 
    typeof comment!='string' || typeof rating!='number'){
        errors.push( "type of info is wrong for review");
    }
    else {
        postID.trim();
        username.trim();
        comment.trim();
    }
    if (typeof postID ==='string' && typeof username ==='string' && 
    typeof comment ==='string' && typeof rating ==='number'){
        if(postID=='' || username=='' || comment==''){
            errors.push( "postid, username, or comment is empty");
        }
        if(rating<1 || rating>5){
            errors.push( "rating needs to be 1-5");
        }
        if(!ObjectId.isValid(postID)){
            errors.push( "not valid post id");
        }
    }

    if (errors.length > 0) { 
        res.status(400).render('pages/soloListing', {
        scripts: ['/public/js/soloListing.js'],
        context: { 
            error: true,
            errors: errors,
            noPagination: true,
            loggedIn: loggedIn,
            isAdmin: isAdmin
            }
        });
        return;
    }

    try{
        const result = await userData.makeReview(userId, postID, username, comment, rating);
        if (result['username'] !== username){
            res.status(500).render('pages/soloListing', { //Maybe to the post's page?
                scripts: ['/public/js/soloListing.js'],
                context: { 
                    error: true,
                    errors: ["Internal server error"],
                    noPagination: true,
                    LoggedIn: loggedIn,
                    isAdmin: isAdmin
                    }
                });
                return;
        }
    } catch (e){
        errors.push(e);
        res.status(400).render('pages/soloListing', { //Maybe to the post's page?
            scripts: ['/public/js/soloListing.js'],
            context: { 
                error: true,
                errors: errors,
                noPagination: true,
                LoggedIn: loggedIn,
                isAdmin: isAdmin
                }
            });
            return;
    }

    res.redirect(`/listings/${postID}`)
});

/**
 * "POST /comment/:postId": 
 *   Comments on the given post.
 */
router.post('/comment/:postId', async (req, res) => {    
   let postId = req.params.postId;
    /** 
     * Insert the code that updates the user's collection of comments here.
     */
    let loggedIn = false;
    let isAdmin = false;
    if (req.session.user){
        loggedIn = true;
        if (req.session.user.isAdmin === true) isAdmin = true;
    }
    else{
        res.status(403).render('pages/soloListing', { //Maybe to the post's page?
            scripts: ['/public/js/soloListing.js'],
            context: { 
                //NoPagination not needed? Im not sure if I rendered the same page but with errors handlebar correctly so reviewLater
                error: true,
                errors: ["You must be logged in to make a comment"],
                noPagination: true,
                LoggedIn: loggedIn,
                isAdmin: isAdmin
                }
            });
            return;
    }

    if (!postId) errors.push("Error: Must supply postId");
    else if (typeof postId != 'string') errors.push("Error: postId must be a string");
    else {
        postId = postId.trim();
        if (postId.length === 0) errors.push("Error: postId cannot be only whitespace");
        else if (!ObjectId.isValid(postId)) errors.push("Error: postId is not a valid objectId");
    }

    const userId = req.session.user['_id'];
    let errors = [];
    let comment = req.body['comment-textarea']
    if (!comment) errors.push ("No comment given");
    else if (typeof comment !== "string") errors.push("Comment is not of type string.");
    else{
        comment = comment.trim(); 
        if (typeof comment === "string" && comment.length === 0) errors.push("Comment cannot be only whitespace.");
        else if (typeof comment === "string" && !ObjectId.isValid(postId)) errors.push("PostId must be a valid objectId");
    }
    
    if (errors.length > 0) { 
        res.status(400).render('pages/soloListing', {
        scripts: ['/public/js/soloListing.js'],
        context: { 
            error: true,
            errors: errors,
            noPagination: true,
            loggedIn: loggedIn,
            isAdmin: isAdmin
            }
        });
        return;
    }

    let result = undefined;

    try{
        result = await userData.makeComment(userId, postId, req.session.user.username, comment)
        if (result['_id'] !== userId){
            res.status(500).render('pages/soloListing', {
                scripts: ['/public/js/soloListing.js'],
                context: { 
                    noPagination: true,
                    error: true,
                    errors: ["Internal Server Error"],
                    loggedIn: loggedIn,
                    isAdmin: isAdmin
                    }
                });
                return;
        }
    } catch (e){
        errors.push(e);
        res.status(400).render('pages/soloListing', { //Maybe to the post's page?
            scripts: ['/public/js/soloListing.js'],
            context: { 
                //NoPagination not needed? Im not sure if I rendered the same page but with errors handlebar correctly so reviewLater
                error: true,
                errors: errors,
                noPagination: true,
                LoggedIn: loggedIn,
                isAdmin: isAdmin
                }
            });
            return;
    }

    res.redirect(`/listings/${postId}`);
});

module.exports = router;