const { recipientModel, shopModel } = require('../../models/recipientSchema');

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