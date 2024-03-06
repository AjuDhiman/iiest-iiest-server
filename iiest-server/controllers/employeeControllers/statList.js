const salesModel = require("../../models/employeeModels/employeeSalesSchema");


exports.getTopSalesPersons = async (req, res) => {

    try {
        const todayDate = new Date();
        const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
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
                    todaySales: {
                        $sum: {
                            $cond: {
                                if: { $gte: ["$createdAt", startOfToday] },
                                then: '$grand_total',
                                else: 0
                            }
                        }
                    },
                    totalSales: { $sum: "$grand_total" }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: "$_id.person",
                    todaySales: "$todaySales",
                    totalSales: "$totalSales",
                }
            },
            { $sort: { totalSales: -1, createdAt: -1 } },
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
        const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
        let topSalesPersons

        // if (req.user.designation !== "Director") {
        //     return res.status(204).json({ message: 'Only for Director' });
        // }

        topSalesPersons = await salesModel.aggregate([
            {
                $unwind: "$product_name"
            },
            {
                $group: {
                    _id: "$product_name",
                    totalSalesCount: { $sum: 1 },
                    todaySalesCount: {
                        $sum: {
                            $cond: {
                                if: { $gte: ["$createdAt", startOfToday] },
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
                    todaySalesCount: "$todaySalesCount",
                    totalSalesCount: "$totalSalesCount"
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