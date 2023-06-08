const mongoose = require('mongoose');

const objectSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    object: {
        type: Number,
    },
    visible: {
        type: Number,
        default: 0
    },
    friendOrFoe: {
        type: String,
        default: 'Unknown',
    }
})
const markerSchema = new mongoose.Schema({
    lat: {
        type: String,
        required: true
    },
    lng: {
        type: String,
        required: true
    },
    object: [objectSchema],
    user: {
        type: String,
        ref: 'user'
    },
    orderStrike: {
        type: String,
        ref: 'user'
    },
})
const userSchema = new mongoose.Schema({
    _id: {
        type: String
    },
    userName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
    },
    role: {
        type: String,
        default: 'user'
    }
})

const marker = mongoose.model('marker', markerSchema);
const user = mongoose.model('user', userSchema);

module.exports = { user, marker };