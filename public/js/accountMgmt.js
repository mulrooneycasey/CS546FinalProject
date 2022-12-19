const validClass = 'valid-feedback', invalidClass = 'invalid-feedback';

const showValidationMessage = (msg, parent, elemId, validationClass) => {
    let divContainer = $('<div></div>');
    divContainer.attr('id', elemId)
    divContainer.addClass(`col-sm-4 col-auto ${validationClass} validation-message`);
    divContainer.html(msg);
    parent.append(divContainer);
    divContainer.show();
};

const validateFirstName = firstVal => {
    let validationMsg = 'Valid first name provided.';
    let parentDiv = $('#firstInput').parent('div').parent('div');
    let regex = /[A-Za-z]{3,64}/;

    // Check if a validation message is already on screen. If so, then remove it.
    let validationMsgOnScreen = parentDiv.has('div.validation-message').length > 0;
    if (validationMsgOnScreen) {
        if ($('#firstValueError').length > 0) $('#firstValueError').remove();
        else if ($('#firstValueSuccess').length > 0) $('#firstValueSuccess').remove();
    }

    // Check if the first name is invalid. If so, display an invalid error message on screen.
    if (!regex.test(firstVal) || firstVal.length < 3 || firstVal.length > 64) {
        validationMsg = firstVal.length < 3 ? 'The first name provided is less than 3 characters.' : (!regex.test(firstVal) ? 'First name should only be letters.' : 'The first name provided is greater than 64 characters.');
        showValidationMessage(validationMsg, parentDiv, 'firstValueError', invalidClass);
        return false;
    }
    // Else, display a valid succcess message on screen.
    else {
        showValidationMessage(validationMsg, parentDiv, 'firstValueSuccess', validClass);
        return true;
    }
}

const validateLastName = lastVal => {
    let validationMsg = 'Valid last name provided.';
    let parentDiv = $('#lastInput').parent('div').parent('div');
    let regex = /[A-Za-z]{3,64}/;

    // Check if a validation message is already on screen. If so, then remove it.
    let validationMsgOnScreen = parentDiv.has('div.validation-message').length > 0;
    if (validationMsgOnScreen) {
        if ($('#lastValueError').length > 0) $('#lastValueError').remove();
        else if ($('#lastValueSuccess').length > 0) $('#lastValueSuccess').remove();
    }

    // Check if the first name is invalid. If so, display an invalid error message on screen.
    if (!regex.test(lastVal) || lastVal.length < 3 || lastVal.length > 64) {
        validationMsg = lastVal.length < 3 ? 'The last name provided is less than 3 characters.' : (!regex.test(lastVal) ? 'Last name should only be letters.' : 'The last name provided is greater than 64 characters.');
        showValidationMessage(validationMsg, parentDiv, 'lastValueError', invalidClass);
        return false;
    }
    // Else, display a valid succcess message on screen.
    else {
        showValidationMessage(validationMsg, parentDiv, 'lastValueSuccess', validClass);
        return true;
    }
}

const validateUsername = usernameVal => {
    let validationMsg = 'Valid username provided.';
    let parentDiv = $('#usernameInput').parent('div').parent('div');
    let regex = /[A-Za-z*\d]{5,20}/;

    // Check if a validation message is already on screen. If so, then remove it.
    let validationMsgOnScreen = parentDiv.has('div.validation-message').length > 0;
    if (validationMsgOnScreen) {
        if ($('#usernameValueError').length > 0) $('#usernameValueError').remove();
        else if ($('#usernameValueSuccess').length > 0) $('#usernameValueSuccess').remove();
    }

    // Check if the username is invalid. If so, display an invalid error message on screen.
    if (!regex.test(usernameVal) || usernameVal.length < 5 || usernameVal.length > 20) {
        validationMsg = usernameVal.length < 5 ? 'The username provided is less than 5 characters.' : (!regex.test(usernameVal) ? 'Username should only have alphanumeric characters.' : 'The username provided is greater than 20 characters.');
        showValidationMessage(validationMsg, parentDiv, 'usernameValueError', invalidClass);
        return false;
    }
    // Else, display a valid succcess message on screen.
    else {
        showValidationMessage(validationMsg, parentDiv, 'usernameValueSuccess', validClass);
        return true;
    }
}

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

