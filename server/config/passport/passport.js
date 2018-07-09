const bCrypt = require('bcryptjs');
const createHash = require('hash-generator');
const nodemailer = require('nodemailer');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const validationFunctions = require('./../../functions/validationFunctions');

module.exports = (passport, logger, auth, user) => {

    const Auth = auth;
    const User = user;
    const log = logger;
    const validation = validationFunctions();
    const LocalStrategy = require('passport-local').Strategy;
    
    passport.use('local-register', new LocalStrategy(
        {
            passReqToCallback: true
        },
        async (req, username, password, done) => {
            var generateHash = (password) => {
                return bCrypt.hashSync(password, bCrypt.genSaltSync(10));
            }
            
            var validUsername = validation.isValidUsername(username);
            if(validUsername !== 'ok') {
                return done(null, false, req.flash('authFailure', validUsername));
            }

            var validEmail = validation.isValidEmail(req.body.email);
            if(validEmail !== 'ok') {
                return done(null, false, req.flash('authFailure', validEmail));
            }

            var passMatch = validation.passwordMatches(req.body.password, req.body.confirmpassword);
            if(passMatch !== 'ok') {
                return done(null, false, req.flash('authFailure', passMatch));
            }

            var validPass = validation.isValidPasswordReg(password);
            if(validPass !== 'ok') {
                return done(null, false, req.flash('authFailure', validPass));
            }

            const authUser = await Auth.findOne({
                where: {
                    username: {
                        [Op.eq]: username
                    }
                }
            });
            if(authUser) {
                return done(null, false, req.flash('authFailure', 'That username is already taken.'));
            }

            const authEmail = await Auth.findOne({
                where: {
                    email: {
                        [Op.eq]: req.body.email
                    }
                }
            });
            if(authEmail) {
                return done(null, false, req.flash('authFailure', 'That email is already associated with an account.'));
            }

            var userPassword = generateHash(password);
            var token = createHash(16);

            var userData = {
                username: username,
                email: req.body.email,
                hashPass: userPassword,
                verifyToken: token,
                verifyTokenExpires: Date.now() + 4 * 60 * 60 * 1000
            };
            
            const newAuth = await Auth.create(userData);
            if(!newAuth) {
                return done(null, false, req.flash('authFailure', 'Something went wrong, please try again.'));
            }
            if(newAuth) {
                User.create({ fk_username: username }).then((newUser) => {
                    if(!newUser) {
                        return done(null, false, req.flash('authFailure', 'Something went wrong, please try again.'));
                    }
                    if(newUser) {
                        var smtpTransport = nodemailer.createTransport({
                            service: 'SendinBlue',
                            requireTLS: true,
                            auth: {
                                user: 'username',
                                pass: 'password'
                            }
                        });
                        var mailOptions = {
                            to: userData.email,
                            from: 'no-reply@domain.com',
                            subject: 'Welcome to domain.com - Please verify your email address',
                            text: 'Hello,\n\nWelcome to Domain.com! This is my personal website that I am using as a way to learn more about programming. ' +
                            'Thank you for registering. I will be adding more functionality for users in the near future. In order to fully use the site\'s features and be able to recover your account, please ' + 
                            'verify your email address. The link below will allow you to verify your account, however it is set to expire in 4 hours.\n' + 
                            'https://' + req.headers.host + '/verify/' + token + '\n\n' + 
                            'Cheers,\nDomain Owner\nSite Owner'
                        };
                        smtpTransport.sendMail(mailOptions, (err) => {
                            if(err) {
                                log.info(err);
                            }
                        });
                        return done(null, newAuth, req.flash('authSuccess', `Your account was successfully created. An email has been sent to ${userData.email} with further instructions.`));
                    }
                }).catch((err) => {
                    log.info('Error:', err);
                    return done(null, false, req.flash('authFailure', 'Something went wrong, please try again.'));
                });
            }
        }
    ));

    passport.use('local-login', new LocalStrategy(
        {
            passReqToCallback: true
        },

        (req, username, password, done) => {
            var isValidPassword = (userpass, password) => {
                return bCrypt.compareSync(password, userpass);
            }

            Auth.findOne({
                where: {
                    username: {
                        [Op.eq]: username
                    }
                }
            })
            .then((auth) => {
                if(!auth || !isValidPassword(auth.hashPass, password)) {
                    return done(null, false, req.flash('authFailure', 'Incorrect Username/Password. Please try again.'));
                }

                var userinfo = auth.get();
                return done(null, userinfo, req.flash('authSuccess', 'You have successfully logged in.'));
            })
            .catch((err) => {
                log.info('Error:', err);
                return done(null, false, req.flash('authFailure', 'Something went wrong with your Login.'));
            });
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.userId);
    });

    passport.deserializeUser((id, done) => {
        Auth.findById(id).then((user) => {
            if(user) {
                done(null, user.get());
            } else {
                done(user.errors, null);
            }
        });
    });

}