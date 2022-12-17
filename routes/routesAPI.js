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
    /** 
     * Once you add the user to the session, you can delete the line below and uncomment the other 
     * one. - Chance 
     */
    // const loggedIn = false;
    // If there is the user logged in, then enable them to logout.
    const loggedIn = typeof req.session.user !== 'undefined'; //reviewLater

    /** 
     * Insert code that, if the user is logged in, determines whether the user is an admin or not 
     * here. - Chance 
     */
    if (loggedIn === true){
        const isAdmin = req.session.user['isAdmin'];
    } 
    // -Nick reviewLater
    const allKeywords = [];
    // Render the landing page, with an "About" section and the 5 most recent postings.
    /** Insert the code for obtaining the 5 most recent postings here. 
     *  Use a function to get all of the postings, probably add it in mongoDB
     *  Then get the most recent five by checking their dates and comparing them - Nick reviewLater
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
                isAdmin: false,
                isHome: true
            }
        })
        }catch (e){
            console.log(e);
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
    res.render('pages/about', {
        context: {
            noPagination: true,
            loggedIn: false, //change to loggedIn reviewLater
            isAdmin: false //change to isAdmin
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
        /** 
         * Once you add the user to the session, you can delete the line below and uncomment the 
         * other ones to restore the correct functionality. - Chance 
         */
        // res.render('pages/userLogin', {
        //     scripts: ['/public/js/userLogin.js'],
        //     context: {
        //         noPagination: true
        //     }
        // });

        if (req.session.user) res.redirect('/'); // reviewLater
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
        let errors = [];
        let emailInput = req.body.emailInput;
        let passwordInput = req.body.passwordInput;
        let theUser = undefined;
        try {
            theUser = await userData.checkUser(emailInput, passwordInput);  //Might need to be implemented in data/users.js using find({}) and iterating through all until finding matching username, returing entire user - Nick reviewLater
        }
        catch (e){
            console.log(e);
            errors.push(e); //This block is to catch the error of 'Either invalid password or username'
        } //theUser is now a whole user object after this part
        
        if (errors.length > 0) {
            console.log();
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
        /** 
         * Once you add the user to the session, you can delete the line below and uncomment the 
         * other ones to restore the correct functionality. - Chance 
         */
        res.render('pages/userRegister', {
            scripts: ['/public/js/userRegister.js'],
            context: {
                noPagination: true
            }
        });
        // if (req.session.user) res.redirect('/'); reviewLater
        // else res.render('pages/userRegister', {
        //     scripts: ['/public/js/userRegister.js'],
        //     context: {
        //         noPagination: true
        //     }
        // });
    })
    .post(async (req, res) => {
        /** 
         * This function is pretty much free for the taking. If registering throws any errors, 
         * render the page again with an object of 'error: true' and 'errors: <array of error 
         * strings>', and with a HTTP 400 (or 500 if it's likely a server/db error) status code. I 
         * guess if you're confused by what any of this means, you can look at the "PUT /account" 
         * route for reference. - Chance 
         */ 
        //reviewLater Nick
        let theUserData = req.body; 
        let errors = [];

        theUserData.usernameInput = theUserData.usernameInput.trim();
        theUserData.passwordInput = theUserData.passwordInput.trim();
        theUserData.firstInput = theUserData.firstInput.trim();
        theUserData.lastInput = theUserData.lastInput.trim();
        theUserData.emailInput = theUserData.emailInput.trim();

        try {
            const newUser = await userData.createUser(
            theUserData.firstInput,
            theUserData.lastInput,
            theUserData.emailInput,
            theUserData.usernameInput,
            theUserData.passwordInput,
            );
            if (newUser['firstName'] === theUserData.firstInput) {
                res.redirect('/'); //Might need to be adjusted based on createUser reviewLater
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
            }
        } catch (e) {
            errors.push(e.toString()); //Check if this works reviewLater; In general, this is jank but hopefully its ok?
            res.status(400).render('pages/userRegister', {
                scripts: ['/public/js/userRegister.js'],
                context: { 
                    noPagination: true,
                    error: true,
                    errors: errors
                    }
                });
        }

        // if (errors.length > 0) { //this part is prob not needed
        //     res.status(400).render('pages/userRegister', {
        //     scripts: ['/public/js/userRegister.js'],
        //     context: { 
        //         //NoPagination not needed? Im not sure if I rendered the same page but with errors handlebar correctly so reviewLater
        //         error: true,
        //         errors: errors
        //         }
        //     });
        // }

        
    });

