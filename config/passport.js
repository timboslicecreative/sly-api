const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Token = mongoose.model('Token');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const constants = require('../constants');
const authController = require('../controllers/auth');
const ERRORS = constants.ERRORS;

const jwtCookieExtractor = function (req) {
    if (req.signedCookies && req.signedCookies['token']) return req.signedCookies['token'];
    else return null;
};

const JWT_OPTIONS = {
    jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        jwtCookieExtractor
    ]),
    secretOrKey: process.env.JWT_SECRET,
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE
};

const LOCAL_OPTIONS = {
    usernameField: 'email',
    passwordField: 'password',
    failWithError: false
};

const LOCAL_CODE_OPTIONS = {
    usernameField: 'email',
    passwordField: 'code',
    failWithError: false
};

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id).then(user => {
        done(null, user);
    });
});

passport.use('jwt', new JwtStrategy(JWT_OPTIONS, (jwt_payload, done) => {
    User.findById(jwt_payload.sub)
        .then(user => {
            if (user) return done(null, user);
            else return done(null, false, ERRORS['invalid-token']);
        })
        .catch(error => done(error, false));
}));

passport.use('local-password', new LocalStrategy(LOCAL_OPTIONS, (email, password, done) => {
    User.authenticate(email, password)
        .then(user => {
            if (user) return done(null, user);
            else return done(null, false, ERRORS['invalid-credentials']);
        })
        .catch(error => done(null, false, error));
}));

passport.use('local-code', new LocalStrategy(LOCAL_CODE_OPTIONS, (email, code, done) => {
    User.findByEmail(email)
        .then(user => Token.validateUserToken(user, code))
        .then(user => done(null, user))
        .catch(error => done(null, false, error));
}));


class Passport {

    constructor(app, controller) {
        this.controller = controller;
        this.strategies = {};
        this.setStrategies();
        app.use(passport.initialize());
    }

    setStrategies() {
        this.strategies = {
            // Wrap the auth strategies in an error handler so we can output json on authentication failure.
            jsonWebToken: this.authStrategy('jwt', {session: false}),
            local: this.authStrategy('local-password', {session: false}),
            localCode: this.authStrategy('local-code', {session: false})
        };
    }

    getStrategies(){
        return this.strategies;
    }

    // A wrapper for auth strategies that handles authentication failures better than the default passport implementation
    authStrategy(strategy, strategyOptions) {
        const auth = passport.authenticate.bind(passport);
        const controller = this.controller;

        return function (req, res, next) {
            auth(strategy, strategyOptions, function (error, user, info) {
                if (error) {
                    controller.deauthenticate(res);
                    console.log('AuthStrategy:error', error);
                    return res.status(404).json(error);
                }
                if (!user) {
                    controller.deauthenticate(res);
                    console.log('AuthStrategy:no user:info', info);
                    return res.status(401).json(info);
                }
                req.user = user;
                next(err)
            })(req, res, next);
        }
    };

}

module.exports = Passport;

//
// module.exports.initialize = function (app) {
//     app.use(passport.initialize());
// };
//
// module.exports.strategies = {
//     // Wrap the auth strategies in an error handler so we can output json on authentication failure.
//     jsonWebToken: authStrategy('jwt', {session: false}),
//     local: authStrategy('local-password', {session: false}),
//     localCode: authStrategy('local-code', {session: false})
// };

// module.exports = function (app) {
//
//     // Setup Auth Methods
//     const auth = passport.authenticate.bind(passport);
//
//     // Wrap the auth strategies in an error handler so we can output json on authentication failure.
//     const authJwt = authStrategy('jwt', {session: false});
//     const authLocal = authStrategy('local-password', {session: false});
//     const authLocalCode = authStrategy('local-code', {session: false});
//
// };

