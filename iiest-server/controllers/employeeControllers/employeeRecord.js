const salesModel = require('../../models/employeeModels/employeeSalesSchema');
const employeeSchema = require('../../models/employeeModels/employeeSchema');
const reportingManagerModel = require('../../models/employeeModels/reportingManagerSchema');

exports.employeeRecord = async (req, res) => {
    try {

        let overAllRecord

        if (req.user.designation == 'Director') {
            overAllRecord = await salesModel.find({});
        } else {
            overAllRecord = await salesModel.find({ employeeInfo: req.user.id });
        }

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

        if (req.user.designation == 'Director') {

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
            salesInfo = await salesModel.find({}).populate([{ path: 'fboInfo' }, { path: 'employeeInfo' }]);
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
                $group: {
                    _id: {
                        department: '$department'
                    },
                    count: {
                        $sum: { $cond: { if: { $eq: ["$status", true] }, then: 1, else: 0 } }
                    }
                }
            }
        ]);

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
        date.getTime() < new Date(now.getFullYear(), (Math.floor(now.getMonth()) / 3 + 1) * 3, 1).getTime()) {
        object.quater[category] += data;
    }

    //update this Half year
    if (date.getTime() >= new Date(now.getFullYear(), Math.floor(now.getMonth() / 6) * 6, 1).getTime() &&
        date.getTime() < new Date(now.getFullYear(), (Math.floor(now.getMonth() / 6) + 1) * 6, 1).getTime()) {
        object.halfYearly[category] += data;
    }

    // Update month
    if (date.getTime() >= new Date(now.getFullYear(), now.getMonth(), 1).getTime() &&
        date.getTime() < new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime()) {
        object.month[category] += data;
    }

    // Update week
    if (Math.floor((now.getTime() - date.getTime()) / 24 * 60 * 60 * 1000) < 7) {
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
                    _id: '$department',
                    // name: "$_id.department",
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    name: "$_id",
                    value: "$count"
                }
            }
        ])

        if (!employeeHiringData) {
            success = false;
            return res.status(404).json({ success, randomErr: true });
        }

        success = true;

        return res.status(200).json( employeeHiringData );

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }

}

