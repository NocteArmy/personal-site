const Models = require('../models/sequelize');
const bCrypt = require('bcryptjs');
const createHash = require('hash-generator');
const nodemailer = require('nodemailer');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

let client = null;
let models = null;

async function getAuth(id) {
    return models.Auth.findOne({ 
        attributes: ['username', 'email', 'role', 'verified'],
        where: {
            userId: {
                [Op.eq]: id
            }
        }
    });
}

async function getUser(username) {
    return models.User.findOne({
        attributes: ['firstName', 'lastName', 'company', 'about'],
        where: {
            fk_username: {
                [Op.eq]: username
            }
        }
    });
}

async function verifyUser(token) {
    try {
        const user = await models.Auth.findOne({
            where: {
                verifyToken: {
                    [Op.eq]: token
                },
                verifyTokenExpires: {
                    [Op.gt]: Date.now()
                }
            }
        });
        if(!user) {
            return ['authFailure', 'Email verify token is invalid or has expired'];
        }
        var userData = {
            verified: true,
            verifyToken: null,
            verifyTokenExpires: null
        }
        const newAuth = await models.Auth.update(userData, {
            where: {
                username: {
                    [Op.eq]: user.username
                }
            }
        });
        if(!newAuth) {
            return ['authFailure', 'Something went wrong with the email verification.'];
        }
        if(newAuth) {
            return [user.username, user.email];
        }   
    } catch (err) {
        console.log(err);
    }
}

async function resendVerify(email) {
    try {
        var token = createHash(16);
        var userData = {
            verified: false,
            verifyToken: token,
            verifyTokenExpires: Date.now() + 4 * 60 * 60 * 1000
        }
        const user = await models.Auth.update(userData, {
            where: {
                email: {
                    [Op.eq]: email
                }
            }
        });
        if(!user) {
            return ['authFailure', 'Something went wrong with updating the verify token.'];
        }
        if(user) {
            return [token];
        }
    } catch (err) {
        console.log(err);
    }
}

async function resetPasswordRequest(email) {
    try {
        const user = await models.Auth.findOne({
            where: {
                email: {
                    [Op.eq]: email
                }
            }
        });
        if(!user) {
            return [null];
        }
        if(user.verified === false) {
            return ['authFailure', 'You must be verified to reset your password. Please contact the site owner for assistance.']
        }
        var token = createHash(16);
        var userData = {
            verifyToken: token,
            verifyTokenExpires: Date.now() + 60 * 60 * 1000
        }
        const newUser = await models.Auth.update(userData, {
            where: {
                email: {
                    [Op.eq]: email
                }
            }
        });
        if(!newUser) {
            return ['authFailure', 'Something went wrong with the request, please try again.'];
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
                to: email,
                from: 'no-reply@domain.com',
                subject: 'Password Reset Request',
                text: 'Hello,\n\nA password reset request was submitted for the account linked to this email address. If you did not request a password reset, please ignore this email. ' +
                'The reset request will expire and become invalid in 1 hour.\n' + 
                'Please visit the following url to complete the request:\n' + 
                'https://www.domain.com/reset/' + token + '\n\n' + 
                'Cheers,\nDomain Owner\nSite Owner'
            };
            smtpTransport.sendMail(mailOptions, (err) => {
                if(err) {
                    console.log(err);
                }
            });
        }
        return [null];
    } catch (err) {
        console.log(err);
    }
}

async function checkResetToken(token) {
    try {
        const user = await models.Auth.findOne({
            where: {
                verifyToken: {
                    [Op.eq]: token
                },
                verifyTokenExpires: {
                    [Op.gt]: Date.now()
                }
            }
        });
        if(!user) {
            return ['authFailure', 'Password reset token is invalid or has expired'];
        }
        if(user) {
            return [null];
        }
    } catch (err) {
        console.log(err);
    }
}

