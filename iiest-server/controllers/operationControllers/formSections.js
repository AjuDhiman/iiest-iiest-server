const fboModel = require("../../models/fboModels/fboSchema");
const { recipientModel, shopModel } = require("../../models/fboModels/recipientSchema");
const fostacAttendanceModel = require("../../models/operationModels/attenSecSchema");
const { fostacVerifyModel, foscosVerifyModel, hraVerifyModel } = require("../../models/operationModels/verificationSchema");
const fostacEnrollmentModel = require("../../models/operationModels/enrollmentSchema");
const generalSectionModel = require("../../models/operationModels/generalSectionSchema");
const ticketDeliveryModel = require("../../models/operationModels/ticketDeliverySchema");
const { logAudit } = require("../generalControllers/auditLogsControllers");
const { sendDocumentMail, sendVerificationMail } = require("../../operations/sendMail");
const { generateFsms, generateSelfDecOProp } = require("../../operations/generateDocuments");
const TrainingBatchModel = require("../../models/trainingModels/trainingBatchModel");
const revertModel = require("../../models/operationModels/revertSchema");
const foscosFilingModel = require("../../models/operationModels/filingSecSchema");

exports.fostacVerification = async (req, res, next) => {
    try {

        let success = false;
        const recpArr = req.recpArr;// we will verify all the recps by looping them

        console.log(recpArr);

        const verifiedRecpArr = [];

        for (let index = 0; index < recpArr.length; index++) {
            const recipientId = recpArr[index]._id;

            let clientdata = {
                product: 'fostac',
                recipientName: recpArr[index].name,
                fboName: recpArr[index].name,
                ownerName: recpArr[index].name,
                fatherName: recpArr[index].fatherName,
                dob: recpArr[index].dob,
                address: recpArr[index].address,
                recipientContactNo: recpArr[index].phoneNo,
                recipientEmail: recpArr[index].email,
                aadharNo: recpArr[index].aadharNo,
            }

            const basicFormAdd = await fostacVerifyModel.create({ operatorInfo: req.user.id, recipientInfo: recipientId });

            const prevVal = {}

            const currentVal = basicFormAdd;

            logAudit(req.user._id, "recipientdetails", recipientId, prevVal, currentVal, "Recipient verified");

            // function to send mail to client after verification process
            if (basicFormAdd !== undefined) {
                sendVerificationMail(clientdata);
            }

            verifiedRecpArr.push(basicFormAdd);
        }

        //this code is for tracking the CRUD operation regarding to a recipient

        // code for tracking ends
        if (verifiedRecpArr.length !== 0) {
            success = true
            // req.verificationInfo = basicFormAdd;
             req.verifiedRecpArr = verifiedRecpArr;
            // return res.status(200).json({ success: true })
            next();
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

        const { operator_name, fbo_name, owner_name, operator_contact_no, email, address, pincode, village, tehsil, kob, food_category, ownership_type, owners_num, license_category, license_duration, foscos_total, sales_date, sales_person } = verifiedData;

        let clientData = {
            product: 'foscos',
            operatorName: operator_name,
            fboName: fbo_name,
            ownerName: owner_name,
            recipientEmail: email,
            operatorContactNo: operator_contact_no,
            address: address,
            pincode: pincode,
            village: village,
            tehsil: tehsil,
            licenseCategory: license_category,
            licenseDuration: license_duration,
            kindOfBusiness: kob,
            foodCategory: food_category,
        }

        const addVerification = await foscosVerifyModel.create({ operatorInfo: req.user._id, shopInfo: shopID, kob: kob, foodCategory: food_category, ownershipType: ownership_type, OwnersNum: owners_num });

        //this code is for tracking the CRUD operation regarding to a shop

        const prevVal = {}

        const currentVal = addVerification;

        logAudit(req.user._id, "shopDetails", shopID, prevVal, currentVal, "Shop verified");

        // function to send mail to client after verification process
        if (addVerification) {
            sendVerificationMail(clientData);
        }

        // code for tracking ends
        if (!addVerification) {
            success = false;
            return res.status(204).json({ success });
        }

        success = true;
        return res.status(200).json({ success });

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.hraVerification = async (req, res, next) => {
    try {
        let success = false;

        const shopID = req.params.shopid;

        const verifiedData = req.body;

        const { fbo_name, manager_name, owner_name, manager_contact_no, email, address, pincode, state, district, village, food_handler_no, tehsil, kob, hra_total, sales_date, sales_person } = verifiedData;

        const addVerification = await hraVerifyModel.create({ operatorInfo: req.user._id, shopInfo: shopID, kob: kob, foodHandlersCount: food_handler_no });

        //this code is for tracking the CRUD operation regarding to a shop

        const prevVal = {}

        const currentVal = addVerification;

        logAudit(req.user._id, "shopDetails", shopID, prevVal, currentVal, "Shop verified");

        let clientData = {
            product: 'hra',
            managerName: manager_name,
            fboName: fbo_name,
            ownerName: owner_name,
            recipientEmail: email,
            managerContactNo: manager_contact_no,
            address: address,
            foodHandlerNo: food_handler_no,
            pincode: pincode,
            village: village,
            tehsil: tehsil,
            kindOfBusiness: kob
        }

        // if (addVerification) {
        //     sendVerificationMail(clientData);
        // }

        // code for tracking ends
        if (!addVerification) {
            success = false;
            return res.status(204).json({ success });
        }

        req.verificationInfo = addVerification;
        req.clientData = clientData;
        next();

        // success = true;
        // return res.status(200).json({ success });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getFostacVerifiedData = async (req, res) => {
    try {
        let success = false;

        const recipientId = req.params.recipientid;

        const verifedData = await fostacVerifyModel.findOne({ recipientInfo: recipientId });

        if (!verifedData) {
            return res.status(204).json({ success: false, message: 'Not Verified yet' })
        }

        const batchData = await TrainingBatchModel.findOne({
            candidateDetails: {
                $in: verifedData._id,
            }
        });

        if (verifedData) {
            success = true;
            return res.status(200).json({ success, message: 'verified recipient', verifedData, batchData });
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
            return res.status(200).json({ success, message: 'Verified Shop', verifedData });
        } else {
            return res.status(204).json({ success, message: 'Shop is not verified' });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getHraVerifiedData = async (req, res) => {
    try {
        let success = false;

        const shopId = req.params.shopid;

        const verifedData = await hraVerifyModel.findOne({ shopInfo: shopId }).populate('shopInfo');

        if (verifedData) {
            success = true;
            return res.status(200).json({ success, message: 'Verified Shop', verifedData });
        } else {
            return res.status(204).json({ success, message: 'Shop is not verified' });
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

        const { tentative_training_date, fostac_training_date, username, password, roll_no, trainer, venue, email } = req.body;


        const checkRollNo = await fostacEnrollmentModel.findOne({ roll_no });

        if (checkRollNo) {
            success = false;
            return res.status(401).json({ success, rollNoErr: true });
        }

        const enrollRecipient = await fostacEnrollmentModel.create({ operatorInfo: req.user.id, verificationInfo: verifiedDataId, fostac_training_date: [fostac_training_date], tentative_training_date, roll_no, username, password, venue, trainer });

        const verifiedData = await fostacVerifyModel.findOne({ _id: verifiedDataId })
            .populate({
                path: 'recipientInfo',
            });

        let clientdata = {
            product: 'fostac_enrollment',
            recipientName: verifiedData.recipientInfo.name,
            fostacTrainingDate: fostac_training_date,
            venue: venue,
            recipientEmail: email,
            enrollmentNumber: roll_no
        }

        //this code is for tracking the flow of data regarding to a recipient

        const prevVal = {}

        const currentVal = enrollRecipient;

        await logAudit(req.user._id, "recipientdetails", verifiedData.recipientInfo._id, prevVal, currentVal, "Recipient Enrolled");

        if (currentVal !== undefined) {
            sendVerificationMail(clientdata);
        }

        // code for tracking ends

        if (enrollRecipient) {
            success = true;
            // sendEnrollmentMail(clientData);
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

exports.foscosFiling = async (req, res) => {
    try {
        let success = false;

        const verifiedDataId = req.params.verifieddataid;

        const receipt = req.files.payment_receipt;

        const { username, password, payment_amount, payment_date } = req.body;

        const filing = await foscosFilingModel.create({ operatorInfo: req.user.id, verificationInfo: verifiedDataId, paymentAmount: payment_amount, paymentDate: payment_date, paymentReceipt: receipt[0].filename, username, password });

        const verifiedData = await foscosVerifyModel.findOne({ _id: verifiedDataId })
            .populate({
                path: 'shopInfo',
            });

        //this code is for tracking the flow of data regarding to a recipient

        const prevVal = {}

        const currentVal = filing;

        await logAudit(req.user._id, "shopdetails", verifiedData.shopInfo._id, prevVal, currentVal, "Filing Completed");

        // code for tracking ends

        if (filing) {
            success = true;
            return res.status(200).json({ success, message: 'Filing Completed', filedId: filing._id });
        }

        return res.status(401).json({ success, message: 'Error' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.getFoscosFiledData = async (req, res) => {
    try {
        let success = false;

        const verifiedDataId = req.params.verifieddataid;

        const filedData = await foscosFilingModel.findOne({ verificationInfo: verifiedDataId });

        if (filedData) {
            success = true;
            return res.status(200).json({ success, message: 'Filed', filedData });
        } else {
            return res.status(204).json({ success, message: 'Not Filed' });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.postGenOperData = async (req, res) => {

    try {

        const recipientId = req.params.recipientid;

        let success = false;

        const { officer_note } = req.body;

        const operGenSecAdd = await generalSectionModel.create({ operatorInfo: req.user._id, recipientInfo: recipientId, officerNote: officer_note });

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

exports.fssaiRevert = async (req, res) => {

    try {

        const id = req.params.id;

        let success = false;

        const { fssai_revert } = req.body;

        const revert = await revertModel.create({ operatorInfo: req.user._id, shopInfo: id, fssaiRevert: fssai_revert });

        const prevVal = {}

        const currentVal = revert;

        await logAudit(req.user._id, "shopdetails", id, prevVal, currentVal, "FSSAI Revert Updated");

        if (revert) {
            success = true
            return res.status(200).json({ success })
        }

    } catch (error) {
        console.log(error);
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

        const enrolledData = await fostacEnrollmentModel.findOne({ _id: enrolledDataId }).populate({ path: 'verificationInfo', populate: { path: 'recipientInfo' } });

        console.log(enrolledData);

        // const verifiedData = await fostacVerifyModel.findOne({ _id: enrolledData.verificationInfo });

        const verifiedData = enrolledData.verificationInfo

        const prevVal = {}

        const currentVal = addAttendance;

        await logAudit(req.user._id, "recipientdetails", verifiedData.recipientInfo._id, prevVal, currentVal, `Attendance Marked ${attendee_status}`);

        // code for tracking ends

        let clientData = {
            product: 'fostac_attendance',
            recipientEmail: verifiedData.email,
            fostacTrainingDate: enrolledData.fostac_training_date,
            venue: enrolledData.venue,
            recipientName: verifiedData.recipientInfo.name,
            attendee_status: attendee_status,
            marks: marks
        }

        if (addAttendance) {
            success = true;
            sendVerificationMail(clientData)
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

        console.log(certificateFile);

        const { ticket_status, issue_date, ticketType } = req.body;

        console.log(req.body)

        if (!certificateFile && ticket_status === 'delivered') {
            success = false;
            return res.status(401).json({ success, fileErr: true });
        }

        const ticket = await ticketDeliveryModel.findOne({ recipientInfo: req.params.recipientid });

        const verificationData = await fostacVerifyModel.findOne({ recipientInfo: req.params.recipientid }).populate({ path: 'recipientInfo' });

        if (ticket) {
            res.status(401).json({ success, recpErr: true });
        }

        let addTicket;

        if (ticket_status == 'delivered') {
            addTicket = await ticketDeliveryModel.create({ operatorInfo: req.user._id, recipientInfo: req.params.recipientid, ticketStatus: ticket_status, certificate: certificateFile.filename, issueDate: issue_date, ticketType: ticketType });
            clientData = {
                ticketType: ticketType,
                clientMail: verificationData.email,
                recipientName: verificationData.recipientInfo.name,
                filePath: `${certificateFile.destination}/${certificateFile.filename}`
            }
            sendDocumentMail(clientData);
        } else {
            addTicket = await ticketDeliveryModel.create({ operatorInfo: req.user._id, recipientInfo: req.params.recipientid, ticketStatus: ticket_status, ticketType: ticketType });
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
        console.log(error);
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

exports.getReverts = async (req, res) => {
    try {

        let success = false;

        const id = req.params.id;

        const reverts = await revertModel.find({ shopInfo: id }).populate({ path: 'operatorInfo' });

        if (reverts) {
            success = true;
            return res.status(200).json({ success, reverts });
        } else {
            return res.status(204);
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" })
    }
}