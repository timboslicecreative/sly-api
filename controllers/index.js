const fs = require('fs');
const path = require('path');
let controllers = {};
const errors = require('../constants/errors');


const loadControllers = () => {

    let skip = [
        path.basename(__filename)
    ];

    let files = fs.readdirSync(__dirname)
        .filter(file => (
            ~file.search(/^[^.].*\.js$/) && !skip.includes(file)
        ));

    for (let controller, i = 0; i < files.length; i++) {
        process.stdout.write(`\t Controller ${files[i]}... `);
        controller = require(path.join(__dirname, files[i]));
        controllers[files[i].replace('.js','')] = controller;
        process.stdout.write(`Done.\n`);
    }

    return controllers;

};


class Controller {

    constructor(model) {
        this.model = model;
    }

    create (req, res) {
        res.status(405).json(errors.http[405]);
    }

    read (req, res) {
        res.status(405).json(errors.http[405]);
    }

    update (req, res) {
        res.status(405).json(errors.http[405]);
    }

    delete (req, res) {
        res.status(405).json(errors.http[405]);
    }

    list (req, res) {
        res.status(405).json(errors.http[405]);
    }

}


class CrudController extends Controller {

    constructor(model) {
        super(model);
    }

    create(req, res) {
        const model = this.model;
        const modelName = this.modelName;

        model.register(req.body)
            .then(document => res.json(document))
            .catch(error => {
                console.log(`${modelName} create error: ${error}`);
                res.status(400).json(errors.mongo[error.code] || error);
            });
    }

    read(req, res) {
        const model = this.model;
        const modelName = this.modelName;

        model.findById(req.params.id)
            .then(document => res.json(document))
            .catch(error => {
                console.log(`${modelName} read error: ${error}`);
                res.status(404).send(errors.http[404])
            });
    };

    update(req, res) {
        res.status(405).json(HTTP_STATUS_ERRORS[405]);
    }

    patch(req, res) {
        res.status(405).json(HTTP_STATUS_ERRORS[405]);
    }

    delete(req, res) {
        res.status(405).json(HTTP_STATUS_ERRORS[405]);
    }

    list(req, res) {
        res.status(405).json(HTTP_STATUS_ERRORS[405]);
    };
}


module.exports.Controller = Controller;
module.exports.CrudController = CrudController;
module.exports.loadControllers = loadControllers;
module.exports.constrollers = controllers;