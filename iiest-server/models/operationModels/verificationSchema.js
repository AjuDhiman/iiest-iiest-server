const mongoose = require('mongoose');
const { Schema }  = mongoose

const fostacVerification = new Schema({
    operatorInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true
    },
    recipientInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recipientDetails',
        required: true,
        // unique: true
    },
}, {timestamps: true})

const fostacVerifyModel = mongoose.model('fostac_verifications', fostacVerification);

const foscosVerification = new Schema({
    operatorInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true
    },
    shopInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'shopDetails',
        required: true,
        unique: true
    },
    kob: {
        type: String,
        required: true
    }, 
    foodCategory: {
        type: Array,
        required: true
    },
    ownershipType: {
        type: String,
        required: true
    },
    OwnersNum: {
        type: Number,
        required: true
    }
}, {timestamps: true});

const foscosVerifyModel = mongoose.model('foscos_verification', foscosVerification);

const hraVerification = new Schema({
    operatorInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true
    },
    shopInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'shopDetails',
        required: true,
        unique: true
    },
    kob: {
        type: String,
        required: true,
        trim: true
    },
    foodHandlersCount: {
        type: Number,
        required: true,
    },
}, {timestamps: true});

const hraVerifyModel = mongoose.model('hra_verification', hraVerification);

module.exports = {fostacVerifyModel, foscosVerifyModel, hraVerifyModel};