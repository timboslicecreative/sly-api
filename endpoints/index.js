const fs = require('fs');
const path = require('path');
let endpoints = {};

const loadEndpoints = () => {
    let skip = [
        path.basename(__filename),
        'auth'
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

    constructor(app, path, controller, strategies) {
        this.app = app;
        this.path = path;
        this.controller = controller;
        this.strategies = strategies;
    }

    initialize() {
    }
}

class CrudEndpoint extends Endpoint {

    constructor(app, path, controller, strategies) {
        super(app, path, controller, strategies);
        this.strategy = strategies.jsonWebToken;
        this.controller = controller;
        this.initialize();
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
        this.app.get(`${this.path}`, this.strategy, this.controller.list);
    }

    create() {
        this.app.post(`${this.path}`, this.strategy, this.controller.create);
    }

    read() {
        this.app.post(`${this.path}/:id`, this.strategy, this.controller.read);
    }

    update() {
        this.app.put(`${this.path}/:id`, this.strategy, this.controller.update);
    }

    patch() {
        this.app.patch(`${this.path}/:id`, this.strategy, this.controller.patch);
    }

    delete() {
        this.app.delete(`${this.path}/:id`, this.strategy, this.controller.delete);
    }
}

module.exports.Endpoint = Endpoint;
module.exports.CrudEndpoint = CrudEndpoint;
module.exports.loadEndpoints = loadEndpoints;
module.exports.endpoints = endpoints;
