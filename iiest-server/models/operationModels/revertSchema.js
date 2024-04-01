const mongoose = require('mongoose');
const { Schema } = mongoose;

const revertSchema=new Schema({
    operatorInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true
    },
    shopInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'shopdetails',
        required: true,
    },
    fssaiRevert:{
        type:String,
    }
}, {timestamps: true});

const revertModel = mongoose.model('revert', revertSchema);

module.exports = revertModel;