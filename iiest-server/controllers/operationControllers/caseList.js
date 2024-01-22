const { recipientModel, shopModel } = require('../../models/recipientSchema');
const salesModel = require('../../models/employeeSalesSchema');
const employeeSchema = require('../../models/employeeSchema');

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