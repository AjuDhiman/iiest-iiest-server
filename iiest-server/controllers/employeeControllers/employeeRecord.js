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
                $facet: {
                    today: [
                        {
                            $match: {
                                createdAt: { $gte: startOfToday },
                            }
                        },
                        {
                            $group: {
                                _id: 1,
                                total: { $sum: "$grand_total" },
                                pending: {
                                    $sum: {
                                        $cond: { if: { $eq: ["$checkStatus", "Pending"] }, then: "$grand_total", else: 0 }
                                    }
                                },
                                approved: {
                                    $sum: {
                                        $cond: { if: { $eq: ["$checkStatus", "Approved"] }, then: "$grand_total", else: 0 }
                                    }
                                }
                            }
                        }
                    ],
                    this_week: [
                        {
                            $match: {
                                createdAt: { $gte: startOfThisWeek },
                             
                            }
                        },
                        {
                            $group: {
                                _id: 2,
                                total: { $sum: "$grand_total" },
                                pending: {
                                    $sum: {
                                        $cond: { if: { $eq: ["$checkStatus", "Pending"] }, then: "$grand_total", else: 0 }
                                    }
                                },
                                approved: {
                                    $sum: {
                                        $cond: { if: { $eq: ["$checkStatus", "Approved"] }, then: "$grand_total", else: 0 }
                                    }
                                }
                            }
                        }
                    ],
                    this_month: [
                        {
                            $match: {
                                createdAt: { $gte: startOfThisMonth },
                             
                            }
                        },
                        {
                            $group: {
                                _id: 3,
                                total: { $sum: "$grand_total" },
                                pending: {
                                    $sum: {
                                        $cond: { if: { $eq: ["$checkStatus", "Pending"] }, then: "$grand_total", else: 0 }
                                    }
                                },
                                approved: {
                                    $sum: {
                                        $cond: { if: { $eq: ["$checkStatus", "Approved"] }, then: "$grand_total", else: 0 }
                                    }
                                }
                            }
                        }
                    ],
                    prev_month: [
                        {
                            $match: {
                                createdAt: { $gte: startOfPrevMonth, $lt: startOfThisMonth },
                             
                            }
                        },
                        {
                            $group: {
                                _id: 4,
                                total: { $sum: "$grand_total" },
                                pending: {
                                    $sum: {
                                        $cond: { if: { $eq: ["$checkStatus", "pending"] }, then: "$grand_total", else: 0 }
                                    }
                                },
                                approved: {
                                    $sum: {
                                        $cond: { if: { $eq: ["$checkStatus", "approved"] }, then: "$grand_total", else: 0 }
                                    }
                                }
                            }
                        }
                    ],
                    this_year: [
                        {
                            $match: {
                                createdAt: { $gte: startOfThisYear },
                             
                            }
                        },
                        {
                            $group: {
                                _id: 5,
                                total: { $sum: "$grand_total" },
                                pending: {
                                    $sum: {
                                        $cond: { if: { $eq: ["$checkStatus", "Pending"] }, then: "$grand_total", else: 0 }
                                    }
                                },
                                approved: {
                                    $sum: {
                                        $cond: { if: { $eq: ["$checkStatus", "Approved"] }, then: "$grand_total", else: 0 }
                                    }
                                }
                            }
                        }
                    ],
                    till_now: [
                        {
                            $group: {
                                _id: 6,
                                total: { $sum: "$grand_total" },
                                pending: {
                                    $sum: {
                                        $cond: { if: { $eq: ["$checkStatus", "Pending"] }, then: "$grand_total", else: 0 }
                                    }
                                },
                                approved: {
                                    $sum: {
                                        $cond: { if: { $eq: ["$checkStatus", "Approved"] }, then: "$grand_total", else: 0 }
                                    }
                                }
                            }
                        }
                    ],
                }
            }
        ];

        if(req.user.designation !== 'Director'){
            pipeline.unshift({
                $match: {
                    employeeInfo: req.user._id,
                }
            });
        }

        const data = await salesModel.aggregate(pipeline);

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};




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
