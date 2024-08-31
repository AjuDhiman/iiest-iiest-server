const { fostacRevenue, foscosRevenue, hraRevenue, medicalRevenue, waterTestRevenue, limitAdminSalePipeline, khadyaPaalnRevenue } = require("../../config/pipeline");
const salesModel = require("../../models/employeeModels/employeeSalesSchema");
const reportingManagerModel = require("../../models/employeeModels/reportingManagerSchema");
const fboModel = require("../../models/fboModels/fboSchema");
const { fboFormData } = require("../generalControllers/generalData");

//function for getting data in a formated way for ploating top sales person list in statlist
exports.getTopSalesPersons = async (req, res) => { 

    try {
        const todayDate = new Date();
        const startOfLastMonth = new Date(todayDate.getFullYear() , todayDate.getMonth() - 1, 1);
        const endOflastMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);

        let topSalesPersons

        if (req.user.designation !== "Director") {
            return res.status(204).json({ message: 'Only for Director' });
        }

        topSalesPersons = await salesModel.aggregate([ 
            {
                $lookup: { //getting employee name realted to eachs sales 
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
                $lookup: { //getting employee name realted to eachs sales 
                    from: "fbo_registers",
                    localField: "fboInfo",
                    foreignField: "_id",
                    as: "fboInfo"
                }
            },
            {
                $unwind: "$fboInfo"
            },
            ...limitAdminSalePipeline,
            {
                $group: {
                    _id: { person: "$employeeInfo.employee_name" },
                    salesAmmount: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$createdAt", startOfLastMonth] },
                                        { $lte: ["$createdAt", endOflastMonth] },
                                        {
                                            $or: [
                                                { $eq: [{ $ifNull: ["$cheque_data", null] }, null] }, // Check if cheque_data is null or doesn't exist
                                                { $eq: [{ $ifNull: ["$cheque_data.status", null] }, "Approved"] } // Check if cheque_data.status is "Approved"
                                            ]
                                        },
                                        {
                                            $or: [
                                                {
                                                    $and: [
                                                        { $eq: ["$payment_mode", "Pay Later"] }, // payment mode = pay later
                                                        { $eq: ["$pay_later_status", "Approved"] } // pay_later_status is "Approved"
                                                    ]
                                                },
                                                {
                                                    $ne: ["$payment_mode", "Pay Later"] // If payment mode is not "Pay Later", skip the check
                                                }
                                            ]
                                        },
                                        { $eq: ["$fboInfo.isBasicDocUploaded", true] }
                                    ]
                                },
                                then: {
                                    $sum: [  //getting revenue formulas pipeline from pipeline.js
                                        ...fostacRevenue, 
                                        ...foscosRevenue,
                                        ...hraRevenue, 
                                        ...medicalRevenue, 
                                        ...waterTestRevenue, 
                                        ...khadyaPaalnRevenue
                                    ]
                                },
                                else: 0
                            }
                        }
                    },
                    salesCount: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$createdAt", startOfLastMonth] },
                                        { $lte: ["$createdAt", endOflastMonth] }
                                    ]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    // location:  {$first: "$allocated_area.state"}
                }
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id.person",
                    salesAmmount: "$salesAmmount",
                    salesCount: "$salesCount",
                    // location: "$location"
                }
            },
            {
                $match: {
                    salesCount: { $gt: 0 }
                }
            },
            { $sort: { salesAmmount: -1, name: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json(topSalesPersons)

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

}

//function for getting data in a formated way for ploating top sales product list in statlist
exports.getTopProducts = async (req, res) => {


    try {
        const todayDate = new Date();
        const startOfLastMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);
        const endOflastMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
        const startOfLastHalf = new Date(todayDate.getFullYear(), todayDate.getMonth() - 6, 1);
        
        let topProducts

        if (req.user.designation !== "Director") {
            return res.status(204).json({ message: 'Only for Director' });
        }

        topProducts = await salesModel.aggregate([
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
                $unwind: "$employeeInfo" 
            },
            {
                $lookup: { //getting employee name realted to eachs sales 
                    from: "fbo_registers",
                    localField: "fboInfo",
                    foreignField: "_id",
                    as: "fboInfo"
                }
            },
            {
                $unwind: "$fboInfo"
            },
            ...limitAdminSalePipeline,
            {
                $unwind: "$product_name"
            },
            { //adding new fiels product amount for getting processing amount of particiular product
                $addFields: {
                    product_amount: {
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
                    _id: "$product_name",
                    salesAmountLastMonth: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$createdAt", startOfLastMonth] },
                                        { $lte: ["$createdAt", endOflastMonth] },
                                        {
                                            $or: [
                                                { $eq: [{ $ifNull: ["$cheque_data", null] }, null] }, // Check if cheque_data is null or doesn't exist
                                                { $eq: [{ $ifNull: ["$cheque_data.status", null] }, "Approved"] } // Check if cheque_data.status is "Approved"
                                            ]
                                        },
                                        {
                                            $or: [
                                                {
                                                    $and: [
                                                        { $eq: ["$payment_mode", "Pay Later"] }, // payment mode = pay later
                                                        { $eq: ["$pay_later_status", "Approved"] } // pay_later_status is "Approved"
                                                    ]
                                                },
                                                {
                                                    $ne: ["$payment_mode", "Pay Later"] // If payment mode is not "Pay Later", skip the check
                                                }
                                            ]
                                        },
                                        { $eq: ["$fboInfo.isBasicDocUploaded", true] }
                                    ]
                                },
                                then: "$product_amount",
                                else: 0
                            }
                        }
                    },
                    salesAmountLastHalf: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$createdAt", startOfLastHalf] },
                                        { $lte: ["$createdAt", endOflastMonth] }
                                    ]
                                },
                                then: "$product_amount",
                                else: 0
                            }
                        }
                    },
                    salesCountLastMonth: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$createdAt", startOfLastMonth] },
                                        { $lte: ["$createdAt", endOflastMonth] }
                                    ]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    salesCountLastHalf: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$createdAt", startOfLastHalf] },
                                        { $lte: ["$createdAt", endOflastMonth] }
                                    ]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    name: "$_id",
                    salesAmount: {
                        lastMonth: "$salesAmountLastMonth",
                        lastHalf: "$salesAmountLastHalf"
                    },
                    salesCount: {
                        lastMonth: "$salesCountLastMonth",
                        lastHalf: "$salesCountLastHalf"
                    }
                }
            },
            { $sort: { "salesAmount": -1 } },
            { $limit: 5 }
        ]);
        

        res.status(200).json(topProducts)

    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }

}

