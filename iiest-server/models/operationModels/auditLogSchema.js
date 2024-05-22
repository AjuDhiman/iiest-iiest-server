const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditLogs = new Schema({
    operatorInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true
    },
    targetCollection: {
        type: String,
        required: true
    },
    targetInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: function(){
            return targetCollection;
        },
        required: true
    },
    prevVal:{
        type: Object,
        required:true,
    },
    currentVal: {
        type: Object,
        required: true
    },
    action: {
        type:String,
        required:true
    }
}, {timestamps: true});

const auditLogsSchema=mongoose.model('audit_logs', auditLogs);
module.exports = auditLogsSchema;