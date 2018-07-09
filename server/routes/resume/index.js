const express = require('express');

module.exports = (config) => {
    const router = express.Router();
    
    router.get('/', (req, res) => {
        res.render('resume', {
            pageTitle: 'Resume',
            pageID: 'resume'
        });
    });

    return router;
};