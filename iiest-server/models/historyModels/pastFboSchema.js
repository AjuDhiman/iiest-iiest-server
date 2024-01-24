const mongoose = require('mongoose');
const { Schema } = mongoose;

const pastFbo = new Schema({
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
        type: String, 
        required: true
    },
    processing_amount: {
        type: Number, 
        required: true
    },
    service_name: {
        type: String, 
        required: true
    },
    fssai_id: {
        type: String, 
        required: true
    },
    client_type: {
        type: String,
        required: true
    },
    recipient_no: {
        type: Number,
        required: true
    },
    water_test_fee: {
        type: Number
    },
    payment_mode: {
        type: String, 
        required: true
    },
    license_category: {
        type: String,
        default: null
    },
    license_duration: {
        type: String,
        default: null
    },
    total_amount: {
        type: Number,
        required: true
    },
    createdBy: {
        type: String, 
        required: true
    },
    deletedBy: {
        type: String, 
        required: true
    }
}, {timestamps: {
    createdAt: 'deletedAt',
    updatedAt: false
}});

const pastFboSchema = mongoose.model('past_fbo', pastFbo);
module.exports = pastFboSchema;