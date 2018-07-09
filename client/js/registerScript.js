(function() {
    'use strict';
    window.addEventListener('load', () => {
        var forms = document.getElementsByClassName('needs-validation');
        const userInput = document.getElementById('reg-username');
        const emailInput = document.getElementById('reg-email');
        const passwordInput = document.getElementById('reg-password');
        const userHelp = document.getElementById('usernamehelp');
        const emailHelp = document.getElementById('emailhelp');
        const passwordHelp = document.getElementById('passwordhelp');
        var usernameStart = true;

        userInput.addEventListener('keyup', () => {
            var username = userInput.value;
            var patt1 = new RegExp(/^[A-Za-z0-9_-]+$/);

            if(username.length < 3 && usernameStart && patt1.test(username)) {
                return;
            }
            if(username.length >= 3 && usernameStart && patt1.test(username)) {
                usernameStart = false;
                userInput.classList.add('valid');
                return;
            }
            if(username.length < 3 || username.length > 30 || !patt1.test(username)) {
                if(userInput.classList.contains('valid')) {
                    userInput.classList.remove('valid');
                }
                userInput.classList.add('invalid');
                userHelp.style.display = 'block';
            } else {
                if(userInput.classList.contains('invalid')) {
                    userInput.classList.remove('invalid');
                }
                userInput.classList.add('valid');
                userHelp.style.display = 'none';
            }
        }, false);

        emailInput.addEventListener('blur', () => {
            if(emailInput.value.length < 6) {
                if(emailInput.classList.contains('valid')) {
                    emailInput.classList.remove('valid');
                }
                emailInput.classList.add('invalid');
                emailHelp.style.display = 'block';
            } else {
                if(emailInput.classList.contains('invalid')) {
                    emailInput.classList.remove('invalid');
                }
                emailInput.classList.add('valid');
                emailHelp.style.display = 'none';
            }
        }, false);

        passwordInput.addEventListener('blur', () => {
            var password = passwordInput.value;
            var patt1 = new RegExp(/[A-Z]+/);
            var patt2 = new RegExp(/[a-z]+/);
            var patt3 = new RegExp(/[0-9]+/);

            if(password.length < 8 || !patt1.test(password) || !patt2.test(password) || !patt3.test(password)) {
                if(passwordInput.classList.contains('valid')) {
                    passwordInput.classList.remove('valid');
                }
                passwordInput.classList.add('invalid');
                passwordHelp.style.display = 'block';
            } else {
                if(passwordInput.classList.contains('invalid')) {
                    passwordInput.classList.remove('invalid');
                }
                passwordInput.classList.add('valid');
                passwordHelp.style.display = 'none';
            }     
        }, false);

        var validation = Array.prototype.filter.call(forms, (form) => {
            form.addEventListener('submit', (event) => {
                if(form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
})();