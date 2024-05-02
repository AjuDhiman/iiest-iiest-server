const boModel = require('../../models/BoModels/boSchema');
const employeeSchema = require('../../models/employeeModels/employeeSchema')
const { sendMailToBo } = require('./emailService');
const { generateUniqueId } = require('../../fbo/generateCredentials');
const { default: mongoose } = require('mongoose');

exports.createBusinessOwner = async (req, res) => {
    try {
        const {
            owner_name,
            business_entity,
            business_category,
            business_ownership_type,
            contact_no,
            email,
            onboard_by } = req.body;

        console.log(req.body);

        const { idNumber, generatedUniqueCustomerId } = await generateUniqueId();

        //preceding lines will terminate the api and send exsisting mail and contact error in response
        const exsistingMail = await boModel.findOne({ email: email });
        console.log(exsistingMail);

        if (exsistingMail) {
            return res.status(401).json({ success: false, emailErr: true });
        }

        const exsistingContact = await boModel.findOne({ contact_no: contact_no });

        if (exsistingContact) {
            return res.status(401).json({ success: false, contactErr: true });
        }

        const employeeInfo = await employeeSchema.findOne({ employee_id: onboard_by });

        const newBo = await boModel.create({
            employeeInfo: req.user._id,
            id_num: idNumber,
            customer_id: generatedUniqueCustomerId,
            owner_name,
            business_entity,
            business_category,
            business_ownership_type,
            contact_no,
            email,
            onboard_by: employeeInfo._id,
            is_contact_verified: false,
            is_email_verified: false
        });

        //sending verification mail
        const mailInfo = {
            purpose: 'verification',
            id: newBo._id
        }
        await sendMailToBo(email, mailInfo);

        return res.status(201).json({ message: 'Business owner created successfully', data: newBo });
    } catch (error) {
        console.error('Error creating business owner:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getAllBusinessOwners = async (_req, res) => {
    try {
        const businessOwners = await boModel.find();
        console.log(businessOwners);
        res.status(200).json({ data: businessOwners });
    } catch (error) {

        console.error('Error fetching business owners:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getEmployeeNameAndId = async (req, res) => {
    try {
        let success = false;

        const nameNIdList = await employeeSchema.find({ status: true, department: 'Sales Department' }).select('employee_name employee_id');

        res.status(200).json(nameNIdList);

    } catch (error) {
        console.log('ID and Name List Error:', error)
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

exports.verifyEmail = async (req, res) => {
    try {
        if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ success: false, message: "Not A Valid Request" });
        }
        const idExsists = await boModel.findOne({ _id: req.params.id });
        if (idExsists) {
            if (idExsists.is_email_verified) {
                return res.status(200).json({ success: true, message: 'Already Verified' })
            }

            const verifiedMail = await boModel.findByIdAndUpdate(
                { _id: req.params.id },
                { $set: { is_email_verified: true } },
                { new: true }
            )

            if(!verifiedMail){
                return res.status(404).json({ success: false, message: "Verification Failed", emailSendingErr: true });
            }

            //sending onboarding  mail
            const mailInfo = {
                purpose: 'onboard',
                customerId: verifiedMail.customer_id
            }
            await sendMailToBo(verifiedMail.email, mailInfo);
            return res.status(200).json({ success: true, message: "Email Verified" })
        }

        return res.status(404).json({ success: false, message: "Verification Failed" });
    } catch (error) {
        console.log('Mail Verification Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}

