const express = require('express');
const passport = require('passport');


module.exports = (config, passport) => {
    const router = express.Router();

    router.get('/register', (req, res) => {
        res.render('register', {
            pageTitle: 'Register',
            pageID: 'register',
            message: req.flash('message')
        });
    });
    
    router.post('/register', passport.authenticate('local-register', {
        successRedirect: '/',
        failureRedirect: '/register',
        failureFlash: true
    }));

    return router;
};