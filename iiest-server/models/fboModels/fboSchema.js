const mongoose = require('mongoose');
const { Schema } = mongoose;

const fboSchema = new Schema({
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        // required: true
    },
    id_num: { //this field decides the customer id of the fbo
        type: Number,
        unique: true,
        required: true,
        min: 10000,
        max: 999999
    },
    boInfo: { //this field contains the refrence to business owner info from bo_regiters which contai info about the bo
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bo_registers',
        required: true
    },
    fbo_name: { //thie field contains the name of the fbo
        type: String,
        required: true
    },
    owner_name: { //this fielsd contains the name of the owner
        type: String,
        required: true
    },
    owner_contact: { // this  field contains the conatact of the manager
        type: Number,
        required: true,
    },
    email: { //this field contains the email of the manager
        type: String,
        required: true,
    },
    state: { // this field conatins the state entry of the fbo
        type: String,
        required: true
    },
    district: { // this field conatins the district entry of the fbo
        type: String,
        required: true
    },
    address: {  // this field conatins the state address of the fbo
        type: String,
        required: true
    },
    business_type:{ //business type b2b or b2c
        type: String,
        required: true
    },
    customer_id: { //ember id of the fbo
        type: String, 
        required: true,
    },
    createdBy: { //who created this fbo
        // type: mongoose.Schema.Types.ObjectId,
        // ref: 'staff_registers',
        // required: true
        type: String,
        required: true
    },
    lastEdit: { //is last edited
        type: String,
        required: true,
        default: 'Not edited yet'
    },
    village: {  // this field conatins the village entry of the fbo
        type: String
    },
    tehsil: {  // this field conatins the tehsil entry of the fbo
        type: String
    },
    pincode: {  // this field conatins the pincode entry of the fbo
        type: Number,
        required: true
    },
    gst_number: { //gst number of the fbo
        type: String, 
        required: function(){
            return this.business_type === 'b2b'
        }
    },
    activeStatus: { // is fbo active
        type: Boolean,
        required: true
    },
    isBasicDocUploaded: { //is all basic doc uploaded
        type: Boolean,
        required: true
    },
    isVerificationLinkSend: { //checkinh if verification link send or not
        type: Boolean,
        required: true,
    },
    isFboVerified: { //checkinh if verified my mail or sms or not
        type: Boolean,
        required: true,
    }
}, {timestamps: true})

const fboModel = mongoose.model('fbo_registers', fboSchema);
module.exports = fboModel;

