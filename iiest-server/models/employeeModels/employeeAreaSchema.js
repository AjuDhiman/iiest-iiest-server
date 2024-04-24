const mongoose = require('mongoose');
const { Schema } = mongoose;

const areaAllocationSchema = new Schema({
    employeeInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true
    },
    state: {
        type: String,
        required: true,
    },
    district: {
        type: [String], 
        required: true
    },
    pincodes: {
        type: [Number],
        validate: {
            validator: function(arr){
                return arr.length > 0
            },
            message: 'Pincodes cannot be empty'
        },
        required: true
    }
}, {timestamps: true})

const areaAllocationModel = mongoose.model('allocated_area', areaAllocationSchema);
module.exports = areaAllocationModel;