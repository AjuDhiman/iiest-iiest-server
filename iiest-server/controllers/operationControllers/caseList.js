const { recipientModel, shopModel } = require('../../models/recipientSchema');
const salesModel = require('../../models/employeeSalesSchema');

exports.caseList = async(req, res)=>{
    try {
      
        const employeePanel = req.user.panel_type;

        let list;

        if(employeePanel === 'Foscos Panel'){

            list = await shopModel.find({});

        }else if(employeePanel === 'Fostac Panel'){

            list = await recipientModel.find({});

        }

        return res.status(200).json({caseList: list})

    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"});
    }
}

exports.caseInfo = async(req, res)=>{
    try {

        let success = false;
        
        const saleId = req.params.id;

        const salesInfo = await salesModel.findById(saleId);
        
        const moreInfo = await salesInfo.populate(['fboInfo', 'employeeInfo'])

        success = true;

        return res.status(200).json({success, moreInfo});

    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"});
    }
}