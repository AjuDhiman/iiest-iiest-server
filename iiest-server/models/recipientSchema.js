const mongoose = require('mongoose');
const { Schema } = mongoose;

const recipientSchema = new Schema({
    salesInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee_sales',
        required: true
    },
    name: {
        type: String, 
        required: true
    },
    phoneNo: {
        type: Number,
        required: true,
        unique: true
    },
    aadharNo: {
        type: Number,
        required: true,
        unique: true
    }
}, {timestamps: true})

const shopSchema = new Schema({
    salesInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee_sales',
        required: true
    },
    operatorName: {
        type: String, 
        required: true
    },
    address: {
        type: String, 
        required: true,
        // unique: true
    },
    eBillImage: {
    type: mongoose.Schema.Types.ObjectId
    // unique: true
    }
}, {timestamps: true})

const recipientModel = mongoose.model('recipientDetails', recipientSchema);
const shopModel = mongoose.model('shopDetails', shopSchema);

module.exports = { recipientModel, shopModel }