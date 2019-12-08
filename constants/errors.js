exports.mongo = {
    11000: {
        code: 'duplicate_key',
        message: 'This email has already been registered'
    }
};

exports.http = {
    404: {code: 'not-found', message: 'The resource you requested has not been found'},
    405: {code: 'not-implemented', message: 'Method not implemented'}
};

exports.named = {
    'invalid-credentials': {code: 'invalid-credentials', message: "Invalid email or password"},
    'invalid-email': {code: 'invalid-email', message: "Email does not exist"},
    'invalid-password': {code: 'invalid-password', message: "Password is incorrect"},
    'invalid-token': {code: 'invalid-token', message: "Invalid authentication token, re-authentication required"},
    'passwords-mismatch': {code: 'passwords-mismatch', message: "Password and password confirmation do not match"},
    'password-update-mismatch': {code: 'password-update-mismatch', message: "New password and new password confirmation do not match"},
    'email-update-mismatch': {code: 'email-update-mismatch', message: "New email and email confirmation do not match"},
    'email-exists': {code: 'email-exists', message: "This email address has already been registered"},
    'delete-no-comment': {code: 'delete-no-comment', message: "No reason was given for deleting the account"},
    'invalid-verification-code': {code: 'invalid-verification-code', message: "The verification code is invalid"},
    'expired-verification-code': {code: 'expired-verification-code', message: "The verification code has expired"}
};