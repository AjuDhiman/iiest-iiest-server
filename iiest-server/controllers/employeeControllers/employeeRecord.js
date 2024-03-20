const salesModel = require('../../models/employeeModels/employeeSalesSchema');
const employeeSchema = require('../../models/employeeModels/employeeSchema');
const reportingManagerModel = require('../../models/employeeModels/reportingManagerSchema');


exports.employeeRecord = async (req, res) => {

    try {
        const todayDate = new Date();
        const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
        const startOfThisWeek = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - todayDate.getDay());
        const startOfPrevMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);
        const startOfThisMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
        const startOfThisYear = new Date(todayDate.getFullYear(), 0, 1);

        const pipeline = [
            {
                $group: {
                    _id: 1,
                    today_total: {
                        $sum: {
                            $cond: {
                                if: { $gte: ["$createdAt", startOfToday] },
                                then: '$grand_total',
                                else: 0
                            }
                        }
                    },
                    today_pending: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$createdAt", startOfToday] },
                                        { $eq: ["$checkStatus", 'pending'] }
                                    ]
                                },
                                then: '$grand_total',
                                else: 0
                            }
                        }
                    },
                    today_approved: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$createdAt", startOfToday] },
                                        { $eq: ["$checkStatus", 'approved'] }
                                    ]
                                },
                                then: '$grand_total',
                                else: 0
                            }
                        }
                    },
                    week_total: {
                        $sum: {
                            $cond: {
                                if: { $gte: ["$createdAt", startOfThisWeek] },
                                then: '$grand_total',
                                else: 0
                            }
                        }
                    },
                    week_pending: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$createdAt", startOfThisWeek] },
                                        { $eq: ["$checkStatus", 'pending'] }
                                    ]
                                },
                                then: '$grand_total',
                                else: 0
                            }
                        }
                    },
                    week_approved: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$createdAt", startOfThisWeek] },
                                        { $eq: ["$checkStatus", 'approved'] }
                                    ]
                                },
                                then: '$grand_total',
                                else: 0
                            }
                        }
                    },
                    prev_month_total: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$createdAt", startOfPrevMonth] },
                                        { $lte: ["$createdAt", startOfThisMonth] }
                                    ]
                                },
                                then: '$grand_total',
                                else: 0
                            }
                        }
                    },
                    prev_month_pending: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$createdAt", startOfPrevMonth] },
                                        { $lte: ["$createdAt", startOfThisMonth] },
                                        { $eq: ["$checkStatus", 'pending'] }
                                    ]
                                },
                                then: '$grand_total',
                                else: 0
                            }
                        }
                    },
                    prev_month_approved: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$createdAt", startOfPrevMonth] },
                                        { $lte: ["$createdAt", startOfThisMonth] },
                                        { $eq: ["$checkStatus", 'approved'] }
                                    ]
                                },
                                then: '$grand_total',
                                else: 0
                            }
                        }
                    },
                    month_total: {
                        $sum: {
                            $cond: {
                                if: { $gte: ["$createdAt", startOfThisMonth] },
                                then: '$grand_total',
                                else: 0
                            }
                        }
                    },
                    month_pending: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$createdAt", startOfThisMonth] },
                                        { $eq: ["$checkStatus", 'pending'] }
                                    ]
                                },
                                then: '$grand_total',
                                else: 0
                            }
                        }
                    },
                    month_approved: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$createdAt", startOfThisMonth] },
                                        { $eq: ["$checkStatus", 'approved'] }
                                    ]
                                },
                                then: '$grand_total',
                                else: 0
                            }
                        }
                    },
                    year_total: {
                        $sum: {
                            $cond: {
                                if: { $gte: ["$createdAt", startOfThisYear] },
                                then: '$grand_total',
                                else: 0
                            }
                        }
                    },
                    year_pending: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$createdAt", startOfThisYear] },
                                        { $eq: ["$checkStatus", 'pending'] }
                                    ]
                                },
                                then: '$grand_total',
                                else: 0
                            }
                        }
                    },
                    year_approved: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gte: ["$createdAt", startOfThisYear] },
                                        { $eq: ["$checkStatus", 'approved'] }
                                    ]
                                },
                                then: '$grand_total',
                                else: 0
                            }
                        }
                    },
                    total: {
                        $sum: "$grand_total"
                    },
                    pending: {
                        $sum: {
                            $cond: {
                                if: {
                                    $eq: ["$checkStatus", 'pending']
                                },
                                then: '$grand_total',
                                else: 0
                            }
                        }
                    },
                    approved: {
                        $sum: {
                            $cond: {
                                if: {

                                    $eq: ["$checkStatus", 'approved']

                                },
                                then: '$grand_total',
                                else: 0
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    today: {
                        totalSales: "$today_total",
                        pendingSales: "$today_pending",
                        approvedSales: "$today_approved"
                    },
                    this_Week: {
                        totalSales: "$week_total",
                        pendingSales: "$week_pending",
                        approvedSales: "$week_approved"
                    },
                    prev_month: {
                        totalSales: "$prev_month_total",
                        pendingSales: "$prev_month_pending",
                        approvedSales: "$prev_month_approved"
                    },
                    this_month: {
                        totalSales: "$month_total",
                        pendingSales: "$month_pending",
                        approvedSales: "$month_approved"
                    },
                    this_year: {
                        totalSales: "$year_total",
                        pendingSales: "$year_pending",
                        approvedSales: "$year_approved"
                    },
                    till_now: {
                        totalSales: "$total",
                        pendingSales: "$pending",
                        approvedSales: "$approved"
                    }
                }
            }];

        if (req.user.designation !== 'Director') {
            pipeline.unshift(
                {
                    $match: {
                        "employeeInfo": req.user._id
                    }
                }
            );
        }

        let data = await salesModel.aggregate([pipeline]);

        if (data.length === 0) {
            data = [{
                today: {
                    totalSales: 0,
                    pendingSales: 0,
                    approvedSales: 0
                },
                this_Week: {
                    totalSales: 0,
                    pendingSales: 0,
                    approvedSales: 0
                },
                prev_month: {
                    totalSales: 0,
                    pendingSales: 0,
                    approvedSales: 0
                },
                this_month: {
                    totalSales: 0,
                    pendingSales: 0,
                    approvedSales: 0
                },
                this_year: {
                    totalSales: 0,
                    pendingSales: 0,
                    approvedSales: 0
                },
                till_now: {
                    totalSales: 0,
                    pendingSales: 0,
                    approvedSales: 0
                }
            }];
        }

        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }


}

