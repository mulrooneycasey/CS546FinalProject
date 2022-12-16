const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const xss = require('xss');
const data = require('../data');
const userData = data.users;
const postData = data.posts;
const helpers = require('../helpers')

/**
 * "GET /listings": 
 *   Takes us to the "Listings" page.
 *   Can have additional queries, like "?page=3".
 * "POST /listings": 
 *   Tries to create a new post with the given user info.
 */
router
    .route('/')
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
        //Beginning of nick filter/page/search
        // let currentList = await postData.getAllPosts();
        // currentList.sort(helpers.compareNumbers)
        // if (req.query.search){
        //     searchField = req.query.search;
        //     searchArr = searchField.split(' ');
        //     currentList = await postData.filterPosts(searchArr, currentList);
        // }
        // if (req.query.filter){
        //     filterField = req.query.filter;
        //     filterArr = filterField.split(' ');
        //     currentList = await postData.filterPosts(filterArr, currentList)
        // }
        // if (req.query.page){
        //     pageField = req.query.page;
        //     pageField = parseInt(pageField);
        //     currentList = await postData.getPostsByIndex(pageField, pageField*10, currentList);
        // }
        // else {
        //     currentList = await postData.getPostById(0, 10, currentList);
        // }
        //end of nick filter/page/search
        
        //begin of hardcode
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
                        loggedIn: loggedIn,
                        trunc: true,
                        isAdmin: false
                    }
                });
            }
            else {
                /** Insert the code for obtaining the 10 most recent postings here. */
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
                        loggedIn: loggedIn,
                        trunc: true,
                        isAdmin: false
                    }
                });
                return;
            }
        }
        //end of hardcode
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
router.get('/:postId', async (req, res) => {
    const postId = req.params.postId;
    //const post = postData.getPostById(postId);
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
        scripts: ['/public/js/soloListing.js'],
        context: {
            post: { //I think we can just change this to post when it all works reviewLater
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

module.exports = router;