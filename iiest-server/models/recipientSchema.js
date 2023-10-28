const { Schema } = require('mongoose')
const Joi = require('joi');

const recipientSchema = new Schema({
    operatorName: {
        type: String, 
        required: true
    },
    address: {
        type: String, 
        required: true,
        unique: true
    },
    eBill: {
        type: String, 
        required: true,
        unique: true
    }
})

const recipientValidationSchema = Joi.object({
    operatorName: Joi.string().required(),
    address: Joi.string().required(),
    eBill: Joi.string().required()
})

const shopSchema = new Schema({
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
const shopValidationSchema = Joi.object({
    name: Joi.string().required(),
    phoneNo: Joi.number().required(),
    aadharNo: Joi.number().required()
})

module.exports = { recipientSchema, shopSchema, recipientValidationSchema, shopValidationSchema }