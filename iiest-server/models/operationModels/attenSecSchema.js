const mongoose = require('mongoose');
const { Schema }  = mongoose

const fostacAttendance = new Schema({
    operatorInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true
    },
    EnrollmentInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'fostac_enrollment',
        required: true,
        unique: true
    },
    attendeeStatus: {
        type:String,
        required: true
    },
    marks: {
        type:Number,
        require:true,
        min:0,
        max:100
    }
    
}, {timestamps: true})


const fostacAttendanceModel = mongoose.model('fostac_attendance', fostacAttendance);
module.exports = fostacAttendanceModel;