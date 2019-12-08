const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const errors = require('../constants/errors');
const ERRORS = errors.named;

const UserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: [true, 'Email address is required'],
        //match: [process.env.PATTERN_EMAIL || PATTERNS.email, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        //select: false,
    },
    isVerified: {
        type: Boolean,
        default: false
    }
});


// Hooks
UserSchema.pre('save', function (next) {
    if (!this.password) {
        const error = new Error('No password provided');
        next(error)
    }
    if (!this.isModified('password')) return next();

    this.password = this.hashPassword(this.password);
    return next();
}, {strict: true});


// Methods

UserSchema.methods.validatePassword = function (inputPassword) {
    return bcrypt.compareSync(inputPassword, this.password);
};

UserSchema.methods.hashPassword = (plainTextPassword) => (
    bcrypt.hashSync(plainTextPassword, 10)
);

UserSchema.methods.generateJsonWebToken = function () {
    return jsonwebtoken.sign(
        {sub: this._id},
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRY,
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        }
    );
};

UserSchema.methods.setVerified = function () {
    this.isVerified = true;
    return this.save();
};


// Static Methods

UserSchema.statics.findByEmail = function (email) {
    return this.findOne({email: email})
};

UserSchema.statics.findIdByEmail = function (email) {
    const schema = this;
    return new Promise((resolve, reject) => {
        schema.findOne({email: email}).select('_id')
            .then(user => resolve(user._id))
            .catch(reject)
    });
};

UserSchema.statics.authenticate = function (email, password) {
    return this.findByEmail(email) //.select('password')
        .then(user => {
            if (user && user.validatePassword(password)) {
                return Promise.resolve(user)
            } else return Promise.resolve(null);
        })
        .catch(error => {
            console.log(`UserSchema:Authenticate:Error:${email}`, error);
            return Promise.reject(error);
        });
};

UserSchema.statics.register = function (user) {
    if (user.password === user.passwordConfirm) {
        return this.create(user);
    } else return Promise.reject(ERRORS['passwords-mismatch']);
};

UserSchema.options.toJSON = {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        ret.created = ret._id.getTimestamp();
        delete ret.password;
        delete ret.token;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
};

module.exports = mongoose.model('User', UserSchema);