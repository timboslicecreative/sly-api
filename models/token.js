const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
const errors = require('../constants/errors');
const ERRORS = errors.named;
const MONGO_ERRORS = errors.mongo;

//TODO: move token expiration to env variable
const TOKEN_EXPIRATION = 60 * 60 * 1000; // 1 Hour

const generateCode = (length) => {
    let numbers = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += numbers.charAt(Math.floor(Math.random() * numbers.length))
    }
    return code
};

const TokenSchema = new Schema({
    value: {
        type: String,
        required: [true, 'Token value is required'],
        index: true
    },
    expiry: {
        type: Date,
        required: [true, 'Token expiry is required']
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: [true, 'Token owner is required']
    }
});

// Methods
TokenSchema.methods.validateCode = function (code) {
    return bcrypt.compareSync(code.toString(), this.value);
};

TokenSchema.methods.isExpired = function () {
    console.log(this.expiry, new Date().getTime());
    return new Date().getTime() >= this.expiry
};

// Static Methods
TokenSchema.statics.validateUserToken = function (user, code) {
    const schema = this;
    return new Promise((resolve, reject) => {
        schema.findOne({owner: user._id})
            .then(token => {
                if (!token) return reject(ERRORS['invalid-verification-code']);
                if (token.isExpired()){
                    token.delete();
                    return reject(ERRORS['expired-verification-code']);
                }
                if (token.validateCode(code)) {
                    token.delete();
                    return resolve(user);
                }
                else reject(ERRORS['invalid-verification-code']);
            })
            .catch(reject);
    });
};

TokenSchema.statics.clearUserTokens = function (user) {
    const schema = this;
    return new Promise((resolve, reject) => {
        schema.find({owner: user.id})
            .then(tokens => tokens.map(token => token.delete()))
            .catch(error => reject(MONGO_ERRORS[error.code] || error));
    });
};


// Generate a code, encode it and return the unencoded code
TokenSchema.statics.createToken = function (ownerId) {
    return new Promise((resolve, reject) => {
        const code = generateCode(process.env.CODE_LENGTH || 6);
        const value = bcrypt.hashSync(code, 10);
        const now = new Date().getTime();

        this.create({
                value: value,
                expiry: new Date(now + TOKEN_EXPIRATION).getTime(),
                owner: ownerId
            })
            .then(token => resolve(code))
            .catch(reject)
    })
};


module.exports = mongoose.model('Token', TokenSchema);