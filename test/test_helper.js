const mongoose = require('mongoose');
const SlyApi = require('../slyapi');
const api = new SlyApi(3323, 'mongodb://db/slyapitest');

//tell mongoose to use es6 implementation of promises
mongoose.Promise = global.Promise;

mongoose.connection
    .once('open', () => console.log('Connected!'))
    .on('error', (error) => {
        console.warn('Error : ',error);
    });

//Called hooks which runs before something.
before((done) => {
    mongoose.connect('mongodb://db/slyapitest', function(){
        mongoose.connection.db.dropDatabase(function(){
            done();
        })
    })
});