const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const xss = require('xss');
const data = require('../data');
const userData = data.users;
const postData = data.posts;
const helpers = require('../helpers')

/**
 * "GET /account": 
 *   Takes us to the "Account Management" page.
 * "PUT /account": 
 *   Updates the phone number/email address/username/password.
 */
router
    .route('/')
    .get(async (req, res) => {
        let isAdmin = false;
        if (req.session.user && req.session.user['isAdmin']) {
            isAdmin = true;
        }
        if (req.session.user)
            res.render('pages/accountMgmt', {
                scripts: ['/public/js/accountMgmt.js'],
                context: {
                    mgmtPage: true,
                    noPagination: true,
                    loggedIn: true,
                    isAdmin: isAdmin
                }
            });
        else {
            res.status(403).render('pages/accountMgmt', {
                scripts: ['/public/js/accountMgmt.js'],
                context: {
                    mgmtPage: true,
                    noPagination: true,
                    loggedIn: false,
                    error: true,
                    errors: ['You are not currently logged in.']
                }
            });
            return;
        }
    })
    .put(async (req, res) => {
        //There is changeFirst, last, email, pass, username
        // Error checking on fields in req.body and (most) error rendering will be handled by AJAX.
        let loggedIn = false;
        let isAdmin = false;
        if (req.session.user){
            loggedIn = true;
            if (req.session.user.isAdmin) isAdmin = true;
        }
        else{
            res.status(403).render('pages/accountMgmt', {
                scripts: ['/public/js/accountMgmt.js'],
                context: {
                    mgmtPage: true,
                    noPagination: true,
                    loggedIn: false,
                    error: true,
                    errors: ['You are not currently logged in.']
                }
            });
            return;
        }

        let errors = [];
        let userId = req.session.user._id
        let username = req.body.usernameInput;
        let password = req.body.confirmationPasswordInput //NOTE: password is the CONFIRMATION PASSWORD, NOT THE CHANGE TO PASSWORD
        let firstName = req.body.firstNameInput;
        let lastName = req.body.lastNameInput;
        let email = req.body.emailInput;
        let passwordC = req.body.passwordInput;

        if (typeof password !== "undefined") errors.push("Password must be supplied to change any information.")
        else{
            let user = req.session.user
            let pass=user['password'];
            let match = await bcrypt.compare(password, pass);
            if(!match){
                errors.push("confirmation password does not match");
            }
            else{
                if (typeof firstName !== "undefined"){ //If firstname is defined, we are changing it, therefore check it
                    if(!firstName || typeof firstName!='string'){
                        errors.push( "first name must be at least 3 letters");
                    }
                    else {
                        firstName.trim()
                        if(firstName.length<3){
                            errors.push( "first name must be at least 3 letters");
                        }
                        if(helpers.containsNum(firstName) || helpers.containsPunct(firstName) || helpers.containsSpec(firstName)){
                            errors.push( "first name cannot have numbers punctuation, or special characters");
                        }
                        if(user['firstName']===firstName){ //Because of put implementation, im going to only check this in the route
                            errors.push( "name is the same as before");
                        }
                    }
                }
                if (typeof lastName !== "undefined"){
                    if(!lastName || typeof lastName!='string'){
                        errors.push( "first name must be at least 3 letters");
                    }
                    else{
                        lastName.trim()
                        if(lastName.length<3){
                            errors.push( "last name must be at least 3 letters");
                        }
                        if(helpers.containsNum(lastName) || helpers.containsPunct(lastName) || helpers.containsSpec(lastName)){
                            errors.push( "last name cannot have numbers punctuation, or special characters");
                        }
                    }
                }
                if (typeof username !== "undefined"){
                    if(!username || typeof username!='string'){
                        errors.push( "first name must be at least 3 letters");
                    }
                    else{
                        username.trim()
                        if(username.length<3){
                            errors.push( "username must be at least 3 letters");
                        }
                        if(helpers.containsNum(username) || helpers.containsPunct(username) || helpers.containsSpec(username)){
                            errors.push( "username cannot have numbers punctuation, or special characters");
                        }
                    }
                }
                if (typeof email !== "undefined"){
                    if(!email || typeof email!='string'){
                        errors.push( "email must be at least 3 letters");
                    }
                    else{
                        email.trim()
                        const at = email.indexOf('@');
                        if(at ==-1){
                            errors.push( "not a proper email");
                        }
                        if(email.includes('.', at)){
                            errors.push( "not a proper email");
                        }
                    }
                }
                if (typeof passwordC !== "undefined"){
                    if(!passwordC || typeof passwordC!='string'){
                        errors.push( "first name must be at least 3 letters");
                    }
                    else{
                        passwordC.trim();
                        if(passwordC.length<5){
                            errors.push( "password is too short");
                        }
                        if(!(helpers.containsNum(passwordC) || helpers.containsUpper(passwordC) || 
                        helpers.containsSpec(passwordC)) || helpers.containsSpace(passwordC)){
                            errors.push( "password needs a number, special character, and uppercase with no spaces")
                        }
                    }
                }
            }
            
            if (errors.length > 0){
                res.status(400).render('pages/accountMgmt', {
                    scripts: ['/public/js/accountMgmt.js'],
                    context: {
                        mgmtPage: true,
                        noPagination: true,
                        loggedIn: true,
                        isAdmin: isAdmin,
                        error: true,
                        errors: errors
                    }
                });
                return;
            }
            let result1 = undefined;
            let result2 = undefined;
            let result3 = undefined;
            let result4 = undefined;
            let result5 = undefined;

            try{
                if (typeof firstName !== "undefined") result1 = await userData.changeFirstName(userId, password, firstName)
                if (typeof lastName !== "undefined") result2 = await userData.changeLastName(userId, lastName, lastName)
                if (typeof username !== "undefined") result3 = await userData.changeUsername(userId, password, username)
                if (typeof email !== "undefined") result4 = await userData.changeEmail(userId, password, email);
                if (typeof passwordC !== "undefined") result5 = await userData.changePassword(userId, password, passwordC);

                if ((typeof firstName !== "undefined" && result1['_id'] !== userId) || (typeof lastName !== "undefined" && result2['_id'] !== userId) ||
                (typeof username !== "undefined" && result3['_id'] !== userId) || (typeof email !== "undefined" && result4['_id'] !== userId) ||
                (typeof passwordC !== "undefined" && result5['_id'] !== userId)){ //Basically, if any of them existed and failed
                    res.status(500).render('pages/accountMgmt', {
                        scripts: ['/public/js/accountMgmt.js'],
                        context: {
                            mgmtPage: true,
                            noPagination: true,
                            loggedIn: true,
                            isAdmin,
                            error: true,
                            errors: ["Interal Server Error"]
                        }
                    });
                    return;
                }
            } catch (e){
                errors.push(e);
                res.status(400).render('pages/accountMgmt', {
                    scripts: ['/public/js/accountMgmt.js'],
                    context: {
                        mgmtPage: true,
                        noPagination: true,
                        loggedIn: true,
                        isAdmin: isAdmin,
                        error: true,
                        errors: errors
                    }
                });
                return;
            }
            res.redirect('/')
        }
        // Update the user with the provided fields.
        let updateUserResult = undefined;
        try {
            /* Insert code that fetches the post by its ID here. Once you do, modify or delete the 
             * lines below. */
            // let userId = req.session.user['_id'];
            // updateUserResult = await users.updateUser(
            //     xss(userId),
            //     xss(usernameInput),
            //     xss(passwordInput),
            //     xss(firstNameInput), //This line and the one below could cause error based on xss, I honestly dont know what xss is - Nick
            //     xss(lastNameInput),
            //     xss(emailInput)
            // );
        } catch (e) {
            errors.push(e);
        }

        // If updating an user threw an error, then render the "Account Management" page (with a 
        // HTTP 400 status code) again with the errors.
        if (errors.length > 0) {
            res.status(400).render('pages/accountMgmt', {
                scripts: ['/public/js/accountMgmt.js'],
                context: {
                    error: true,
                    errors: errors
                }
            });
            return;
        }

        // If we successfully updated a user, do nothing (because AJAX will update the page with a 
        // success message).
        return;
    });

