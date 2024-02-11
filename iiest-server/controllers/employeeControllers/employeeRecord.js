const salesModel = require('../../models/employeeModels/employeeSalesSchema');
const employeeSchema = require('../../models/employeeModels/employeeSchema');

exports.employeeRecord = async (req, res) => {
    try {
        const overAllRecord = await salesModel.find({ employeeInfo: req.user.id });

        let totalSaleAmount = 0;

        if (overAllRecord) {
            overAllRecord.forEach((elem) => {
                totalSaleAmount += Number(elem.grand_total);
            })
        }

        const pendingSales = await salesModel.find({ checkStatus: 'Pending', employeeInfo: req.user.id });

        let pendingSalesAmount = 0;
        if (pendingSales) {
            pendingSales.forEach((elem) => {
                pendingSalesAmount += Number(elem.grand_total);
            })
        }

        const approvedSales = await salesModel.find({ checkStatus: 'Approved', employeeInfo: req.user.id });

        let approvedSalesAmount = 0;

        if (approvedSales) {
            approvedSales.forEach((elem) => {
                approvedSalesAmount += Number(elem.grand_total)
            })
        }

        const pendingSalesCount = await salesModel.countDocuments({ checkStatus: 'Pending', employeeInfo: req.user.id });
        const approvedSalesCount = await salesModel.countDocuments({ checkStatus: 'Approved', employeeInfo: req.user.id });
        const overallSalesCount = await salesModel.countDocuments({ employeeInfo: req.user.id });

        return res.status(200).json({ overAllSales: totalSaleAmount, pendingSales: pendingSalesAmount, approvedSales: approvedSalesAmount, pendingSalesCount, approvedSalesCount, overallSalesCount });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

exports.empSalesProdWise = async (req, res) => {
    try {
        let totalEmpSaleProdWise
        
        if(req.user.designation == 'Director'){

            totalEmpSaleProdWise = await salesModel.find({});

        } else {

            totalEmpSaleProdWise = await salesModel.find({ employeeInfo: req.user.id });

        }

        const salesByDuration = {}

        initializeAll(salesByDuration);

        if (totalEmpSaleProdWise) {
            totalEmpSaleProdWise.forEach((elem) => {
                if (elem.product_name.includes("Fostac")) {
                    if (elem.fostacInfo.fostac_service_name === 'Catering') {
                        filterByDuration(salesByDuration, 1, 'catering', elem.createdAt);
                    } else if (elem.fostacInfo.fostac_service_name === 'Retail') {
                        filterByDuration(salesByDuration, 1, 'retail', elem.createdAt);
                    }
                }
                if (elem.product_name.includes("Foscos")) {
                    if (elem.foscosInfo.foscos_service_name === 'Registration') {
                        filterByDuration(salesByDuration, 1, 'registration', elem.createdAt);
                    } else if (elem.foscosInfo.foscos_service_name === 'State') {
                        filterByDuration(salesByDuration, 1, 'state', elem.createdAt);
                    }
                }
            });
        }

        return res.status(200).json(salesByDuration);
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

exports.employeeSalesData = async (req, res) => {
    try {
        let salesInfo;
        if (req.user.designation === 'Director') {
            salesInfo = await salesModel.find({}).populate('fboInfo').select('-employeeInfo');
        } else {
            salesInfo = await salesModel.find({ employeeInfo: req.user.id }).populate('fboInfo').select('-employeeInfo');
        }
        return res.status(200).json({ salesInfo });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.employeeDepartmentCount = async (req, res) => {

    try {

        let success = false;

        const employeeGroupCount = await employeeSchema.aggregate([
            {
                $match: { status: true } // Filter documents where status is true
            },
            {
                $group: {
                    _id: { department: '$department' },
                    count: { $sum: 1 }
                }
            }
        ])

        if (!employeeGroupCount) {
            success = false;
            return res.status(404).json({ success, randomErr: true });
        }

        success = true;

        return res.status(200).json({ success, employeeGroupCount })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }

}

function filterByDuration(object, data, category, createdAt) {
    let now = new Date();
    let date = new Date(createdAt);

    // Update tillNow
    object.tillNow[category] += data;

    // Update Financial year
    if (date.getTime() >= new Date(now.getFullYear() - 1, 3, 1).getTime() &&
        date.getTime() < new Date(now.getFullYear(), 3, 1).getTime()) {
        object.year[category] += data;
    }

    //update this Quater
    if (date.getTime() >= new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1).getTime() &&
        date.getTime() < new Date(now.getFullYear(), (Math.floor(now.getMonth()) /3 + 1) * 3, 1).getTime()) {
        object.quater[category] += data;
    }

    //update this Half year
    if (date.getTime() >= new Date(now.getFullYear(), Math.floor(now.getMonth() / 6) * 6, 1).getTime() &&
        date.getTime() < new Date(now.getFullYear(), (Math.floor(now.getMonth()/ 6) + 1) * 6, 1).getTime()) {
        object.halfYearly[category] += data;
    }

    // Update month
    if (date.getTime() >= new Date(now.getFullYear(), now.getMonth(), 1).getTime() &&
        date.getTime() < new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime()) {
        object.month[category] += data;
    }

    // Update week
    if (now.getTime() - date.getTime() < now.getDay() * 24 * 60 * 60 * 1000) {
        object.week[category] += data;
    }
}

function initializeAll(object) {
    const durationArr = ['week', 'month', 'quater', 'halfYearly', 'year', 'tillNow'];
    const varriablesArr = ['retail', 'catering', 'registration', 'state'];

    durationArr.forEach(item => {
        object[item] = {};
        varriablesArr.forEach(elem => {
            object[item][elem] = 0;
        });
    });
}

exports.empHiringData = async (req, res) => {

    try {

        let success = false;

        const employeeHiringData = await employeeSchema.aggregate([
            {
                $match: { createdBy: req.user.employee_name } // Filter documents where status is true
            },
            {
                $group: {
                    _id: { department: '$department' },
                    count: { $sum: 1 }
                }
            }
        ])

        if (!employeeHiringData) {
            success = false;
            return res.status(404).json({ success, randomErr: true });
        }

        success = true;

        return res.status(200).json({ success, employeeHiringData })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }

}