const validatePhoneNum = phoneVal => {
    let validationMsg = 'Valid phone number provided.';
    let parentDiv = $('#phoneInput').parent('div').parent('div');
    let regex = /[0-9]{3}-[0-9]{3}-[0-9]{4}/;

    // Check if a validation message is already on screen. If so, then remove it.
    let validationMsgOnScreen = parentDiv.has('div.validation-message').length > 0;
    if (validationMsgOnScreen) {
        if ($('#phoneValueError').length > 0) $('#phoneValueError').remove();
        else if ($('#phoneValueSuccess').length > 0) $('#phoneValueSuccess').remove();
    }

    // Check if the phone number is invalid. If so, display an invalid error message on screen.
    if (!regex.test(phoneVal) || phoneVal.length > 12) {
        validationMsg = 'Phone number should be in the format: XXX-XXX-XXXX.';
        showValidationMessage(validationMsg, parentDiv, 'phoneValueError', invalidClass);
        return false;
    }
    // Else, display a valid succcess message on screen.
    else {
        showValidationMessage(validationMsg, parentDiv, 'phoneValueSuccess', validClass);
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

const validateOldPassword = passwordVal => {
    let validationMsg = 'Valid password provided.';
    let parentDiv = $('#oldPasswordInput').parent('div').parent('div');
    let regex = /(?=.*\d)(?=.*[!@#$%^&*_=+-])(?=.*[a-z])(?=.*[A-Z]).{6,64}/;

    // Check if a validation message is already on screen. If so, then remove it.
    let validationMsgOnScreen = parentDiv.has('div.validation-message').length > 0;
    if (validationMsgOnScreen) {
        if ($('#oldPasswordValueError').length > 0) $('#oldPasswordValueError').remove();
        else if ($('#oldPasswordValueSuccess').length > 0) $('#oldPasswordValueSuccess').remove();
    }

    // Check if the password is invalid. If so, display an invalid error message on screen.
    if (!regex.test(passwordVal) || passwordVal.length < 6 || passwordVal.length > 64) {
        validationMsg = passwordVal.length < 6 ? 'The password provided is less than 6 characters.' : (!regex.test(passwordVal) ? 'Password must include at least 1 lowercase, 1 uppercase, 1 number, and 1 special character.' : 'The password provided is greater than 64 characters.');
        showValidationMessage(validationMsg, parentDiv, 'oldPasswordValueError', invalidClass);
        return false;
    }
    // Else, display a valid succcess message on screen.
    else {
        let newPasswordVal = $('#passwordInput').val();
        // If the user has input for the new password, then check if the old password is the same 
        // as the new password. If so, display a valid success message on screen. Else, display an 
        // invalid error message on screen.
        if (newPasswordVal.length > 0) {
            if (passwordVal === newPasswordVal) {
                validationMsg = 'Both passwords are valid.';
                showValidationMessage(validationMsg, parentDiv, 'oldPasswordValueSuccess', validClass);
                return true;
            } else {
                validationMsg = 'Passwords do not match.';
                showValidationMessage(validationMsg, parentDiv, 'oldPasswordValueError', invalidClass);
                return false;
            }
        }
        // Else, display an invalid error message on screen.
        else {
            validationMsg = 'Please input a new password.';
            showValidationMessage(validationMsg, parentDiv, 'oldPasswordValueError', invalidClass);
            return false;
        }
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
    var firstInput = $('#firstInput'),
        lastInput = $('#lastInput'),
        usernameInput = $('#usernameInput'), 
        emailInput = $('#emailInput'), 
        phoneInput = $('#phoneInput'),
        passwordInput = $('#passwordInput'),
        oldPasswordInput = $('#oldPasswordInput');

    firstInput.on('keyup', evt => {
        if (!evt.repeat && checkValidKeypress(evt)) {
            let firstVal = firstInput.val();
            validateFirstName(firstVal);
        }
    });
    lastInput.on('keyup', evt => {
        if (!evt.repeat && checkValidKeypress(evt)) {
            let lastVal = lastInput.val();
            validateLastName(lastVal);
        }
    });
    usernameInput.on('keyup', evt => {
        if (!evt.repeat && checkValidKeypress(evt)) {
            let usernameVal = usernameInput.val();
            validateUsername(usernameVal);
        }
    });
    emailInput.on('keyup', evt => {
        if (!evt.repeat && checkValidKeypress(evt)) {
            let emailVal = emailInput.val();
            validateEmail(emailVal);
        }
    });
    phoneInput.on('keyup', evt => {
        if (!evt.repeat && checkValidKeypress(evt)) {
            let phoneVal = phoneInput.val();
            validatePhoneNum(phoneVal);
        }
    });
    passwordInput.on('keyup', evt => {
        if (!evt.repeat && checkValidKeypress(evt)) {
            let passwordVal = passwordInput.val();
            validatePassword(passwordVal);
        }
    });
    oldPasswordInput.on('keyup', evt => {
        if (!evt.repeat && checkValidKeypress(evt)) {
            let passwordVal = oldPasswordInput.val();
            validateOldPassword(passwordVal);
        }
    });

    // $('button[type=submit]').on('click', evt => {
    //     evt.preventDefault();

    //     let firstVal = firstInput.val(),
    //         lastVal = lastInput.val(),
    //         usernameVal = usernameInput.val(),
    //         emailVal = emailInput.val(),
    //         passwordVal = passwordInput.val(),
    //         oldPasswordVal = oldPasswordInput.val();

    //     console.log(document.location.pathname);
    //     let requestConfig = {
    //         method: 'POST',
    //         url: document.location.pathname,
    //         timeout: 5000,
    //         dataType: 'json',
    //         data: JSON.stringify({
    //             usernameInput: usernameVal,
    //             confirmationPasswordInput: oldPasswordVal,
    //             firstNameInput: firstVal,
    //             lastNameInput: lastVal,
    //             emailInput: emailVal,
    //             passwordInput: passwordVal
    //             // let username = xss(req.body.usernameInput);
    //             // let password = xss(req.body.confirmationPasswordInput) //NOTE: password is the CONFIRMATION PASSWORD, NOT THE CHANGE TO PASSWORD
    //             // let firstName = xss(req.body.firstNameInput);
    //             // let lastName = xss(req.body.lastNameInput);
    //             // let email = xss(req.body.emailInput);
    //             // let passwordC = xss(req.body.passwordInput);
    //         }),
    //         success: res => {
    //             console.log('POST success:');
    //             console.log(res);
    //             let updateButton = $('button[type=submit]');
    //             let alertDiv = $('<div></div>');
    //             alertDiv
    //                 .attr('role', 'alert')
    //                 .addClass('alert alert-success alert-dismissible fade show mt-2 w-75 text-center ml-auto mr-auto')
    //                 .html('Updated your information! <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</button>');
    //             updateButton.parent('div').after(alertDiv);
    //             if (res.redirect) {
    //                 window.location = res.redirect;
    //             }
    //         },
    //         error: () => {
    //             console.log('POST error.');
    //         }
    //     };

    //     $.ajax(requestConfig).then(function(response) {
    //         console.log(response);
    //         let updateButton = $('button[type=submit]');
    //         let alertDiv = $('<div></div>');
    //         alertDiv
    //             .attr('role', 'alert')
    //             .addClass('alert alert-success alert-dismissible fade show mt-2 w-75 text-center ml-auto mr-auto')
    //             .html('Updated your information! <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</button>');
    //         updateButton.parent('div').after(alertDiv);  
    //     }); 
    // });

    form.submit(evt => {
        let firstVal = firstInput.val(),
            lastVal = lastInput.val(),
            usernameVal = usernameInput.val(),
            emailVal = emailInput.val(),
            phoneVal = phoneInput.val(),
            passwordVal = passwordInput.val(),
            oldPasswordVal = oldPasswordInput.val();
        let validFirstName = validateFirstName(firstVal),
            validLastName = validateLastName(lastVal),
            validUsername = validateUsername(usernameVal),
            validEmail = validateEmail(emailVal),
            validPhoneNum = validatePhoneNum(phoneVal),
            validPassword = validatePassword(passwordVal),
            validOldPassword = validateOldPassword(oldPasswordVal);
        if (!validFirstName || !validLastName || !validUsername || !validEmail || !validPhoneNum || !validPassword || !validOldPassword) {
            evt.preventDefault();
            evt.stopPropagation();
        }
        form.addClass('was-validated');
    });
});