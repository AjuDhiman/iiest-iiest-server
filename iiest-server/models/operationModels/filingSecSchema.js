const mongoose = require('mongoose');
const { Schema }  = mongoose

const foscosFilingSchema = new Schema({
    operatorInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true
    },
    verificationInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'fostac_verifications',
        required: true,
        unique: true
    },
    username: {
        type:String,
        require:true
    },
    password: {
        type:String,
        require:true
    }, 
    payment_amount: {
        type:String,
        require:true,
    },
    payment_amount: {
        type: Number,
        required: true
    },
    payment_recipt: {
        type: String,
        required: true
    }
    
}, {timestamps: true})


const foscosFilingSchemaModel = mongoose.model('foscos_filing', foscosFilingSchema);
module.exports = foscosFilingSchemaModel;