const { recipientModel, shopModel } = require('../../models/recipientSchema');
const employeeSchema = require('../../models/employeeSchema');

exports.caseList = async(req, res)=>{
    try {
      
        const employeePanel = req.user.panel_type;

        let list;

        if(employeePanel === 'Foscos Panel'){

            list = await shopModel.find({}).populate({ path: 'salesInfo', populate: [{ path: 'employeeInfo' }, {path: 'fboInfo'}]});

        }else if(employeePanel === 'Fostac Panel'){

            list = await recipientModel.find({}).populate({ path: 'salesInfo', populate: [{ path: 'employeeInfo' }, {path: 'fboInfo'}]});

        }

        return res.status(200).json({caseList: list})

    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"});
    }
}

exports.caseInfo = async(req, res)=>{
    try {

        let success = false;
        
        const recipientId = req.params.recipientid

        let recipientInfo;

        if(req.user.panel_type === 'Fostac Panel'){
          recipientInfo  = await recipientModel.findById(recipientId);
        }else if(req.user.panel_type === 'Foscos Panel'){
          recipientInfo = await shopModel.findById(recipientId);
        }

        const moreInfo = await (await recipientInfo.populate('salesInfo')).populate(['salesInfo.employeeInfo', 'salesInfo.fboInfo']);

        success = true;

        return res.status(200).json({success, populatedInfo: moreInfo});

    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"});
    }
}

 exports.employeeCountDeptWise = async(req, res)=>{
    try {

        let success = true;
        
        const departmentName = req.params.dept;

        const employeeList = await employeeSchema.find({department: departmentName});

        if(!employeeList){
            success = false;
            return res.status(404).json({success, randomErr: true});
        }

        return res.status(200).json({success, employeeList});

    } catch (error) {
        return res.status(500).json({message: "Internal Server Error"});
    }
 }