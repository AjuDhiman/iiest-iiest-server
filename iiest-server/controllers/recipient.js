const { recipientModel, shopModel } = require('../models/recipientSchema')
const { fboEbillBucket } = require('../config/db');

exports.addRecipient = async (req, res) => {

try {

    let success = false;

    const { name, phoneNo, aadharNo }  = req.body;

    const existingPhone = await recipientModel.findOne({phoneNo});
    const existingAadhar = await recipientModel.findOne({aadharNo});

    if(existingPhone){
        success = false;
        return res.status(401).json({success, phoneErr: true})
    }

    if(existingAadhar){
        success = false;
        return res.status(401).json({success, aadharErr: true})
    }

    const addRecipient = await recipientModel.create({ fboObjId: req.params.id, name, phoneNo, aadharNo });

    if(addRecipient){
        success = true;
        return res.status(200).json({ success })
    }

    return res.status(404).json({success, randomErr: 'Some error Occured. Please Try Again.'});

} catch (error) {
    console.log(error);
    return res.status(500).json({message: 'Internal Server Error'});
    }

};

exports.addShop = async(req, res)=>{

    try {
        
    let success = false;
    let billSaved = false;

    const eBill = req.file;
    const { operatorName, address } = req.body;

    if(!eBill){
        success = false;
        return res.status(401).json({ success, ebillErr: true })
    }

    const existingAddress = await recipientModel.findOne({ address });

    if(existingAddress){
        success = false;
        return res.status(401).json({ success, addressErr: true })
    }

    const eBillName = `${Date.now()}_${eBill.originalname}`;

    const billBucket = fboEbillBucket();

    const billUploadStream = billBucket.openUploadStream(eBillName);

    billUploadStream.write(eBill.buffer);

    billUploadStream.end((err)=>{
        if(err){
            success = false;
            return res.status(401).json({success, billErr: true})
        }
    })

    billSaved = true;

    if(billSaved){
        const addShop = await shopModel.create({fboObjId: req.params.id, operatorName, address, eBillImage: billUploadStream.id});
        if(addShop){
        success = true
        return res.status(200).json({ success })
        }
    }  

    success = false;
    res.status(404).json({success, randomErr: 'Some error occured. Please try again'});

    } catch (error) {
    console.log(error);
    return res.status(500).json({message: 'Internal Server Error'});
    }
    
};

