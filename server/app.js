const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('cookie-session');
const csrf = require('csurf');
const flash = require('connect-flash');
const routeHandler = require('./routes');
const passport = require('passport');
const dotenv = require('dotenv').config({ path: path.join(__dirname, '../.env') });
const userFunctions = require('./functions/userFunctions');

module.exports = (config) => {
    const app = express();
    
    // view engine setup
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser(process.env.SECRET_KEY));
    
    app.set('trust proxy', 1);
    app.use(session({
        name: 'session',
        secret: process.env.SECRET_KEY,
        cookie: {
            secure: true,
            httpOnly: true,
            domain: 'domain',
            maxAge: 2 * 24 * 60 * 60 * 1000
        }
    }));
    app.use(csrf());
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    
    app.use(express.static(path.join(__dirname, '../client')));
    app.get('/favicon.ico', (req, res) => {
        res.status(204);
    });
    app.get('/robots.txt', (req, res) => {
        res.status(204);
    });
    
    // Global template variables
    app.use(async (req, res, next) => {
        const user = userFunctions(config.postgres.client);

        res.locals.siteTitle = config.applicationName;
        res.locals._csrf = req.csrfToken();

        res.locals.authFailure = req.flash('authFailure');
        res.locals.authSuccess = req.flash('authSuccess');
        res.locals.verifyInfo = req.flash('verifyInfo');
        res.locals.messageEmail = req.flash('messageEmail');
        res.locals.successEmail = req.flash('successEmail');
        res.locals.messagePassword = req.flash('messagePassword');
        res.locals.successPassword = req.flash('successPassword');
        res.locals.messageAboutme = req.flash('messageAboutme');
        res.locals.successAboutme = req.flash('successAboutme');

        try {
            if(req.session.passport) {
                var currentUserTemp = await user.getAuth(req.session.passport.user);
                res.locals.currentUser = currentUserTemp;
                if(currentUserTemp) {
                    res.locals.userInfo = await user.getUser(currentUserTemp.username);
                }
            }
        } catch(err) {
            return next(err);
        }

        return next();
    });
    
    app.use('/', routeHandler(config));
    app.use(require('./routes/login/index')(config, passport));
    app.use(require('./routes/register/index')(config, passport));
    app.use(require('./routes/profile/index')(config));
    
    // Catch 404 and forward to error handler
    app.use((req, res, next) => {
        const err = new Error(`Not Found (${req.url})`);
        err.status = 404;
        next(err);
    });

    // Error Handler
    app.use((err, req, res) => {
        //set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

        //render the error page
        res.status(err.status || 500);
        res.render('error');
    });

    return app;
}