const mongoose = require('mongoose');
const { Schema } = mongoose;

const generalSection=new Schema({
    operatorInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true
    },
    recipientInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recipientdetails',
        required: true,
        unique: true
    },
    recipientStatus:{
        type:String,
    },
    officerNote:{
        type:String,
    }
}, {timestamps: true});

const generalSectionModel = mongoose.model('operation_general_section', generalSection);

module.exports = generalSectionModel;