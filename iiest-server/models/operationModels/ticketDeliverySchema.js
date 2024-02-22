const mongoose = require('mongoose');
const { Schema } = mongoose;

const ticketDelivery = new Schema({
    operatorInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff_registers',
        required: true
    },
    recipientInfo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'recipientdetails',
        required: true,
        unique: true
    },
    ticketStatus : {
        type: String,
        required: true
    },
    certificate: {
        type: String,
        required: function() {
           if(this.ticketStatus === 'delivered'){
            return true;
           } else {
             return false;
           }
        }
    }
}, {timestamps: true});

const ticketDeliveryModel = mongoose.model('ticket_delivery', ticketDelivery);
module.exports = ticketDeliveryModel;