const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const xss = require('xss');
const data = require('../data');
const userData = data.users;
const postData = data.posts;

//store username as case sensitive, but actually use the true case.

/**
 * "GET /account": 
 *   Takes us to the "Account Management" page.
 * "PUT /account": 
 *   Updates the phone number/email address/username/password.
 */
router
    .route('/')
    .get(async (req, res) => {
        /** 
         * Once you add the user to the session, you can delete the line below and uncomment the 
         * other ones to restore the correct functionality. - Chance 
         */
        res.render('pages/accountMgmt', {
            scripts: ['/public/js/accountMgmt.js'],
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
        //         scripts: ['/public/js/accountMgmt.js'],
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
        //         scripts: ['/public/js/accountMgmt.js'],
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
        let firstNameInput = req.body.firstNameInput;
        let lastNameInput = req.body.lastNameInput;
        // I commented out the phone number input because our database proposal doesn't include a 
        // phone number field. Feel free to uncomment this line if this is accounted for. - Chance
        // let phoneNumInput = req.body.phoneNumInput;
        let emailInput = req.body.emailInput;

        // Update the user with the provided fields.
        let updateUserResult = undefined;
        try {
            /* Insert code that fetches the post by its ID here. Once you do, modify or delete the 
             * lines below. */
            // let userId = req.session.user._id;
            // updateUserResult = await users.updateUser(
            //     xss(userId),
            //     xss(usernameInput),
            //     xss(passwordInput),
            //     xss(firstNameInput), //This line and the one below could cause error based on xss, I honestly dont know what xss is - Nick
            //     xss(lastNameInput),
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
                scripts: ['/public/js/listings.js', '/public/js/pagination.js'],
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