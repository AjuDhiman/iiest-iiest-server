const boModel = require('../../models/BoModels/boSchema');
const employeeSchema = require('../../models/employeeModels/employeeSchema')
const { sendMailToBo } = require('./emailService');
const { generateUniqueId } = require('../../fbo/generateCredentials');
const { default: mongoose } = require('mongoose');

exports.createBusinessOwner = async (req, res) => { //methord for creating business owners
    try {
        const {
            owner_name,
            business_entity,
            business_category,
            business_ownership_type,
            manager_name,
            contact_no,
            email,
            onboard_by } = req.body; //destructuring req body

        const { idNumber, generatedUniqueCustomerId } = await generateUniqueId(); //generating unique customer id for a bo

        //preceding lines will terminate the api and send exsisting mail error in response
        const exsistingMail = await boModel.findOne({ email: email });
        console.log(exsistingMail);

        if (exsistingMail) {
            return res.status(401).json({ success: false, emailErr: true });
        }

        //preceding lines will terminate the api and send exsisting contact error in response
        const exsistingContact = await boModel.findOne({ contact_no: contact_no });

        if (exsistingContact) {
            return res.status(401).json({ success: false, contactErr: true });
        }

        const employeeInfo = await employeeSchema.findOne({ employee_id: onboard_by }); //getting employee info the help of unique
        //  employee id of a sales man (we are not using req.user in this case like our other api because we are not passing this api through middleware because we want to consumer to use onboard form witout being some one logged in)

        const newBo = await boModel.create({
            id_num: idNumber,
            customer_id: generatedUniqueCustomerId,
            owner_name,
            business_entity,
            business_category,
            business_ownership_type,
            contact_no,
            email,
            manager_name,
            onboard_by: employeeInfo._id,
            is_contact_verified: false,
            is_email_verified: false //setting contact and email verification initially false beacuse we want consumer to verify both by mail or contact
        }); // creating new bo in db

       
        const mailInfo = {
            purpose: 'verification',// purpose of the mail
            id: newBo._id,
            email: newBo.email,
            contact_no: newBo.contact_no
        }//collecting data relate to mail in mail info and next pass into send mail

        await sendMailToBo(email, mailInfo); //sending verification mail

        return res.status(200).json({ message: 'Business owner created successfully', data: newBo });
    } catch (error) {
        console.error('Error creating business owner:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getAllBusinessOwners = async (_req, res) => { //get list of all business owner from bo registers whose both contact and email are verified
    try {
        const businessOwners = await boModel.find({ is_contact_verified: true, is_email_verified: true });
        console.log(businessOwners);
        res.status(200).json({ data: businessOwners });
    } catch (error) {
        console.error('Error fetching business owners:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getEmployeeNameAndId = async (req, res) => {//getting all employee name and employeeid for showing list of sale employee in onboard form onboard officer field
    try {

        const nameNIdList = await employeeSchema.find({ status: true, department: 'Sales Department' }).select('employee_name employee_id');

        res.status(200).json(nameNIdList);

    } catch (error) {

        console.log('ID and Name List Error:', error);

        res.status(500).json({ success: false, message: 'Internal Server Error' });

    }
}

exports.verifyEmail = async (req, res) => { //methord for verifing email and contact of an bo by clicking verify mail button send in mail or sms
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) { //sending error message in case of wrong format of objet id send in parameter
            return res.status(404).json({ success: false, message: "Not A Valid Request" }); //this message will be shown in verifing mail frontend
        }

        const idExsists = await boModel.findOne({ _id: req.params.id });

        if (idExsists) {//sending already verified mail case of mailor contact already verified 
            if (idExsists.is_email_verified) {
                return res.status(200).json({ success: true, message: 'Already Verified' })
            }

            const verifiedMail = await boModel.findByIdAndUpdate(//updates the bo obj by assigning is_verified mail and is_contact _verified true
                { _id: req.params.id },
                {
                    $set: {
                        is_email_verified: true,
                        is_contact_verified: true
                    }
                },
                { new: true }
            );

            //in case of verification failed send verificatio  error
            if (!verifiedMail) {
                return res.status(404).json({ success: false, message: "Verification Failed", emailSendingErr: true });
            }

           
            const mailInfo = { //aggregating mail info for sending mail to bo with his or her customer id
                boName: idExsists.owner_name,
                purpose: 'onboard',
                customerId: verifiedMail.customer_id,
                email: idExsists.email,
                contact_no: idExsists.contact_no,
                managerName: idExsists.manager_name
            }

            await sendMailToBo(verifiedMail.email, mailInfo);//sending onboard mail when bo verifies mail and contact by clicking on verify mail button 
            
            return res.status(200).json({ success: true, message: "Email Verified" }) 
        }

        return res.status(404).json({ success: false, message: "Verification Failed" });
    } catch (error) {
        console.log('Mail Verification Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' })
    }
}

