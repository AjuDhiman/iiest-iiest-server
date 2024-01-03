const mongoose = require('mongoose');
const { Schema } = mongoose;

const fboSchema = new Schema({
    createrId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true
    },
    id_num: {
        type: Number,
        unique: true,
        required: true,
        min: 10000,
        max: 99999
    },
    fbo_name: {
        type: String,
        required: true
    },
    owner_name: {
        type: String,
        required: true
    },
    owner_contact: {
        type: Number,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    state: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    product_name: {
        type: [String], 
        validate: {
            validator: function(arr){
                return arr.length > 0;
            },
            message: 'Product name cannot be empty'
        },
        required: true
    },
    business_type:{
        type: [String],
        validate: {
            validator: function(arr){
                return arr.length > 0;
            },
            message: 'Business type cannot be empty'
        },
        required: true
    },
    customer_id: {
        type: String, 
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    payment_mode: {
        type: String, 
        required: true
    },
    createdBy: {
        type: String, 
        required: true
    },
    lastEdit: {
        type: String,
        required: true,
        default: 'Not edited yet'
    },
    checkStatus: {
        type: String, 
        required: true,
        default: 'Pending'
    },
    village: {
        type: String
    },
    tehsil: {
        type: String
    },
    pincode: {
        type: Number,
        required: true
    },
    fostacInfo: {
        type: Object,
        required: function(){
            return this.product_name.includes('Fostac Training')
        }
    },
    foscosInfo: {
        type: Object,
        required: function(){
            return this.product_name.includes('Foscos Training')
        }
    },
    grand_total: {
        type: Number, 
        required: true
    },
    gst_number: {
        type: String, 
        required: function(){
            return this.business_type.includes('b2b')
        }
    }
})

const fboModel = mongoose.model('fbo_registers', fboSchema);
module.exports = fboModel;

