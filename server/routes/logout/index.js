const express = require('express');

module.exports = () => {
    const router = express.Router();
    
    
    router.get('/', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    return router;
};