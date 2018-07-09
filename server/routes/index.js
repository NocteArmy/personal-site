const express = require('express');
const resumeRoute = require('./resume/index');

module.exports = (config) => {
    const router = express.Router();

    router.get('/', (req, res) => {
        res.render('index', {
            pageTitle: 'Home',
            pageID: 'home'
        });
    });

    router.use('/resume', resumeRoute(config));

    return router;
};