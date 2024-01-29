const fboModel = require("../../models/fboModels/fboSchema");
const { recipientModel } = require("../../models/fboModels/recipientSchema");
const fostacVerifyModel = require("../../models/operationModels/basicFormSchema");

exports.fostacVerification = async(req, res)=>{
    try {

        let success = false;

        const recipientId = req.params.recipientid;

        console.log(recipientId);
        console.log(req.body)
        
        const { recipient_name, fbo_name, owner_name, father_name, dob, address, recipient_contact_no, email, aadhar_no, pancard_no, sales_date, username, password } = req.body;

        const checkAddress = await fostacVerifyModel.findOne({address});

        if(checkAddress){
            success = false;
            return res.status(401).json({success, addressErr: true});
        }

        const checkExistingMail = await fostacVerifyModel.findOne({email});

        if(checkExistingMail){
            success = false;
            return res.status(401).json({success, emailErr: true})
        }

        const checkPancard = await fostacVerifyModel.findOne({pancardNo: pancard_no});

        if(checkPancard){
            success = false;
            return res.status(401).json({success, panErr: true})
        }

        const checkUsername = await fostacVerifyModel.findOne({userName: username})

        if(checkUsername){
            success = false;
            return res.status(401).json({success, userNameErr: true})
        }

        const basicFormAdd = await fostacVerifyModel.create({operatorInfo: req.user.id, recipientInfo: recipientId, email, address, pancardNo: pancard_no, fatherName: father_name, dob, userName: username, password, salesDate: sales_date});

        if(basicFormAdd){
            success = true
            return res.status(200).json({success})
        }

    } catch (error) {
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

exports.getFostacVerifiedData = async(req, res) => {
    try{ 
       let success = false;

       const recipientId = req.params.recipientid;
       
       const verifedData = await fostacVerifyModel.findOne({recipientInfo: recipientId});

       if(verifedData){
        success=true;
        return res.status(200).json({success, message: 'verified recipient', verifedData});
       } else {
        return res.status(204).json({success, message: 'Recipient is not verified'});
       }

    } catch (error) {
        return res.status(500).json({message: 'Internal Server Error'});
    }
}