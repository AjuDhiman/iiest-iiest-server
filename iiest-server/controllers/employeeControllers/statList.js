const salesModel = require("../../models/employeeModels/employeeSalesSchema");
const reportingManagerModel = require("../../models/employeeModels/reportingManagerSchema");


exports.getTopSalesPersons = async (req, res) => {

    try {
        const todayDate = new Date();
        const startOfLastMonth = new Date(todayDate.getFullYear() - 1, todayDate.getMonth() - 1, 1);
        const endOflastMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);

        console.log(startOfLastMonth, endOflastMonth, 11);

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
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id.person",
                    salesAmmount: "$salesAmmount",
                    salesCount: "$salesCount",
                }
            },
            { $sort: { saleAmmount: -1, name: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json(topSalesPersons)

    } catch (error) {
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

        console.log(startOfLastHalf);

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
            { $sort: { salesCount: -1 } }, // Sorting by salesCount
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