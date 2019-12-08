const express = require('express');
const mongoose = require('mongoose');
const logo = require('./constants').logo;

class Slyapi {

    constructor(port, mongo_uri) {
        this.authStrategies = {};
        this.port = port || process.env.PORT || 3000;
        this.mongo_uri = mongo_uri || process.env.MONGO_URI || 'mongodb://db/slydb';
    }

    configureExpress() {
        // Configure Express
        console.log('\nLoading express configuration.\n');
        this.app = express();
        this.server = null;
        require('./config/express').initialize(this.app);

    }

    configureAuthentication() {
        // Configure Passport

        console.log('\nCreate Authentication.\n');

        const models = this.models;
        const controllers = this.controllers;
        const endpoints = this.endpoints;

        let model = models['user'];

        let endpoint = endpoints['auth'];
        let controller = new controllers['auth'](model);

        const passport = require('./config/passport');
        const Passport = new passport(this.app, controller);

        this.authStrategies = Passport.getStrategies();
        const authEndpoint = new endpoint(this.app, 'auth', controller, this.authStrategies).initialize();
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

    loadDefaultRoutes() {
        console.log('\nLoading routes.\n');
        require('./config/routes')(this.app);
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

            new endpoint(this.app, name.toLowerCase(), new controller(model), authStrategies);
        }
    }

    listen() {
        const app = this.app;
        const port = this.port;
        return new Promise((resolve, reject) => {
            const server = app.listen(port, ()=>{
                console.log(`\nSly-api started on port ${port}\n`);
                resolve(server);
            });
        });
    }

    connect() {
        const mongo_uri = this.mongo_uri;
        return new Promise((resolve, reject) => {
            console.log(`\nConnecting mongoose to ${mongo_uri}\n`);
            mongoose.connection
                .on('error', reject)
                .on('disconnected', () => {
                    console.log('disconnected')
                })
                //.on('disconnected', connect)
                .once('open', () => {
                    console.log('mongoose connected, resolving');
                    resolve();
                });

            mongoose.set('useUnifiedTopology', true);
            mongoose.set('useCreateIndex', true);
            mongoose.connect(mongo_uri, {keepAlive: 1, useNewUrlParser: true});
        });
    }

    start() {
        return new Promise((resolve, reject) => {
            console.log(logo);
            this.loadModels();
            this.loadControllers();
            this.loadEndpoints();
            this.configureExpress();
            this.configureAuthentication();
            this.createEndpoints();
            this.loadDefaultRoutes();
            this.connect()
                .then(() => this.listen())
                .then(server => {
                    this.server = server;
                    resolve(server);
                })
                .catch(reject);
        })
    }

    stop(){
        const port = this.port;
        this.server.close(()=>{
           console.log(`\nSly-api stopped on port ${port}\n`);
       });
    }
}

module.exports = Slyapi;

