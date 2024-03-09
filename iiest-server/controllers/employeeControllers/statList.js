const salesModel = require("../../models/employeeModels/employeeSalesSchema");
const reportingManagerModel = require("../../models/employeeModels/reportingManagerSchema");


exports.getTopSalesPersons = async (req, res) => {

    try {
        const todayDate = new Date();
        const startOfMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());

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
                                if: { $gte: ["$createdAt", startOfMonth] },
                                then: '$grand_total',
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
        const startOfMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
        let topSalesPersons

        if (req.user.designation !== "Director") {
            return res.status(204).json({ message: 'Only for Director' });
        }

        topSalesPersons = await salesModel.aggregate([
            {
                $unwind: "$product_name"
            },
            {
                $group: {
                    _id: "$product_name",
                    salesAmmount: {
                        $sum: {
                            $cond: {
                                if: { $gte: ["$createdAt", startOfMonth] },
                                then: "$grand_total",
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
                    name: "$_id",
                    salesAmmount: "$salesAmmount",
                    salesCount: "$salesCount"
                }
            },
            { $sort: { totalSalesCount: -1, createdAt: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json(topSalesPersons)

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