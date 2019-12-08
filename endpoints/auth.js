'use strict';
const Endpoint = require('../endpoints').Endpoint;

class AuthEndpoint extends Endpoint {

    constructor(app, path, controller, strategies) {
        super(app, path, controller, strategies);
    }

    initialize() {
        this.authentication();
        // console.log('auth initialize');
    }

    authentication() {
        // console.log('loading auth routes', this.strategies);
        const controller = this.controller;
        const app = this.app;
        const authJWT = this.strategies.jsonWebToken;
        const authLocal = this.strategies.local;
        const authCode = this.strategies.localCode;

        // Authentication Routes
        /**
         * Basic Username/Password Authentication
         * Accepts url param 'token' to return just the token
         */
        app.post('/auth', authLocal, controller.authenticate);
        /**
         * Username/Code Authentication
         * Accepts url param 'token' to return just the token
         */
        app.post('/auth/code', authCode, controller.authenticate);
        /**
         * Json Web Token Authentication
         * Accepts url param 'token' to return just the token
         */
        app.get('/auth', authJWT, controller.authenticate);
        app.get('/auth/logout', authJWT, controller.logout);
        app.post('/auth/code/request', controller.sendAuthenticationCode);
        app.get('/auth/code/request', authJWT, controller.sendVerificationCode);

    }

}

module.exports = AuthEndpoint;