const mongoose = require('mongoose');
const { Schema } = mongoose;

const trainingBatchSchema = new Schema({
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
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        // required: true
    },
    category: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    venue: {
       type: String
    },
    candidateNo: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'completed', 'trained']
    },
    candidateDetails: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'fostac_enrollment',
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
    return value.length < 50;
}

const TrainingBatchModel = mongoose.model('training_batches', trainingBatchSchema);

module.exports = TrainingBatchModel;
