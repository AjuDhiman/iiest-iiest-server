const mongoose = require('mongoose');
const { Schema } = mongoose;

const recipientSchema = new Schema({
    fboObjId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'fbo_registers',
        required: true,
        unique: true
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
    fboObjId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'fbo_registers',
    required: true,
    unique: true
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