exports.employeeSalesData = async (req, res) => {
    try {
        let salesInfo;
        if (req.user.designation === 'Director') {
            salesInfo = await salesModel.find({}).populate([{ path: 'fboInfo', options: { lean: true } }, { path: 'employeeInfo', options: { lean: true } }]).lean();
        } else {
            salesInfo = await salesModel.find({ employeeInfo: req.user.id }).populate('fboInfo').select('-employeeInfo');
        }
        return res.status(200).json({ salesInfo });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

// exports.salesData = async (req, res) => { api under development for getting optimized sales list
//     try {

//         let salesData = await salesModel.aggregate([
//             {
//                 $lookup: {
//                     from: "fbo_registers",
//                     localField: "fboInfo",
//                     foreignField: "_id",
//                     as: "fboInfo"
//                 }
//             },
//             {
//                 $unwind: "$fboInfo"
//             },
//             {
//                 $replaceRoot: { newRoot: "$fboInfo" } // Replace the root with fboInfo
//             },
//             {
//                 $project: {
//                     _id: 1, // Exclude _id field
//                     fbo_name: 1,
//                     owner_name: 1,
//                     customer_id: 1,
//                     state: 1,
//                     district: 1
//                 }
//             }
//         ]);

//         // Now salesData contains plain JavaScript objects directly returned from the aggregation pipeline


//         res.status(200).json(salesData);

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// }

exports.employeeDepartmentCount = async (req, res) => {

    try {

        let success = false;

        const employeeGroupCount = await employeeSchema.aggregate([
            {
                $group: {
                    _id: {
                        department: '$department'
                    },
                    active: {
                        $sum: { $cond: { if: { $eq: ["$status", true] }, then: 1, else: 0 } }
                    },
                    inactive: {
                        $sum: { $cond: { if: { $eq: ["$status", false] }, then: 1, else: 0 } }
                    },
                    count: {
                        $sum: 1
                    }
                }
            }
        ]);

        if (!employeeGroupCount) {
            success = false;
            return res.status(404).json({ success, randomErr: true });
        }

        success = true;

        return res.status(200).json({ success, employeeGroupCount })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }

}

exports.empHiringData = async (req, res) => {

    try {

        let success = false;

        const employeeHiringData = await employeeSchema.aggregate([
            {
                $match: { createdBy: req.user.employee_name } // Filter documents where status is true
            },
            {
                $group: {
                    _id: '$department',
                    // name: "$_id.department",
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    name: "$_id",
                    value: "$count"
                }
            }
        ])

        if (!employeeHiringData) {
            success = false;
            return res.status(404).json({ success, randomErr: true });
        }

        success = true;

        return res.status(200).json(employeeHiringData);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }

}

exports.getEmployeeUnderManager = async (req, res) => {
    try {

        let success = false;

        const employees = await reportingManagerModel.find({ reportingManager: req.user._id }).select('-reportingManager').populate({ path: 'employeeInfo' });

        const empArr = employees.map(emp => emp.employeeInfo);

        if (!employees) {
            success = false;
            return res.status(404).json({ success, randomErr: true });
        }

        success = true;

        return res.status(200).json({ success, empArr })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
