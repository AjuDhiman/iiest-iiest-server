const fboModel = require("../../models/fboModels/fboSchema");
const { recipientModel } = require("../../models/fboModels/recipientSchema");
const fostacAttendanceModel = require("../../models/operationModels/attenSecSchema");
const fostacVerifyModel = require("../../models/operationModels/basicFormSchema");
const fostacEnrollmentModel = require("../../models/operationModels/enrollmentSchema");
const generalSectionModel = require("../../models/operationModels/generalSectionSchema");
const { logAudit } = require("../generalControllers/auditLogsControllers");

exports.fostacVerification = async (req, res) => {
    try {

        let success = false;

        const recipientId = req.params.recipientid;

        const { recipient_name, fbo_name, owner_name, father_name, dob, address, recipient_contact_no, email, aadhar_no, pancard_no, sales_date, username, password } = req.body;

        const checkExistingMail = await fostacVerifyModel.findOne({ email });

        if (checkExistingMail) {
            success = false;
            return res.status(401).json({ success, emailErr: true })
        }

        const checkUsername = await fostacVerifyModel.findOne({ userName: username })

        if (checkUsername) {
            success = false;
            return res.status(401).json({ success, userNameErr: true })
        }

        const basicFormAdd = await fostacVerifyModel.create({ operatorInfo: req.user.id, recipientInfo: recipientId, email, address, pancardNo: pancard_no, fatherName: father_name, dob, userName: username, password, salesDate: sales_date });

        //this code is for tracking the CRUD operation regarding to a recipient
        
        const prevVal = {}

        const currentVal = basicFormAdd;

        logAudit(req.user._id, "recipientdetails", recipientId , prevVal, currentVal, "Recipient verified");

        // code for tracking ends

        if (basicFormAdd) {
            success = true
            return res.status(200).json({ success, verifiedId: basicFormAdd._id });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getFostacVerifiedData = async (req, res) => {
    try {
        let success = false;

        const recipientId = req.params.recipientid;

        const verifedData = await fostacVerifyModel.findOne({ recipientInfo: recipientId });

        if (verifedData) {
            success = true;
            return res.status(200).json({ success, message: 'verified recipient', verifedData });
        } else {
            return res.status(204).json({ success, message: 'Recipient is not verified' });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

//backend code for enrollment form
exports.fostacEnrollment = async (req, res) => {
    try {
        let success = false;

        const verifiedDataId = req.params.verifieddataid;

        const { tentative_training_date, fostac_training_date, roll_no } = req.body;

        const checkRollNo = await fostacEnrollmentModel.findOne({ roll_no });

        if (checkRollNo) {
            success = false;
            return res.status(401).json({ success, rollNoErr: true });
        }

        const enrollRecipient = await fostacEnrollmentModel.create({ operatorInfo: req.user.id, verificationInfo: verifiedDataId, tentative_training_date, fostac_training_date, roll_no });

        //this code is for tracking the flow of data regarding to a recipient

        const verifiedData = await fostacVerifyModel.findOne({ _id: verifiedDataId });//only for getting recipient id because we want to track recipient

        // //this code is for tracking fostac training date and tentative training date

        let trainingDateAction = '';

        if (getFormatedDate(enrollRecipient.tentative_training_date) !== getFormatedDate(enrollRecipient.fostac_training_date)) {

            trainingDateAction = `Date ${getFormatedDate(enrollRecipient.fostac_training_date)} is given instead of tentative training date(${getFormatedDate(enrollRecipient.tentative_training_date)})`

        } else {

            trainingDateAction = `Training Date(${getFormatedDate(enrollRecipient.fostac_training_date)}) is given`;

        }

        const prevVal = {}

        const currentVal = enrollRecipient;

        await logAudit(req.user._id, "recipientdetails", verifiedData.recipientInfo,  prevVal, currentVal, trainingDateAction);

        await logAudit(req.user._id, "recipientdetails", verifiedData.recipientInfo, prevVal, currentVal, "Recipient Enrolled");

        // code for tracking ends

        if (enrollRecipient) {
            success = true;
            return res.status(200).json({ success, message: 'Enrolled recipient', enrolledId: enrollRecipient._id });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getFostacEnrolledData = async (req, res) => {
    try {
        let success = false;

        const verifiedDataId = req.params.verifieddataid;

        const enrolledData = await fostacEnrollmentModel.findOne({ verificationInfo: verifiedDataId });

        if (enrolledData) {
            success = true;
            return res.status(200).json({ success, message: 'Enrolled recipient', enrolledData });
        } else {
            return res.status(204).json({ success, message: 'Recipient is not enrolled' });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.postGenOperData = async (req, res) => {

    try {

        const recipientId = req.params.recipientid;

        let success = false;

        const { recipient_status, officer_note } = req.body;

        const operGenSecAdd = await generalSectionModel.create({ operatorInfo: req.user._id, recipientInfo: recipientId, recipientStatus: recipient_status, officerNote: officer_note });

        const prevVal = {}

        const currentVal = operGenSecAdd

        await logAudit(req.user._id, "recipientdetails", recipientId, prevVal, currentVal, "Officer Note changed");

        if (operGenSecAdd) {
            success = true
            return res.status(200).json({ success })
        }

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getGenOperData = async (req, res) => {
    try {
        let success = false;

        const recipientId = req.params.recipientid;

        const genSecData = await generalSectionModel.find({ recipientInfo: recipientId }).populate({ path: 'operatorInfo'});

        if (genSecData) {
            success = true;
            return res.status(200).json({ success, genSecData });
        } else {
            return res.status(204).json({ success });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

// exports.updateGenOperData = async (req, res) => {

//     try {

//         let success = false;

//         const recipientId = req.params.recipientid;

//         const { recipient_status, officer_note } = req.body;

//         const operGenSecUpdate = await generalSectionModel.findOneAndUpdate({ recipientInfo: recipientId }, { recipientStatus: recipient_status, officerNote: officer_note });

//         const prevVal = operGenSecUpdate;

//         const currentVal = await generalSectionModel.findOne({_id :operGenSecUpdate._id})

//         await logAudit(req.user._id, "recipientdetails", recipientId, prevVal, currentVal, "Officer Note changed");

//         if (operGenSecUpdate) {
//             success = true
//             return res.status(200).json({ success })
//         }

//     } catch (error) {
//         return res.status(500).json({ message: 'Internal Server Error' });
//     }
// }

function getFormatedDate(date) {
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
    const originalDate = new Date(date);
    const year = originalDate.getFullYear();
    const month = months[originalDate.getMonth()];
    const day = String(originalDate.getDate()).padStart(2, '0');
    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
}


//for trainers panel

//backend code for attendance form
exports.fostacAttendance = async (req, res) => {
    console.log(req.params.enrolleddataid);
    try {
        let success = false;

        const enrolledDataId = req.params.enrolleddataid;

        const { attendee_status, marks } = req.body;

        const addAttendance = await fostacAttendanceModel.create({ operatorInfo: req.user.id, EnrollmentInfo: enrolledDataId, attendeeStatus: attendee_status, marks:marks})

        //this code is for tracking the flow of data regarding to a recipient

        const enrolledData = await fostacEnrollmentModel.findOne({ _id: enrolledDataId });

        const verifiedData = await fostacVerifyModel.findOne({ _id: enrolledData.verificationInfo });

        const prevVal = {}

        const currentVal = addAttendance;

        await logAudit(req.user._id, "recipientdetails", verifiedData.recipientInfo, prevVal, currentVal, `Attendance Marked ${attendee_status}`);

        // code for tracking ends

        if (addAttendance) {
            success = true;
            return res.status(200).json({ success, message: 'Attendance Marked' });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getFostacAttenData = async(req,res) => {
    try {
        let success = false;

        const enrolledDataId = req.params.enrolleddataid;

        const attenData = await fostacAttendanceModel.findOne({ EnrollmentInfo: enrolledDataId });

        if (attenData) {
            success = true;
            return res.status(200).json({ success, attenData });
        } else {
            return res.status(204).json({ success });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}