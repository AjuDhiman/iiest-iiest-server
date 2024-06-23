const mongoose = require('mongoose');
const { Schema } = mongoose;

const docSchema = new Schema({
    handlerId: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true
    },
    format: {
        type: String,
        required: true,
    },
    multipleDoc: {
        type: Boolean,
        required: true
    },
    src: {
        type: [String],
        required: true
    }
});

const docsModel = mongoose.model('documents', docSchema);
module.exports = docsModel;