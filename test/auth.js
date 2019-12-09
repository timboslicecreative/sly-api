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

    describe('/POST users', () => {
        it('it should fail to register a new user with incorrect password confirmation', (done) => {
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

        it('it should register a new user', (done) => {
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

    describe('/GET auth', () => {
        it('it should check authentication status and receive an unauthorised status', (done) => {
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
        it('it should fail authentication', (done) => {
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

        it('it should authenticate', (done) => {
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
                    res.body.should.have.property('email').eql(user.email);
                    res.body.should.have.property('id');
                    done();
                });
        });

        it('it should authenticate and receive a token', (done) => {
            let user = {
                email: "success@sly-api.com",
                password: "abc123"
            };

            chai.request(api.app)
                .post('/auth?token=true')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('token');
                    res.body.token.should.be.a('string');
                    done();
                });
        });
    });

    // describe('/GET auth/logout', () => {
    //     it('it should deauthenticate and remove token cookie', (done) => {
    //         chai.request(api.app)
    //             .get('/auth')
    //             .end((err, res) => {
    //                 res.should.have.status(200);
    //                 res.body.should.be.a('object');
    //                 done();
    //             });
    //     });
    // });

});

