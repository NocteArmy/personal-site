const express = require('express');
const userFunctions = require('../../functions/userFunctions');
const validationFunctions = require('../../functions/validationFunctions');

module.exports = (config) => {
    const router = express.Router();
    const user = userFunctions(config.postgres.client);
    const validation = validationFunctions();
    
    router.get('/:token', async (req, res) => {
        const auth = await user.checkResetToken(req.params.token);
        if(auth[0] === 'authFailure') {
            req.flash(auth[0], auth[1]);
            return res.redirect('/lostpassword');
        }
        res.render('reset', {
            pageTitle: 'Reset Password',
            pageID: 'reset'
        });
    });

    router.post('/:token', async (req, res) => {
        var token = req.params.token;
        var newPassword = req.body.newpassword;
        var confirmPassword = req.body.confirmpassword;
        var validPass = validation.isValidPasswordReg(newPassword);
        if(validPass !== 'ok') {
            req.flash('authFailure', validPass);
            return res.redirect('/reset/' + token);
        }
        var passMatch = validation.passwordMatches(newPassword, confirmPassword);
        if(passMatch !== 'ok') {
            req.flash('authFailure', passMatch);
            return res.redirect('/reset/' + token);
        }
        const auth = await user.resetPassword(newPassword, token);
        if(auth[0] === 'authFailure') {
            req.flash(auth[0], auth[1]);
            return res.redirect('back');
        }
        req.flash('authSuccess', 'Your password has been successfully changed!');
        res.redirect('/login')
    });

    return router;
}