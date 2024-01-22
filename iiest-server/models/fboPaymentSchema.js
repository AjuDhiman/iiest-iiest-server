const mongoose = require('mongoose');
const { Schema } = mongoose;

const fboPaymentModel = new Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'fbo_registers',
        required: true
    },
    merchantId: {
        type: String, 
        required: true
    },
    merchantTransactionId: {
        type: String,
        required: true,
    },
    providerReferenceId: {
        type: String, 
        required: true
    },
    amount: {
        type: Number, 
        required: true
    },
    date: {
        type: Number, 
        required: true,
        default: new Date()
    }
}, {timestamps: true})

const fboPaymentSchema = mongoose.model('fbo_payment', fboPaymentModel);
module.exports = fboPaymentSchema;
