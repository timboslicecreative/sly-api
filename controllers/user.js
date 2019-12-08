const mongoose = require('mongoose');
const User = mongoose.model('User');
const Token = mongoose.model('Token');
const mailer = require('../lib/mailer');
const constants = require('../constants');
const COOKIE_CONFIG = constants.COOKIE_CONFIG;
const HTTP_STATUS_ERRORS = constants.HTTP_STATUS_ERRORS;
const EMAIL_TEMPLATES = constants.EMAIL_TEMPLATES;

const errors = require('../constants/errors');
const ERRORS = errors.named;
const MONGO_ERRORS = errors.mongo;

const Controller = require('../controllers').Controller;

class UserController extends Controller {

    constructor(model) {
        super(model);
    }


    authenticate(req, res) {
        console.log(`authentivcate ${req.user} `);
        const sendToken = req.params.token;
        if (sendToken) {
            res.json({token: req.user.generateJsonWebToken()});
        } else {
            res.cookie('token', req.user.generateJsonWebToken(), COOKIE_CONFIG);
            res.json(req.user);
        }
    }

    deauthenticate(res) {
        res.clearCookie('token', COOKIE_CONFIG);
    }

    logout(req, res) {
        deauthenticate(res);
        res.json({});
    }

    create(req, res) {
        User.register(req.body)
            .then(user => {
                res.cookie('token', user.generateJsonWebToken(), COOKIE_CONFIG);
                return res.json(user);
            })
            .catch(error => {
                console.log('created user error', error);
                res.status(400).json(MONGO_ERRORS[error.code] || error)
            });
    }

    read(req, res) {
        User.findById(req.params.id)
            .then(result => res.json(result))
            .catch(error => res.status(404).send(HTTP_STATUS_ERRORS[404]));
    }

    update(req, res) {
        res.status(405).json(HTTP_STATUS_ERRORS[405]);
    }

    delete(req, res) {
        res.status(405).json(HTTP_STATUS_ERRORS[405]);
    }

    list(req, res) {
        res.status(405).json(HTTP_STATUS_ERRORS[405]);
    }

    updateEmail(req, res) {
        const {newEmail, newEmailConfirm} = req.body;

        if (newEmail !== newEmailConfirm) {
            return res.status(400).send(ERRORS['email-update-mismatch']);
        }

        User.findByEmail(newEmail)
            .then(user => {
                if (user) return res.status(400).send(ERRORS['email-exists']);
                // Update email
                req.user.email = newEmail;
                req.user.isVerified = false;
                return req.user.save();
            })
            .then(user => {
                res.json(user);
            })
            .catch(error => {
                console.log('update user email error', error);
                res.status(400).json(MONGO_ERRORS[error.code] || error)
            });
    }

    updatePassword(req, res) {
        const {newPassword, newPasswordConfirm} = req.body;

        if (newPassword !== newPasswordConfirm) {
            return res.status(400).send(ERRORS['password-update-mismatch']);
        }

        req.user.password = newPassword;
        req.user.save()
            .then(user => {
                res.json(user);
                mailer.renderMail(
                    {to: user.email, templates: EMAIL_TEMPLATES['password-changed']},
                    {}
                )
                    .then(response => {
                        console.log(`User.Create.SendMail.Success ${user.email}`);
                    })
                    .catch(error => {
                        console.log(`User.Create.SendMail.Error ${user.email} Error: ${error}`);
                    });
            })
            .catch(error => {
                console.log('update user password error', error);
                res.status(400).json(MONGO_ERRORS[error.code] || error)
            });
    }


    deleteUser(req, res) {
        const {comment, password} = req.body;

        if (!req.user.validatePassword(password)) {
            return res.status(401).send(ERRORS['invalid-password']);
        }
        if (!comment || comment === "") {
            return res.status(400).send(ERRORS['delete-no-comment']);
        }

        const user = Object.assign({}, req.user.toJSON());

        req.user.delete()
            .then(result => {
                res.clearCookie('token', COOKIE_CONFIG);
                res.json({});

                mailer.renderMail(
                    {to: process.env.ADMIN_EMAIL, templates: EMAIL_TEMPLATES['admin-account-deleted']},
                    {user, result, comment}
                )
                    .then(response => {
                        console.log(`User.Create.SendMail.Success ${process.env.ADMIN_EMAIL}`);
                    })
                    .catch(error => {
                        console.log(`User.Create.SendMail.Error ${process.env.ADMIN_EMAIL} Error: ${error}`);
                    });

            })
            .catch(error => {
                console.log('delete account error', error);
                res.status(400).json(MONGO_ERRORS[error.code] || error)
            });
    }

    verifyEmail(req, res) {
        const {code} = req.body;
        Token.validateUserToken(req.user, code)
            .then(user => user.setVerified())
            .then(user => res.json(user))
            .catch(error => res.status(400).json(MONGO_ERRORS[error.code] || error));
    }

    sendVerificationCode(req, res) {
        this.sendVerificationCodeViaEmail(req.user, 'verification-code')
            .then(result => res.status(200).send({}))
            .catch(error => res.status(500).send(error))
    }

    sendAuthenticationCode(req, res) {
        // get user email from body data
        const email = req.body.email;
        if (!email || email === "") return res.status(400).send(ERRORS['invalid-email']);

        // find user - send error if not exists
        User.findByEmail(email)
            .then(user => {
                if (!user) return res.status(400).send(ERRORS['invalid-email']);
                return this.sendVerificationCodeViaEmail(user, 'verification-code');
            })
            .then(result => res.status(200).send({}))
            .catch(error => res.status(500).send(error))
    }

    sendVerificationCodeViaEmail(user, emailType) {
        return new Promise((resolve, reject) => {
            // remove any previous email verification code
            Token.clearUserTokens(user);
            // Create Token and send via email
            Token.createToken(user.id)
                .then(code => mailer.renderMail(
                    {to: user.email, templates: EMAIL_TEMPLATES[emailType]},
                    {code: code, email: user.email})
                )
                .then(resolve)
                .catch(reject);
        })
    }
}

module.exports = UserController;