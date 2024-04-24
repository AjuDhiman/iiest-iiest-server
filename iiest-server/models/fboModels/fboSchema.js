const mongoose = require('mongoose');
const { Schema } = mongoose;

const fboSchema = new Schema({
    employeeInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        // required: true
    },
    id_num: {
        type: Number,
        unique: true,
        required: true,
        min: 10000,
        max: 999999
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
    },
    email: {
        type: String,
        required: true,
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
        required: true
    },
    customer_id: {
        type: String, 
        required: true,
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
            return this.business_type === 'b2b'
        }
    }
}, {timestamps: true})

const fboModel = mongoose.model('fbo_registers', fboSchema);
module.exports = fboModel;

