const mongoose = require('mongoose');
const { Schema } = mongoose;

const reportingManagerSchema = new Schema({
    employeeInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true
    },
    reportingManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true,
        unique: true
    },
}, {timestamps: true})

const reportingManagerModel = mongoose.model('reporting_manager', reportingManagerSchema);
module.exports = reportingManagerModel