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
        res.status(404).json({error: 'Not found.'});
    });
};

module.exports = constructorMethod;