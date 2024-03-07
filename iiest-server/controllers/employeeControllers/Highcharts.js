const salesModel = require("../../models/employeeModels/employeeSalesSchema");

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
                        _id: { name: "$name", category: "$service_name", date: "$createdAt" },
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
                                value: "$value",
                                // modalData: {
                                //     headers: ['Sale Date'],
                                //     values: ['$name']
                                // }
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
                }, 
                {
                    $sort: {"name": 1}
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
                },
                {
                    $sort: { "name": 1 }
                }
            ]);
        }
        res.status(200).json(productSaleData);

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

//api for sare wise sales highcharts
exports.getAreaWiseSalesData = async (req, res) => {
    try {

        let salesAreaWiseData
        if (req.user.designation === 'Director') {
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
                },
                {
                    $sort: { "name" : 1 }
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
                },
                {
                    $sort:{"name": 1}
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
        if (req.user.designation == 'Director') {
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
                }, 
                {
                    $sort: {"name": 1 }
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
                }, 
                {
                    $sort: {"name": 1}
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
        if (req.user.designation === 'Director') {
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
                },
                {
                    $sort: { "_id": 1 }
                }
            ]);
        } else {
            clientTypeSalesdata = await salesModel.aggregate([
                {
                    $match: {
                        "employeeInfo": req.user._id
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
                },
                {
                    $sort: { "_id": 1 }
                }
            ]);
        }

        res.status(200).json(clientTypeSalesdata);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

//api for month wise sales chart
exports.getMonthWiseSaleData = async (req, res) => {
    try {

        let monthWiseSale

        if (req.user.designation == 'Director') {
            monthWiseSale = await salesModel.aggregate([
                {
                    $project: {
                        month: { $month: "$createdAt" },
                        dayOfMonth: { $dayOfMonth: "$createdAt" }
                    }
                },
                {
                    $group: {
                        _id: { month: "$month", dayOfMonth: "$dayOfMonth" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: "$_id.month",
                        count: { $sum: "$count" },
                        categories: {
                            $push: {
                                name: "$_id.dayOfMonth",
                                value: "$count"
                            }
                        }
                    }
                },
                {
                    $project: {
                        name: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ["$_id", 1] }, then: "January" },
                                    { case: { $eq: ["$_id", 2] }, then: "February" },
                                    { case: { $eq: ["$_id", 3] }, then: "March" },
                                    { case: { $eq: ["$_id", 4] }, then: "April" },
                                    { case: { $eq: ["$_id", 5] }, then: "May" },
                                    { case: { $eq: ["$_id", 6] }, then: "June" },
                                    { case: { $eq: ["$_id", 7] }, then: "July" },
                                    { case: { $eq: ["$_id", 8] }, then: "August" },
                                    { case: { $eq: ["$_id", 9] }, then: "September" },
                                    { case: { $eq: ["$_id", 10] }, then: "October" },
                                    { case: { $eq: ["$_id", 11] }, then: "November" },
                                    { case: { $eq: ["$_id", 12] }, then: "December" }
                                ],
                                default: "Unknown"
                            }
                        },
                        value: "$count",
                        categories: 1
                    }
                },
                { $sort: { "_id": 1, } }
            ]);
        } else {
            monthWiseSale = await salesModel.aggregate([
                {
                    $match: {
                        "employeeInfo": req.user._id
                    }
                },
                {
                    $project: {
                        month: { $month: "$createdAt" },
                        dayOfMonth: { $dayOfMonth: "$createdAt" }
                    }
                },
                {
                    $group: {
                        _id: { month: "$month", dayOfMonth: "$dayOfMonth" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: "$_id.month",
                        count: { $sum: "$count" },
                        categories: {
                            $push: {
                                name: "$_id.dayOfMonth",
                                value: "$count"
                            }
                        }
                    }
                },
                {
                    $project: {
                        name: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ["$_id", 1] }, then: "January" },
                                    { case: { $eq: ["$_id", 2] }, then: "February" },
                                    { case: { $eq: ["$_id", 3] }, then: "March" },
                                    { case: { $eq: ["$_id", 4] }, then: "April" },
                                    { case: { $eq: ["$_id", 5] }, then: "May" },
                                    { case: { $eq: ["$_id", 6] }, then: "June" },
                                    { case: { $eq: ["$_id", 7] }, then: "July" },
                                    { case: { $eq: ["$_id", 8] }, then: "August" },
                                    { case: { $eq: ["$_id", 9] }, then: "September" },
                                    { case: { $eq: ["$_id", 10] }, then: "October" },
                                    { case: { $eq: ["$_id", 11] }, then: "November" },
                                    { case: { $eq: ["$_id", 12] }, then: "December" }
                                ],
                                default: "Unknown"
                            }
                        },
                        value: "$count",
                        categories: 1
                    }
                },
                { $sort: { "_id": 1, } }
            ]);
        }

        res.status(200).json(monthWiseSale);

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}