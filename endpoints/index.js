const fs = require('fs');
const path = require('path');
let endpoints = {};

const loadEndpoints = () => {
    let skip = [
        path.basename(__filename)
    ];

    let files = fs.readdirSync(__dirname)
        .filter(file => (
            ~file.search(/^[^.].*\.js$/) && !skip.includes(file)
        ));

    for (let endpoint, i = 0; i < files.length; i++) {
        process.stdout.write(`\tEndpoint ${files[i]}... `);
        endpoint = require(path.join(__dirname, files[i]));
        endpoints[files[i].replace('.js', '')] = endpoint;
        process.stdout.write(`Done.\n`);
    }

    return endpoints;
};


class Endpoint {

    constructor(app, path, controller, authStrategies) {
        this.app = app;
        this.path = path;
        this.controller = controller;
        this.authStrategies = authStrategies;
    }

    initialize() {
    }
}

class CrudEndpoint extends Endpoint {

    constructor(app, path, controller, authStrategies) {
        super(app, path, controller, authStrategies);
        this.initialize();
        this.authStrategy = authStrategies.jsonWebToken;
    }

    initialize() {
        this.list();
        this.create();
        this.read();
        this.update();
        this.patch();
        this.delete();
    }

    list() {
        this.app.get(`${this.path}`, this.authStrategy, this.controller.list);
    }

    create() {
        this.app.post(`${this.path}`, this.authStrategy, this.controller.create);
    }

    read() {
        this.app.post(`${this.path}/:id`, this.authStrategy, this.controller.read);
    }

    update() {
        this.app.put(`${this.path}/:id`, this.authStrategy, this.controller.update);
    }

    patch() {
        this.app.patch(`${this.path}/:id`, this.authStrategy, this.controller.patch);
    }

    delete() {
        this.app.delete(`${this.path}/:id`, this.authStrategy, this.controller.delete);
    }
}

module.exports.Endpoint = Endpoint;
module.exports.CrudEndpoint = CrudEndpoint;
module.exports.loadEndpoints = loadEndpoints;
module.exports.endpoints = endpoints;
