const { recipientModel, shopModel } = require('../../models/fboModels/recipientSchema')
const { fboEbillBucket } = require('../../config/buckets');
const { ObjectId } = require('mongodb');
const { logAudit } = require('../generalControllers/auditLogsControllers');
const generateRecipientInfo = require('../../fbo/generateCredentials');
const fs = require('fs');

exports.addRecipient = async (req, res) => {

    try {

        let success = false;

        const bodyArray = req.body;

        let isValid = false;

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

                const addRecipient = await recipientModel.create({ salesInfo: req.params.id, id_num: idNumber, name: recipient.name, phoneNo: recipient.phoneNo, recipientId: recipientId, aadharNo: recipient.aadharNo });

                // this code is for tracking the the record related action of a recipient

                const prevVal = {},

                   currentVal = addRecipient;

                const log = logAudit(req.user._id, "recipientdetails", addRecipient._id, prevVal, currentVal, "Recipient Registered");

                if (!addRecipient) {
                    success = false;
                    return res.status(404).json({ success, randomErr: true })
                }
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

};

exports.addShop = async (req, res) => {

    try {

        let success = false;
        let billSaved = false;

        const eBill = req.files['eBill'];
        const ownerPhoto = req.files['ownerPhoto'];
        const shopPhoto = req.files['shopPhoto'];

        const { operatorName, address, pincode, village, tehsil } = req.body;

        if (!eBill) {
            success = false;
            return res.status(401).json({ success, ebillErr: true })
        }

        if (!ownerPhoto) {
            success = false;
            return res.status(401).json({ success, ownerPhotoErr: true })
        }

        if (!shopPhoto) {
            success = false;
            return res.status(401).json({ success, shopPhotoErr: true })
        }

        // const eBillName = `${Date.now()}_${eBill.originalname}`;

        // const billBucket = fboEbillBucket();

        // const billUploadStream = billBucket.openUploadStream(eBillName);

        // billUploadStream.write(eBill.buffer);

        // billUploadStream.end((err)=>{
        //     if(err){
        //         success = false;
        //         return res.status(401).json({success, billErr: true})
        //     }
        // })

        // eBillImage: billUploadStream.id

        const addShop = await shopModel.create({ salesInfo: req.params.id, operatorName, address, pincode, village, tehsil, eBillImage: eBill[0].filename, ownerPhoto: ownerPhoto[0].filename, shopPhoto: shopPhoto[0].filename});

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

        const bodyArray = req.body;

        console.log(bodyArray);

        let isValid = false;
    } catch(error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.recipientsList = async (req, res) => {
    try {
        const recipientsList = await recipientModel.find({ salesInfo: req.params.id });
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

exports.showBill = async (req, res) => {
    try {

        const shopID = req.params.id;

        const billBucket = fboEbillBucket();

        const billDownloadStream = billBucket.openDownloadStream(new ObjectId(shopID));

        let chunks = [];

        billDownloadStream.on('data', (chunk) => {
            chunks.push(chunk);
        })

        billDownloadStream.on('end', () => {
            const billBuffer = Buffer.concat(chunks);
            const billPrefix = 'data:image/png;base64,';
            const billBase64 = billBuffer.toString('base64');
            const billConverted = `${billPrefix}${billBase64}`;

            success = true;

            return res.status(200).json({ success, billConverted })
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

