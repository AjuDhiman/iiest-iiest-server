const fboModel = require('../models/fboSchema');

const employeeRecord = async(req, res)=>{
    try {
        const userData = req.user;

        const overAllRecord = await fboModel.find({createdBy: `${userData.employee_name}(${userData.employee_id})`});
    
        let totalSaleAmount = 0;
    
        if(overAllRecord){
            overAllRecord.forEach((elem)=>{
                totalSaleAmount += elem.grand_total;
            })
        }
        
        const pendingSales = await fboModel.find({checkStatus: 'Pending', createdBy: `${userData.employee_name}(${userData.employee_id})`});
        
        let pendingSalesAmount = 0;
        if(pendingSales){
            pendingSales.forEach((elem)=>{
                pendingSalesAmount += elem.grand_total;
            })
        }
    
        const approvedSales = await fboModel.find({checkStatus: 'Approved', createdBy: `${userData.employee_name}(${userData.employee_id})`});
    
        let approvedSalesAmount = 0;
        
        if(approvedSales){
            approvedSales.forEach((elem)=>{
                approvedSalesAmount += elem.grand_total
            })
        }

        const pendingSalesCount = await fboModel.countDocuments({checkStatus: 'Pending'});
        const approvedSalesCount = await fboModel.countDocuments({checkStatus: 'Approved'});
        const overallSalesCount = await fboModel.countDocuments();

        return res.status(200).json({overAllSales: totalSaleAmount, pendingSales: pendingSalesAmount, approvedSales: approvedSalesAmount, pendingSalesCount, approvedSalesCount, overallSalesCount});
    } catch (error) {
        console.error(error)
    }
}

module.exports = { employeeRecord }
