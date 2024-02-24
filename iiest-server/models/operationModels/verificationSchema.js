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
        ref: 'recipientdetails',
        required: true,
        unique: true
    },
    email: {
        type: String, 
        required: true,
        unique: true
    },
    address: {
        type: String, 
        required: true, 
        // unique: true
    },
    pancardNo: {
        type: String, 
        // unique: true
    },
    fatherName: {
        type: String, 
        required: true
    },
    dob: {
        type: String, 
        required: true
    },
    userName: {
        type: String, 
        required: true,
        unique: true
    },
    password: {
        type: String, 
        required: true
    },
    salesDate: {
        type: Date, 
        required: true 
    }
}, {timestamps: true})

const fostacVerifyModel = mongoose.model('fostac_verification', fostacVerification);

const foscosVerification = new Schema({
    operatorInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true
    },
    shopInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recipientdetails',
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
        type: Array,
        required: true
    },
    foodItems: {
        type: String,
        required: true
    },
    operatorAddress: {
        type: String,
        required: true
    }
});

const foscosVerifyModel = mongoose.model('foscos_verification', foscosVerification)

module.exports = {fostacVerifyModel, foscosVerifyModel};