const errors = require('../constants/errors');

module.exports = function (app) {

    app.get('/', function (req, res) {
        res.json({'message': 'hello'})
    });

    /**
     * Error handling
     */

    app.use(function (err, req, res, next) {
        // treat as 404
        if (
            err.message &&
            (~err.message.indexOf('not found') ||
                ~err.message.indexOf('Cast to ObjectId failed'))
        ) {
            return next();
        }
        console.error(err.stack);
        if (err.stack.includes('ValidationError')) {
            res.status(422).json(err.stack);
            return;
        }
        // error page
        res.status(500).json(err.stack);
    });

    // assume 404 since no middleware responded
    app.use(function (req, res) {
        return res.status(404).json(errors.http[404]);
    });
};