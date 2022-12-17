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
        res.render('pages/soloListing', {
            scripts: ['/public/js/soloListing.js'],
            context: {
                loggedIn: false,
                noPagination: true,
                error: true,
                errors: ["No page found."]
            }
        });
    });
};

module.exports = constructorMethod;