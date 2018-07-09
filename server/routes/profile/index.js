const express = require('express');
const userFunctions = require('../../functions/userFunctions');
const validationFunctions = require('../../functions/validationFunctions');
const util = require('../../util');

module.exports = (config) => {
    const router = express.Router();
    const user = userFunctions(config.postgres.client);
    const validation = validationFunctions();
    
    router.get('/profile', util.ensureAuthenticated, (req, res) => {
        res.render('profile', {
            pageTitle: 'Edit Profile',
            pageID: 'profile',
        });
    });

    router.post('/profile', async (req, res) => {
        var username = req.body.username;
        var id = req.session.passport.user;
        var currentEmail = req.body.currentemail;
        var newEmail = req.body.email;
        var password = req.body.password;
        var currentPassword = req.body.currentpassword;
        var newPassword = req.body.newpassword;
        var confirmPassword = req.body.confirmpassword;
        var messageArray = [];

        if(req.body.firstname) {
            firstName = req.body.firstname;
        } else {
            firstName = null;
        }
        if(req.body.lastname) {
            lastName = req.body.lastname;
        } else {
            lastName = null;
        }
        if(req.body.company) {
            company = req.body.company;
        } else {
            company = null;
        }
        if(req.body.aboutme) {
            aboutMe = req.body.aboutme;
        } else {
            aboutMe = null;
        }
        try {
            if(newEmail) {
                if(currentEmail === newEmail) {
                    req.flash('messageEmail', 'Your current email and the new email are the same');
                    return res.redirect('/profile');
                }
                messageArray = await user.updateEmail(id, newEmail, password);
                req.flash(messageArray[0], messageArray[1]);
            } else if (newPassword) {
                var validPass = validation.isValidPasswordReg(newPassword);
                if(validPass !== 'ok') {
                    req.flash('messagePassword', validPass);
                    return res.redirect('/profile');
                }
                var passMatch = validation.passwordMatches(newPassword, confirmPassword);
                if(passMatch !== 'ok') {
                    req.flash('messagePassword', passMatch);
                    return res.redirect('/profile');
                }
                if(currentPassword === newPassword) {
                    req.flash('messagePassword', 'Your provided current password and the new password are the same');
                    return res.redirect('/profile');
                }
                messageArray = await user.updatePassword(id, currentPassword, newPassword, confirmPassword);
                req.flash(messageArray[0], messageArray[1]);
            } else {
                messageArray = await user.updateUser(username, firstName, lastName, company, aboutMe).then((newUser) => {
                    if(!newUser) {
                        return ['messageAboutme', 'Something went wrong with your update'];
                    }
                    if(newUser) {
                        return ['successAboutme', 'Updates have been succesfully saved'];
                    }
                }).catch((err) => {
                    console.log('Error:', err);
                    return ['messageAboutme', 'Something went wrong with your update'];
                });
                req.flash(messageArray[0], messageArray[1]);
            }
        } catch (err) {
            console.log(err);
        }
        res.redirect('/profile');
    });
    return router;
};