/**
 * "GET /account/listings": 
 *   If logged in, takes us to the "My Listings" page;
 *   Else, you're not logged in, redirects you to the "Sign In" page.
 *   Can have additional queries, like "?page=3".
 * "POST /account/listings": 
 *   Tries to create a new post with the given user info.
 */
router
    .route('/listings')
    .get(async (req, res) => {
        const allKeywords = [];
        let loggedIn = false;
        let isAdmin = false;
        if (req.session.user){
            loggedIn = true;
            if (req.session.user.isAdmin) isAdmin = true;
        }
        else{
            res.status(403).render('pages/accountMgmt', {
                scripts: ['/public/js/accountMgmt.js'],
                context: {
                    mgmtPage: true,
                    noPagination: true,
                    loggedIn: false,
                    error: true,
                    errors: ['You are not currently logged in.']
                }
            });
            return;
        }


        let currentList = []
        try{
            currentList = await postData.getAllPosts(); //just change this to getAllPostsBy
        } catch (e){
            res.status(500).render('pages/listings', {
                scripts: ['/public/js/listings.js', '/public/js/pagination.js'],
                context: {
                    loggedIn: loggedIn,
                    isAdmin: false,
                    error: true,
                    errors: ["Internal Server Error"]
                }
            })
            return;
        }

        try{
            currentList.sort(helpers.compareNumbers)
            if (req.query.search){
                let searchField = req.query.search;
                currentList = await postData.searchPosts(searchField, currentList);
            }
            if (req.query.filter){ //works if we have keywords as one words only!
                let filterField = req.query.filter;
                let filterArr = [];
                if (typeof filterField === "string") {
                    filterArr.push(filterField)
                    currentList = await postData.filterPosts(filterArr, currentList)
                }
                else{
                    currentList = await postData.filterPosts(filterField, currentList)
                }
            }
            if (req.query.page){
                let pageField = req.query.page;
                pageField = parseInt(pageField);
                currentList = await postData.getPostsByIndex(pageField*10-10, 10, currentList);
            }
            else {
                currentList = await postData.getPostsByIndex(0, 10, currentList);//
            }
            for (let post of currentList){
                let theKeywords = post['keywords']
                for (let keyword of theKeywords){
                    allKeywords.push(keyword)
                }
            }
            res.render('pages/listings', {
                scripts: ['/public/js/listings.js', '/public/js/pagination.js'],
                context: {
                    posts: currentList,
                    allKeywords: allKeywords,
                    loggedIn: loggedIn,
                    trunc: true,
                    isAdmin: false
                }
            })
            return;
            } catch (e){
                res.status(400).render('pages/listings', {
                scripts: ['/public/js/listings.js', '/public/js/pagination.js'],
                context: {
                    loggedIn: loggedIn,
                    isAdmin: false,
                    error: true,
                    errors: errors
                }
            })
            return;
            }
        
    })
    .post(async (req, res) => {
        /** 
         * This function is pretty much free for the taking. It's mostly just MongoDB. - Chance
         */
    });

