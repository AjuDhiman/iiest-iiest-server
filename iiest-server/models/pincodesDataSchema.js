const mongoose = require('mongoose');
const { Schema } = mongoose;

const pincodes = new Schema({
    pincode:{
        type:Number,
        required:true
    },
    StateName:{
        type:String,
        required:true
    },
    district:{
        type:String,
        required:true
    }
})

const pincodesDataScheme = mongoose.model('pinodesData', pincodes);
module.exports = pincodesDataScheme;