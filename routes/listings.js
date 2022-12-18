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

        let userId = xss(req.session.user);
        let firstName = xss(req.session.user.firstName);
        let lastName = xss(req.session.user.lastName);
        let object = xss(req.body.descriptionInput);
        let image = xss(req.body.imageInput);
        let location = xss(req.body.locationInput);

        if(!firstName || !lastName || !object || !image || !location || !keywords){
            throw "missing item";
        }
        else if(helpers.containsNum(firstName) || helpers.containsNum(lastName)){
            throw "name cannot have numbers in it";
        }
        else if(typeof firstName!='string' || typeof lastName!='string' ||
        typeof location!='string' || typeof object!='string'){
            throw "first name, last name, location, and object has to be a string";
        }
        else if(typeof keywords != ' undefined' && typeof keywords != 'string'){
            throw "keywords has to be a string";
        }
        else{
            firstName.trim();
            lastName.trim();
            location.trim();
            object.trim();
            keywords.trim();
            if(firstName=='' || lastName=='' || location=='' || object==''){
                throw "first name, last name, location, and object has to be a string";
            }
        }  
        
        if (errors.length > 0) { 
            res.status(400).render('pages/soloListing', {
                scripts: ['/public/js/soloListing.js'],
                context: {
                    post: thePost,
                    loggedIn: true,
                    trunc: false,
                    noPagination: true
                }
            });
        }
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