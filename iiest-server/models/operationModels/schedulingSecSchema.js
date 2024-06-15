const mongoose = require('mongoose');
const { Schema } = mongoose;

const schedulingSchema=new Schema({
    operatorInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true
    },
    verificationInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hra_verification',
        required: true,
    },
    auditDate: {
        type: [Date], 
        required: true,
    },
    changeDate: {
        type: Array,
        default: []
    },
    documents: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'documents',
        default: []
    },
    auditor: {
        type: String,
        required: true,
        trim: true
    }
}, {timestamps: true});

const schedulingSecModel = mongoose.model('scheduling', schedulingSchema);

module.exports = schedulingSecModel;