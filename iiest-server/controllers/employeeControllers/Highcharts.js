const { fostacRevenue, foscosRevenue, hraRevenue, medicalRevenue, waterTestRevenue, limitAdminSalePipeline, khadyaPaalnRevenue } = require("../../config/pipeline");
const salesModel = require("../../models/employeeModels/employeeSalesSchema");
const fboModel = require("../../models/fboModels/fboSchema");
const ticketDeliveryModel = require("../../models/operationModels/ticketDeliverySchema");

//api for product sales highchart
exports.getProductSaleData = async (req, res) => {

    try {

        const user = req.user;
        const isDirector = user.designation === 'Director';

        const todayDate = new Date();
        const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
        const startOfThisMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
        const startOfPrevMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);
        const startOfThisFinancialYear = new Date(todayDate.getFullYear(), 3, 1);

        let pipelinesArr;

        if (isDirector) {
            pipelinesArr = [
                {
                    $lookup: {
                        from: 'staff_registers',
                        let: { employeeId: '$employeeInfo' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$_id', '$$employeeId']
                                    }
                                }
                            },
                            {
                                $project: {
                                    employee_name: 1, // Only include the employee_name field
                                    _id: 0 // Optionally exclude the _id field
                                }
                            }
                        ],
                        as: 'employeeInfo'
                    }
                },
                {
                    $unwind: "$employeeInfo" //unwinding fboInfo because data comes in array format
                },
                ...limitAdminSalePipeline,
                {
                    $unwind: "$product_name"
                },
                {
                    $addFields: {
                        service_name: { //add new field service name on the basis of product
                            $switch: {
                                branches: [
                                    {
                                        case: {
                                            $eq: ["$product_name", "Fostac"]
                                        },
                                        then: "$fostacInfo.fostac_service_name"
                                    },
                                    {
                                        case: {
                                            $eq: ["$product_name", "Foscos"]
                                        },
                                        then: "$foscosInfo.foscos_service_name"
                                    },
                                    {
                                        case: {
                                            $eq: ["$product_name", "HRA"]
                                        },
                                        then: "$hraInfo.hra_service_name"
                                    },
                                    {
                                        case: {
                                            $eq: ["$product_name", "Medical"]
                                        },
                                        then: "Medical"
                                    },
                                    {
                                        case: {
                                            $eq: ["$product_name", "Water Test Report"]
                                        },
                                        then: "$waterTestInfo.water_test_service_name"
                                    },
                                    {
                                        case: {
                                            $eq: ["$product_name", "Khadya Paaln"]
                                        },
                                        then: "Khadya Paaln"
                                    }
                                ],
                                default: ""
                            }
                        },
                        product_amount: { //add new field product amount on the basis of product
                            $switch: {
                                branches: [
                                    {
                                        case: {
                                            $eq: ["$product_name", "Fostac"]
                                        },
                                        then: fostacRevenue
                                    },
                                    {
                                        case: {
                                            $eq: ["$product_name", "Foscos"]
                                        },
                                        then: foscosRevenue
                                    },
                                    {
                                        case: {
                                            $eq: ["$product_name", "HRA"]
                                        },
                                        then: hraRevenue
                                    },
                                    {
                                        case: {
                                            $eq: ["$product_name", "Medical"]
                                        },
                                        then: medicalRevenue
                                    },
                                    {
                                        case: {
                                            $eq: ["$product_name", "Water Test Report"]
                                        },
                                        then: waterTestRevenue
                                    },
                                    {
                                        case: {
                                            $eq: ["$product_name", "Khadya Paaln"]
                                        },
                                        then: khadyaPaalnRevenue
                                    }
                                ],
                                default: 0
                            }
                        }
                    }
                },
                {
                    $unwind: "$product_amount"
                },
                {
                    $group: {
                        _id: {
                            product: "$product_name",
                            service: "$service_name"
                        },
                        value: {
                            $sum: "$product_amount"
                        }
                    }
                },
                {
                    $group: {
                        _id: "$_id.product",
                        value: { $sum: "$value" },
                        categories: {
                            $push: {
                                name: "$_id.service",
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
        } else {
            pipelinesArr = [
                {
                    $unwind: "$product_name"
                },
                {
                    $addFields: {
                        service_name: { //add new field service name on the basis of product
                            $switch: {
                                branches: [
                                    {
                                        case: {
                                            $eq: ["$product_name", "Fostac"]
                                        },
                                        then: "$fostacInfo.fostac_service_name"
                                    },
                                    {
                                        case: {
                                            $eq: ["$product_name", "Foscos"]
                                        },
                                        then: "$foscosInfo.foscos_service_name"
                                    },
                                    {
                                        case: {
                                            $eq: ["$product_name", "HRA"]
                                        },
                                        then: "$hraInfo.hra_service_name"
                                    },
                                    {
                                        case: {
                                            $eq: ["$product_name", "Medical"]
                                        },
                                        then: "Medical"
                                    },
                                    {
                                        case: {
                                            $eq: ["$product_name", "Water Test Report"]
                                        },
                                        then: "$waterTestInfo.water_test_service_name"
                                    }
                                ],
                                default: ""
                            }
                        },
                        product_amount: { //add new field product amount on the basis of product
                            $switch: {
                                branches: [
                                    {
                                        case: {
                                            $eq: ["$product_name", "Fostac"]
                                        },
                                        then: fostacRevenue
                                    },
                                    {
                                        case: {
                                            $eq: ["$product_name", "Foscos"]
                                        },
                                        then: foscosRevenue
                                    },
                                    {
                                        case: {
                                            $eq: ["$product_name", "HRA"]
                                        },
                                        then: hraRevenue
                                    },
                                    {
                                        case: {
                                            $eq: ["$product_name", "Medical"]
                                        },
                                        then: medicalRevenue
                                    },
                                    {
                                        case: {
                                            $eq: ["$product_name", "Water Test Report"]
                                        },
                                        then: waterTestRevenue
                                    }
                                ],
                                default: 0
                            }
                        }
                    }
                },
                {
                    $unwind: "$product_amount"
                },
                {
                    $group: {
                        _id: {
                            product: "$product_name",
                            service: "$service_name"
                        },
                        value: {
                            $sum: "$product_amount"
                        }
                    }
                },
                {
                    $group: {
                        _id: "$_id.product",
                        value: { $sum: "$value" },
                        categories: {
                            $push: {
                                name: "$_id.service",
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
                                createdAt: { $gte: startOfThisFinancialYear }
                            },
                        },
                        ...pipelinesArr
                    ]
                }
            }
        ];

        if (!isDirector) {
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

        const user = req.user;

        const isDirector = user.designation === 'Director';

        const todayDate = new Date();
        const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
        const startOfThisMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
        const startOfPrevMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);

        let startOfThisFinancialYear;

        //getting start of this financial year
        if (todayDate.getMonth() < 3) {
            startOfThisFinancialYear = new Date((todayDate.getFullYear() - 1), 3, 1);
        } else {
            startOfThisFinancialYear = new Date(todayDate.getFullYear(), 3, 1);
        }

        let pipelinesArr

        if (isDirector) {
            pipelinesArr = [
                {
                    $lookup: {
                        from: 'staff_registers',
                        let: { employeeId: '$employeeInfo' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$_id', '$$employeeId']
                                    }
                                }
                            },
                            {
                                $project: {
                                    employee_name: 1, // Only include the employee_name field
                                    _id: 0 // Optionally exclude the _id field
                                }
                            }
                        ],
                        as: 'employeeInfo'
                    }
                },
                {
                    $unwind: "$employeeInfo" //unwinding fboInfo because data comes in array format
                },
                ...limitAdminSalePipeline,
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
        } else {
            pipelinesArr = [
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
        }



        if (!isDirector) {
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
                                createdAt: { $gte: startOfThisFinancialYear }
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

        const user = req.user;
        const isDirector = user.designation === 'Director';

        const todayDate = new Date();
        const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
        const startOfThisMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
        const startOfPrevMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);

        let startOfThisFinancialYear;

        //getting start of this financial year
        if (todayDate.getMonth() < 3) {
            startOfThisFinancialYear = new Date((todayDate.getFullYear() - 1), 3, 1);
        } else {
            startOfThisFinancialYear = new Date(todayDate.getFullYear(), 3, 1);
        }
        const pipelinesArr = [
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
            ...limitAdminSalePipeline,
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

        if (!isDirector) {
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
                                createdAt: { $gte: startOfThisFinancialYear }
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

        const user = req.user;
        const isDirector = user.designation === 'Director';

        let pipeline

        if (!isDirector) {
            pipeline = [
                {
                    $facet: {
                        Fostac: [
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
                            ...limitAdminSalePipeline,
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
                        ]
                    }
                }
            ];
        } else {
            pipeline = [
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
                        ]
                    }
                }
            ];
        }



        if (!isDirector) {
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

        const user = req.user;
        const isDirector = user.designation === 'Director';

        const today = new Date()
        let yearStart, yearEnd;
        const todayDate = new Date();
        const startOfToday = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), todayDate.getUTCDate(), 0, 0, 0));
        const startOfThisWeek = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), todayDate.getUTCDate() - todayDate.getUTCDay(), 0, 0, 0));
        const startOfPrevMonth = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth() - 1, 1, 0, 0, 0));
        const startOfThisMonth = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), 1, 0, 0, 0));

        let startOfThisFinancialYear;

        //getting start of this financial year
        if (todayDate.getMonth() < 3) {
            startOfThisFinancialYear = new Date((todayDate.getFullYear() - 1), 3, 1);
        } else {
            startOfThisFinancialYear = new Date(todayDate.getFullYear(), 3, 1);
        }


        if (today.getMonth() > 2) {
            yearStart = new Date(today.getFullYear(), 3, 1);
            yearEnd = new Date(today.getFullYear() + 1, 3, 1);
        } else {
            yearStart = new Date(today.getFullYear() - 1, 3, 1);
            yearEnd = new Date(today.getFullYear(), 3, 1);
        }

        let pipeline

        if (isDirector) {
            pipeline = [
                {
                    $lookup: {
                        from: 'staff_registers',
                        let: { employeeId: '$employeeInfo' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$_id', '$$employeeId']
                                    }
                                }
                            },
                            {
                                $project: {
                                    employee_name: 1, // Only include the employee_name field
                                    _id: 0 // Optionally exclude the _id field
                                }
                            }
                        ],
                        as: 'employeeInfo'
                    }
                },
                {
                    $unwind: "$employeeInfo" //unwinding fboInfo because data comes in array format
                },
                ...limitAdminSalePipeline,
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
                                    createdAt: { $gte: startOfThisFinancialYear }
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
        } else {
            pipeline = [
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
                                    createdAt: { $gte: startOfThisFinancialYear }
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
        }


        if (!isDirector) {
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

//api for repaeat customer chart
exports.getRepeactCustomerData = async (req, res) => {
    try {
        // const today = new Date()
        // let yearStart, yearEnd;
        // const todayDate = new Date();
        // const startOfToday = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), todayDate.getUTCDate(), 0, 0, 0));
        // const startOfThisWeek = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), todayDate.getUTCDate() - todayDate.getUTCDay(), 0, 0, 0));
        // const startOfPrevMonth = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth() - 1, 1, 0, 0, 0));
        // const startOfThisMonth = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), 1, 0, 0, 0));
        // const startOfThisFinancialYear = new Date(Date.UTC(todayDate.getUTCFullYear(), 0, 1, 0, 0, 0));

        const user = req.user;
        const isDirector = user.designation === 'Director';

        const todayDate = new Date();
        const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 0, 0, 1);
        const startOfThisMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
        const startOfPrevMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);

        let startOfThisFinancialYear;

        //getting start of this financial year
        if (todayDate.getMonth() < 3) {
            startOfThisFinancialYear = new Date((todayDate.getFullYear() - 1), 3, 1);
        } else {
            startOfThisFinancialYear = new Date(todayDate.getFullYear(), 3, 1);
        }

        let pipeline

        if (isDirector) {
            pipeline = [
                {
                    $lookup: {
                        from: 'staff_registers',
                        let: { employeeId: '$employeeInfo' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$_id', '$$employeeId']
                                    }
                                }
                            },
                            {
                                $project: {
                                    employee_name: 1, // Only include the employee_name field
                                    _id: 0 // Optionally exclude the _id field
                                }
                            }
                        ],
                        as: 'employeeInfo'
                    }
                },
                {
                    $unwind: "$employeeInfo" //unwinding fboInfo because data comes in array format
                },
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
                                    lastSalesDate: { $gte: startOfThisFinancialYear },
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
        } else {
            pipeline = [
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
                                    lastSalesDate: { $gte: startOfThisFinancialYear },
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
        }


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
                $match: {
                    $or: [
                        { "fboInfo.state": "Delhi" },
                        { "fboInfo.state": "Uttar Pradesh" },
                        { "fboInfo.state": "Haryana" }
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
                    name: { $first: "$_id.name" },
                    total: { $sum: "$total" },
                    categories: {
                        $push: {
                            state: "$_id.state",
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

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

//api for ticket delivery chart
exports.ticketDeviveryChartData = async (req, res) => {
    try {

        const todayDate = new Date();
        const startOfToday = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), todayDate.getUTCDate(), 0, 0, 0));
        const startOfThisWeek = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), todayDate.getUTCDate() - todayDate.getUTCDay(), 0, 0, 0));
        const startOfPrevMonth = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth() - 1, 1, 0, 0, 0));
        const startOfThisMonth = new Date(Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), 1, 0, 0, 0));

        let startOfThisFinancialYear;

        //getting start of this financial year
        if (todayDate.getMonth() < 3) {
            startOfThisFinancialYear = new Date((todayDate.getFullYear() - 1), 3, 1);
        } else {
            startOfThisFinancialYear = new Date(todayDate.getFullYear(), 3, 1);
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
                                createdAt: { $gte: startOfThisFinancialYear }
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
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

function changeId(month) {
    let updatedMonth;

    updatedMonth = (month + 3) % 12;

    return updatedMonth
}
