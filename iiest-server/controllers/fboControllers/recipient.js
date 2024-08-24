const { recipientModel, shopModel } = require('../../models/fboModels/recipientSchema')
const { fboEbillBucket } = require('../../config/buckets');
const { ObjectId } = require('mongodb');
const { logAudit } = require('../generalControllers/auditLogsControllers');
const { generateRecipientInfo } = require('../../fbo/generateCredentials');
const fs = require('fs');
const salesModel = require('../../models/employeeModels/employeeSalesSchema');

//methord for adding recipient
exports.addRecipient = async (req, res, next) => {

    try {

        let success = false;

        const bodyArray = req.body;

        let isValid = false;

        const recpArr = [];

        for (let recipient of bodyArray) {
            const existingPhone = await recipientModel.findOne({ phoneNo: recipient.phoneNo });
            const existingAadhar = await recipientModel.findOne({ aadharNo: recipient.aadharNo });
            if (existingPhone) {
                return res.status(401).json({ success, phoneErr: true });
            }
            if (existingAadhar) {
                return res.status(401).json({ success, aadharErr: true })
            }

            isValid = true;
        }

        if (isValid) {
            for (let recipient of bodyArray) {

                let { idNumber, recipientId } = await generateRecipientInfo(req.params.id);

                console.log(idNumber, recipientId);

                const addRecipient = await recipientModel.create({ salesInfo: req.params.id, id_num: idNumber, name: recipient.name, phoneNo: recipient.phoneNo, recipientId: recipientId, aadharNo: recipient.aadharNo, fatherName: recipient.fatherName, dob: recipient.dob, email: recipient.email, address: recipient.recp_address });

                // this code is for tracking the the record related action of a recipient

                const prevVal = {},

                    currentVal = addRecipient;

                const log = logAudit(req.user._id, "recipientdetails", addRecipient._id, prevVal, currentVal, "Recipient Registered");

                if (!addRecipient) {
                    success = false;
                    return res.status(404).json({ success, randomErr: true })
                }

                recpArr.push(addRecipient);
            }
            success = true;
        }

        //code for approving sale
        const salesInfo = await salesModel.findOne({ _id: req.params.id });

        const allRecp = await recipientModel.find({ salesInfo: req.params.id });

        if ((allRecp.length == salesInfo.fostacInfo.recipient_no)) {
            await salesModel.findByIdAndUpdate(req.params.id, { checkStatus: 'Approved' }) // we will approve this sale if all docs are uploaded for all shops related to this sale
        }

        if (success) {
            req.recpArr = recpArr;
            next();
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }

};

exports.addShop = async (req, res) => {

    try {

        let success = false;

        // const eBill = req.files['eBill'];
        const ownerPhoto = req.files['ownerPhoto'];
        const shopPhoto = req.files['shopPhoto'];
        const aadharPhoto = req.files['aadharPhoto'];

        const { operatorName, address, pincode, village, tehsil, byExcel } = req.body;

        if (!ownerPhoto) {
            success = false;
            return res.status(401).json({ success, ownerPhotoErr: true })
        }

        if (!shopPhoto) {
            success = false;
            return res.status(401).json({ success, shopPhotoErr: true })
        }

        if (!aadharPhoto) {
            success = false;
            return res.status(401).json({ success, aadharPhotoErr: true })
        }

        const { state, district } = await readPincodeFile(pincode); //extract state and district on the basis of pincode

        console.log(state, district);

        if (state == '' && district == '') {
            res.status(401).json({ success: false, pincodeErr: true, message: 'Pincode Not Found' })
        }

        const aadharSrc = aadharPhoto.map((file) => file.filename);

        const addShop = await shopModel.create({ salesInfo: req.params.id, operatorName, address, state, district, pincode, village, tehsil, ownerPhoto: ownerPhoto[0].filename, shopPhoto: shopPhoto[0].filename, aadharPhoto: aadharSrc, byExcel });

        
        if (addShop) {
            success = true
            return res.status(200).json({ success })
        }

        success = false;
        res.status(404).json({ success, randomErr: true });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }

};

exports.addShopByExcel = async (req, res) => {
    try {
        let success = false;

        const bodyArray = req.body.formInterface;

        let byExcel = req.body.byExcel;

        for (let shop of bodyArray) {

            // let { idNumber, recipientId } = await generateRecipientInfo(req.params.id);

            const { operatorName, address, pincode, village, tehsil } = shop;

            const { state, district } = await readPincodeFile(pincode);

            const addShop = await shopModel.create({ salesInfo: req.params.id, operatorName, address, pincode, state, district, village, tehsil, byExcel });

            // this code is for tracking the the record related action of a recipient

            // const prevVal = {},

            //     currentVal = addShop;

            // const log = logAudit(req.user._id, "shopdetails", addShop._id, prevVal, currentVal, "Shop Registered");

            if (!addShop) {
                success = false;
                return res.status(404).json({ success, randomErr: true })
            }
            success = true;
        }

        if (success) {
            return res.status(200).json({ success })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.recipientsList = async (req, res) => {
    try {
        // const recipientsList = await recipientModel.find({ salesInfo: req.params.id });
        const recipientsList = await recipientModel.aggregate([
             {
                $match: {
                    salesInfo: new ObjectId(req.params.id)
                }
            },
            {
                $lookup: {
                    from: 'documents', // Ensure this matches the actual collection name
                    localField: 'recipientId',
                    foreignField: 'handlerId',
                    as: 'docs'
                }
            }
        ]);
        console.log(recipientsList)
        return res.status(200).json({ recipientsList });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.shopsList = async (req, res) => {
    try {
        const shopsList = await shopModel.find({ salesInfo: req.params.id });
        return res.status(200).json({ shopsList });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

//function for reading pincode file and extracting state and district from that file
async function readPincodeFile(pincode) {
    return new Promise((resolve, reject) => {
        fs.readFile('./assets/pincodes.json', 'utf8', async (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            let pincodeData = JSON.parse(data);
            let state, district;
            let invalidPincode = true;

            for (let i = 0; i < pincodeData.length; i++) {
                if (pincodeData[i].Pincode == pincode) {
                    invalidPincode = false;
                    state = pincodeData[i].State;
                    district = pincodeData[i].District;
                    break; // Exit loop once found
                }
            }

            if (invalidPincode) {
                reject("Invalid pincode");
                return;
            }

            resolve({ state, district });
        });
    });
}
