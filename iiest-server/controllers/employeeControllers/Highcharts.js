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
                    $sort: { "name": 1 }
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
                    $sort: { "name": 1 }
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
                    $sort: { "name": 1 }
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
                    $sort: { "value": -1 }
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
                    $sort: { "name": 1 }
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
        const today = new Date()
        let yearStart, yearEnd;

        if (today.getMonth() > 2) {
            yearStart = new Date(today.getFullYear(), 3, 1);
            yearEnd = new Date(today.getFullYear() + 1, 3, 1);
        } else {
            yearStart = new Date(today.getFullYear() - 1, 3, 1);
            yearEnd = new Date(today.getFullYear(), 3, 1)
        }

        let monthWiseSale

        if (req.user.designation === 'Director') {
            
            monthWiseSale = await salesModel.aggregate([
                {
                    $match: {
                        "createdAt": {
                            $gte: yearStart,
                            $lt: yearEnd,
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                            day: { $dayOfMonth: "$createdAt" }
                        },
                        total: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: "$_id.month",
                        date: {$first: "$_id"},
                        total: { $sum: "$total" },
                        categories: {
                            $push: {
                                name: { $toString: "$_id.day" },
                                value: "$total",
                                date: {
                                    year: "$_id.year",
                                    month: "$_id.month",
                                    day: "$_id.day"
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        name: "$_id",
                        value: "$total",
                        date: "$date",
                        categories: 1
                    }
                },
                {
                    $unwind: "$categories"
                },
                {
                    $sort: { "categories.date.day": 1 }
                },
                {
                    $group: {
                        _id: "$_id",
                        name: { $first: "$name" },
                        value: { $first: "$value" },
                        date: { $first: "$date" },
                        categories: { $push: "$categories" }
                    }
                },
                {
                    $sort: {
                        "date.year": 1,
                        "date.month": 1
                    }
                }
            ]);


        } else {
            monthWiseSale = await salesModel.aggregate([
                {
                    $match: {
                        "createdAt": {
                            $gte: yearStart,
                            $lt: yearEnd,
                        },
                        "employeeInfo": req.user._id
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" },
                            day: { $dayOfMonth: "$createdAt" }
                        },
                        total: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: "$_id.month",
                        date: {$first: "$_id"},
                        total: { $sum: "$total" },
                        categories: {
                            $push: {
                                name: { $toString: "$_id.day" },
                                value: "$total",
                                date: {
                                    year: "$_id.year",
                                    month: "$_id.month",
                                    day: "$_id.day"
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        name: "$_id",
                        value: "$total",
                        date: "$date",
                        categories: 1
                    }
                },
                {
                    $unwind: "$categories"
                },
                {
                    $sort: { "categories.date.day": 1 }
                },
                {
                    $group: {
                        _id: "$_id",
                        name: { $first: "$name" },
                        value: { $first: "$value" },
                        date: { $first: "$date" },
                        categories: { $push: "$categories" }
                    }
                },
                {
                    $sort: {
                        "date.year": 1,
                        "date.month": 1
                    }
                }
            ]);
        }

        res.status(200).json(monthWiseSale);

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

function changeId(month) {
    let updatedMonth;

    updatedMonth = (month + 3) % 12;

    return updatedMonth
}