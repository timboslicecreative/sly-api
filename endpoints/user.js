'use strict';
const Endpoint = require('../endpoints').CrudEndpoint;

class UsersEndpoint extends Endpoint {

    constructor(app, path, controller) {
        super(app, path, controller);
    }

    initialize() {
        this.user();
    }

    user() {
        const app = this.app;
        const authJWT = this.authStrategies.jsonWebToken;
        const controller = this.controller;

        app.post('/users/email', authJWT, controller.updateEmail);
        app.post('/users/email/verify', authJWT, controller.verifyEmail);

        app.post('/users/password', authJWT, controller.updatePassword);
        app.post('/users/delete', authJWT, controller.deleteUser);

        app.get('/users', authJWT, controller.list);
        app.post('/users', controller.create);

        app.get('/users/:id', authJWT, controller.read);
        app.put('/users/:id', authJWT, controller.update);
        app.patch('/users/:id', authJWT, controller.update);
        app.delete('/users/:id', authJWT, controller.delete);

        app.get('/', function (req, res) {
            res.json({'message': 'hello user'})
        });
    }

}

module.exports = UsersEndpoint;