async function resetPassword(password, token) {
    try {
        const user = await models.Auth.findOne({
            where: {
                verifyToken: {
                    [Op.eq]: token
                },
                verifyTokenExpires: {
                    [Op.gt]: Date.now()
                }
            }
        });
        if(!user) {
            return ['authFailure', 'Password reset token is invalid or has expired'];
        }
        var generateHash = (password) => {
            return bCrypt.hashSync(password, bCrypt.genSaltSync(10));
        }
        var userData = {
            hashPass: generateHash(password),
            verifyToken: null,
            verifyTokenExpires: null
        }
        const newAuth = await models.Auth.update(userData, {
            where: {
                verifyToken: {
                    [Op.eq]: token
                }
            }
        });
        if(!newAuth) {
            return ['authFailure', 'Something went wrong with the request, please try again.'];
        }
        if(newAuth) {
            var smtpTransport = nodemailer.createTransport({
                service: 'SendinBlue',
                requireTLS: true,
                auth: {
                    user: 'username',
                    pass: 'password'
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'no-reply@domain.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\nThis is a confirmation email that your password request was successfully completed and your password has been updated.\n\n' +
                'Cheers,\nDomain Owner\nSite Owner'
            };
            smtpTransport.sendMail(mailOptions, (err) => {
                if(err) {
                    console.log(err);
                }
            });
            return[null];
        }
    } catch (err) {
        console.log(err);
    }
}

async function getAllAuths() {
    return models.Auth.findAll({
        attributes: ['userId', 'username', 'email', 'role'],
    });
}

async function getAllUsers() {
    return models.User.findAll({
        attributes: ['firstName', 'lastName', 'company', 'about'],
    });
}

async function updateEmail(id, email, password) {
    try {
        var isValidPassword = (userpass, password) => {
            return bCrypt.compareSync(password, userpass);
        }
    
        const auth = await models.Auth.findOne({
            where: {
                userId: {
                    [Op.eq]: id
                }
            }
        });
        if(!auth || !isValidPassword(auth.hashPass, password)) {
            return ['messageEmail', 'Invalid password, please try again'];
        } else {
            var token = createHash(16);
            var userData = {
                email: email,
                verified: false,
                verifyToken: token,
                verifyTokenExpires: Date.now() + 4 * 60 * 60 * 1000
            }
            const newAuth = await models.Auth.update(userData, {
                where:{
                    userId: {
                        [Op.eq]: id
                    }
                }
            });
            if(!newAuth) {
                return ['messageEmail', 'Something went wrong with your update'];
            }
            if(newAuth) {
                var smtpTransport = nodemailer.createTransport({
                    service: 'SendinBlue',
                    requireTLS: true,
                    auth: {
                        user: 'username',
                        pass: 'password'
                    }
                });
                var mailOptions = {
                    to: email,
                    from: 'no-reply@domain.com',
                    subject: 'Please verify your email address',
                    text: 'Hello,\n\nYour email account on domain.com was updated recently; in order to fully use the site\'s features and be able to recover your account, please ' + 
                    'verify your email address.  The link below will allow you to verify your account, however it is set to expire in 4 hours.\n' + 
                    'https://domain.com/verify/' + token + '\n\n' + 
                    'Cheers,\nDomain Owner\nSite Owner'
                };
                smtpTransport.sendMail(mailOptions, (err) => {
                    if(err) {
                        log.info(err);
                    }
                });
                return ['successEmail', 'Your email was successfully updated. Please check your new email address to verify your account again'];
            }
        }
    } catch (err) {
        console.log(err);
    }
}

async function updatePassword(id, currentPassword, newPassword, confirmPassword) {
    try { 
        var isValidPassword = (userpass, password) => {
            return bCrypt.compareSync(password, userpass);
        }
    
        var generateHash = (password) => {
            return bCrypt.hashSync(password, bCrypt.genSaltSync(10));
        }
    
        const auth = await models.Auth.findOne({
            where: {
                userId: {
                    [Op.eq]: id
                }
            }
        });
        if(!auth || !isValidPassword(auth.hashPass, currentPassword)) {
            return ['messagePassword', 'Invalid password, please try again'];
        } else {
            var hashPass = generateHash(newPassword);
            const newAuth = await models.Auth.update({ hashPass }, {
                where:{
                    userId: {
                        [Op.eq]: id
                    }
                } 
            });
            if(!newAuth) {
                return ['messagePassword', 'Something went wrong with your update'];
            }
            if(newAuth) {
                return ['successPassword', 'Your password was successfully updated'];
            }
        }
    } catch (err) {
        console.log(err);
    }
}

async function updateUser(username, firstName, lastName, company, about) {
    return models.User.update({ firstName, lastName, company, about }, {
        where: {
            fk_username: {
                [Op.eq]: username
            } 
        }
    });
}

module.exports = (_client) => {
    models = Models(_client);
    client = _client;

    return {
        getAuth,
        getUser,
        verifyUser,
        resendVerify,
        resetPasswordRequest,
        checkResetToken,
        resetPassword,
        getAllAuths,
        getAllUsers,
        updateEmail,
        updatePassword,
        updateUser
    }
}