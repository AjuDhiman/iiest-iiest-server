const salesModel = require("../../models/employeeModels/employeeSalesSchema");
const reportingManagerModel = require("../../models/employeeModels/reportingManagerSchema");
const fboModel = require("../../models/fboModels/fboSchema");
const { fboFormData } = require("../generalControllers/generalData");


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
                $lookup: {
                    from: "allocated_area",
                    localField: "employeeInfo._id",
                    foreignField: "employeeInfo",
                    as: "allocated_area"
                }
            },
            {
                $unwind: {
                    path: "$allocated_area",
                    preserveNullAndEmptyArrays: true // Preserve documents with empty foreign fields
                }
            },
            {
                $match: {
                    allocated_area: { $exists: true } // Filter out documents with empty foreign fields
                }
            },
            {
                $group: {
                    _id: { person: "$employeeInfo.employee_name" },
                    salesAmmount: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$createdAt", startOfLastMonth] },
                                        { $lte: ["$createdAt", endOflastMonth] }
                                    ]
                                },
                                then: '$grand_total',
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
                    location:  {$first: "$allocated_area.state"}
                }
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id.person",
                    salesAmmount: "$salesAmmount",
                    salesCount: "$salesCount",
                    location: "$location"
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

        console.log(topSalesPersons);

        res.status(200).json(topSalesPersons)

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

}

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
                $unwind: "$product_name"
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
                                        { $lte: ["$createdAt", endOflastMonth] }
                                    ]
                                },
                                then: "$grand_total",
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
                                then: "$grand_total",
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

        const pipeline = [

        ]

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
                }
            ]
        );

        res.status(200).json(mostRepeatedCustomer);
    } catch(error) {
        console.log(error);
        res.status(500).json({message: 'Internal Server Error'});
    }
}