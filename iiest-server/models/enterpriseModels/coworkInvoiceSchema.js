const mongoose = require('mongoose');
const { Schema } = mongoose;

const cowworkInvoice = new Schema({
    business_name: { 
        type: String,
        required: true,
    },
    invoice_code: { 
        type: String,
        required: true
    },
    invoice_src: { 
        type: String,
        required: true
    },
    state: { 
        type: String,
        required: true
    },
    district: {  
        type: String,
        required: true
    },
    pincode: { 
        type: String,
        required: true
    },
    address : { 
        type: String,
        required: true
    },
    contact_no : { 
        type: Number,
        required: true
    },
    email : { 
        type: String,
        required: true
    },
    invoice_type: {  
        type: String,
        required: true,
        enum: ['Tax', 'Customer', 'Service']
    },
    gst_number: { 
        type: String,
        required: function(){
            return this.invoice_type === 'Tax'
        }
    },
    gst_amount: { 
        type: Number,
        required: true
    },
    processing_amount: {
        type: Number,
        required: true
    },
    total_amount: {
        type: Number,
        required: true
    },
    qty: {
        type: String,
        required: true
    },
    product: {
        type: String,
        required: true
    },
    product_code: {
        type: String,
        required: true
    },
    narration: {
        type: String,
        required: true
    },
    invoice_date: {
        type: Date,
        required: true
    },
    behalf_of: {
        type: String,
        required: true
    },
    isAmountReceived: {
        type: Boolean,
        require: true
    },
    receivingAmount: {
        type: Number,
        required: function () {
            return this.isAmountReceived;
        }
    },
    receivingDate: {
        type: Date,
        required: function () {
            return this.isAmountReceived;
        }
    },
    receivingNarration: {
        type: String,
        required: function () {
            return this.isAmountReceived;
        }
    }
}, {timestamps: true});

const coworkInvoiceModel = mongoose.model('cowork_invoice', cowworkInvoice);
module.exports = coworkInvoiceModel;