const express = require('express');

module.exports = (config, passport) => {
    const router = express.Router();
    
    
    router.get('/login', (req, res) => {
        res.render('login', {
            pageTitle: 'Login',
            pageID: 'login',
            message: req.flash('message')
        });
    });
    
    router.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

    return router;
};