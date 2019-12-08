const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const errors = require('../constants/errors');

const ProfileSchema = new Schema({
    name: {
        type: String,
    }
});

// Hooks

// Methods

// Static Methods

ProfileSchema.options.toJSON = {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        ret.created = ret._id.getTimestamp();
        delete ret._id;
        delete ret.__v;
        return ret;
    }
};

module.exports = mongoose.model('Profile', ProfileSchema);