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
        unique: true
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
module.exports = fostacVerifyModel;