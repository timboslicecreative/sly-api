const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
chai.use(chaiHttp);
const SlyApi = require('../slyapi');
const api = new SlyApi(3323, 'mongodb://db/slyapitest');


//Our parent block
describe('Auth', () => {

    before(function () {
        // runs before all tests in this block
        api.start();
    });

    after(function () {
        // runs after all tests in this block
        api.stop();
    });

    describe('/GET auth status', () => {
        it('it should check authentication status and receive an unauthorised status and empty response', (done) => {
            chai.request(api.app)
                .get('/auth')
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    describe('/POST auth', () => {
        it('it should attempt authentication and fail with incorrect credentials', (done) => {
            let invalidUser = {
                email: "fail@sly-api.com",
                password: "abc123"
            };

            chai.request(api.app)
                .post('/auth')
                .send(invalidUser)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.body.should.be.a('object');
                    res.body.should.have.property('code').eql('invalid-credentials');
                    done();
                });
        });
    });

    describe('/POST user', () => {
        it('it should register a new user with incorrect password confirmation and receive the correct error code', (done) => {
            let user = {
                email: "success@sly-api.com",
                password: "abc123",
                passwordConfirm: "abc124"
            };

            chai.request(api.app)
                .post('/users')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.should.have.property('code').eql('passwords-mismatch');
                    done();
                });
        });
    });

    describe('/POST user', () => {
        it('it should register a new user and receive that user', (done) => {
            let user = {
                email: "success@sly-api.com",
                password: "abc123",
                passwordConfirm: "abc123"
            };

            chai.request(api.app)
                .post('/users')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('isVerified').eql(false);
                    res.body.should.have.property('email').eql(user.email);
                    res.body.should.have.property('id');
                    done();
                });
        });
    });

    describe('/POST auth', () => {
        it('it should attempt authentication and succeed', (done) => {
            let user = {
                email: "success@sly-api.com",
                password: "abc123"
            };

            chai.request(api.app)
                .post('/auth')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

});

