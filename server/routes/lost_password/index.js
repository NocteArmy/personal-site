const express = require('express');
const userFunctions = require('../../functions/userFunctions');

module.exports = (config) => {
    const router = express.Router();
    const user = userFunctions(config.postgres.client);
    
    router.get('/', (req, res) => {
        res.render('lostpassword', {
            pageTitle: 'Lost Password',
            pageID: 'lostpassword'
        });
    });

    router.post('/', async (req, res) => {
        var email = req.body.email;
        var auth = await user.resetPasswordRequest(email);
        if(auth[0] === 'authFailure') {
            req.flash(auth[0], auth[1]);
            return res.redirect('/lostpassword');
        }
        req.flash('authSuccess', 'An email was sent to the provide email address. Please follow the instructions to reset your password.');
        res.redirect('/lostpassword');
    });

    return router;
}