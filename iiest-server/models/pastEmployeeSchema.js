const mongoose = require('mongoose');
const { Schema } = mongoose;

const pastEmp = new Schema({
    id_num: {
        type: Number, 
        unique: true,
        required: true,
        min: 1000,
        max: 9999
    },
    employee_name: {
        type: String, 
        required: true
    },
    gender: {
        type: String, 
        required: true
    },
    email: {
        type: String, 
        required: true,
        unique: true
    },
    contact_no: {
        type: Number, 
        required: true,
        unique: true
    },
    alternate_contact: {
        type: Number, 
        required: true, 
        unique: true
    },
    dob: {
        type: Date,
        required: true
    },
    country: {
        type: String, 
        required: true
    },
    state: {
        type: String, 
        required: true
    },
    city: {
        type: String, 
        required: true
    },
    address: {
        type: String, 
        required: true
    },
    zip_code: {
        type: Number, 
        required: true
    },
    employee_id: {
        type: String, 
        required: true,
        unique: true
    },
    panel_type: {
        type: String,
        required: true
    },
    department: {
        type: String, 
        required: true
    },
    designation: {
        type: String, 
        required: true
    },
    salary: {
        type: Number, 
        required: true
    },
    grade_pay: {
        type: Number, 
        required: true
    },
    doj: {
        type: Date,
        required: true
    },
    company_name: {
        type: String, 
        required: true
    },
    project_name: {
        type: String, 
        required: true
    },
    username: {
        type: String, 
        required: true,
        unique: true
    },
    password: {
        type: String, 
        required: true
    },
    createdBy: {
        type: String, 
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    deletedAt: {
        type: Date,
        required: true
    },
    deletedBy: {
        type: String,
        required: true
    }
})

const pastEmployeeSchema = mongoose.model('past_emp', pastEmp);
module.exports = pastEmployeeSchema;