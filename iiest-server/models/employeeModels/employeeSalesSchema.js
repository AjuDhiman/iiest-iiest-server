const mongoose = require('mongoose');
const { Schema } = mongoose;

const salesSchema = new Schema({
    employeeInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true
    },
    fboInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'fbo_registers',
        required: true
    },
    product_name: {
        type: [String],
        validate: {
            validator: function(arr){
                return arr.length > 0;
            },
            message: 'Product Name cannot be empty.'
        },
        required: true
    },
    fostacInfo: {
        type: Object,
        required: function(){
            return this.product_name.includes('Fostac')
        }
    },
    foscosInfo: {
        type: Object,
        required: function(){
            return this.product_name.includes('Foscos')
        }
    },
    hraInfo: {
        type: Object,
        required: function() {
            return this.product_name.includes('HRA');
        }
    },
    medicalInfo: {
        type: Object,
        required: function() {
            return this.product_name.includes('Medical');
        }
    },
    waterTestInfo: {
        type: Object,
        required: function() {
            return this.product_name.includes('Water Test Report');
        }
    },
    payment_mode: {
        type: String, 
        required: true
    },
    checkStatus: {
        type: String, 
        required: true,
        default: 'Pending'
    },
    grand_total: {
        type: Number,
        required: true
    },
    cheque_data: {
        type: Object,
        required: function() {
            return (this.payment_mode === 'By Cheque');
        }
    },
    invoiceId: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true
    }
}, {timestamps: true})

const salesModel = mongoose.model('employee_sales', salesSchema);
module.exports = salesModel;