const mongoose = require('mongoose');
const { Schema }  = mongoose

const fostacEnrollment = new Schema({
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
    tentative_training_date: {
        type:String,
        require:true
    },
    fostac_training_date: {
        type:String,
        require:true
    },
    roll_no: {
        type:String,
        require:true,
        unique:true
    }
    
}, {timestamps: true})


const fostacEnrollmentModel = mongoose.model('fostac_enrollment', fostacEnrollment);
module.exports = fostacEnrollmentModel;