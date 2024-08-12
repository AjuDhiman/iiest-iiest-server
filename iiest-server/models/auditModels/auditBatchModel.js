const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditBatchSchema = new Schema({
    id_num: {
        type: Number,
        required: true,
        unique: true
    },
    batchCode: {
        type: String,
        required: true,
        unique: true
    },
    auditNum: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    pincodes: {
        type: [String],
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'completed', 'trained']
    },
    auditDates: {
        type: [Date],
        required: true
    },
    auditor: {
        type: String,
        required: true
    },
    candidateDetails: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'shop_verifications',
            // unique: true
        }],
        required: true
    }
}, { timestamps: true });

const auditBatchModel = mongoose.model('audit_batches', auditBatchSchema);

module.exports = auditBatchModel;
