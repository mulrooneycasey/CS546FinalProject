/** 
 * Requiring express, bcrypt, & xss (don't forget to use it when passing input into the database!), 
 * and initializing the express router. 
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const xss = require('xss');
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
    // const loggedIn = typeof req.session.user !== 'undefined';

    /** 
     * Insert code that, if the user is logged in, determines whether the user is an admin or not 
     * here. - Chance 
     */
    
    // Render the landing page, with an "About" section and the 5 most recent postings.
    /** Insert the code for obtaining the 5 most recent postings here. */
    res.render('pages/home', {
        script: '/public/js/listings.js',
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
     */
    res.render('pages/about', {
        context: {
            noPagination: true,
            loggedIn: false,
            isAdmin: false
        }
    });
});

/**
 * "GET /listings": 
 *   Takes us to the "Listings" page.
 *   Can have additional queries, like "?page=3".
 * "POST /listings": 
 *   Tries to create a new post with the given user info.
 */
router
    .route('/listings')
    .get(async (req, res) => {
        // Grab all keywords so that we can pass them to the 'listings' view, which will enable
        // filter functionality.
        /** 
         * I recommend using projection to get the keywords for every user. Remove the line below 
         * once you're ready to do this. - Chance 
         */
        const allKeywords = [];
        /** 
         * Once you add the user to the session, you can delete the line below and uncomment the 
         * other one. - Chance 
         */
        const loggedIn = false;
        // If there is the user logged in, then enable them to create posts and to logout.
        // const loggedIn = typeof req.session.user !== 'undefined';

        /** 
         * If the user has clicked a specific page (say, page 3), then we need to move the cursor 
         * in the database so that the corresponding posts are displayed. We must keep in mind any 
         * filtered keywords the user has selected and/or any keyword the user has searched.
         */
        if (req.query.page) {
            // If there's a search query attached, then we only search the database for posts that 
            // match the given keyword.
            if (req.query.search) {
                // If there is also a filter query, search the database for posts that match the 
                // keyword while also filtering for posts that match those keywords.
                if (req.query.filter) {
                    /** 
                     * Insert the code for obtaining the 10 most recent postings based on the 
                     * search query ("req.query.search" will either be a string), the filter 
                     * query/queries ("req.query.filter" will either be a string or an array of 
                     * strings), and the provided page here.
                     */
                    res.render('pages/listings', {
                        script: '/public/js/listings.js',
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
                            allKeywords: allKeywords,
                            loggedIn: loggedIn,
                            trunc: true,
                            isAdmin: false
                        }
                    });
                    return;
                } else {
                    /** 
                     * Insert the code for obtaining the 10 most recent postings based on the 
                     * search query ("req.query.search" will be a string) and on the provided page 
                     * here.
                     */
                    res.render('pages/listings', {
                        script: '/public/js/listings.js',
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
                            allKeywords: allKeywords,
                            loggedIn: loggedIn,
                            trunc: true,
                            isAdmin: false
                        }
                    });
                    return;
                }
            }
            // If there's a filter query or filter queries attached, then we only search the 
            // database for posts that match the given keyword(s).
            if (req.query.filter) {
                /** 
                 * Insert the code for obtaining the 10 most recent postings based on the filter 
                 * query/queries ("req.query.filter" will either be a string or an array of 
                 * strings) and on the provided page here. 
                 */
                res.render('pages/listings', {
                    script: '/public/js/listings.js',
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
                        allKeywords: allKeywords,
                        loggedIn: loggedIn,
                        trunc: true,
                        isAdmin: false
                    }
                });
                return;
            }

            else {
                /** 
                 * Insert the code for obtaining the 10 most recent postings here.
                 */
                res.render('pages/listings', {
                    script: '/public/js/listings.js',
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
                        allKeywords: allKeywords,
                        loggedIn: loggedIn,
                        trunc: true,
                        isAdmin: false
                    }
                });
                return;
            }
        } 
        /** 
         * Else, just obtain the 10 most recent postings, while also keeping in mind any filtered 
         * keyword(s) the user has selected and/or any keyword the user has searched.
        */
        else {
            // If there's a search query attached, then we only search the database for posts that 
            // match the given keyword.
            if (req.query.search) {
                // If there is also a filter query, search the database for posts that match the 
                // keyword while also filtering for posts that match those keywords.
                if (req.query.filter) {
                    /** 
                     * Insert the code for obtaining the 10 most recent postings based on the 
                     * search query ("req.query.search" will either be a string), the filter 
                     * query/queries ("req.query.filter" will either be a string or an array of 
                     * strings) here.
                     */
                    res.render('pages/listings', {
                        script: '/public/js/listings.js',
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
                            allKeywords: allKeywords,
                            loggedIn: loggedIn,
                            trunc: true,
                            isAdmin: false
                        }
                    });
                } else {
                    /** 
                     * Insert the code for obtaining the 10 most recent postings based on the 
                     * search query ("req.query.search" will be a string) here.
                     */
                    res.render('pages/listings', {
                        script: '/public/js/listings.js',
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
                            allKeywords: allKeywords,
                            loggedIn: loggedIn,
                            trunc: true,
                            isAdmin: false
                        }
                    });
                }
            }
            // If there's a filter query or filter queries attached, then we only search the 
            // database for posts that match the given keyword(s).
            if (req.query.filter) {
                /** 
                 * Insert the code for obtaining the 10 most recent postings here 
                 * ("req.query.filter" will either be a string or an array of strings). 
                 */
                res.render('pages/listings', {
                    script: '/public/js/listings.js',
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
                        allKeywords: allKeywords,
                        loggedIn: loggedIn,
                        trunc: true,
                        isAdmin: false
                    }
                });
            }
            else {
                /** Insert the code for obtaining the 10 most recent postings here. */
                res.render('pages/listings', {
                    script: '/public/js/listings.js',
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
                        allKeywords: allKeywords,
                        loggedIn: loggedIn,
                        trunc: true,
                        isAdmin: false
                    }
                });
                return;
            }
        }
    })
    .post(async (req, res) => {
        /** 
         * This function is pretty much free for the taking. It's mostly just MongoDB. - Chance
         */
    });

