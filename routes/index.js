// Requiring route files and exporting the constructor (similar to ones in lecture).
const routes = require('./routesAPI');

const constructorMethod = app => {
    app.use('/', routes);
    app.use('*', (req, res) => {
        res.status(404).json({error: 'Not found.'});
    });
};

module.exports = constructorMethod;