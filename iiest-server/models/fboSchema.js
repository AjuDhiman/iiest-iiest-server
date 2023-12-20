const mongoose = require('mongoose');
const { Schema } = mongoose;

const fboSchema = new Schema({
    id_num: {
        type: Number,
        unique: true,
        required: true,
        min: 10000,
        max: 99999
    },
    fbo_name: {
        type: String,
        required: true
    },
    owner_name: {
        type: String,
        required: true
    },
    owner_contact: {
        type: Number,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    state: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true,
        unique: true
    },
    product_name: {
        type: [String], 
        required: true
    },
    business_type:{
        type: [String],
        required: true
    },
    customer_id: {
        type: String, 
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    payment_mode: {
        type: String, 
        required: true
    },
    createdBy: {
        type: String, 
        required: true
    },
    lastEdit: {
        type: String,
        required: true,
        default: 'Not edited yet'
    },
    checkStatus: {
        type: String, 
        required: true,
        default: 'Pending'
    },
    village: {
        type: String
    },
    tehsil: {
        type: String
    },
    pincode: {
        type: Number,
        required: true
    },
    fostacInfo: {
        type: {
            fostac_processing_amount: {
                type: Number
            },
            fostac_service_name: {
                type: String
            },
            fostac_client_type: {
                type: String
            },
            recipient_no: {
                type: Number
            },
            fostac_total: {
                type: Number
            }
        },
      default: null
    },
    foscosInfo: {
        type: {
            foscos_processing_amount: {
                type: Number
            },
            foscos_service_name: {
                type: String
            },
            foscos_client_type: {
                type: String
            },
            shop_no: {
                type: Number
            },
            water_test_fee: {
                type: Number
            },
            license_category: {
                type: String
            },
            license_duration: {
                type: String
            },
            foscos_total: {
                type: Number
            }
        },
        default: null
    },
    total_amount: {
        type: Number,
        required: true
    }
})

const fboModel = mongoose.model('fbo_registers', fboSchema);
module.exports = fboModel;

