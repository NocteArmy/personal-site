const express = require('express');
const resumeRoute = require('./resume/index');
const logoutRoute = require('./logout/index');
const verifyRoute = require('./verify/index');
const lostRoute = require('./lost_password/index');
const resetRoute = require('./reset/index');

module.exports = (config) => {
    const router = express.Router();

    router.get('/', (req, res) => {
        res.render('index', {
            pageTitle: 'Home',
            pageID: 'home'
        });
    });

    router.use('/resume', resumeRoute(config));
    router.use('/logout', logoutRoute());
    router.use('/verify', verifyRoute(config));
    router.use('/lostpassword', lostRoute(config));
    router.use('/reset', resetRoute(config));

    return router;
};