const SlyApi = require('./slyapi');
const api = new SlyApi();

api.start();

module.exports = api;