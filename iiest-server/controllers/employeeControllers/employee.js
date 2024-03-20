const employeeSchema = require('../../models/employeeModels/employeeSchema');
const pastEmployeeSchema = require('../../models/historyModels/pastEmployeeSchema');
const areaAllocationModel = require('../../models/employeeModels/employeeAreaSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { generateUsername, generatePassword, generateEmployeeID } = require('../../employee/generateCredentials');
const sendEmployeeInfo = require('../../employee/sendMail');
const { empSignBucket, empImageBucket } = require('../../config/buckets');
const { ObjectId } = require('mongodb');
const reportingManagerModel = require('../../models/employeeModels/reportingManagerSchema');
const auth = JSON.parse(process.env.AUTH);
const JWT_SECRET = auth.JWT_TOKEN;



exports.employeeRegister = async (req, res) => {
    try {
        const signature = req.files['empSignature'];
        const image = req.files['employeeImage'];

        let success = false;
        let isUnique = false;

        if (!signature) {
            success = false
            return res.status(401).json({ success, signatureErr: true })
        }

        if (!image) {
            success = false
            return res.status(401).json({ success, imageErr: true })
        }

        const { employee_name, gender, email, alternate_contact, contact_no, dob, post_type, country, state, city, address, zip_code, panel_type, department, designation, salary, pay_band, doj, company_name, project_name, createdBy } = req.body;

        const existing_email = await employeeSchema.findOne({ email });
        if (existing_email) {
            return res.status(401).json({ success, emailErr: true });
        }

        const existing_contact = await employeeSchema.findOne({ contact_no });
        if (existing_contact) {
            return res.status(401).json({ success, contactErr: true });
        }

        const existing_alternate_no = await employeeSchema.findOne({ alternate_contact });
        if (existing_alternate_no) {
            return res.status(401).json({ success, alternateContactErr: true });
        }

        const existing_address = await employeeSchema.findOne({ address });
        if (existing_address) {
            return res.status(401).json({ success, addressErr: true });
        }

        let idNumber;

        while (!isUnique) {
            idNumber = Math.floor(1000 + Math.random() * 9000);
            const existingNumber = await employeeSchema.findOne({ id_num: idNumber });
            if (!existingNumber) {
                isUnique = true;
            }
        }

        const generatedUsername = generateUsername(employee_name, idNumber);

        const generatedId = generateEmployeeID(company_name, idNumber);

        let generatedPassword = generatePassword(10);

        console.log(generatedUsername, generatedPassword);

        const salt = await bcrypt.genSalt(10);

        const secPass = await bcrypt.hash(generatedPassword, salt);

        const signatureFileName = `${Date.now()}_${signature[0].originalname}`;
        const imageFileName = `${Date.now()}_employeeimage_${image[0].originalname}`;

        const sigatureBuckcet = empSignBucket();

        const uploadSignStream = sigatureBuckcet.openUploadStream(signatureFileName);

        uploadSignStream.write(signature[0].buffer);

        const imageBucket = empImageBucket();

        const uploadImageStream = imageBucket.openUploadStream(imageFileName);

        uploadImageStream.write(image[0].buffer);

        uploadSignStream.end((err) => {
            if (err) {
                success = false;
                return res.status(401).json({ success, signatureErr: true })
            }
            console.log(`File ${uploadSignStream.id} uploaded successfully.`);
        });

        uploadImageStream.end((err) => {
            if (err) {
                success = false;
                return res.status(401).json({ success, imageErr: true })
            }
            console.log(`File ${uploadImageStream.id} uploaded successfully.`);
        })

        const employeeRegisterd = await employeeSchema.create({
            id_num: idNumber, employee_name, gender, email, contact_no, alternate_contact, dob, post_type, country, state, city, address, zip_code, employee_id: generatedId, panel_type, department, designation, salary, pay_band, doj, company_name, project_name, username: generatedUsername, password: secPass, createdBy, signatureImage: uploadSignStream.id, status: true, employeeImage: uploadImageStream.id
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
function generateTemporaryPassword() {
    // Generate a temporary password 
    return Math.random().toString(36).slice(-8); 
}

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

        console.log('Temporary password sent successfully:', temporaryPassword);

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

exports.allEmployeesData = async (req, res) => {
    const employeesData = await employeeSchema.find({ _id: { $ne: req.user.id } });
    try {
        return res.status(200).json({ employeesData })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.areaAllocation = async (req, res) => {
    try {

        let success = false;

        const employeeId = req.params.id;

        const existingAreas = await areaAllocationModel.findOne({ employeeInfo: employeeId });

        if (existingAreas) {
            return res.status(404).json({ success, existingAreaErr: true })
        }

        const areaAllocated = await areaAllocationModel.create({ employeeInfo: employeeId, state: req.body.state, district: req.body.district, pincodes: req.body.pincodes });
        if (!areaAllocated) {
            success = false;
            return res.status(200).json({ success, randomErr: true })
        }

        success = true;
        res.status(200).json({ success })

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }

}

exports.assignManger = async (req, res) => {
    try {
        let success = false;

        const employeeId = req.params.id;

        console.log(employeeId, req.body);

        const reportingManger = await reportingManagerModel.findOne({ employeeInfo: employeeId });

        if (reportingManger) {
            return res.status(404).json({ success, existingManagerErr: true })
        }

        const managerAssigned = await reportingManagerModel.create({ employeeInfo: employeeId, reportingManager: req.body.reportingManager});
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

exports.allocatedAreas = async (req, res) => {
    try {

        const allocatedPincodes = await areaAllocationModel.findOne({ employeeInfo: req.params.id });
        return res.status(200).json({ allocatedPincodes })

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.employeeImage = async (req, res) => {
    try {

        let success = false;

        const imageBucket = empImageBucket();

        const imageExists = await imageBucket.find({ "_id": new ObjectId(req.params.id) }).toArray();

        if (!imageExists.length > 0) {
            success = false;
            return res.status(200).json({ success, noImage: true })
        }

        const imageDownloadStream = imageBucket.openDownloadStream(new ObjectId(req.params.id));

        imageDownloadStream.on('error', () => {
            success = false;
            return res.status(200).json({ success, defaultImage: '../../../assets/logo-side.png' })
        })

        let chunks = [];

        imageDownloadStream.on('data', (chunk) => {
            chunks.push(chunk);
        })

        imageDownloadStream.on('end', () => {

            const imageBuffer = Buffer.concat(chunks);
            const imagePrefix = 'data:image/png;base64,';
            const imageBase64 = imageBuffer.toString('base64');
            const imageConverted = `${imagePrefix}${imageBase64}`;

            success = true;

            return res.status(200).json({ success, imageConverted })
        })

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


exports.employeeSignature = async (req, res) => {
    try {

        let success = false;

        const signatureBucket = empSignBucket();

        const signExists = await signatureBucket.find({ "_id": new ObjectId(req.params.id) }).toArray();

        if (!signExists.length > 0) {
            success = false;
            return res.status(200).json({ success, noSign: true })
        }

        const signDownloadStream = signatureBucket.openDownloadStream(new ObjectId(req.params.id));

        if (!signDownloadStream) {
            success = false;
            return res.status.json({ success, noSignature: true });
        }

        let chunks = [];

        signDownloadStream.on('data', (chunk) => {
            chunks.push(chunk);
        })

        signDownloadStream.on('end', () => {
            const signatureBuffer = Buffer.concat(chunks);
            const signaturePrefix = 'data:image/png;base64,';
            const signBase64 = signatureBuffer.toString('base64');
            const signatureConverted = `${signaturePrefix}${signBase64}`;

            success = true;

            return res.status(200).json({ success, signatureConverted })
        })

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.editEmployeeImages = async (req, res) => {
    try {

        let success = false;

        const userInfo = await employeeSchema.findById(req.user.id);

        const imageBucket = empImageBucket();

        const signatureBucket = empSignBucket();

        let updatedInfo;

        if (req.files['userImage']) {
            const imageFile = req.files['userImage'];
            const newImageName = `${Date.now()}_${imageFile[0].originalname}`;

            const imageExists = await imageBucket.find({ "_id": new ObjectId(userInfo.employeeImage) }).toArray();

            if (imageExists.length > 0) {
                await imageBucket.delete(userInfo.employeeImage);
            }

            const newImageStream = imageBucket.openUploadStream(newImageName);

            newImageStream.write(imageFile[0].buffer);

            newImageStream.end((err) => {
                if (err) {
                    success = false;
                    return res.status(404).json({ success, editImageErr: true })
                }

                console.log('New Image Uploaded Successfully');
            })

            userInfo.employeeImage = newImageStream.id;
            updatedInfo = await userInfo.save();
        }

        if (req.files['userSign']) {
            const signatureFile = req.files['userSign'];
            const newSignName = `${Date.now()}_${signatureFile[0].originalname}`;

            const signExists = await signatureBucket.find({ "_id": new ObjectId(userInfo.signatureImage) }).toArray();

            if (signExists.length > 0) {
                await signatureBucket.delete(userInfo.signatureImage);
            }

            const newSignStream = signatureBucket.openUploadStream(newSignName);

            newSignStream.write(signatureFile[0].buffer);

            newSignStream.end((err) => {
                if (err) {
                    success = false;
                    return res.status(404).json({ success, editSignErr: true })
                }
                console.log('New Signature Uploaded Successfully')
            })

            userInfo.signatureImage = newSignStream.id;
            updatedInfo = await userInfo.save();
        }

        if (updatedInfo) {

            const newData = {
                user: {
                    id: userInfo._id
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
