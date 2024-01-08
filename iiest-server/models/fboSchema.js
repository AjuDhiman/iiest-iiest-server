const mongoose = require('mongoose');
const { Schema } = mongoose;

const fboSchema = new Schema({
    employeeInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true,
        unique: true
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
    business_type:{
        type: String,
        // validate: {
        //     validator: function(arr){
        //         return arr.length > 0;
        //     },
        //     message: 'Business type cannot be empty'
        // },
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
    createdBy: {
        type: String, 
        required: true
    },
    lastEdit: {
        type: String,
        required: true,
        default: 'Not edited yet'
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
    gst_number: {
        type: String, 
        required: function(){
            return this.business_type.includes('b2b')
        }
    }
})

const fboModel = mongoose.model('fbo_registers', fboSchema);
module.exports = fboModel;

