const mongoose = require('mongoose');
const { Schema } = mongoose;

let sessionSchema = new Schema({
    data: {
        type: Object,
    }
});

const sessionModel = mongoose.model('sessionData', sessionSchema);
module.exports = sessionModel;