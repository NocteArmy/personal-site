const express = require('express');
const nodemailer = require('nodemailer');
const userFunctions = require('../../functions/userFunctions');
const util = require('../../util');

module.exports = (config) => {
    const router = express.Router();
    const user = userFunctions(config.postgres.client);
    
    router.get('/', util.ensureAuthenticated, (req, res) => {
        res.render('verify', {
            pageTitle: 'Verify',
            pageID: 'verify'
        });
    });

    router.post('/', async (req, res) => {
        var email = req.body.email;
        var auth = await user.resendVerify(email);
        if(auth[0] === 'authFailure') {
            req.flash(auth[0], auth[1]);
            return res.redirect('/verify');
        }
        var smtpTransport = nodemailer.createTransport(config.mail.options);
        var mailOptions = {
            to: email,
            from: 'no-reply@domain.com',
            subject: 'Welcome to domain.com - Please verify your email address',
            text: 'Hello,\n\nWelcome to Domain.com! This is my personal website that I am using as a way to learn more about programming. ' +
            'Thank you for registering. I will be adding more functionality for users in the near future.  In order to fully use the site\'s features and be able to recover your account, please ' + 
            'verify your email address. The link below will allow you to verify your account, however it is set to expire in 4 hours.\n' + 
            'https://' + req.headers.host + '/verify/' + auth[0] + '\n\n' + 
            'Cheers,\nDomain Owner\nSite Owner'
        };
        smtpTransport.sendMail(mailOptions, (err) => {
            if(err) {
                console.log(err);
            }
        });
        req.flash('authSuccess', 'Your new verification email has been sent');
        res.redirect('/profile');
    });

    router.get('/:token', async (req, res) => {
        try {
            var messageArray = await user.verifyUser(req.params.token);
            if(messageArray[0] === 'authFailure') {
                req.flash(messageArray[0], messageArray[1]);
                return res.redirect('/');
            }
            smtpTransport = nodemailer.createTransport(config.mail.options);
            var mailOptions = {
                to: messageArray[1],
                from: 'no-reply@domain.com',
                subject: 'Your email has been successfully verified!',
                text: 'Hello,\n\nThis is a confirmation that your email has been verified. Thank you again for signing up to my site.\n\n' + 
                'Cheers,\nDomain Owner\nSite Owner'
            };
            smtpTransport.sendMail(mailOptions, (err) => {
               if(err) throw err; 
            });
            req.flash('authSuccess', 'Your account has been successfully verified!')
        } catch(err) {
            console.log(err);
        }
        res.redirect('/');
    });

    return router;
};