/**
 * "GET /listings/:postId": 
 *   Takes us to the "Individual Listing" page for the given post.
 */
router.get('/listings/:postId', async (req, res) => {
    const postId = req.params.postId;

    /** 
     * Once you add the user to the session, you can delete the line below and uncomment the other 
     * one. - Chance 
     */
    const loggedIn = false;
    // If there is the user logged in, then enable them to create posts and to logout.
    // const loggedIn = typeof req.session.user !== 'undefined';
    /** 
     * Insert code that fetches the post by its ID here. Once you do, modify or delete the lines 
     * below. 
     */
    res.render('pages/soloListing', {
        script: '/public/js/soloListing.js',
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
            loggedIn: loggedIn,
            trunc: false,
            noPagination: true
        }
    });
});

/**
 * "GET /account": 
 *   Takes us to the "Account Management" page.
 * "PUT /account": 
 *   Updates the phone number/email address/username/password.
 */
router
    .route('/account')
    .get(async (req, res) => {
        /** 
         * Once you add the user to the session, you can delete the line below and uncomment the 
         * other ones to restore the correct functionality. - Chance 
         */
        res.render('pages/accountMgmt', {
            script: '/public/js/accountMgmt.js',
            context: {
                mgmtPage: true,
                noPagination: true,
                loggedIn: true
            }
        });
        // // If the user is logged in, then they should gain access to the "Account Management" page 
        // // without a problem.
        // if (req.session.user)
        //     res.render('pages/accountMgmt', {
        //         script: '/public/js/accountMgmt.js',
        //         context: {
        //             mgmtPage: true,
        //             noPagination: true,
        //             loggedIn: true
        //         }
        //     });
        // // Else, render the "Account Management" page as if the user is not logged in with an 
        // // error message.
        // else {
        //     res.status(403).render('pages/accountMgmt', {
        //         script: '/public/js/accountMgmt.js',
        //         context: {
        //             mgmtPage: true,
        //             loggedIn: false,
        //             error: true,
        //             errors: ['You are not currently logged in.']
        //         }
        //     });
        //     return;
        // }
    })
    .put(async (req, res) => {
        // Error checking on fields in req.body and (most) error rendering will be handled by AJAX.
        let errors = [];
        let usernameInput = req.body.usernameInput;
        let passwordInput = req.body.passwordInput;
        // I commented out the phone number input because our database proposal doesn't include a 
        // phone number field. Feel free to uncomment this line if this is accounted for. - Chance
        // let phoneNumInput = req.body.phoneNumInput;
        let emailInput = req.body.emailInput;

        // Update the user with the provided fields.
        let updateUserResult = undefined;
        try {
            /* Insert code that fetches the post by its ID here. Once you do, modify or delete the 
             * lines below. */
            // let postId = undefined;
            // updateUserResult = await users.updateUser(
            //     xss(postId),
            //     xss(usernameInput),
            //     xss(passwordInput),
            //     xss(phoneNumInput),
            //     xss(emailInput)
            // );
        } catch (e) {
            errors.push(e);
        }

        // If updating an user threw an error, then render the "Account Management" page (with a 
        // HTTP 400 status code) again with the errors.
        if (errors.length > 0) {
            res.status(400).render('pages/accountMgmt', {
                script: '/public/js/accountMgmt.js',
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
    .route('/account/listings')
    .get(async (req, res) => {
        // Grab all keywords so that we can pass them to the 'listings' view, which will enable
        // filter functionality.
        /** 
         * I recommend using projection to get the keywords for every user. Remove the line below 
         * once you're ready to do this. - Chance 
         */
        const allKeywords = [];

        /** 
         * Once you add the user to the session, you can delete the line below and uncomment the 
         * other one. - Chance 
         */
        const loggedIn = true;
        // const loggedIn = typeof req.session.user !== 'undefined';

        // If the user is logged in, then they should gain access to the "My Listings" page 
        // without a problem.
        if (loggedIn) {
            /** 
             * If the user has clicked a specific page (say, page 3), then we need to move the 
             * cursor in the database so that the corresponding posts are displayed. We must keep 
             * in mind any filtered keyword(s) the user has selected and/or any keyword the user 
             * has searched.
             */
            if (req.query.page) {
                // If there's a search query attached, then we only search the database for posts 
                // that match the given keyword.
                if (req.query.search) {
                    // If there is also a filter query, search the database for posts that match 
                    // the keyword while also filtering for posts that match those keywords.
                    if (req.query.filter) {
                        /** 
                         * Insert the code for obtaining the 10 most recent postings related to 
                         * the user based on the search query ("req.query.search" will either be a 
                         * string), the filter query/queries ("req.query.filter" will either be a 
                         * string or an array of strings), and the provided page here.
                         */
                        res.render('pages/listings', {
                            script: '/public/js/listings.js',
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
                                allKeywords: allKeywords,
                                mgmtPage: true,
                                loggedIn: loggedIn,
                                trunc: true,
                                isAdmin: false
                            }
                        });
                        return;
                    } else {
                        /** 
                         * Insert the code for obtaining the 10 most recent postings related to 
                         * the user based on the search query ("req.query.search" will be a 
                         * string) and on the provided page here.
                         */
                        res.render('pages/listings', {
                            script: '/public/js/listings.js',
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
                                allKeywords: allKeywords,
                                mgmtPage: true,
                                loggedIn: loggedIn,
                                trunc: true,
                                isAdmin: false
                            }
                        });
                        return;
                    }
                }
                // If there's a filter query or filter queries attached, then we only search the 
                // database for posts that match the given keyword(s).
                if (req.query.filter) {
                    /** 
                     * Insert the code for obtaining the 10 most recent postings related to the 
                     * user based on the filter query/queries ("req.query.filter" will either be a 
                     * string or an array of strings) and on the provided page here. 
                     */
                    res.render('pages/listings', {
                        script: '/public/js/listings.js',
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
                            allKeywords: allKeywords,
                            mgmtPage: true,
                            loggedIn: loggedIn,
                            trunc: true,
                            isAdmin: false
                        }
                    });
                    return;
                }

                else {
                    /** 
                     * Insert the code for obtaining the 10 most recent postings related to the 
                     * user here.
                     */
                    res.render('pages/listings', {
                        script: '/public/js/listings.js',
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
                            allKeywords: allKeywords,
                            mgmtPage: true,
                            loggedIn: loggedIn,
                            trunc: true,
                            isAdmin: false
                        }
                    });
                    return;
                }
            } 
            /** 
             * Else, just obtain the 10 most recent postings related to the user, while also 
             * keeping in mind any filtered keyword(s) the user has selected and/or any keyword 
             * the user has searched.
             */
            else {
                // If there's a search query attached, then we only search the database for posts 
                // that match the given keyword.
                if (req.query.search) {
                    // If there is also a filter query, search the database for posts that match 
                    // the keyword while also filtering for posts that match those keywords.
                    if (req.query.filter) {
                        /** 
                         * Insert the code for obtaining the 10 most recent postings related to 
                         * the user based on the search query ("req.query.search" will either be a 
                         * string), the filter query/queries ("req.query.filter" will either be a 
                         * string or an array of strings) here.
                         */
                        res.render('pages/listings', {
                            script: '/public/js/listings.js',
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
                                allKeywords: allKeywords,
                                mgmtPage: true,
                                loggedIn: loggedIn,
                                trunc: true,
                                isAdmin: false
                            }
                        });
                    } else {
                        /** 
                         * Insert the code for obtaining the 10 most recent postings related to 
                         * the user based on the search query ("req.query.search" will be a 
                         * string) here.
                         */
                        res.render('pages/listings', {
                            script: '/public/js/listings.js',
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
                                allKeywords: allKeywords,
                                mgmtPage: true,
                                loggedIn: loggedIn,
                                trunc: true,
                                isAdmin: false
                            }
                        });
                    }
                }
                // If there's a filter query or filter queries attached, then we only search the 
                // database for posts that match the given keyword(s).
                if (req.query.filter) {
                    /** 
                     * Insert the code for obtaining the 10 most recent postings related to the 
                     * user here ("req.query.filter" will either be a string or an array of 
                     * strings).
                     */
                    res.render('pages/listings', {
                        script: '/public/js/listings.js',
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
                            allKeywords: allKeywords,
                            mgmtPage: true,
                            loggedIn: loggedIn,
                            trunc: true,
                            isAdmin: false
                        }
                    });
                }
                else {
                    /** 
                     * Insert the code for obtaining the 10 most recent postings related to the 
                     * user here. 
                     */
                    res.render('pages/listings', {
                        script: '/public/js/listings.js',
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
                            allKeywords: allKeywords,
                            mgmtPage: true,
                            loggedIn: loggedIn,
                            trunc: true,
                            isAdmin: false
                        }
                    });
                    return;
                }
            }
        }
        // Else, render the "My Listings" page as if the user is not logged in with an 
        // error message.
        else {
            res.status(403).render('pages/listings', {
                script: '/public/js/listings.js',
                loggedIn: false,
                context: {
                    mgmtPage: true,
                    error: true,
                    errors: ['You are not currently logged in.']
                }
            });
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
router.get('/account/listings/:postId', async (req, res) => {
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
            script: '/public/js/soloListing.js',
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
        //         script: '/public/js/soloListing.js',
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
            script: '/public/js/userLogin.js',
            context: {
                noPagination: true
            }
        });
        // if (req.session.user) res.redirect('/');
        // else res.render('pages/userLogin', {
        //     script: '/public/js/userLogin.js',
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
            script: '/public/js/userRegister.js',
            context: {
                noPagination: true
            }
        });
        // if (req.session.user) res.redirect('/');
        // else res.render('pages/userRegister', {
        //     script: '/public/js/userRegister.js',
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
 * "GET /admin": 
 *   If logged in, redirects you to the listings route;
 *   Else, you're not logged in, redirects you to the "Sign In" page.
 */
