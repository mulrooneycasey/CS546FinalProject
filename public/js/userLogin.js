const validClass = 'valid-feedback', invalidClass = 'invalid-feedback';

const showValidationMessage = (msg, parent, elemId, validationClass) => {
    let divContainer = $('<div></div>');
    divContainer.attr('id', elemId)
    divContainer.addClass(`col-sm-4 col-auto ${validationClass} validation-message`);
    divContainer.html(msg);
    parent.append(divContainer);
    divContainer.show();
};

const validateEmail = emailVal => {
    let validationMsg = 'Valid email provided.';
    let parentDiv = $('#emailInput').parent('div').parent('div');
    // Email regex taken from https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#validation.
    let regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    // Check if a validation message is already on screen. If so, then remove it.
    let validationMsgOnScreen = parentDiv.has('div.validation-message').length > 0;
    if (validationMsgOnScreen) {
        if ($('#emailValueError').length > 0) $('#emailValueError').remove();
        else if ($('#emailValueSuccess').length > 0) $('#emailValueSuccess').remove();
    }

    // Check if the email address is invalid. If so, display an invalid error message on screen.
    if (!regex.test(emailVal) || emailVal.length < 3 || emailVal.length > 64) {
        validationMsg = emailVal.length < 3 ? 'The email address provided is less than 3 characters.' : (!regex.test(emailVal) ? 'Email must be in "name@email.com" format.' : 'The email address provided is greater than 64 characters.');
        showValidationMessage(validationMsg, parentDiv, 'emailValueError', invalidClass);
        return false;
    }
    // Else, display a valid succcess message on screen.
    else {
        showValidationMessage(validationMsg, parentDiv, 'emailValueSuccess', validClass);
        return true;
    }
}

const validatePassword = passwordVal => {
    let validationMsg = 'Valid password provided.';
    let parentDiv = $('#passwordInput').parent('div').parent('div');
    let regex = /(?=.*\d)(?=.*[!@#$%^&*_=+-])(?=.*[a-z])(?=.*[A-Z]).{6,64}/;

    // Check if a validation message is already on screen. If so, then remove it.
    let validationMsgOnScreen = parentDiv.has('div.validation-message').length > 0;
    if (validationMsgOnScreen) {
        if ($('#passwordValueError').length > 0) $('#passwordValueError').remove();
        else if ($('#passwordValueSuccess').length > 0) $('#passwordValueSuccess').remove();
    }

    // Check if the password is invalid. If so, display an invalid error message on screen.
    if (!regex.test(passwordVal) || passwordVal.length < 6 || passwordVal.length > 64) {
        validationMsg = passwordVal.length < 6 ? 'The password provided is less than 6 characters.' : (!regex.test(passwordVal) ? 'Password must include at least 1 lowercase, 1 uppercase, 1 number, and 1 special character.' : 'The password provided is greater than 64 characters.');
        showValidationMessage(validationMsg, parentDiv, 'passwordValueError', invalidClass);
        return false;
    }
    // Else, display a valid succcess message on screen.
    else {
        showValidationMessage(validationMsg, parentDiv, 'passwordValueSuccess', validClass);
        return true;
    }
}

const checkValidKeypress = (evt) => {
    let validKeypress = true;
    switch (evt.key) {
        case "Down":
        case "ArrowDown":
        case "Up":
        case "ArrowUp":
        case "Left":
        case "ArrowLeft":
        case "Right":
        case "ArrowRight":
        case "Home":
        case "End":
        case "PageDown":
        case "PageUp":
        case "Insert":
        case "Esc":
        case "Escape":
        case "Shift":
        case "Tab":
        case "CapsLock":
        case "Alt":
        case "Control":
        case "Fn":
        case "Meta":
        case "NumLock":
        case "Scroll":
        case "ScrollLock":
        case "Space Bar":
        case " ":
            validKeypress = false;
            break;
        default:
            return validKeypress;
    }
    return validKeypress;
}

$(document).ready(function() {
    let form = $('.needs-validation');
    var emailInput = $('#emailInput'), passwordInput = $('#passwordInput');

    emailInput.on('keyup', evt => {
        if (!evt.repeat && checkValidKeypress(evt)) {
            let emailVal = emailInput.val();
            validateEmail(emailVal);
        }
    });
    passwordInput.on('keyup', evt => {
        if (!evt.repeat && checkValidKeypress(evt)) {
            let passwordVal = passwordInput.val();
            validatePassword(passwordVal);
        }
    });

    form.submit(evt => {
        let emailVal = emailInput.val(), passwordVal = passwordInput.val();
        let validEmail = validateEmail(emailVal), validPassword = validatePassword(passwordVal);
        if (!validEmail || !validPassword) {
            evt.preventDefault();
            evt.stopPropagation();
        } else {
            let signInButton = $('button[type=submit]');
            let alertDiv = $('<div></div>');
            alertDiv
                .attr('role', 'alert')
                .addClass('alert alert-success mt-2 w-75 text-center ml-auto mr-auto')
                .html('Logging in... <a href="/" class="alert-link">Click on this link</a> to return the homepage.');
            signInButton.parent('div').after(alertDiv);
        }
        form.addClass('was-validated');
    });
});