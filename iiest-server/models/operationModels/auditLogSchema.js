const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditLogs = new Schema({
    operatorInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true
    },
    recipientInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recipientdetails',
        required: true
    },
    action: {
        type:String,
        required:true
    }
}, {timestamps: true});

const auditLogsSchema=mongoose.model('audit_logs', auditLogs);
module.exports = auditLogsSchema;