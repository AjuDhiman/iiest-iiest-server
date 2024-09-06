const employeeSchema = require('../../models/employeeModels/employeeSchema');
const pastEmployeeSchema = require('../../models/historyModels/pastEmployeeSchema');
const areaAllocationModel = require('../../models/employeeModels/employeeAreaSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { generateUsername, generatePassword, generateEmployeeID } = require('../../employee/generateCredentials');
const {sendEmployeeInfo, sendTemporaryPass} = require('../../employee/sendMail');
const { empSignBucket, empImageBucket } = require('../../config/buckets');
const { ObjectId } = require('mongodb');
const reportingManagerModel = require('../../models/employeeModels/reportingManagerSchema');
const salesModel = require('../../models/employeeModels/employeeSalesSchema');
const { employeeDocsPath, uploadDocObject, getDocObject, deleteDocObject, doesFileExist } = require('../../config/s3Bucket');
const auth = JSON.parse(process.env.AUTH);
const JWT_SECRET = auth.JWT_TOKEN;


//methord for creating new employee Record
exports.employeeRegister = async (req, res) => {
    try {

        let success = false;
        let isUnique = false;

        //destructuring body of the request
        const { employee_name, gender, email, alternate_contact, contact_no, dob, post_type, country, state, city, address, zip_code, panel_type, department, designation, salary, pay_band, doj, company_name, project_name, createdBy, empSignature, employeeImage } = req.body;

        console.log(req.body);
        //checking if email comming in body aready exsists or not
        const existing_email = await employeeSchema.findOne({ email });
        if (existing_email) {
            return res.status(401).json({ success, emailErr: true });
        }

        //checking if phone no comming in body aready exsists or not
        const existing_contact = await employeeSchema.findOne({ contact_no });
        if (existing_contact) {
            return res.status(401).json({ success, contactErr: true });
        }

        //checking if  aternate phone no comming in body aready exsists or not
        const existing_alternate_no = await employeeSchema.findOne({ alternate_contact });
        if (existing_alternate_no) {
            return res.status(401).json({ success, alternateContactErr: true });
        }

        //checking if the address already exsistts or not
        const existing_address = await employeeSchema.findOne({ address });
        if (existing_address) {
            return res.status(401).json({ success, addressErr: true });
        }

        let idNumber;

        //getting unique id num
        while (!isUnique) {
            idNumber = Math.floor(1000 + Math.random() * 9000);
            const existingNumber = await employeeSchema.findOne({ id_num: idNumber });
            if (!existingNumber) {
                isUnique = true;
            }
        }

        //generatig user name
        const generatedUsername = generateUsername(employee_name, idNumber);

        //generatig employee id
        const generatedId = generateEmployeeID(company_name, idNumber);

        //generating password
        let generatedPassword = generatePassword(10);

        console.log(generatedUsername, generatedPassword);

        const salt = await bcrypt.genSalt(10);

        const secPass = await bcrypt.hash(generatedPassword, salt);


        const employeeRegisterd = await employeeSchema.create({
            id_num: idNumber, employee_name, gender, email, contact_no, alternate_contact, dob, post_type, country, state, city, address, zip_code, employee_id: generatedId, panel_type, department, designation, salary, pay_band, doj, company_name, project_name, username: generatedUsername, password: secPass, createdBy, signatureImage: empSignature, status: true, employeeImage: employeeImage
        });

        if (!employeeRegisterd) {
            success = false;
            return res.status(404).json({ success, randomErr: true })
        }

        sendEmployeeInfo(generatedUsername, generatedPassword, generatedId, email)
        success = true;
        return res.status(200).json({ success, successMsg: true });

    } catch (error) {
        console.error(error);
        success = false;
        return res.status(500).json({ success, message: "Internal Server Error" })
    }
}

//api for employee login
exports.employeeLogin = async (req, res) => {
    try {
        let success = false;

        const { username, password } = req.body;

        const employee_user = await employeeSchema.findOne({ username });

        if (!employee_user) {
            return res.status(401).json({ success, message: "Please try to login with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, employee_user.password);
        if (!passwordCompare) {
            return res.status(401).json({ success, message: "Please try to login with correct credentials" });
        }

        const data = {
            user: {
                id: employee_user.id
            }
        }

        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        return res.status(200).json({ success, authToken, employee_user });

    } catch (error) {
        console.error(error);
        success = false;
        return res.status(500).json({ success, message: "Internal Server Error" });
    }
}

//this methord generates temporary passwords
function generateTemporaryPassword() {
    // Generate a temporary password 
    return Math.random().toString(36).slice(-8);
}

//api for forgot password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await employeeSchema.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate temporary password
        const temporaryPassword = generateTemporaryPassword();

        // Hash temporary password
        const hashedTemporaryPassword = await bcrypt.hash(temporaryPassword, 10);

        user.temporaryPassword = hashedTemporaryPassword;

        await user.save();

        sendTemporaryPass(temporaryPassword, user.email)

        // console.log('Temporary password sent successfully:', temporaryPassword);

        // Set timeout to clear temporary password after 10 minutes
        setTimeout(async () => {
            user.temporaryPassword = null;
            await user.save();
            console.log('Temporary password cleared after 10 minutes');
        }, 10 * 60 * 1000);

        // Return success message and temporary password to the client
        return res.status(200).json({ success: true, message: 'Temporary password sent successfully', temporaryPassword });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

//api for reseting password
exports.resetPassword = async (req, res) => {
    try {
        const { username, email, temporaryPassword, newPassword } = req.body;

        // Find employee by email
        const user = await employeeSchema.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if the provided username matches the user's username
        if (user.username !== username) {
            return res.status(401).json({ success: false, message: 'Username is incorrect' });
        }

        // Compare temporary password
        const passwordMatch = await bcrypt.compare(temporaryPassword, user.temporaryPassword);

        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Temporary password is incorrect' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update employee's password and clear temporary password
        user.password = hashedNewPassword;
        user.temporaryPassword = null;
        await user.save();

        return res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

//api for deleting employee object
exports.deleteEmployee = async (req, res) => {
    const objId = req.params.id;
    const { deletedBy } = req.body;
    let success = false;

    const signatureBucket = empSignBucket();
    const imageBucket = empImageBucket();

    try {

        const deletedEmployee = await employeeSchema.findByIdAndDelete(objId);

        if (!deletedEmployee) {
            success = false;
            return res.status(404).json({ success, deleteEmpErr: true });
        }

        const signatureExists = await signatureBucket.find({ '_id': new ObjectId(deletedEmployee.signatureImage) }).toArray();

        const imageExists = await imageBucket.find({ '_id': new ObjectId(deletedEmployee.employeeImage) }).toArray();

        if (signatureExists.length > 0) {
            await signatureBucket.delete(deletedEmployee.signatureImage);
        }

        if (imageExists.length > 0) {
            await imageBucket.delete(deletedEmployee.employeeImage);
        }

        if (deletedEmployee) {

            const { _id, ...pastEmployee } = deletedEmployee.toObject();

            await pastEmployeeSchema.create({ ...pastEmployee, deletedBy: deletedBy }) //Adding deleted employee to past employee data

            success = true;
            return res.status(200).json({ success, deletedEmployee });
        } else {
            success = false;
            return res.status(401).json({ success, message: "Employee Not Found" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

//api for editing employee
exports.editEmployee = async (req, res) => {

    try {

        let objId = req.params.id;
        let success = false;

        const updatedEmployeeData = req.body;
        console.log(updatedEmployeeData);

        const existing_email = await employeeSchema.findOne({ email: updatedEmployeeData.email });
        if (existing_email) {
            return res.status(401).json({ success, emailErr: "Employee with this email already exists" });
        }

        const existing_contact = await employeeSchema.findOne({ contact_no: updatedEmployeeData.contact_no });
        if (existing_contact) {
            return res.status(401).json({ success, contactErr: "Employee with this phone number already exists" });
        }

        const existing_alternate_no = await employeeSchema.findOne({ alternate_contact: updatedEmployeeData.alternate_contact });
        if (existing_alternate_no) {
            return res.status(401).json({ success, alternateContactErr: "Employee with this alternate phone number already exists" });
        }

        const existing_address = await employeeSchema.findOne({ address: updatedEmployeeData.address });
        if (existing_address) {
            return res.status(401).json({ success, addressErr: "Employee with this address already exists" });
        }

        const editedBy = req.body.editedBy;

        const updatedEmployee = await employeeSchema.findByIdAndUpdate(objId, { ...updatedEmployeeData, lastEdit: editedBy }, { new: true });

        if (!updatedEmployee) {
            success = false;
            return res.status(401).json({ success, message: "Employee Not Found" });
        }

        success = true;
        return res.status(200).json({ success, updatedEmployee })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

//api for getting all employees data
exports.allEmployeesData = async (req, res) => {
    const employeesData = await employeeSchema.find({
        _id: { $ne: req.user.id },
        employee_name: {
          $not: {
            $regex: "admin",
            $options: "i" // Case-insensitive match
          }
        }
      });
      
    try {
        return res.status(200).json({ employeesData })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

//api for arae allocation
exports.areaAllocation = async (req, res) => { //methord for allocating area to a particular employee
    try {

        let success = false;

        const employeeId = req.params.id; //getting employee Id from route

        const existingAreas = await areaAllocationModel.findOne({ employeeInfo: employeeId }); //checking if already allocated or not

        if (existingAreas) {
            return res.status(404).json({ success, existingAreaErr: true })
        }

        const areaAllocated = await areaAllocationModel.create({ employeeInfo: employeeId, state: req.body.state, district: req.body.district, pincodes: req.body.pincodes }); //create new object and allocate new are in case area not allocated
        if (!areaAllocated) {
            success = false;
            return res.status(200).json({ success, randomErr: true })
        }

        success = true;
        res.status(200).json({ success })

    } catch (error) {
        //getting time of error in case of error
        console.error(`Area allocation error at ${new Date().toUTCString()}`, error);
        return res.status(500).json({ message: "Internal Server Error" });
    }

}

//api for assigining manager
exports.assignManger = async (req, res) => { //methord for assigning manager
    try {
        let success = false;

        const employeeId = req.params.id; //gettinhg employee from route

        const reportingManger = await reportingManagerModel.findOne({ employeeInfo: employeeId }); //checking if manager assigned

        if (reportingManger) {
            return res.status(404).json({ success, existingManagerErr: true })
        }

        const managerAssigned = await reportingManagerModel.create({ employeeInfo: employeeId, reportingManager: req.body.reportingManager });
        //assigning new manager in case no manager assigned

        if (!managerAssigned) {
            success = false;
            return res.status(200).json({ success, randomErr: true })
        }

        success = true;
        res.status(200).json({ success })

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

//methord for getting allocate area of the user
exports.allocatedAreas = async (req, res) => {
    try {

        const allocatedPincodes = await areaAllocationModel.findOne({ employeeInfo: req.params.id });
        return res.status(200).json({ allocatedPincodes })

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

//api for getting presighned url of employee image
exports.employeeImage = async (req, res) => {
    try {

        const src = req.params.id;
        const key = `${employeeDocsPath}${src}`;

        //returning error in case image file doesn't exsists
        const isExsists = await doesFileExist(key);

        if(!isExsists) {
            return res.status(204).json({success: false, message: 'Image Not Found', exsistanceErr: true})
        }

        //getting presigned url for image saves in s3 bucket
        const imageConverted = await getDocObject(key);
        return res.status(200).json({ success: true, imageConverted: imageConverted });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


//api for getting presigned url of employee signature
exports.employeeSignature = async (req, res) => {
    try {

        const src = req.params.id;
        const key = `${employeeDocsPath}${src}`;

         //returning error in case image file doesn't exsists
         const isExsists = await doesFileExist(key);

         if(!isExsists) {
             return res.status(204).json({success: false, message: 'Image Not Found', exsistanceErr: true})
         }

        const signatureConverted = await getDocObject(key);
        return res.status(200).json({ success: true, signatureConverted: signatureConverted });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

//api for updating employee image and signature
exports.editEmployeeImages = async (req, res) => {
    try {

        let success = false;

        const { userImage, userSignature } = req.body;

        console.log(req.body);

        const userInfo = await employeeSchema.findOne({_id: req.user._id});

       

        //update userImage in case user image came in body
        if (userImage) {
            await deleteDocObject(`${employeeDocsPath}${userInfo.employeeImage}`);
            await userInfo.updateOne({ $set: { employeeImage: userImage} });
            await userInfo.save();
        }

        //update userSign in case user sign came in body
        if (userSignature) {
            await deleteDocObject(`${employeeDocsPath}${userInfo.signatureImage}`);
            await userInfo.updateOne({ $set: { signatureImage: userSignature  } });
            await userInfo.save();
        }

        const updatedInfo = await employeeSchema.findOne({_id: req.user._id});


        //setting new token in case updated info
        if (userImage || userSignature) {

            const newData = {
                user: {
                    id: req.user._id
                }
            }

            const newToken = jwt.sign(newData, JWT_SECRET);

            success = true;
            return res.status(200).json({ success, infoUpdated: true, newToken, newData: updatedInfo });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

//methord for getting notifications
exports.getNotifications = async (req, res) => {
    try {

        const purpose = req.query.purpose;

        const notifications = await salesModel.aggregate([
            {
                $unwind: "$notificationInfo"
            },
            {
                $lookup: {
                    from: 'staff_registers',
                    localField: 'employeeInfo',
                    foreignField: '_id',
                    as: 'employeeInfo'
                }
            },
            {
                $unwind: "$employeeInfo"
            },
            // {
            //     $match: {
            //         eq: ["$notificationInfo.purpose", purpose]
            //     }
            // },
            {
                $project: {
                    "purpose": "$notificationInfo.purpose",
                    "isRead": "$notificationInfo.isRead",
                    "product": "$notificationInfo.product",
                    "readerInfo": "$notificationInfo.readerInfo",
                    "salesInfo": "$_id",
                    "createdAt": "$createdAt",
                    "employeeImage": "$employeeInfo.employeeImage",
                    "employee_name": "$employeeInfo.employee_name"
                }
            },
            {
                $sort: {
                    "createdAt": -1
                }
            },
            {
                $limit: 100
            }
        ])

        console.log(purpose);

        return res.status(200).json({ notifications });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}


//methord for updating notiofication status
exports.updateNotificationStatus = async (req, res) => {
    try {

        const saleId = req.params.saleid;
        const product = req.query.product;

        //getting notification array
        const notificationArr = (await salesModel.findOne({ _id: saleId })).notificationInfo;

        console.log(notificationArr, product)

        //upating notification ststus
        notificationArr.forEach(notification => {
            if (notification.product === product) {
                notification.isRead = true;
                notification.readerInfo = req.user._id;
            }
        });

        const updatedNotification = await salesModel.findByIdAndUpdate({ _id: saleId }, { $set: { "notificationInfo": notificationArr } });

        if (!updatedNotification) {
            res.status(201).json({ notificationUpdateErr: true, status: flase })
        }

        res.status(200).json({ status: true });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

//methord for generatig uplaod url for employeeDocs
exports.getEmployeeDocUploadURL = async (req, res) => {
    try {
        const filename = req.params.name;
        const format = req.query.format;

        console.log(filename, format);
        //convering format commoing in formof image_png or image_jpg to image/png or jpeg
        const formatConverted = format.split('_').join('/');

        //generating key for obj
        const key = `${employeeDocsPath}${filename}`;

        //generating uolaod url
        const uploadUrl = await uploadDocObject(key, formatConverted);

        return res.status(200).json({ uploadUrl: uploadUrl });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}


//methord for generating pesigned url for a key if it comming from frontend
exports.generatePresignedGetUrl = async(req, res) => {
    try {
        let success = false;

        const {key} = req.body.key;

        const url = await getDocObject(key);

        if(!url){
            return res.status(404).json({success: success, urlGeneratingError: true})
        }

        success = true;
        return res.status(200).json({success: success, url: url});
    } catch(error) {
        console.log(error);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
}
