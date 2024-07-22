const mongoose = require('mongoose');
const { Schema } = mongoose;

const generalData = new Schema({
    staff_data: {
        type: Object,
        required: true
    },
    fbo_data: {
        type: Object,
        required: true
    },
    products: {
        type: Object,
        required: true
    },
    posts: {
        type: Array, 
        required: true
    },
    kob: {
        type: Array,
        required: true
    },
    auditors: { //array of aditors
        type: Array,
        required: true,
    },
    our_holidays: {  //array of holidays
        type: Array,
        required: true,
    },
    invoice_details: { //array will contain details about invoice like last invoice id 
        type: Object,
        required: true
    },
    state_gst_code: { //stage gst code data
        type: Array,
        required: true
    },
    pan_india_allowed_ids: { //employee with Id in this array can sale on any pincode
        type: Array,
        required: true
    }
})

const generalDataSchema = mongoose.model('generaldata', generalData);
module.exports = generalDataSchema;