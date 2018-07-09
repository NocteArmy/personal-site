function isValidUsername(username) {

    if(username.length < 3 || username.length > 30) {
        return 'The username must be between 3 and 30 characters(inclusive).';
    }

    var patt1 = new RegExp(/^[A-Za-z0-9_-]+$/);
    if(!patt1.test(username)) {
        return 'The username must only contain numbers, letters, underscores and hyphens.';
    }

    return 'ok';
}

function isValidEmail(email) {
    if(email.length < 6) {
        return 'Please enter an email address.';
    }

    return 'ok';
}

function isValidPasswordReg(password) {

    if(password.length < 8) {
        return 'The password is too short.';
    }

    var patt1 = new RegExp(/[A-Z]+/);
    if(!patt1.test(password)) {
        return 'The password must contain at least one uppercase letter.';
    }

    var patt2 = new RegExp(/[a-z]+/);
    if(!patt2.test(password)) {
        return 'The password must contain at least one lowercase letter.';
    }

    var patt3 = new RegExp(/[0-9]+/);
    if(!patt3.test(password)) {
        return 'The password must contain at least one number.';
    }

    if(password.length > 1000) {
        return 'The password has an upper limit of 1000 characters.'
    }

    return 'ok';
}

function passwordMatches(password, confirmpassword) {
    if(password === confirmpassword) {
        return 'ok';
    } else {
        return 'The passwords do not match.';
    }
}

module.exports = () => {
    return {
        isValidUsername,
        isValidEmail,
        isValidPasswordReg,
        passwordMatches
    }
}