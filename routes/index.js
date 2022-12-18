// Requiring route files and exporting the constructor (similar to ones in lecture).
const routes = require('./routesAPI');
const accountRoutes = require('./account');
const listingsRoutes = require('./listings');
const adminRoutes = require('./admin');

const constructorMethod = app => {
    app.use('/', routes);
    app.use('/account', accountRoutes);
    app.use('/listings', listingsRoutes);
    app.use('/admin', adminRoutes);
    app.use('*', (req, res) => {
        let loggedIn = typeof req.session.user === "undefined" ? false : true
        let isAdmin = loggedIn && req.session.user.isAdmin === true ? true : false
        res.status(404).render('pages/soloListing', {
            scripts: ['/public/js/soloListing.js'],
            context: {
                loggedIn: loggedIn,
                isAdmin: isAdmin,
                noPagination: true,
                error: true,
                errors: ["No page found."]
            }
        });
    });
};

module.exports = constructorMethod;