const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const xss = require('xss');
const data = require('../data');
const userData = data.users;
const postData = data.posts;
const helpers = require('../helpers');
const { ObjectId } = require('mongodb');


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
        let allKeywords = [];
        const loggedIn = typeof req.session.user !== 'undefined';
        if (loggedIn && req.session.user['isAdmin']) res.redirect('/admin/listings')
        //Beginning of nick filter/page/search
        let currentList = []
        let errors = [];
        try{
            currentList = await postData.getAllPosts();
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
            currentList.sort(helpers.compareNumbers)//
            // console.log(currentList);
            if (req.query.search){
                let searchField = xss(req.query.search);
                currentList = await postData.searchPosts(searchField, currentList);
            }
            if (req.query.filter){ //works if we have keywords as one words only!
                let filterField = xss(req.query.filter);
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
                let pageField = xss(req.query.page);
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
            }catch (e){
                errors.push(e);
            }

            if (errors.length > 0) { 
                res.status(400).render('pages/listing', {
                    scripts: ['/public/js/listing.js'],
                    context: {
                        error: true,
                        errors: true,
                        noPagination: true
                    }
                });
                return;
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
        })
    .post(async (req, res) => {
        /** 
         * This function is pretty much free for the taking. It's mostly just MongoDB. - Chance
         */
        errors = [];
        let loggedIn = false;
        let isAdmin = false;
        if (!req.session.user){
            res.status(403).render('pages/listings', {
                scripts: ['/public/js/listings.js'],
                context: {
                    loggedIn: false,
                    error: true,
                    errors: ['You are not currently logged in.']
                }
            });
            return;
        }
        else {
            loggedIn = true;
            if (req.session.user.isAdmin) isAdmin = true;
        }
    
        let userId = xss(req.session.user._id);
        let username = xss(req.session.user.username)
        let object = xss(req.body.description);
        let image = xss(req.body.image);
        let location = xss(req.body.location);
        let keywords = xss(req.body.keywords);
        let placed = xss(req.body.placedSighted);
        console.log(req.body);
        if(!username || !object || !image || !location || !keywords || !placed){
            errors.push( "missing item");
        }
        else if(typeof username !='string' ||
        typeof location!='string' || typeof object!='string' || typeof placed !== "string" || typeof placed !== "string"){
            errors.push( "first name, last name, location, placed, keywords, object, and placed has to be a string");
        }
        else if(typeof keywords != ' undefined' && typeof keywords != 'string'){
            errors.push( "keywords has to be a string");
        }
        else{
            username.trim();
            location.trim();
            object.trim();
            keywords.trim();
            placed.trim();
            if(username=='' || location=='' || object==''){
                errors.push( "first name, last name, location, and object has to be a string");
            }
            if (placed.toLowerCase() !== "true" && placed.toLowerCase() !== "false") errors.push("placed must be a string, either true or false")
        }  
        image = "../public/photos/" + image;
        
        if (errors.length > 0) { 
            console.log(errors);
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
        let postId = undefined;
        try{
            postId = await userData.makePost(userId, username, object, image, location, keywords, placed)
            if (!ObjectId.isValid(postId)){
                res.status(500).render('pages/soloListing', {
                    scripts: ['/public/js/soloListing.js'],
                    context: {
                        loggedIn: loggedIn,
                        isAdmin: isAdmin,
                        trunc: false,
                        noPagination: true,
                        error: true,
                        errors: ["Internal Server Error"]
                    }
                });
                return;
            }
        } catch (e){
            res.status(400).render('pages/soloListing', {
                scripts: ['/public/js/soloListing.js'],
                context: {
                    loggedIn: loggedIn,
                    isAdmin: isAdmin,
                    trunc: false,
                    noPagination: true,
                    error: true,
                    errors: errors
                }
            });
            return;
        }
    
        res.redirect(`/listings/${postId}`)
        //descriptionInput, imageInput, locationInput, keywordInput
    });

/**
 * "GET /listings/:postId": 
 *   Takes us to the "Individual Listing" page for the given post.
 */
router.get('/:postId', async (req, res) => {
    let postId = xss(req.params.postId);
    const loggedIn = typeof req.session.user !== 'undefined';
    if (loggedIn && req.session.user.isAdmin) res.redirect(`/admin/listings/${postId}`)
    errors = [];
    if(!postId){
        errors.push( "Error: no postId provided");
    }
    else if(typeof postId!='string' || postId.trim()==''){
        errors.push( "Error: postId is not a valid string");
    }
    else {
        postId=postId.trim();
        if(!ObjectId.isValid(postId)){
            errors.push( "Error: postId is not valid");
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
            isAdmin: false
            }
        });
        return;
    }

    let thePost = undefined
    try {
        thePost = await postData.getPostById(postId);
        if (thePost['_id'] !== postId){
            res.status(500).render('pages/soloListing', {
                scripts: ['/public/js/soloListing.js'],
                context: {
                    loggedIn: loggedIn,
                    noPagination: true,
                    error: true,
                    errors: ["Interal server error"]
                }
            });
            return;
        }
    }catch (e){
        errors.push(e);
        res.status(400).render('pages/soloListing', {
            scripts: ['/public/js/soloListing.js'],
            context: {
                loggedIn: loggedIn,
                noPagination: true,
                error: true,
                errors: errors
            }
        });
        return;
    }

    res.render('pages/soloListing', {
        scripts: ['/public/js/soloListing.js'],
        context: {
            post: thePost,
            loggedIn: loggedIn,
            trunc: false,
            noPagination: true,
        }
    });
    return;
});

module.exports = router;