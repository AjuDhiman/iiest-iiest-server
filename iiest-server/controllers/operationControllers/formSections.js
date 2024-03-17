const fboModel = require("../../models/fboModels/fboSchema");
const { recipientModel, shopModel } = require("../../models/fboModels/recipientSchema");
const fostacAttendanceModel = require("../../models/operationModels/attenSecSchema");
const { fostacVerifyModel, foscosVerifyModel } = require("../../models/operationModels/verificationSchema");
const fostacEnrollmentModel = require("../../models/operationModels/enrollmentSchema");
const generalSectionModel = require("../../models/operationModels/generalSectionSchema");
const ticketDeliveryModel = require("../../models/operationModels/ticketDeliverySchema");
const { logAudit } = require("../generalControllers/auditLogsControllers");
const sendDocumentMail = require("../../operations/sendMail");
const { generateFsms, generateSelfDecOProp } = require("../../operations/generateDocuments");

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

        logAudit(req.user._id, "recipientdetails", recipientId, prevVal, currentVal, "Recipient verified");

        // code for tracking ends

        if (basicFormAdd) {
            success = true
            return res.status(200).json({ success, verifiedId: basicFormAdd._id });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.foscosVerification = async (req, res) => {
    try {
        let success = false;

        const shopID = req.params.shopid;

        const verifiedData = req.body;

        const shopInfo = await shopModel.findOne({ _id: shopID }).populate({ path: 'salesInfo', populate: [{ path: 'employeeInfo' }, { path: 'fboInfo' }] });

        const fsmsCertificate = await generateFsms(verifiedData, shopInfo);

        const selfDecOProp = await generateSelfDecOProp(verifiedData, shopInfo);

        const { operator_name, fbo_name, owner_name, operator_contact_no, email, address, pincode, village, tehsil, kob, food_category, ownership_type, food_items, operator_address, license_category, license_duration, foscos_total, sales_date, sales_person } = verifiedData;

        const addVerification = await foscosVerifyModel.create({ operatorInfo: req.user._id, shopInfo: shopID, kob: kob, foodCategory: food_category, ownershipType: ownership_type, foodItems: food_items, operatorAddress: operator_address, fsmsCertificate: fsmsCertificate, selfDecOProp: selfDecOProp });

        //this code is for tracking the CRUD operation regarding to a recipient

        const prevVal = {}

        const currentVal = addVerification;

        logAudit(req.user._id, "shopDetails", shopID, prevVal, currentVal, "Shop verified");

        // code for tracking ends

        if (!addVerification) {
            success = false;
            res.status(204).json({ success })
        }

        success = true;
        res.status(200).json({ success });

    } catch (error) {

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

exports.getFoscosVerifiedData = async (req, res) => {
    try {
        let success = false;

        const shopId = req.params.shopid;

        const verifedData = await foscosVerifyModel.findOne({ shopInfo: shopId });

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
exports.fostacEnrollment = async (req, res, next) => {
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

        const verifiedData = await fostacVerifyModel.findOne({ _id: verifiedDataId })
            .populate({
                path: 'recipientInfo',
                populate: {
                    path: 'salesInfo',
                }
            });

        //this code is for tracking the flow of data regarding to a recipient

        // //this code is for tracking fostac training date and tentative training date

        let trainingDateAction = '';

        if (getFormatedDate(enrollRecipient.tentative_training_date) !== getFormatedDate(enrollRecipient.fostac_training_date)) {

            trainingDateAction = `Date ${getFormatedDate(enrollRecipient.fostac_training_date)} is given instead of tentative training date(${getFormatedDate(enrollRecipient.tentative_training_date)})`

        } else {

            trainingDateAction = `Training Date(${getFormatedDate(enrollRecipient.fostac_training_date)}) is given`;

        }

        const prevVal = {}

        const currentVal = enrollRecipient;

        await logAudit(req.user._id, "recipientdetails", verifiedData.recipientInfo._id, prevVal, currentVal, trainingDateAction);

        await logAudit(req.user._id, "recipientdetails", verifiedData.recipientInfo._id, prevVal, currentVal, "Recipient Enrolled");

        // code for tracking ends

        if (enrollRecipient) {
            success = true;
            req.enrollRecipient = {...enrollRecipient, verificationInfo: verifiedData };
            return next();
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

        const genSecData = await generalSectionModel.find({ recipientInfo: recipientId }).populate({ path: 'operatorInfo' });

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

    try {
        let success = false;

        const enrolledDataId = req.params.enrolleddataid;

        const { attendee_status, marks } = req.body;

        const addAttendance = await fostacAttendanceModel.create({ operatorInfo: req.user.id, EnrollmentInfo: enrolledDataId, attendeeStatus: attendee_status, marks: marks })

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

exports.getFostacAttenData = async (req, res) => {
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

exports.ticketDelivery = async (req, res) => {

    try {
        let success = false;

        const certificateFile = req.file;

        const ticket_status = req.body.ticket_status;

        if (!certificateFile && ticket_status === 'delivered') {
            success = false;
            return res.status(401).json({ success, fileErr: true });
        }

        const ticket = await ticketDeliveryModel.findOne({ recipientInfo: req.params.recipientid });

        const verificationData = await fostacVerifyModel.findOne({ recipientInfo: req.params.recipientid });

        if (ticket) {
            res.status(401).json({ success, recpErr: true });
        }

        let addTicket;

        if (ticket_status == 'delivered') {
            addTicket = await ticketDeliveryModel.create({ operatorInfo: req.user._id, recipientInfo: req.params.recipientid, ticketStatus: ticket_status, certificate: certificateFile.filename });
            sendDocumentMail(verificationData.email, 'Fostac_Certificate.pdf', `${certificateFile.destination}/${certificateFile.filename}`);
        } else {
            addTicket = await ticketDeliveryModel.create({ operatorInfo: req.user._id, recipientInfo: req.params.recipientid, ticketStatus: ticket_status });
        }

        if (addTicket) {
            //this code is for audit logging 

            const prevVal = {}
            const currentVal = addTicket;

            await logAudit(req.user._id, "recipientdetails", req.params.recipientid, prevVal, currentVal, `Ticket marked ${ticket_status}`);

            success = true;
            return res.status(200).json({ success, addTicket });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getTicketDeliveryData = async (req, res) => {
    try {
        let success = false;

        const recipientId = req.params.recipientid

        const data = await ticketDeliveryModel.findOne({ recipientInfo: recipientId });

        if (data) {
            success = true;
            res.status(200).json({ success, data });
        } else {
            res.status(204).json({ success });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}