/**
 * "GET /logout": 
 *   Deletes the cookie and takes us to the "Logout" page.
 */
router.get('/logout', async (req, res) => {
    req.session.destroy();
    res.render('pages/userLogout', {
        context: {
            noPagination: true
        }
    });
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
    const postId = req.params.postId.trim();
    /** 
     * Insert the code that appends the ObjectId (MongoDB) of the post to the user's list of 
     * favorites here.
     */
    /** 
     * This function is pretty much free for the taking. It's mostly just MongoDB. - Chance
     */
    //reviewLater nick
    // const userId = req.session.user['_id']; 
    // let errors = [];
    // try{
    //     const result = await userData.addFavorite(postId, userId.toString())
    //     if (result['favoriteInserted'] !== true){
    //         res.status(500).render('pages/soloListing', {
    //             scripts: ['/public/js/soloListing.js'],
    //             context: { 
    //                 //NoPagination not needed? Im not sure if I rendered the same page but with errors handlebar correctly so reviewLater
    //                 error: true,
    //                 errors: errors
    //                 }
    //             });
    //     }
    // } catch (e){
    //     errors.append(e.toString());
    //     res.status(400).render('pages/soloListing', { //Maybe to the post's page?
    //         scripts: ['/public/js/soloListing.js'],
    //         context: { 
    //             //NoPagination not needed? Im not sure if I rendered the same page but with errors handlebar correctly so reviewLater
    //             error: true,
    //             errors: errors
    //             }
    //         });
    // }
});

/**
 * "POST /review/:postId": 
 *   Adds a review to the given post.
 */
router.post('/review/:postId', async (req, res) => {  
    const postId = req.params.postId.trim();
    /** 
     * Insert the code that updates the user's collection of reviews here.
     */
    /** 
     * This function is pretty much free for the taking. It's mostly just MongoDB. - Chance
     */
    //reviewLater nick
    // const userId = req.session.user['_id'];
    // let errors = [];
    // try{
    //     await postData.createReview(postId, req.session.user['username'], req.body.comment.trim(), req.body.rating)
    //     const result = await userData.addRating(postId, userId.toString())
    //     if (result['ratingInserted'] !== true){
    //         res.status(500).render('pages/soloListing', {
    //             scripts: ['/public/js/soloListing.js'],
    //             context: { 
    //                 //NoPagination not needed? Im not sure if I rendered the same page but with errors handlebar correctly so reviewLater
    //                 error: true,
    //                 errors: errors
    //                 }
    //             });
    //     }
    // } catch (e){
    //     errors.append(e.toString());
    //     res.status(400).render('pages/soloListing', { //Maybe to the post's page?
    //         scripts: ['/public/js/soloListing.js'],
    //         context: { 
    //             //NoPagination not needed? Im not sure if I rendered the same page but with errors handlebar correctly so reviewLater
    //             error: true,
    //             errors: errors
    //             }
    //         });
    // }
});

/**
 * "POST /comment/:postId": 
 *   Comments on the given post.
 */
router.post('/comment/:postId', async (req, res) => {    
   const postId = req.params.postId;
    /** 
     * Insert the code that updates the user's collection of comments here.
     */
    /** 
     * This function is pretty much free for the taking. It's mostly just MongoDB. - Chance
     */
    //reviewLater nick
    const userId = req.session.user['_id'];
    let errors = [];
    try{
        await userData.makeComment(req.session.user['_id'], postId, req.session.user['username'], req.body.comment.trim())
        const result = await userData.addComment(postId, userId.toString())
        if (result['commentInserted'] !== true){
            res.status(500).render('pages/soloListing', {
                scripts: ['/public/js/soloListing.js'],
                context: { 
                    noPagination: true,
                    error: true,
                    errors: errors
    //post, loggedIn, truncination, posts error: true errors: errors all in 
                    }
                });
        }
    } catch (e){
        errors.append(e.toString());
        res.status(400).render('pages/soloListing', { //Maybe to the post's page?
            scripts: ['/public/js/soloListing.js'],
            context: { 
                //NoPagination not needed? Im not sure if I rendered the same page but with errors handlebar correctly so reviewLater
                error: true,
                errors: errors
                }
            });
    }
});

module.exports = router;