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
        // const loggedIn = false;
        // If there is the user logged in, then enable them to create posts and to logout.
        const loggedIn = typeof req.session.user !== 'undefined';

        /** 
         * If the user has clicked a specific page (say, page 3), then we need to move the cursor 
         * in the database so that the corresponding posts are displayed. We must keep in mind any 
         * filtered keywords the user has selected and/or any keyword the user has searched.
         */
        //Beginning of nick filter/page/search
        try{
            let currentList = await postData.getAllPosts();
            currentList.sort(helpers.compareNumbers)
            // console.log(currentList);
            if (req.query.search){
                searchField = req.query.search;
                searchArr = searchField.split(' ');
                currentList = await postData.filterPosts(searchArr, currentList);
            }
            if (req.query.filter){
                filterField = req.query.filter;
                filterArr = filterField.split(' ');
                currentList = await postData.filterPosts(filterArr, currentList)
            }
            if (req.query.page){
                pageField = req.query.page;
                pageField = parseInt(pageField);
                currentList = await postData.getPostsByIndex(pageField*10-10, 5, currentList);
            }
            else {
                currentList = await postData.getPostsByIndex(0, 5, currentList);
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
            }catch (e){
                console.log(e);
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
router.get('/:postId', async (req, res) => {
    const postId = req.params.postId;
    //const post = postData.getPostById(postId);
    /** 
     * Once you add the user to the session, you can delete the line below and uncomment the other 
     * one. - Chance 
     */
    // const loggedIn = false;
    // If there is the user logged in, then enable them to create posts and to logout.
    const loggedIn = typeof req.session.user !== 'undefined';
    /** 
     * Insert code that fetches the post by its ID here. Once you do, modify or delete the lines 
     * below. 
     */
    let thePost = postData.getPostById(postId);
    res.render('pages/soloListing', {
        scripts: ['/public/js/soloListing.js'],
        context: {
            post: thePost,
            loggedIn: loggedIn,
            trunc: false,
            noPagination: true
        }
    });
});

module.exports = router;