const employeeSchema = require('../models/employeeSchema');
const pastEmployeeSchema = require('../models/pastEmployeeSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { generateUsername, generatePassword, generateEmployeeID } = require('./empGenerator');
const { sendEmployeeInfo } = require('./employeeMail');
const { empSignBucket } = require('../config/db');
const auth = JSON.parse(process.env.AUTH);

const JWT_SECRET = auth.JWT_TOKEN;

//Controller for staff registration
exports.employeeRegister = async(req, res)=>{
    try {

        console.log(req.body);
        const signature = req.file;

        let success = false;
        let isUnique = false; //To check if id number generated is unique 
    
        //Fields being used for staff entry
        const { employee_name, gender, email, alternate_contact, contact_no, dob, country, state, city, address, zip_code, portal_type, department, designation, salary, grade_pay, doj, company_name, project_name, createdBy } = req.body;

        //To check if employee with same email exists 
        const existing_email = await employeeSchema.findOne({email});
        if(existing_email){
            return res.status(401).json({success, emailErr: "Employee with this email already exists"});
        }
    
        //To check if employye with same phone number exists
        const existing_contact = await employeeSchema.findOne({contact_no});
        if(existing_contact){
            return res.status(401).json({success, contactErr: "Employee with this phone number already exists"});
        }
    
        //To check if employye with same alternate phone number exists
        const existing_alternate_no = await employeeSchema.findOne({alternate_contact});
        if(existing_alternate_no){
            return res.status(401).json({success, alternateContactErr: "Employee with this alternate phone number already exists"});
        }

        const existing_address = await employeeSchema.findOne({address});
        if(existing_address){
            return res.status(401).json({success, addressErr: "Employee with this address already exists"});
        }

        let idNumber; //Variable being used for id number

        //Keeps generating a 4-digit number for id number unless it's value is unique
        while(!isUnique){
            idNumber = Math.floor(1000 + Math.random() * 9000);
            const existingNumber = await employeeSchema.findOne({id_num: idNumber});
        if(!existingNumber){
            isUnique = true;
            }
        }

        const generatedUsername = generateUsername(employee_name, idNumber); //Calling function to generate employee username

        const generatedId = generateEmployeeID(company_name, idNumber); //Calling function to generate employee id

        let generatedPassword = generatePassword(10); //Calling function to generate employee password

        console.log(generatedUsername, generatedPassword);

        //Password Hashing
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(generatedPassword, salt);

        let date = new Date();
        
        if(signature){
            await employeeSchema.create({
                id_num: idNumber, employee_name, gender, email, contact_no, alternate_contact, dob, country, state, city, address, zip_code, employee_id: generatedId, portal_type, department, designation, salary, grade_pay, doj, company_name, project_name, username: generatedUsername, password: secPass, createdBy, createdAt: date
            });

            const sigatureBuckcet = empSignBucket();

            const uploadSignStream = sigatureBuckcet.openUploadStream(`${Date.now()}_${signature.originalname}`);

            uploadSignStream.write(signature.buffer);

            uploadSignStream.end((err) => {
            if (err) {
                console.error(err);
            } 
                console.log(`File ${signature.originalname} uploaded successfully.`);
            });
        }else{
            return res.status(401).json({message: "Some error occured with signature file. Please try again"});
        }

        sendEmployeeInfo(generatedUsername, generatedPassword, generatedId, email)
    
        success = true;
        return res.status(201).json({success, message: "Staff Entry Successfully"});
        
        } catch (error) {
            console.error(error);
            return res.status(500).json({message: "Internal Server Error"})
        }
}

//Controller for employee login
exports.employeeLogin = async(req, res)=>{
    try {
        let success = false;
    
        const { username, password } = req.body; //Fields to be used for staff login
        
        //To check if username is available for login
        const employee_user = await employeeSchema.findOne({username});
        if(!employee_user){
            return res.status(401).json({success, message: "Please try to login with correct credentials"});
        }
    
        const passwordCompare = await bcrypt.compare(password, employee_user.password); //Comparing hashed password
        if(!passwordCompare){
            return res.status(401).json({success, message: "Please try to login with correct credentials"});
        }
    
        const data = {
            user:{
                id: employee_user.id
            }
        }    
    
        const authToken = jwt.sign(data, JWT_SECRET); // Generating a JWT Token for further authentication and authorization
        success = true;
        return res.status(200).json({success, authToken, employee_user});
    
        } catch (error) {
            console.error(error);
            return res.status(500).json({message: "Internal Server Error"});
        }
}

//Controller for deleting employee
exports.deleteEmployee = async(req, res)=>{
    const objId =  req.params.id;
    const {deletedBy} = req.body;
    let success = false;

    let date = new Date();

    try {
        const deletedEmployee = await employeeSchema.findByIdAndDelete(objId);
        if(deletedEmployee){

            const {_id, ...pastEmployee} = deletedEmployee.toObject();

            await pastEmployeeSchema.create({...pastEmployee, deletedAt: date, deletedBy: deletedBy}) //Adding deleted employee to past employee data

            success = true;
            return res.status(200).json({success, deletedEmployee});
        }else{
            success = false;
            return res.status(401).json({success, message: "Employee Not Found"});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

//Controller for editing employee data
exports.editEmployee = async(req, res)=>{

    try {

        let objId = req.params.id;
        let success = false;

        const updatedEmployeeData = req.body;
        console.log(updatedEmployeeData);
        
        const existing_email = await employeeSchema.findOne({email: updatedEmployeeData.email});
        if(existing_email){
            return res.status(401).json({success, emailErr: "Employee with this email already exists"});
        }
    
        const existing_contact = await employeeSchema.findOne({contact_no: updatedEmployeeData.contact_no});
        if(existing_contact){
            return res.status(401).json({success, contactErr: "Employee with this phone number already exists"});
        }
        
        const existing_alternate_no = await employeeSchema.findOne({alternate_contact: updatedEmployeeData.alternate_contact});
        if(existing_alternate_no){
            return res.status(401).json({success, alternateContactErr: "Employee with this alternate phone number already exists"});
        }

        const existing_address = await employeeSchema.findOne({address: updatedEmployeeData.address});
        if(existing_address){
            return res.status(401).json({success, addressErr: "Employee with this address already exists"});
        }

        const editedBy = req.body.editedBy;

        const updatedEmployee = await employeeSchema.findByIdAndUpdate(objId, {...updatedEmployeeData, lastEdit: editedBy}, {new: true});

        if(!updatedEmployee){
            success = false;
            return res.status(401).json({success, message: "Employee Not Found"});
        }

        success = true;
        return res.status(201).json({success, updatedEmployee})

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

//Controller to get all employees data
exports.allEmployeesData = async(req, res)=>{
    const employeesData = await employeeSchema.find();
    try {
        return res.status(200).json({employeesData})
    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"});
    }
}