router.get('/admin', async (req, res) => {
    /** 
     * Once you add the user to the session, you can delete the line below and uncomment the 
     * other ones to restore the correct functionality. - Chance 
     */
    res.redirect('/admin/listings');
    // if (req.session.user) res.redirect('/admin/listings');
    // else res.redirect('/login');
});

/**
 * "GET /admin/listings": 
 *   If logged in, takes us to the main "Admin Management" page;
 *   Else, you're not logged in, redirects you to the "Sign In" page.
 *   Can have additional queries, like "?page=3".
 */
router.get('/admin/listings', async (req, res) => {
    /** 
     * Once you add the user to the session, you can uncomment the other lines to restore the 
     * correct functionality. - Chance 
     */
    // // If the user is logged in, then they should gain access to the "Listings" page without a 
    // // problem.
    // if (req.session.user) {
        /** 
         * If the user has clicked a specific page (say, page 3), then we need to move the cursor 
         * in the database so that the corresponding posts are displayed. We must keep in mind any 
         * filtered keyword(s) the user has selected and/or any keyword the user has searched.
         */
         if (req.query.page) {
            // If there's a search query attached, then we only search the database for posts that 
            // match the given keyword.
            if (req.query.search) {
                // If there is also a filter query, search the database for posts that match the 
                // keyword while also filtering for posts that match those keywords.
                if (req.query.filter) {
                    /** 
                     * Insert the code for obtaining the 10 most recent postings related to the 
                     * user based on the search query ("req.query.search" will either be a 
                     * string), the filter query/queries ("req.query.filter" will either be a 
                     * string or an array of strings), and the provided page here.
                     */
                    res.render('pages/listings', {
                        script: '/public/js/listings.js',
                        context: {
                            posts: [{
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
                            loggedIn: true,
                            trunc: true,
                            isAdmin: true
                        }
                    });
                    return;
                } else {
                    /** 
                     * Insert the code for obtaining the 10 most recent postings related to the 
                     * user based on the search query ("req.query.search" will be a string) and on 
                     * the provided page here.
                     */
                    res.render('pages/listings', {
                        script: '/public/js/listings.js',
                        context: {
                            posts: [{
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
                            loggedIn: true,
                            trunc: true,
                            isAdmin: true
                        }
                    });
                    return;
                }
            }
            // If there's a filter query or filter queries attached, then we only search the 
            // database for posts that match the given keyword(s).
            if (req.query.filter) {
                /** 
                 * Insert the code for obtaining the 10 most recent postings related to the user 
                 * based on the filter query/queries ("req.query.filter" will either be a string 
                 * or an array of strings) and on the provided page here.
                 */
                res.render('pages/listings', {
                    script: '/public/js/listings.js',
                    context: {
                        posts: [{
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
                        loggedIn: true,
                        trunc: true,
                        isAdmin: true
                    }
                });
                return;
            }

            else {
                /** 
                 * Insert the code for obtaining the 10 most recent postings related to the user 
                 * here.
                 */
                res.render('pages/listings', {
                    script: '/public/js/listings.js',
                    context: {
                        posts: [{
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
                        loggedIn: true,
                        trunc: true,
                        isAdmin: true
                    }
                });
                return;
            }
        } 
        /** 
         * Else, just obtain the 10 most recent postings related to the user, while also keeping 
         * in mind any filtered keyword(s) the user has selected and/or any keyword the user has 
         * searched.
         */
        else {
            // If there's a search query attached, then we only search the database for posts that 
            // match the given keyword.
            if (req.query.search) {
                // If there is also a filter query, search the database for posts that match the 
                // keyword while also filtering for posts that match those keywords.
                if (req.query.filter) {
                    /** 
                     * Insert the code for obtaining the 10 most recent postings related to the 
                     * user based on the search query ("req.query.search" will either be a 
                     * string), the filter query/queries ("req.query.filter" will either be a 
                     * string or an array of strings) here.
                     */
                    res.render('pages/listings', {
                        script: '/public/js/listings.js',
                        context: {
                            posts: [{
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
                            loggedIn: true,
                            trunc: true,
                            isAdmin: true
                        }
                    });
                } else {
                    /** 
                     * Insert the code for obtaining the 10 most recent postings related to the 
                     * user based on the search query ("req.query.search" will be a string) here.
                     */
                    res.render('pages/listings', {
                        script: '/public/js/listings.js',
                        context: {
                            posts: [{
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
                            loggedIn: true,
                            trunc: true,
                            isAdmin: true
                        }
                    });
                }
            }
            // If there's a filter query or filter queries attached, then we only search the 
            // database for posts that match the given keyword(s).
            if (req.query.filter) {
                /** 
                 * Insert the code for obtaining the 10 most recent postings related to the user 
                 * here ("req.query.filter" will either be a string or an array of strings). 
                 */
                res.render('pages/listings', {
                    script: '/public/js/listings.js',
                    context: {
                        posts: [{
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
                        loggedIn: true,
                        trunc: true,
                        isAdmin: true
                    }
                });
            }
            else {
                /** 
                 * Insert the code for obtaining the 10 most recent postings related to the user 
                 * here. 
                 */
                res.render('pages/listings', {
                    script: '/public/js/listings.js',
                    context: {
                        posts: [{
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
                        loggedIn: true,
                        trunc: true,
                        isAdmin: true
                    }
                });
                return;
            }
        }
    // }
    // // Else, redirect the user to the "Sign In" page.
    // else res.redirect('/login');
});

/**
 * "GET /admin/listings/:postId": 
 *   If logged in, takes us to the individual post (with additional moderation controls) under the 
 *   "Admin Management" page;
 *   If you're not logged in, redirects you to the "Sign In" page;
 *   If the post doesn't exist, redirects you to the main "Admin Management" page.
 * "POST /admin/listings/:postId": 
 *   Either changes status to "accepted"/"denied" for the given post.
 */
router
    .route('/admin/listings/:postId')
    .get(async (req, res) => {
        /** 
         * You should probably wrap the function in an if statement that checks if the post 
         * exists. If it doesn't, then it should redirect us to "/admin/listings". Otherwise, 
         * carry out the code below.
         */
        /** 
         * Once you add the user to the session, you can delete the line below and uncomment the 
         * other ones to restore the correct functionality. - Chance 
         */
         res.render('pages/soloListing', {
            script: '/public/js/soloListing.js',
            post: {},
            loggedIn: true,
            trunc: false,
            noPagination: true
        });
        // // If the user is logged in, then they should gain access to the post without a problem.
        // if (req.session.user) {
        //     const postId = req.params.postId;

        //     /** 
        //      * Insert code that fetches the post by its ID here. Once you do, modify or delete the 
        //      * lines below.
        //      */
        //     res.render('pages/soloListing', {
        //         script: '/public/js/soloListing.js',
        //         post: {},
        //         loggedIn: true,
        //         trunc: false,
        //         noPagination: true
        //     });
        // }
        // // Else, redirect the user to the "Sign In" page.
        // else res.redirect('/login');
    })
    .post(async (req, res) => {
        /** 
         * This function is pretty much free for the taking. It's mostly just MongoDB. - Chance
         */
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