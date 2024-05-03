const salesModel = require("../../models/employeeModels/employeeSalesSchema");
const fboModel = require("../../models/fboModels/fboSchema");
const ticketDeliveryModel = require("../../models/operationModels/ticketDeliverySchema");

//api for product sales highchart
exports.getProductSaleData = async (req, res) => {

    try {
        const todayDate = new Date();
        const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
        const startOfThisMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
        const startOfPrevMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);
        const startOfThisYear = new Date(todayDate.getFullYear(), 0, 1);

        const pipelinesArr = [
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
                                                { $toInt: "$foscosInfo.water_test_fee" },
                                                {
                                                    $cond: {
                                                        if: {
                                                            $eq: [{ $toInt: "$foscosInfo.water_test_fee" }, 0]
                                                        },
                                                        then: 0,
                                                        else: -1200
                                                    }
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
        ];

        const pipeline = [
            {
                $facet: {
                    Today: [
                        {
                            $match: {
                                createdAt: { $gte: startOfToday }
                            },
                        },
                        ...pipelinesArr
                    ],
                    This_Month: [
                        {
                            $match: {
                                createdAt: { $gte: startOfThisMonth }
                            },
                        },
                        ...pipelinesArr
                    ],
                    Prev_Month: [
                        {
                            $match: {
                                createdAt: { $gte: startOfPrevMonth, $lt: startOfThisMonth },
                            },
                        },
                        ...pipelinesArr
                    ],
                    This_Year: [
                        {
                            $match: {
                                createdAt: { $gte: startOfThisYear }
                            },
                        },
                        ...pipelinesArr
                    ]
                }
            }
        ];

        if (req.user.designation != 'Director') {
            pipeline.unshift({
                $match: {
                    "employeeInfo": req.user._id,
                } // Filter based on the employeeInfo property
            });
        }

        const productSaleData = await salesModel.aggregate(pipeline);

        res.status(200).json(productSaleData[0]);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

//api for sare wise sales highcharts
exports.getAreaWiseSalesData = async (req, res) => {
    try {
        const todayDate = new Date();
        const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
        const startOfThisMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
        const startOfPrevMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);
        const startOfThisYear = new Date(todayDate.getFullYear(), 0, 1);

        const pipelinesArr = [
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
        ]

        if (req.user.designation !== 'Director') {
            pipelinesArr.unshift(
                {
                    $match: {
                        "employeeInfo": req.user._id
                    }
                }
            );
        }

        const pipeline = [
            {
                $facet: {
                    Today: [
                        {
                            $match: {
                                createdAt: { $gte: startOfToday }
                            },
                        },
                        ...pipelinesArr
                    ],
                    This_Month: [
                        {
                            $match: {
                                createdAt: { $gte: startOfThisMonth }
                            },
                        },
                        ...pipelinesArr
                    ],
                    Prev_Month: [
                        {
                            $match: {
                                createdAt: { $gte: startOfPrevMonth, $lt: startOfThisMonth },
                            },
                        },
                        ...pipelinesArr
                    ],
                    This_Year: [
                        {
                            $match: {
                                createdAt: { $gte: startOfThisYear }
                            },
                        },
                        ...pipelinesArr
                    ]
                }
            }
        ];

        const salesAreaWiseData = await salesModel.aggregate(pipeline);

        res.status(200).json(salesAreaWiseData[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

//api for sales by employee highcharts
exports.getPersonWiseSalesData = async (req, res) => {

    try {
        const todayDate = new Date();
        const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
        const startOfThisMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
        const startOfPrevMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);
        const startOfThisYear = new Date(todayDate.getFullYear(), 0, 1);
        const pipelinesArr = [{
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
        }];

        if (req.user.designation != 'Director') {
            pipelinesArr.unshift({
                $match: {
                    "employeeInfo": req.user._id
                }
            });
        }

        const pipeline = [
            {
                $facet: {
                    Today: [
                        {
                            $match: {
                                createdAt: { $gte: startOfToday }
                            },
                        },
                        ...pipelinesArr
                    ],
                    This_Month: [
                        {
                            $match: {
                                createdAt: { $gte: startOfThisMonth }
                            },
                        },
                        ...pipelinesArr
                    ],
                    Prev_Month: [
                        {
                            $match: {
                                createdAt: { $gte: startOfPrevMonth, $lt: startOfThisMonth },
                            },
                        },
                        ...pipelinesArr
                    ],
                    This_Year: [
                        {
                            $match: {
                                createdAt: { $gte: startOfThisYear }
                            },
                        },
                        ...pipelinesArr
                    ]
                }
            }
        ]

        const salesPersonWiseData = await salesModel.aggregate(pipeline);

        res.status(200).json(salesPersonWiseData[0]);
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

//api for clent type highchart
exports.getClientTypeSalesData = async (req, res) => {
    try {

        const pipeline = [
            {
                $facet: {
                    Fostac: [
                        {
                            $match: {
                                product_name: {
                                    $elemMatch: {
                                        $eq: "Fostac"
                                    }
                                }
                            }
                        },
                        {
                            $group: {
                                _id: "$fostacInfo.fostac_client_type",
                                total: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                name: "$_id",
                                value: "$total"
                            }
                        }
                    ],
                    Foscos: [
                        {
                            $match: {
                                product_name: {
                                    $elemMatch: {
                                        $eq: "Foscos"
                                    }
                                }
                            }
                        },
                        {
                            $group: {
                                _id: "$foscosInfo.foscos_client_type",
                                total: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                name: "$_id",
                                value: "$total"
                            }
                        }
                    ],
                    HRA: [
                        {
                            $match: {
                                product_name: {
                                    $elemMatch: {
                                        $eq: "HRA"
                                    }
                                }
                            }
                        },
                        {
                            $group: {
                                _id: "$hraInfo.hra_client_type",
                                total: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                name: "$_id",
                                value: "$total"
                            }
                        }
                    ]
                }
            }
        ];

        if (req.user.designation != 'Director') {
            pipeline.unshift({
                $match: {
                    "employeeInfo": req.user._id
                }
            });
        }

        const clientTypeSalesdata = await salesModel.aggregate(pipeline);

        res.status(200).json(clientTypeSalesdata[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

//api for month wise sales chart
exports.getMonthWiseSaleData = async (req, res) => {
    try {
        const today = new Date()
        let yearStart, yearEnd;
        const todayDate = new Date();
        const startOfToday = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), todayDate.getUTCDate(), 0, 0, 0));
        const startOfThisWeek = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), todayDate.getUTCDate() - todayDate.getUTCDay(), 0, 0, 0));
        const startOfPrevMonth = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth() - 1, 1, 0, 0, 0));
        const startOfThisMonth = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), 1, 0, 0, 0));
        const startOfThisYear = new Date(Date.UTC(todayDate.getUTCFullYear(), 0, 1, 0, 0, 0));


        if (today.getMonth() > 2) {
            yearStart = new Date(today.getFullYear(), 3, 1);
            yearEnd = new Date(today.getFullYear() + 1, 3, 1);
        } else {
            yearStart = new Date(today.getFullYear() - 1, 3, 1);
            yearEnd = new Date(today.getFullYear(), 3, 1);
        }

        const pipeline = [
            {
                $facet: {
                    This_Week: [
                        {
                            $match: {
                                createdAt: { $gte: startOfThisWeek }
                            }
                        },
                        {
                            $group: {
                                _id: { $dayOfWeek: "$createdAt" }, // Add this line to get the day of the week
                                total: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                name: "$_id",
                                value: "$total"
                            }
                        },
                        {
                            $sort: {
                                name: 1
                            }
                        }
                    ],
                    This_Month: [
                        {
                            $match: {
                                createdAt: { $gte: startOfThisMonth }
                            }
                        },
                        {
                            $group: {
                                _id: { $dayOfMonth: "$createdAt" }, // Add this line to get the day of the week
                                total: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                name: "$_id",
                                value: "$total"
                            }
                        },
                        {
                            $sort: {
                                name: 1
                            }
                        }
                    ],
                    This_Year: [
                        {
                            $match: {
                                createdAt: { $gte: startOfThisYear }
                            }
                        },
                        {
                            $group: {
                                _id: { $month: "$createdAt" }, // Add this line to get the day of the week
                                total: { $sum: 1 },
                            }
                        },
                        {
                            $project: {
                                name: "$_id",
                                value: "$total"
                            }
                        },
                        {
                            $sort: {
                                name: 1
                            }
                        }
                    ]
                }
            }
        ];

        if (req.user.designation != 'Director') {
            pipeline.unshift({
                $match: {
                    "employeeInfo": req.user._id
                }
            });
        }

        const monthWiseSale = await salesModel.aggregate(pipeline);

        return res.status(200).json(monthWiseSale[0]);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getRepeactCustomerData = async (req, res) => {
    try {
        // const today = new Date()
        // let yearStart, yearEnd;
        // const todayDate = new Date();
        // const startOfToday = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), todayDate.getUTCDate(), 0, 0, 0));
        // const startOfThisWeek = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), todayDate.getUTCDate() - todayDate.getUTCDay(), 0, 0, 0));
        // const startOfPrevMonth = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth() - 1, 1, 0, 0, 0));
        // const startOfThisMonth = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), 1, 0, 0, 0));
        // const startOfThisYear = new Date(Date.UTC(todayDate.getUTCFullYear(), 0, 1, 0, 0, 0));

        const todayDate = new Date();
        const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(),0,0, 1);
        const startOfThisMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
        const startOfPrevMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);
        const startOfThisYear = new Date(todayDate.getFullYear(), 0, 1);

        const pipeline = [
            {
                $lookup: {
                    from: 'fbo_registers',
                    localField: 'fboInfo',
                    foreignField: '_id',
                    as: 'fbo'
                }
            },
            {
                $unwind: "$fbo"
            },
            {
                $group: {
                    _id: {
                        owner_name: "$fbo.owner_name",
                        customer_id: "$fbo.customer_id"
                    },
                    total: { $sum: 1 },
                    salesDates: {
                        $push: "$createdAt"
                    },
                    lastSalesDate: {
                        $max: "$createdAt"
                    }
                }
            },
            {
                $sort: {
                    total: -1
                }
            },
            {
                $facet: {
                    This_Year: [
                        {
                            $match: {
                                lastSalesDate: { $gte: startOfThisYear },
                                total: {
                                    $gt: 1
                                }
                            }
                        },
                        {
                            $addFields: { // Create a new field representing the day of the week
                                month: { $month: "$lastSalesDate" }
                            }
                        },
                        {
                            $group: {
                                _id: "$month",
                                total: { $sum: 1 },
                            },
                        },
                        {
                            $project: {
                                name: "$_id",
                                value: "$total"
                            }
                        },
                        {
                            $sort: {
                                name: 1
                            }
                        }
                    ],
                    Till_Now: [
                        {
                            $match: {
                                total: {
                                    $gt: 1
                                }
                            }
                        },
                        {
                            $addFields: { // Create a new field representing the day of the week
                                year: { $year: "$lastSalesDate" }
                            }
                        },
                        {
                            $group: {
                                _id: "$year",
                                total: { $sum: 1 }
                            },
                        },
                        {
                            $project: {
                                name: "$_id",
                                value: "$total"
                            }
                        },
                        {
                            $sort: {
                                name: 1
                            }
                        }
                    ]
                }
            }
        ];

        if (req.user.designation != 'Director') {
            pipeline.unshift({
                $match: {
                    "employeeInfo": req.user._id
                }
            });
        }

        const repeatedCustomerData = await salesModel.aggregate(pipeline);

        return res.status(200).json(repeatedCustomerData[0]);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getData = async (req, res) => {
    try {

        const data = await salesModel.aggregate([
            {
                $lookup: {
                    from: 'staff_registers',
                    localField: 'employeeInfo',
                    foreignField: '_id',
                    as: 'employeeInfo'
                }
            },
            {
                $unwind: "$employeeInfo"
            },
            {
                $lookup: {
                    from: 'fbo_registers',
                    localField: 'fboInfo',
                    foreignField: '_id',
                    as: 'fboInfo'
                }
            },
            {
                $unwind: "$fboInfo"
            },
            {
                $match:{
                    $or: [
                        {"fboInfo.state": "Delhi"},
                        {"fboInfo.state": "Uttar Pradesh"},
                        {"fboInfo.state": "Haryana"}
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        employee: "$employeeInfo._id",
                        name: "$employeeInfo.employee_name",
                        state: "$fboInfo.state",
                    },
                    total: { $sum: 1 },
                }
            },
            {
                $group: {
                   _id: {
                    employee: "$_id.employee",
                   },
                   name: {$first:"$_id.name"},
                   total: {$sum: "$total"},
                   categories:{
                       $push:{
                        state:  "$_id.state",
                        total: "$total"
                       }
                   } 
                }
            }
            // {
            //     $project: {

            //     }
            // }
        ]);

        return res.status(200).json(data);

    } catch(error) {
        console.log(error);
        return res.status(500).json({message:'Internal Server Error'});
    }
}

exports.ticketDeviveryChartData = async(req, res) => {
    try {

        const todayDate = new Date();
        const startOfToday = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), todayDate.getUTCDate(), 0, 0, 0));
        const startOfThisWeek = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), todayDate.getUTCDate() - todayDate.getUTCDay(), 0, 0, 0));
        const startOfPrevMonth = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth() - 1, 1, 0, 0, 0));
        const startOfThisMonth = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), 1, 0, 0, 0));
        const startOfThisYear = new Date(Date.UTC(todayDate.getUTCFullYear(), 0, 1, 0, 0, 0));

        const pipeline = [
            {
                $facet: {
                    This_Week: [
                        {
                            $match: {
                                createdAt: { $gte: startOfThisWeek }
                            }
                        },
                        {
                            $group: {
                                _id: { $dayOfWeek: "$createdAt" }, // Add this line to get the day of the week
                                total: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                name: "$_id",
                                value: "$total"
                            }
                        },
                        {
                            $sort: {
                                name: 1
                            }
                        }
                    ],
                    This_Month: [
                        {
                            $match: {
                                createdAt: { $gte: startOfThisMonth }
                            }
                        },
                        {
                            $group: {
                                _id: { $dayOfMonth: "$createdAt" }, // Add this line to get the day of the week
                                total: { $sum: 1 }
                            }
                        },
                        {
                            $project: {
                                name: "$_id",
                                value: "$total"
                            }
                        },
                        {
                            $sort: {
                                name: 1
                            }
                        }
                    ],
                    This_Year: [
                        {
                            $match: {
                                createdAt: { $gte: startOfThisYear }
                            }
                        },
                        {
                            $group: {
                                _id: { $month: "$createdAt" }, // Add this line to get the day of the week
                                total: { $sum: 1 },
                            }
                        },
                        {
                            $project: {
                                name: "$_id",
                                value: "$total"
                            }
                        },
                        {
                            $sort: {
                                name: 1
                            }
                        }
                    ]
                }
            }
        ];

        const ticketDeliveryChartData = await ticketDeliveryModel.aggregate(pipeline);

        res.status(200).json(ticketDeliveryChartData[0]);

    } catch (error) {
        console.log('Ticket Delivery Chart Error:', error);
        return res.status(500).json({success: false, message: 'Internal Server Error'});
    }
}

function changeId(month) {
    let updatedMonth;

    updatedMonth = (month + 3) % 12;

    return updatedMonth
}
