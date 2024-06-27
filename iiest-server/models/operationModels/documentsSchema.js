const mongoose = require('mongoose');
const { Schema } = mongoose;

const docSchema = new Schema({
    handlerId: {
        type: String,
        required: true,
        trim: true
    },
   documents: {
        type: [Object],
        default: []
   }
},{timestamps: true});

const docsModel = mongoose.model('documents', docSchema);
module.exports = docsModel;