const { recipientModel, shopModel, hygieneShopModel } = require('../../models/fboModels/recipientSchema')
const { fboEbillBucket } = require('../../config/buckets');
const { ObjectId } = require('mongodb');
const { logAudit } = require('../generalControllers/auditLogsControllers');
const { generateRecipientInfo, generateHygieneShopInfo } = require('../../fbo/generateCredentials');
const fs = require('fs');
const salesModel = require('../../models/employeeModels/employeeSalesSchema');

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

                // //code for approving sale after recipient's basic details are added

                // const approvedSale = await salesModel.findOneAndUpdate({_id: req.params.id}, {checkStatus: 'Approved'});

                // if(!approvedSale){
                //     res.status(401).json({ approvedSaleErr: true })
                // }

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

        const salesInfo = await salesModel.findOne({_id: req.params.id});

        const allRecp = await recipientModel.find({salesInfo: req.params.id});

        if(allRecp.length == salesInfo.fostacInfo.recipient_no) {
            await salesModel.findByIdAndUpdate(req.params.id, {checkStatus: 'Approved'}) // we will approve this sale if all docs are uploaded for all shops related to this sale
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

        const eBill = req.files['eBill'];
        const ownerPhoto = req.files['ownerPhoto'];
        const shopPhoto = req.files['shopPhoto'];
        const aadharPhoto = req.files['aadharPhoto'];

        const { operatorName, address, pincode, village, tehsil, byExcel } = req.body;

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
       
        if (!aadharPhoto) {
            success = false;
            return res.status(401).json({ success, aadharPhotoErr: true })
        }

        const {state, district} = await readPincodeFile(pincode); //extract state and district on the basis of pincode

        console.log(state, district);

        if(state == '' && district == ''){
           res.status(401).json({success: false, pincodeErr: true, message:'Pincode Not Found'}) 
        }

        const aadharSrc = aadharPhoto.map((file) => file.filename); 

        const addShop = await shopModel.create({ salesInfo: req.params.id, operatorName, address, state, district, pincode, village, tehsil, eBillImage: eBill[0].filename, ownerPhoto: ownerPhoto[0].filename, shopPhoto: shopPhoto[0].filename, aadharPhoto: aadharSrc, byExcel });


        const salesInfo = await salesModel.findOne({_id: req.params.id});

        const allShop = await shopModel.find({salesInfo: req.params.id});

        let allDocUploaded = false;

        allShop.forEach(shop => {
            if(shop.eBillImage != undefined && shop.eBillImage != ''
             && shop.shopPhoto != undefined && shop.shopPhoto != '' 
             && shop.ownerPhoto != undefined && shop.ownerPhoto != ''
             && shop.aadharPhoto != undefined && shop.shopPhoto.length != 0) {
                allDocUploaded = true
            }
        });

        if((allShop.length == salesInfo.foscosInfo.shops_no) && allDocUploaded) {
            await salesModel.findByIdAndUpdate(req.params.id, {checkStatus: 'Approved'}) // we will approve this sale if all docs are uploaded for all shops related to this sale
        }

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

exports.addHygieneShop = async (req, res) => {

    try {

        let success = false;

        const fostacCertificate = req.files['fostacCertificate'];
        const foscosLicense = req.files['foscosLicense'];

        const { manager_name, manager_contact, manager_email, kob, food_handlers, address, pincode, byExcel } = req.body;

        if (!fostacCertificate) {
            success = false;
            return res.status(401).json({ success, fostacCertificateErr: true })
        }

        if (!foscosLicense) {
            success = false;
            return res.status(401).json({ success, foscosLicenseErr: true })
        }

        const {state, district} = await readPincodeFile(pincode); //extract state and district on the basis of pincode

        console.log(state, district);

        if(state == '' && district == ''){
           res.status(401).json({success: false, pincodeErr: true, message:'Pincode Not Found'}) 
        }

        const shopCustInfo = await generateHygieneShopInfo(req.params.id);

        const addShop = await hygieneShopModel.create({ salesInfo: req.params.id, shopId: shopCustInfo.shopId, managerName: manager_name,managerContact: manager_contact, managerEmail: manager_email, kob, foodHandlersCount: food_handlers, address, state, district, pincode, fostacCertificate: fostacCertificate[0].filename, foscosLicense: foscosLicense[0].filename });

        const salesInfo = await salesModel.findOne({_id: req.params.id});

        const allShop = await hygieneShopModel.find({salesInfo: req.params.id});

        let allDocUploaded = false;

        allShop.forEach(shop => {
            if(shop.fostacCertificate != undefined && shop.fostacCertificate != ''
             && shop.foscosLicense != undefined && shop.foscosLicense != '' ) {
                allDocUploaded = true;
            }
        });

        if((allShop.length == salesInfo.hraInfo.shops_no) && allDocUploaded) {
            await salesModel.findByIdAndUpdate(req.params.id, {checkStatus: 'Approved'}) // we will approve this sale if all docs are uploaded for all shops related to this sale
        }

        if (addShop) {
            success = true;
            return res.status(200).json({ success });
        }

        //code for tracking data operation data flow by auditing log starts 
        const prevVal = {};

        const currentVal = addShop;

        const log = logAudit(req.user._id, "hygienes", addShop._id, prevVal, currentVal, "Shop Registered");
        //code for tracking data operation data flow by auditing log ends

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

exports.hygieneShopsList = async (req, res) => {
    try {
        const shopsList = await hygieneShopModel.find({ salesInfo: req.params.id });
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

exports.uploadEbill = async (req, res) => {
    try {
        let success = false;

        const eBill = req.files['eBill'];

        const billUploaded = await shopModel.updateOne({ _id: req.params.id }, { $set: { eBillImage: eBill[0].filename } });

        if (!billUploaded) {
            success = false;
            return res.status(404).json({ success, randomErr: true });
        }

        const shopInfo = await shopModel.findOne({_id: req.params.id}) 

        const salesInfo = await salesModel.findOne({_id: shopInfo._id});

        const allShop = await shopModel.find({salesInfo: shopInfo._id});

        let allDocUploaded = false;

        allShop.forEach(shop => {
            if(shop.eBillImage != undefined && shop.eBillImage != ''
             && shop.shopPhoto != undefined && shop.shopPhoto != '' 
             && shop.ownerPhoto != undefined && shop.ownerPhoto != ''
             && shop.aadharPhoto != undefined && shop.shopPhoto.length != 0) {
                allDocUploaded = true
            }
        })

        if(allShop.length == (salesInfo.foscosInfo.shops_no - 1) && allDocUploaded) {
            await salesModel.findByIdAndUpdate(shopInfo._id, {checkStatus: 'Approved'}) // we will approve this sale if all docs are uploaded for all shops related to this sale
        }

        success = true;
        res.status(200).json({ success, billUploaded });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.uploadOwnerPhoto = async (req, res) => {
    try {
        let success = false;

        const ownerPhoto = req.files['ownerPhoto'];

        const photoUploaded = await shopModel.updateOne({ _id: req.params.id }, { $set: { ownerPhoto: ownerPhoto[0].filename } });

        if (!photoUploaded) {
            success = false;
            res.status(404).json({ success, randomErr: true });
        }

        const shopInfo = await shopModel.findOne({_id: req.params.id}) 

        const salesInfo = await salesModel.findOne({_id: shopInfo._id});

        const allShop = await shopModel.find({salesInfo: shopInfo._id});

        let allDocUploaded = false;

        allShop.forEach(shop => {
            if(shop.eBillImage != undefined && shop.eBillImage != ''
             && shop.shopPhoto != undefined && shop.shopPhoto != '' 
             && shop.ownerPhoto != undefined && shop.ownerPhoto != ''
             && shop.aadharPhoto != undefined && shop.shopPhoto.length != 0) {
                allDocUploaded = true
            }
        })

        if(allShop.length == (salesInfo.foscosInfo.shops_no - 1) && allDocUploaded) {
            await salesModel.findByIdAndUpdate(shopInfo._id, {checkStatus: 'Approved'}) // we will approve this sale if all docs are uploaded for all shops related to this sale
        }

        success = true;
        res.status(200).json({ success, photoUploaded });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.uploadShopPhoto = async (req, res) => {
    try {
        let success = false;

        const shopPhoto = req.files['shopPhoto'];

        const photoUploaded = await shopModel.updateOne({ _id: req.params.id }, { $set: { shopPhoto: shopPhoto[0].filename } });

        if (!photoUploaded) {
            success = false;
            res.status(404).json({ success, randomErr: true });
        }

        const shopInfo = await shopModel.findOne({_id: req.params.id}) 

        const salesInfo = await salesModel.findOne({_id: shopInfo._id});

        const allShop = await shopModel.find({salesInfo: shopInfo._id});

        let allDocUploaded = false;

        allShop.forEach(shop => {
            if(shop.eBillImage != undefined && shop.eBillImage != ''
             && shop.shopPhoto != undefined && shop.shopPhoto != '' 
             && shop.ownerPhoto != undefined && shop.ownerPhoto != ''
             && shop.aadharPhoto != undefined && shop.shopPhoto.length != 0) {
                allDocUploaded = true
            }
        })

        if(allShop.length == (salesInfo.foscosInfo.shops_no - 1) && allDocUploaded) {
            await salesModel.findByIdAndUpdate(shopInfo._id, {checkStatus: 'Approved'}) // we will approve this sale if all docs are uploaded for all shops related to this sale
        }

        success = true;
        res.status(200).json({ success, photoUploaded });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.uploadAadharPhoto = async (req, res) => {
    try {
        let success = false;

        const aadharPhoto = req.files['aadharPhoto'];

        const aadhar = aadharPhoto.map(file => file.filename)

        const photoUploaded = await shopModel.updateOne({ _id: req.params.id }, { $set: { aadharPhoto: aadhar } });

        if (!photoUploaded) {
            success = false;
            res.status(404).json({ success, randomErr: true });
        }

        const shopInfo = await shopModel.findOne({_id: req.params.id}) 

        const salesInfo = await salesModel.findOne({_id: shopInfo._id});

        const allShop = await shopModel.find({salesInfo: shopInfo._id});

        let allDocUploaded = false;

        allShop.forEach(shop => {
            if(shop.eBillImage != undefined && shop.eBillImage != ''
             && shop.shopPhoto != undefined && shop.shopPhoto != '' 
             && shop.ownerPhoto != undefined && shop.ownerPhoto != ''
             && shop.aadharPhoto != undefined && shop.shopPhoto.length != 0) {
                allDocUploaded = true
            }
        })

        if(allShop.length == (salesInfo.foscosInfo.shops_no - 1) && allDocUploaded) {
            await salesModel.findByIdAndUpdate(shopInfo._id, {checkStatus: 'Approved'}) // we will approve this sale if all docs are uploaded for all shops related to this sale
        }

        success = true;
        res.status(200).json({ success, photoUploaded });
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
