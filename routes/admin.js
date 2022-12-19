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
                loggedIn: true,
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
router.route('/listings')
    .get(async (req, res) => {
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
})
.post(async (req, res) => {
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
            else{
                res.status(403).render('pages/listings', {
                    scripts: ['/public/js/listings.js'],
                    context: {
                        loggedIn: false,
                        error: true,
                        errors: ['You are not an admin']
                    }
                });
                return;
            }
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
        image = "../../public/photos/" + image;
        
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
                trunc: false,
                noPagination: true
            }
        });
        return;
        
    })
    .post(async (req, res) => {
        let postId = xss(req.params.postId);
        const loggedIn = typeof req.session.user !== 'undefined';
        if (!loggedIn || !req.session.user.isAdmin) {
            res.status(403).render('pages/listings', {
                scripts: ['/public/js/listings.js'],
                context: {
                    loggedIn: false,
                    error: true,
                    errors: ['You are not currently logged in or not an admin']
                }
            });
            return;
        }
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
        
        let userId = req.session.user._id;
        let status = req.body.status;
        if (!status) errors.push("No status provided")
        else if (typeof status !== "string") errors.push("status must be a string")
        else {
            status = status.trim();
            if (status.length === 0) errors.push("status cannot be only whitespace.")
            if (status.toLowerCase() === 'pending') errors.push("you cannot submit a pending status");
            if (status.toLowerCase() === "accepted") status = "approve";
            else if (status.toLowerCase() === "taken") status = "deny";
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

        let theApprove = undefined;
        try{
            theApprove = await userData.approvePost(postId, userId, status)
            if (typeof theApprove !== "string" && typeof theApprove !== "object"){
                res.status(500).render('pages/soloListing', {
                    scripts: ['/public/js/soloListing.js'],
                    context: { 
                        error: true,
                        errors: ["Internal Server Error"],
                        noPagination: true,
                        loggedIn: loggedIn,
                        isAdmin: true
                        }
                    });
                    return;
            }
        } catch (e){
            errors.push(e);
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

        res.redirect('/listings')
    });

module.exports = router;