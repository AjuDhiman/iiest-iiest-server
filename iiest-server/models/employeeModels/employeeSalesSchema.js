const mongoose = require('mongoose'); 
const { Schema } = mongoose;

const salesSchema = new Schema({ //creating sales schema
    employeeInfo: { //property for saving a object id from employee collection of employee who did this sale
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true
    },
    fboInfo: { //property for saving a object id from fbo_registers collection of fbo on which thus sale is done
        type: mongoose.Schema.Types.ObjectId,
        ref: 'fbo_registers',
        required: true
    },
    product_name: { // array of all productrs this which are sold in this sale
        type: [String],
        validate: { //its length shoyld not be zero
            validator: function(arr){
                return arr.length > 0;
            },
            message: 'Product Name cannot be empty.' //error message 
        },
        required: true
    },
    fostacInfo: { // object that contacin all info about fostac if fostac sold in this sale
        type: Object,
        required: function(){
            return this.product_name.includes('Fostac') //required if fostac present in product_name array
        }
    },
    foscosInfo: { // object that contacin all info about foscos if foscos sold in this sale
        type: Object,
        required: function(){
            return this.product_name.includes('Foscos') //required if foscos present in product_name array
        }
    },
    hraInfo: { // object that contacin all info about hra if hra sold in this sale
        type: Object,
        required: function() {
            return this.product_name.includes('HRA'); //required if hra present in product_name array
        }
    },
    medicalInfo: { // object that contacin all info about medical if medical sold in this sale
        type: Object,
        required: function() {
            return this.product_name.includes('Medical'); //required if medical present in product_name array
        }
    },
    waterTestInfo: {  // object that contacin all info about water test if water tset sold in this sale
        type: Object, 
        required: function() {
            return this.product_name.includes('Water Test Report'); //required if water test present in product_name array
        }
    },
    khadyaPaalnInfo: {  // object that contacin all info about khadsya palan
        type: Object, 
        required: function() {
            return this.product_name.includes('Khadya paaln'); 
        }
    },
    payment_mode: { //property that contain info about which payment payemnt mode is used in this sale
        type: String, 
        required: true
    },
    checkStatus: { //property that contain info about if is all recps info is taken of not  in case of recipient like fostac
        type: String, 
        required: true,
        default: 'Pending'
    },
    grand_total: { //property contains total amount of sale
        type: Number,
        required: true
    },
    cheque_data: { //property contains about all info about cheque 
        type: Object,
        required: function() {
            return (this.payment_mode === 'By Cheque'); // required in case of payment mode is by cheque
        }
    },
    invoiceId: { // array that contains object id of invoices of all product sold in this sale
        type: Array,
        required: true
    },
    notificationInfo: { //array that contains info related to notification of this sale to verifier
        type: Array,
        required: true
    }
}, {timestamps: true})

const salesModel = mongoose.model('employee_sales', salesSchema);
module.exports = salesModel;