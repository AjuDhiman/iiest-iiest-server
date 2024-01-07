const mongoose = require('mongoose');
const { Schema } = mongoose;

const recipientSchema = new Schema({
    fboInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'fbo_registers',
        required: true,
        unique: true
    },
    productInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee_sales',
        required: true, 
        unique: true
    },
    employeeInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        unique: true, 
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
})

const shopSchema = new Schema({
    fboInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'fbo_registers',
        required: true,
        unique: true
    },
    productInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product_info',
        required: true, 
        unique: true
    },
    employeeInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        unique: true, 
        required: true
    },
    operatorName: {
        type: String, 
        required: true
    },
    address: {
        type: String, 
        required: true,
        unique: true
    },
    eBillImage: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
    }
})

const recipientModel = mongoose.model('recipientDetails', recipientSchema);
const shopModel = mongoose.model('shopDetails', shopSchema);

module.exports = { recipientModel, shopModel }