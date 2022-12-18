/**
 * NOTE: For anyone handling accessibility, you might want to create a variable that tracks the 
 * tabindex. It could be useful for one of the handlebars helpers.
 */
// Setting up the server (and handlebars), the express session, and the middleware.
const express = require('express');
const app = express();
const static = express.static(__dirname + '/public');
const session = require('express-session');
const configRoutes = require('./routes');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');

const handlebarsInstance = exphbs.create({
    defaultLayout: 'main',
    // Specify helpers which are only registered on this instance.
    helpers: {
        length: (arr, item) => arr.length > 1 ? `${arr.length} ${item}s` : `${arr.length} ${item}`,
        // A helper that will be used to display page dropdowns.
        pageSeq: arr => {
            const arrLength = arr.length;
            let outputHtml = '';
            const numPages = Math.floor(arrLength / 10);
            for (let i = 1; i <= numPages; i++)
                outputHtml += '<option value="' + i + '">' + i + '</option>'
            return new Handlebars.SafeString(outputHtml);
        },
        kwPrinter: (keywords, sep) => {
            if (typeof keywords === 'undefined') return;
            else {
                return keywords.join(sep + ' ')
            }
        }
    },
    partialsDir: ['views/partials/']
});

app.use('/public', express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.engine('.handlebars', handlebarsInstance.engine);
app.set('view engine', 'handlebars');

// Initializing the middleware.
app.use(session({
    name: 'AuthCookie',
    secret: 'hoboken curbside', // This can be changed to whatever you think works best. - Chance
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 300000 } // This can be changed to whatever you think works best. - Chance
}));
/** rest of middleware code goes here */


// Initializing the server.
configRoutes(app);

app.listen(3000, () => {
    /* (maybe keep this or maybe not) Create a database seed. Might need to make this an async 
     * function. */
    console.group('Server Initialization:');
    console.log('The server is now running on http://localhost:3000.');
    console.groupEnd();
});