exports.getEmpUnderManager = async (req, res) => {
    try {

        const todayDate = new Date();
        const startOfMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());

        const empData = await reportingManagerModel.aggregate([
            {
                $match: {
                    "reportingManager": req.user._id
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
                $unwind: "$employeeInfo",
            },
            ...limitAdminSalePipeline, //limiting admin from showing in sale
            {
                $lookup: {
                    from: "employee_sales",
                    localField: "employeeInfo._id",
                    foreignField: "employeeInfo",
                    as: "sales"
                }
            },
            {
                $unwind: "$sales"
            },
            {
                $group: {
                    _id: "$employeeInfo._id",
                    name: { $first: "$employeeInfo.employee_name" },
                    salesAmmount: {
                        $sum: {
                            $cond: {
                                if: { $gte: ["$createdAt", startOfMonth] },
                                then: "$sales.grand_total",
                                else: 0
                            }
                        }
                    },
                    salesCount: {
                        $sum: {
                            $cond: {
                                if: { $gte: ["$createdAt", startOfMonth] },
                                then: 1,
                                else: 0
                            }
                        }
                    }

                }
            },
            {
                $project: {
                    name: "$name",
                    salesAmmount: "$salesAmmount",
                    salesCount: "$salesCount"
                }
            },
            { $sort: { salesAmmount: -1, createdAt: -1 } }
        ])

        res.status(200).json(empData);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
}

exports.mostRepeatedCustomer = async(req, res) => {
    try{

        // const pipeline = [

        // ]

        if (req.user.designation !== "Director") {
            return res.status(204).json({ message: 'Only for Director' });
        }

        const mostRepeatedCustomer = await salesModel.aggregate(
            [
                {
                    $lookup: {
                        from: "fbo_registers",
                        localField: "fboInfo",
                        foreignField: "_id",
                        as: "fbo"
                    }
                },
                {
                    $unwind: "$fbo"
                },
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
                $unwind: "$employeeInfo" 
            },
            ...limitAdminSalePipeline,
                {
                    $group: {
                        _id: {
                            customer_id: "$fbo.customer_id",
                            name: "$fbo.fbo_name"
                        },
                        total: { $sum: 1}
                    }
                },
                {
                    $project: {
                        name: "$_id.name",
                        repetition_count: "$total"
                    }
                },
                {
                    $sort: {
                        repetition_count: -1
                    }
                },
                { 
                    $limit: 10
                }
            ]
        );

        res.status(200).json(mostRepeatedCustomer);
    } catch(error) {
        console.log(error);
        res.status(500).json({message: 'Internal Server Error'});
    }
}