exports.getEmployeeUnderManager = async (req, res) => {
    try {

        let success = false;

        const employees = await reportingManagerModel.find({ reportingManager: req.user._id }).select('-reportingManager').populate({ path: 'employeeInfo' });

        const empArr = employees.map(emp => emp.employeeInfo);

        if (!employees) {
            success = false;
            return res.status(404).json({ success, randomErr: true });
        }

        success = true;

        return res.status(200).json({ success, empArr })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

//api for product sales highchart
exports.getProductSaleData = async (req, res) => {
    try {

        let productSaleData;

        if (req.user.designation === 'Director') {

            productSaleData = await salesModel.aggregate([
                {
                    $project: {
                        name: { $cond: [{ $ifNull: ["$fostacInfo", false] }, "Fostac", "Foscos"] },
                        service_name: { $ifNull: ["$fostacInfo.fostac_service_name", "$foscosInfo.foscos_service_name"] }
                    }
                },
                {
                    $group: {
                        _id: { name: "$name", category: "$service_name" },
                        value: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        value: { $sum: "$value" },
                        categories: {
                            $push: {
                                name: "$_id.category",
                                value: "$value"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        name: "$_id",
                        value: 1,
                        categories: 1
                    }
                }
            ]);

        } else {
            productSaleData = await salesModel.aggregate([
                {
                    $match: { "employeeInfo": req.user._id } // Filter based on the employeeInfo property
                },
                {
                    $project: {
                        name: { $cond: [{ $ifNull: ["$fostacInfo", false] }, "Fostac", "Foscos"] },
                        service_name: { $ifNull: ["$fostacInfo.fostac_service_name", "$foscosInfo.foscos_service_name"] }
                    }
                },
                {
                    $group: {
                        _id: { name: "$name", category: "$service_name" },
                        value: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        value: { $sum: "$value" },
                        categories: {
                            $push: {
                                name: "$_id.category",
                                value: "$value"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        name: "$_id",
                        value: 1,
                        categories: 1
                    }
                }
            ]);
        }
        res.status(200).json(productSaleData);

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

//api for sare wise sales high cahrts
exports.getAreaWiseSalesData = async (req, res) => {
    try {

        let salesAreaWiseData
        if(req.user.disegnation === 'Director'){
            salesAreaWiseData = await salesModel.aggregate([
                {
                    $lookup: {
                        from: "fbo_registers",
                        localField: "fboInfo",
                        foreignField: "_id",
                        as: "fboInfo"
                    }
                },
                {
                    $group: {
                        _id: { state: "$fboInfo.state", district: "$fboInfo.district" },
                        stateCount: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: "$_id.state",
                        stateCount: { $sum: "$stateCount" },
                        districts: {
                            $push: {
                                name: { $arrayElemAt: ["$_id.district", 0] },
                                value: "$stateCount"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        name: { $arrayElemAt: ["$_id", 0] },
                        value: "$stateCount",
                        categories: "$districts"
                    }
                }
            ]);
        } else {
            salesAreaWiseData = await salesModel.aggregate([
                {
                    $match: {
                        "employeeInfo": req.user._id
                    }
                },
                {
                    $lookup: {
                        from: "fbo_registers",
                        localField: "fboInfo",
                        foreignField: "_id",
                        as: "fboInfo"
                    }
                },
                {
                    $group: {
                        _id: { state: "$fboInfo.state", district: "$fboInfo.district" },
                        stateCount: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: "$_id.state",
                        stateCount: { $sum: "$stateCount" },
                        districts: {
                            $push: {
                                name: { $arrayElemAt: ["$_id.district", 0] },
                                value: "$stateCount"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        name: { $arrayElemAt: ["$_id", 0] },
                        value: "$stateCount",
                        categories: "$districts"
                    }
                }
            ]);
        }

        res.status(200).json(salesAreaWiseData);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

//api for sales by employee highcharts
exports.getPersonWiseSalesData = async (req, res) => {
    try {

        let salesPersonWiseData
        if(req.user.designation == 'Director'){
            salesPersonWiseData = await salesModel.aggregate([
                {
                    $lookup: {
                        from: "staff_registers",
                        localField: "employeeInfo",
                        foreignField: "_id",
                        as: "employeeInfo"
                    }
                },
                {
                    $unwind: "$employeeInfo"
                },
                {
                    $group: {
                        _id: { person: "$employeeInfo.employee_name" },
                        personCount: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        name: "$_id.person",
                        value: "$personCount",
                    }
                }
            ]);
        } else {
            salesPersonWiseData = await salesModel.aggregate([
                {
                    $match: {
                        "employeeInfo": req.user._id
                    }
                },
                {
                    $lookup: {
                        from: "staff_registers",
                        localField: "employeeInfo",
                        foreignField: "_id",
                        as: "employeeInfo"
                    }
                },
                {
                    $unwind: "$employeeInfo"
                },
                {
                    $group: {
                        _id: { person: "$employeeInfo.employee_name" },
                        personCount: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        name: "$_id.person",
                        value: "$personCount",
                    }
                }
            ]);
        }

        res.status(200).json(salesPersonWiseData);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

//api for clent type highchart
exports.getClientTypeSalesData = async (req, res) => {
    try {

        let clientTypeSalesdata
        if(req.user.designation === 'Director') {
            clientTypeSalesdata = await salesModel.aggregate([
                {
                    $project: {
                        client_types: {
                            $mergeObjects: [
                                { $cond: { if: { $ifNull: ["$fostacInfo", false] }, then: { fostac_client_type: "$fostacInfo.fostac_client_type" }, else: {} } },
                                { $cond: { if: { $ifNull: ["$foscosInfo", false] }, then: { foscos_client_type: "$foscosInfo.foscos_client_type" }, else: {} } }
                            ]
                        }
                    }
                },
                {
                    $project: {
                        client_types: { $objectToArray: "$client_types" }
                    }
                },
                {
                    $unwind: "$client_types"
                },
                {
                    $group: {
                        _id: "$client_types.v",
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        name: "$_id",
                        value: "$count"
                    }
                }
            ]);    
        } else {
            clientTypeSalesdata = await salesModel.aggregate([
                {
                    $match: {
                        "employeeInfo" : req.user._id
                    }
                },
                {
                    $project: {
                        client_types: {
                            $mergeObjects: [
                                { $cond: { if: { $ifNull: ["$fostacInfo", false] }, then: { fostac_client_type: "$fostacInfo.fostac_client_type" }, else: {} } },
                                { $cond: { if: { $ifNull: ["$foscosInfo", false] }, then: { foscos_client_type: "$foscosInfo.foscos_client_type" }, else: {} } }
                            ]
                        }
                    }
                },
                {
                    $project: {
                        client_types: { $objectToArray: "$client_types" }
                    }
                },
                {
                    $unwind: "$client_types"
                },
                {
                    $group: {
                        _id: "$client_types.v",
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        name: "$_id",
                        value: "$count"
                    }
                }
            ]);    
        }
        
        res.status(200).json(clientTypeSalesdata);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}