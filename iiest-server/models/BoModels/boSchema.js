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
    customer_id: {
        type: String, 
        required: true,
        unique: true
    },
    owner_name: {
        type: String,
        required: true
    },
    business_entity: {
        type: String,
        required: true
    },
    business_category: {
        type: String,
        required: true
    },
    business_ownership_type: {
        type: String,
        required: true
    },
    contact_no: {
        type: Number,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }

}, {timestamp: true})

const boModel = mongoose.model('bo_registers', boSchema);
module.exports = boModel;