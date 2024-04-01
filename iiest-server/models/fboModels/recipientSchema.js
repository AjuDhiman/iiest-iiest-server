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
    },
    ownerPhoto: {
        type: String,
    },
    shopPhoto: {
        type: String,
    },
    aadharPhoto: {
        type: [String],
    }
}, { timestamps: true });

const hygieneShopSchema = new Schema({
    salesInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employee_sales',
        required: true
    },
    shopId: {
        type: String,
        required: true
    },
    managerName: {
        type: String,
        required: true
    },
    managerContact: {
        type: String,
        required: true
    },
    managerEmail: {
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
    state: {
        type: String,
        required: true,
    },
    kob: {
        type: String,
        required: true,
    },
    foodHandlersCount: {
        type: Number,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    fostacCertificate: {
        type: String,
    },
    foscosLicense: {
        type: String,
    }
}, { timestamps: true })

const recipientModel = mongoose.model('recipientDetails', recipientSchema);
const shopModel = mongoose.model('shopDetails', shopSchema);
const hygieneShopModel = mongoose.model('hygiene', hygieneShopSchema)

module.exports = { recipientModel, shopModel, hygieneShopModel }