/** 
 * Requiring express, bcrypt, & xss (don't forget to use it when passing input into the database!), 
 * and initializing the express router. 
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const xss = require('xss');
const data = require('../data');
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
    const loggedIn = false;
    // If there is the user logged in, then enable them to logout.
    // const loggedIn = typeof req.session.user !== 'undefined'; reviewLater

    /** 
     * Insert code that, if the user is logged in, determines whether the user is an admin or not 
     * here. - Chance 
     */
    // if (loggedIn === True){
    //     const isAdmin = req.session.user.isAdmin;
    // } 
    // -Nick reviewLater

    // Render the landing page, with an "About" section and the 5 most recent postings.
    /** Insert the code for obtaining the 5 most recent postings here. 
     *  Use a function to get all of the postings, probably add it in mongoDB
     *  Then get the most recent five by checking their dates and comparing them - Nick reviewLater
    */
    res.render('pages/home', {
        scripts: ['/public/js/listings.js', '/public/js/pagination.js'],
        context: {
            posts: [{
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
            }],
            loggedIn: loggedIn,
            trunc: true,
            isAdmin: false,
            noPagination: true
        }
    });
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
        res.render('pages/userLogin', {
            scripts: ['/public/js/userLogin.js'],
            context: {
                noPagination: true
            }
        });
        // if (req.session.user) res.redirect('/'); reviewLater
        // else res.render('pages/userLogin', {
        //     scripts: ['/public/js/userLogin.js'],
        //     context: {
        //         noPagination: true
        //     }
        // });
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
        // let errors = [];
        // let usernameInput = req.body.usernameInput;
        // let passwordInput = req.body.passwordInput;
        // let the
        // try {
        //     let theUser = await userData.checkUser(usernameInput, passwordInput); //Might need to be implemented in data/users.js using find({}) and iterating through all until finding matching username, returing entire user - Nick reviewLater
        // }
        // catch (e){
        //     errors.push(e); //This block is to catch the error of 'Either invalid password or username'
        // } //theUser is now a whole user object after this part
        
        // if (typeof theUser !== undefined){
        //     req.session.user = theUser;
        //     res.redirect('/'); //Redirect to homepage if successfully logged in
        // }

        // if (errors.length > 0) {
        //     res.status(400).render('pages/userLogin', {
        //         scripts: ['/public/js/userLogin.js'],
        //         context: { //NoPagination not needed? Im not sure if I rendered the same page but with errors handlebar correctly so reviewLater
        //             error: true,
        //             errors: errors
        //         }
        //     });
        //     return;
        // }
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
    const postId = req.params.postId;
    /** 
     * Insert the code that appends the ObjectId (MongoDB) of the post to the user's list of 
     * favorites here.
     */
    /** 
     * This function is pretty much free for the taking. It's mostly just MongoDB. - Chance
     */
});

/**
 * "POST /review/:postId": 
 *   Adds a review to the given post.
 */
router.post('/review/:postId', async (req, res) => {  
    const postId = req.params.postId;
    /** 
     * Insert the code that updates the user's collection of reviews here.
     */
    /** 
     * This function is pretty much free for the taking. It's mostly just MongoDB. - Chance
     */
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
});

module.exports = router;