const express = require('express');
const mongoose = require('mongoose');
const port = process.env.PORT;
const app = express();
const logo = require('./constants').logo;

class Slyapi {

    constructor() {
        this.authStrategies = {};
    }

    configureExpress() {
        // Configure Express
        console.log('\nLoading express configuration.\n');
        require('./config/express').initialize(app);

    }

    configureAuthentication(){
        // Configure Passport

        console.log('\nCreate Authentication.\n');

        const models = this.models;
        const controllers = this.controllers;
        const endpoints = this.endpoints;

        let model = models['user'];

        let endpoint = endpoints['auth'];
        let controller = new controllers['auth'](model);

        const Passport = require('./config/passport');
        const passport = new Passport(app, controller);

        this.authStrategies = passport.getStrategies();
        const authEndpoint = new endpoint(app, 'auth', controller).initialize();
    }

    loadModels() {
        console.log('\nLoading models:\n');
        this.models = require('./models');
    }

    loadControllers() {
        console.log('\nLoading controllers:\n');
        this.controllers = require('./controllers').loadControllers();
    }

    loadEndpoints() {
        console.log('\nLoading endpoints:\n');
        this.endpoints = require('./endpoints').loadEndpoints();
    }

    loadDefaultRoutes(){
        console.log('\nLoading routes.\n');
        require('./config/routes')(app);
    }

    createEndpoints() {
        console.log('\nCreating endpoints:\n');
        const models = this.models;
        const controllers = this.controllers;
        const endpoints = this.endpoints;
        const authStrategies = this.authStrategies;

        let defaultEndpoint = require('./endpoints').CrudEndpoint;
        let defaultController = require('./controllers').CrudController;

        let endpoint;
        let controller;
        let model;

        for (let name in models) {
            model = models[name];
            // check for endpoint if none use default
            endpoint = endpoints.hasOwnProperty(name) ? endpoints[name] : defaultEndpoint;
            // check for controller if none use default
            controller = endpoints.hasOwnProperty(name) ? controllers[name] : defaultController;

            new endpoint(app, name.toLowerCase(), new controller(model), authStrategies);
        }
    }

    listen() {
        console.log(`\nBegin listening on port ${port}`);
        app.listen(port);
        console.log(`\nSly-api started on port ${port}\n`);
    }

    connect() {
        console.log(`\nConnecting mongoose to ${process.env.MONGO_URI}\n`);
        mongoose.connection
            .on('error', console.log)
            .on('disconnected', () => {
                console.log('disconnected')
            })
            //.on('disconnected', connect)
            .once('open', this.listen);
        return mongoose.connect(process.env.MONGO_URI, {keepAlive: 1, useNewUrlParser: true});
    }

    start() {
        console.log(logo);
        this.loadModels();
        this.loadControllers();
        this.loadEndpoints();
        this.configureExpress();
        this.configureAuthentication();
        this.createEndpoints();
        this.loadDefaultRoutes();
        this.connect();
    }
}

module.exports = Slyapi;

