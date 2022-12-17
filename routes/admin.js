const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const xss = require('xss');

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
            scripts: ['/public/js/soloListing.js'],
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
        //         script: ['/public/js/soloListing.js'],
		// 		context: {
		// 			post: {
		// 				postId: 1,
		// 				firstName: 'Andrew',
		// 				lastName: 'Capro',
		// 				description: 'post description',
		// 				image: 'img.png',
		// 				location: 'Hoboken, 10th St.',
		// 				time: new Date().toTimeString(),
		// 				date: new Date().toDateString(),
		// 				keywords: ['test1', 'test2', 'test3'],
		// 				overallRating: 5,
		// 				reviews: [{
		// 					user: 'Andrew Capro',
		// 					ratingNum: 5,
		// 					description: 'this was a real thing'
		// 				}],
		// 				comments: [{
		// 					name: 'Casey Mulrooney',
		// 					comment: 'this is cool'
		// 				}]
		// 			},
		// 			loggedIn: true,
		// 			trunc: false,
		// 			noPagination: true
		// 		}
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

module.exports = router;