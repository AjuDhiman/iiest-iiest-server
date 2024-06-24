const mongoose = require('mongoose');
const {Schema} = mongoose;

const boSchema = new Schema({
    id_num: {
        type: Number,
        unique: true,
        required: true,
        min: 10000,
        max: 999999
    },
    onboard_by:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true 
    },
    customer_id: {
        type: String, 
        required: true,
        unique: true,
        trim: true
    },
    owner_name: {
        type: String,
        required: true,
        trim: true
    },
    business_entity: {
        type: String,
        required: true,
        trim: true
    },
    business_category: {
        type: String,
        required: true,
        trim: true
    },
    business_ownership_type: {
        type: String,
        required: true,
        trim: true   
    },
    manager_name: {
        type: String,
        required: true,
        trim: true
    },
    contact_no: {
        type: Number,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    is_email_verified: {
        type: Boolean,
        required: true
    },
    is_contact_verified: {
        type: Boolean,
        required: true
    }

}, { timestamps: true })

const boModel = mongoose.model('bo_registers', boSchema);
module.exports = boModel;