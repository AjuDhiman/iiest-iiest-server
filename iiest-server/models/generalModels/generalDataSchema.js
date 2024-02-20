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
        typeof: Array,
        // required: true
    }
})

const generalDataSchema = mongoose.model('generaldata', generalData);
module.exports = generalDataSchema;