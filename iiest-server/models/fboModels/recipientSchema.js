const mongoose = require('mongoose');
const { Schema } = mongoose;

const recipientSchema = new Schema({
    salesInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee_sales',
        required: true
    },
    id_num: {
        type: Number,
        unique: true,
        required: true,
        min: 10000,
        max: 99999
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
    recipientId: {
        type: String,
        required: true,
        unique: true
    },
    aadharNo: {
        type: Number,
        required: true,
        unique: true
    }
}, { timestamps: true })

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
    },
    pincode: {
        type: Number,
        required: true,
    },
    village: {
        type: String,
        required: true
    },
    tehsil: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    eBillImage: {
        type: String,
        // required: function () { 
        //     return (!this.byExcel);
        // }
    },
    ownerPhoto: {
        type: String,
        // required: function () { 
        //     return (!this.byExcel);
        // }
    },
    shopPhoto: {
        type: String,
        // required: function () { 
        //     return (!this.byExcel);
        // },
    }
}, { timestamps: true })

const recipientModel = mongoose.model('recipientDetails', recipientSchema);
const shopModel = mongoose.model('shopDetails', shopSchema);

module.exports = { recipientModel, shopModel }