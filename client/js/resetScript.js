(function() {
    'use strict';
    window.addEventListener('load', () => {
        var forms = document.getElementsByClassName('needs-validation');
        const passwordInput = document.getElementById('reset-password');
        const passwordHelp = document.getElementById('reset-passwordhelp');

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