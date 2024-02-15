const mongoose = require('mongoose');

const UserotpverificationSchema = new mongoose.Schema({

    email:String,

    otp:String,

    createdAt:Date,

    expiresAt:Date,
});

module.exports = mongoose.model(
    'UserotpverificationSchema',
    UserotpverificationSchema
);