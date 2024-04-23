const salesModel = require("../../models/employeeModels/employeeSalesSchema");
const fboModel = require("../../models/fboModels/fboSchema");

//api for product sales highchart
exports.getProductSaleData = async (req, res) => {
    const todayDate = new Date();
    const startOfPrevMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);
    const startOfThisMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
    try {

        let productSaleData;

        if (req.user.designation === 'Director') {

            productSaleData = await salesModel.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfThisMonth }
                    }
                },
                {
                    $project: {
                        name: {
                            $cond: [
                                { $ifNull: ["$fostacInfo", false] },
                                "Fostac",
                                {
                                    $cond: [
                                        { $ifNull: ["$foscosInfo", false] },
                                        "Foscos",
                                        "HRA"
                                    ]
                                }
                            ]
                        },
                        service: {
                            $cond: [
                                { $ifNull: ["$fostacInfo", false] },
                                {
                                    name: "$fostacInfo.fostac_service_name",
                                    amt: {
                                        $multiply: [
                                            { $toInt: "$fostacInfo.fostac_processing_amount" },
                                            { $toInt: "$fostacInfo.recipient_no" }
                                        ]
                                    }
                                },
                                {
                                    $cond: [
                                        { $ifNull: ["$foscosInfo", false] },
                                        {
                                            name: "$foscosInfo.foscos_service_name",
                                            amt: {
                                                $add: [
                                                    {
                                                        $multiply: [
                                                            { $toInt: "$foscosInfo.foscos_processing_amount" },
                                                            { $toInt: "$foscosInfo.shops_no" }
                                                        ]
                                                    },
                                                    { $toInt: "$foscosInfo.water_test_fee" }
                                                ]
                                            }
                                        },
                                        {
                                            name: "$hraInfo.hra_service_name",
                                            amt: {
                                                $multiply: [
                                                    { $toInt: "$hraInfo.hra_processing_amount" },
                                                    { $toInt: "$hraInfo.shops_no" }
                                                ]
                                            },
                                            processing_amt: "$hraInfo.hra_processing_amount",
                                            qty: "$hraInfo.shops_no"
                                        }
                                    ]
                                }
                            ]
                        }
                    }

                },
                {
                    $group: {
                        _id: { name: "$name", category: "$service.name" },
                        value: { $sum: "$service.amt" }
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

        } else {
            productSaleData = await salesModel.aggregate([
                {
                    $match: {
                        "employeeInfo": req.user._id,
                        createdAt: { $gte: startOfThisMonth }
                    } // Filter based on the employeeInfo property
                },
                {
                    $project: {
                        name: {
                            $cond: [
                                { $ifNull: ["$fostacInfo", false] },
                                "Fostac",
                                {
                                    $cond: [
                                        { $ifNull: ["$foscosInfo", false] },
                                        "Foscos",
                                        "HRA"
                                    ]
                                }
                            ]
                        },
                        service: {
                            $cond: [
                                { $ifNull: ["$fostacInfo", false] },
                                {
                                    name: "$fostacInfo.fostac_service_name",
                                    amt: {
                                        $multiply: [
                                            { $toInt: "$fostacInfo.fostac_processing_amount" },
                                            { $toInt: "$fostacInfo.recipient_no" },
                                        ]
                                    }
                                },
                                {
                                    $cond: [
                                        { $ifNull: ["$foscosInfo", false] },
                                        {
                                            name: "$foscosInfo.foscos_service_name",
                                            amt: {
                                                $add: [
                                                    {
                                                        $multiply: [
                                                            { $toInt: "$foscosInfo.foscos_processing_amount" },
                                                            { $toInt: "$foscosInfo.shops_no" }
                                                        ]
                                                    },
                                                    {
                                                        $subtract: [
                                                            { $toInt: "$foscosInfo.water_test_fee" },
                                                            {
                                                                $cond: {
                                                                    if: {
                                                                        $eq: [{ $toInt: "$foscosInfo.water_test_fee" }, 0]
                                                                    },
                                                                    then: 0,
                                                                    else: 1200
                                                                }
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            name: "$hraInfo.hra_service_name",
                                            amt: {
                                                $multiply: [
                                                    { $toInt: "$hraInfo.hra_processing_amount" },
                                                    { $toInt: "$hraInfo.shops_no" }
                                                ]
                                            },
                                            processing_amt: "$hraInfo.hra_processing_amount",
                                            qty: "$hraInfo.shops_no"
                                        }
                                    ]
                                }
                            ]
                        }
                    }

                },
                {
                    $group: {
                        _id: { name: "$name", category: "$service.name" },
                        value: { $sum: "$service.amt" }
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
        console.log(error);
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
            yearEnd = new Date(today.getFullYear(), 3, 1);
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
                        date: { $first: "$_id" },
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
                        date: { $first: "$_id" },
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

//api for sare wise sales highcharts
exports.getAreaWiseFboData = async (req, res) => {
    try {

        let salesAreaWiseData
        // if (req.user.designation === 'Director') {
        salesAreaWiseData = await fboModel.aggregate([
            {
                $lookup: {
                    from: 'employee_sales',
                    localField: '_id',
                    foreignField: 'fboInfo',
                    as: 'sales'
                }
            },
            {
                $group: {
                    _id: { state: "$state", district: "$district" },
                    stateCount: { $sum: 1 },
                }
            },
            {
                $group: {
                    _id: "$_id.state",
                    stateCount: { $sum: "$stateCount" },
                    districts: {
                        $push: {
                            name: "$_id.district",
                            value: "$stateCount"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id",
                    value: "$stateCount",
                    categories: "$districts"
                }
            },
            {
                $sort: { "name": 1 }
            }
        ]);
        // } 

        res.status(200).json(salesAreaWiseData);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}