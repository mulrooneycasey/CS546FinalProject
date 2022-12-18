const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const xss = require('xss');
const data = require('../data')
const userData = data.users;
const postData = data.posts;
const helpers = require('../helpers')
const { ObjectId } = require('mongodb');

/**
 * "GET /admin": 
 *   If logged in, redirects you to the listings route;
 *   Else, you're not logged in, redirects you to the "Sign In" page.
 */
router.get('/', async (req, res) => {
    /** 
     * Once you add the user to the session, you can delete the line below and uncomment the 
     * other ones to restore the correct functionality. - Chance 
     */
    if (req.session.user && req.session.user['isAdmin'] === true) res.redirect('/admin/listings');
    else if (!req.session.user) res.redirect('/login')
    else{
        res.status(403).render('pages/listings', {
            scripts: ['/public/js/listings.js'],
            context: {
                mgmtPage: true,
                loggedIn: false,
                error: true,
                errors: ['Admins only.']
            }
        });
    }
    // if (req.session.user) res.redirect('/admin/listings');
    // else res.redirect('/login');
});

/**
 * "GET /admin/listings": 
 *   If logged in, takes us to the main "Admin Management" page;
 *   Else, you're not logged in, redirects you to the "Sign In" page.
 *   Can have additional queries, like "?page=3".
 */
router.get('/listings', async (req, res) => {
    /** 
     * Once you add the user to the session, you can uncomment the other lines to restore the 
     * correct functionality. - Chance 
     */
        let allKeywords = [];
        const loggedIn = typeof req.session.user !== 'undefined';
        if (!loggedIn || !req.session.user['isAdmin']) res.redirect('/listings')
        //Beginning of nick filter/page/search
        if (loggedIn && req.session.user['isAdmin']){
        let currentList = []
        try{
            currentList = await postData.getAllPosts();
        } catch (e){
            res.status(500).render('pages/listings', {
                scripts: ['/public/js/listings.js', '/public/js/pagination.js'],
                context: {
                    loggedIn: loggedIn,
                    isAdmin: true,
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
            res.render('pages/listings', {
                scripts: ['/public/js/listings.js', '/public/js/pagination.js'],
                context: {
                    posts: currentList,
                    allKeywords: allKeywords,
                    loggedIn: loggedIn,
                    trunc: true,
                    isAdmin: true
                }
            })
            return;
            } catch (e){
                res.status(400).render('pages/listings', {
                scripts: ['/public/js/listings.js', '/public/js/pagination.js'],
                context: {
                    loggedIn: loggedIn,
                    isAdmin: true,
                    error: true,
                    errors: errors
                }
            })
            return;
        }
    }
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
    .route('/listings/:postId')
    .get(async (req, res) => {
        let postId = xss(req.params.postId);
        const loggedIn = typeof req.session.user !== 'undefined';
        if (!loggedIn || !req.session.user.isAdmin) res.redirect(`/listings/${postId}`)
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
                isAdmin: true
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
                        isAdmin: true,
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
                    isAdmin: true,
                    noPagination: true,
                    error: true,
                    errors: errors
                }
            });
            return;
        }

        thePost['image'] = '../' + thePost['image'];
        res.render('pages/soloListing', {
            scripts: ['/public/js/soloListing.js'],
            context: {
                post: thePost,
                loggedIn: loggedIn,
                isAdmin: true,
                trunc: true,
                noPagination: true,
            }
        });
        return;
        
    })
    .post(async (req, res) => {
        if (!req.session.user || !req.session.user.isAdmin){
            res.status(403).render('pages/listings', {
                scripts: ['/public/js/listings.js'],
                context: {
                    loggedIn: false,
                    error: true,
                    errors: ['You are not currently logged in or not an admin.']
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
            postId = await userData.makePost(userId, firstName, lastName, object, image, location, keyword)
            if (!ObjectId.isValid(postId)){
                res.render('pages/soloListing', {
                    scripts: ['/public/js/soloListing.js'],
                    context: {
                        loggedIn: loggedIn,
                        trunc: false,
                        noPagination: true,
                        error: true,
                        errors: ["Internal Server Error"]
                    }
                });
            }
        } catch (e){
            res.render('pages/soloListing', {
                scripts: ['/public/js/soloListing.js'],
                context: {
                    loggedIn: loggedIn,
                    trunc: false,
                    noPagination: true,
                    error: true,
                    errors: errors
                }
            });
        }

        res.redirect(`/listings/${postId}`)
    });

module.exports = router;