/**
 * "GET /account/listings/:postId": 
 *   If logged in, takes us to the individual post under the "My Listings" page;
 *   If you're not logged in, redirects you to the "Sign In" page;
 *   If the post doesn't exist, redirects you to the "My Listings" page.
 */
router.get('/listings/:postId', async (req, res) => {
        /** 
         * You should probably wrap the function in an if statement that checks if the post 
         * exists. If it doesn't, then it should redirect us to "/account/listings". Otherwise, 
         * carry out the code below.
         */
        /** 
         * Once you add the user to the session, you can delete the line below and uncomment the 
         * other ones to restore the correct functionality. - Chance 
         */
         res.render('pages/soloListing', {
            scripts: ['/public/js/soloListing.js'],
            context: {
                post: {
                    postId: 1,
                    firstName: 'Andrew',
                    lastName: 'Capro',
                    description: 'post description',
                    image: 'img.png',
                    location: 'Hoboken, 10th St.',
                    time: new Date().toTimeString(),
                    date: new Date().toDateString(),
                    keywords: ['test1', 'test2', 'test3'],
                    overallRating: 5,
                    reviews: [{
                        user: 'Andrew Capro',
                        ratingNum: 5,
                        description: 'this was a real thing'
                    }],
                    comments: [{
                        name: 'Casey Mulrooney',
                        comment: 'this is cool'
                    }]
                },
                mgmtPage: true,
                loggedIn: true,
                trunc: false,
                noPagination: true,
                ownPost: true
            }
        });
        // // If the user is logged in, then they should gain access to the post without a problem.
        // if (req.session.user) {
        //     /** 
        //      * Insert code that obtains the post with the provided postId from the database here. 
        //      * Once you do, modify or delete the lines below.
        //      */
        //     const postId = req.params.postId;

        //     /** 
        //      * Insert code that fetches the post by its ID here. Once you do, modify or delete the lines 
        //      * below. 
        //      */
        //     res.render('pages/soloListing', {
        //         scripts: ['/public/js/soloListing.js'],
        //         context: {
        //             post: {
        //                 postId: 1,
        //                 firstName: 'Andrew',
        //                 lastName: 'Capro',
        //                 description: 'post description',
        //                 image: 'img.png',
        //                 location: 'Hoboken, 10th St.',
        //                 time: new Date().toTimeString(),
        //                 date: new Date().toDateString(),
        //                 keywords: ['test1', 'test2', 'test3'],
        //                 overallRating: 5,
        //                 reviews: [{
        //                     user: 'Andrew Capro',
        //                     ratingNum: 5,
        //                     description: 'this was a real thing'
        //                 }],
        //                 comments: [{
        //                     name: 'Casey Mulrooney',
        //                     comment: 'this is cool'
        //                 }]
        //             },
        //             mgmtPage: true,
        //             loggedIn: true,
        //             trunc: false,
        //             noPagination: true,
        //             ownPost: true
        //         }
        //     });
        // }
        // // Else, redirect the user to the "Sign In" page.
        // else res.redirect('/login');
});

module.exports = router;