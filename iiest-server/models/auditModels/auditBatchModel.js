const mongoose = require('mongoose');
const { Schema } = mongoose;

const auditBatchSchema = new Schema({
    operatorInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true
    },
    id_num: {
        type: Number,
        required: true
    },
    batchCode: {
        type: String,
        required: true,
        unique: true
    },
    auditor: {
        type: String,
        // required: true
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'completed', 'Audit Completed']
    },
    candidateDetails: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'fostac_verifications',
            // unique: true
        }],
        required: true,
        validate: [arrayMaxLengthValidator, 'Candidate details array must contain at most 50 elements']
    },
    trainingDate: {
        type: Date,
        // required: true
    }
}, { timestamps: true });

function arrayMaxLengthValidator(value) {
    return value.length < 2;
}

const AuditBatchModel = mongoose.model('audit_batches', auditBatchSchema);

module.exports = AuditBatchModel;
