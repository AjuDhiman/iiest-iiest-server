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

const shopVerification = new Schema({
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
    product: {
        type: String,
        required: true,
        trim: true
    },
    kob: { //required in case of HRA and foscos only
        type: String,
        required: function() {
            return (this.product === 'HRA' || this.product === 'Foscos');
        },
        trim: true
    },
    foodHandlersCount: { //required in case of HRA only
        type: Number,
        required: function() {
            return this.product === 'HRA'
        }
    },
    foodCategory: {
        type: Array,
        required: function() { //required in case of Foscos only
            return this.product === 'Foscos'
        },
    },
    ownershipType: {
        type: String,
        required: function() { //required in case of Foscos only
            return this.product === 'Foscos'
        },
    },
    OwnersNum: { //required in case of Foscos only
        type: Number,
        required: function() {
            return this.product === 'Foscos'
        },
    },
    isProdVerified: {
        type: Boolean,
        required: true
    },
    isReqDocVerificationLinkSend: {
        type: Boolean,
        required: true
    },
    checkedDocs: {
        type: Array,
        required: true
    },
    isReqDocsVerified: {
        type: Boolean,
        required: true
    }
},{timestamps: true});

const shopVerificationModel = mongoose.model('shop_verifications', shopVerification)

module.exports = {fostacVerifyModel, foscosVerifyModel, hraVerifyModel, shopVerificationModel};