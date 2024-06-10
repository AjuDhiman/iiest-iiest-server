const salesModel = require('../../models/employeeModels/employeeSalesSchema');
const employeeSchema = require('../../models/employeeModels/employeeSchema');
const reportingManagerModel = require('../../models/employeeModels/reportingManagerSchema');
const { recipientModel } = require('../../models/fboModels/recipientSchema');
const { recipientsList } = require('../fboControllers/recipient');

exports.employeeRecord = async (req, res) => {
    try {
        const todayDate = new Date();
        const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
        const startOfThisWeek = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - todayDate.getDay());
        const startOfPrevMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);
        const startOfThisMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
        const startOfThisFinancialYear = new Date(todayDate.getFullYear(), 3, 1);

        const pipeLineArr = [
            {
                $group: {
                    _id: 3,
                    totalProcessingAmount: {
                        $sum: {
                            $sum: [
                                {
                                    $multiply: [
                                        { $toInt: { $ifNull: ["$fostacInfo.fostac_processing_amount", 0] } },
                                        { $toInt: { $ifNull: ["$fostacInfo.recipient_no", 0] } },
                                    ]
                                },
                                {
                                    $multiply: [
                                        { $toInt: { $ifNull: ["$foscosInfo.foscos_processing_amount", 0] } },
                                        { $toInt: { $ifNull: ["$foscosInfo.shops_no", 0] } },
                                    ]
                                },
                                {
                                    $toInt: { $ifNull: ["$foscosInfo.water_test_fee", 0] },
                                },
                                {
                                    $cond: [
                                        {
                                          $and: [
                                            { $gt: [{ $type: '$foscosInfo' }, 'missing'] }, // Check if foscosInfo exists
                                            { $ne: ['$foscosInfo.water_test_fee', '0'] }       // Check if water_test_fee is not equal to 0
                                          ]
                                        },
                                        -1200, // Value to return if both conditions are true
                                        0   // Value to return if either condition is false
                                      ]
                                },
                                // {
                                    // $add: [
                                    //     { $toInt: { $ifNull: ["$foscosInfo.water_test_fee", 0] } },
                                    //     {
                                    //         $cond: [
                                    //             {
                                    //                 $and: [
                                    //                     { $ne: [{ $ifNull: ["$foscosInfo", null] }, null] }, // Check if foscosInfo exists
                                    //                     { $ne: [{ $toInt: { $ifNull: ["$foscosInfo.water_test_fee", 0] } }, 0] } // Check if water_test_fee is not 0
                                    //                 ]
                                    //             },
                                    //             {
                                    //                 $subtract: [
                                    //                     { $toInt: { $ifNull: ["$foscosInfo.water_test_fee", 0] } }, 1200]
                                    //             }, // Subtract 1200 if both conditions are true
                                    //             0 // Otherwise, leave it as 0
                                    //         ]
                                    //     }
                                    // ]
                                // },
                                {
                                    $multiply: [
                                        { $toInt: { $ifNull: ["$hraInfo.hra_processing_amount", 0] } },
                                        { $toInt: { $ifNull: ["$hraInfo.shops_no", 0] } },
                                    ]
                                }
                            ]
                        }
                    },
                    pending: {
                        $sum: {
                            $cond: {
                                if: { $eq: ["$checkStatus", "Pending"] }, then: {
                                    $sum: [
                                        {
                                            $multiply: [
                                                { $toInt: { $ifNull: ["$fostacInfo.fostac_processing_amount", 0] } },
                                                { $toInt: { $ifNull: ["$fostacInfo.recipient_no", 0] } },
                                            ]
                                        },
                                        {
                                            $multiply: [
                                                { $toInt: { $ifNull: ["$foscosInfo.foscos_processing_amount", 0] } },
                                                { $toInt: { $ifNull: ["$foscosInfo.shops_no", 0] } },
                                            ]
                                        },
                                        {
                                            $toInt: { $ifNull: ["$foscosInfo.water_test_fee", 0] },
                                        },
                                        {
                                            $cond: [
                                                {
                                                  $and: [
                                                    { $gt: [{ $type: '$foscosInfo' }, 'missing'] }, // Check if foscosInfo exists
                                                    { $ne: ['$foscosInfo.water_test_fee', '0'] }       // Check if water_test_fee is not equal to 0
                                                  ]
                                                },
                                                -1200, // Value to return if both conditions are true
                                                0   // Value to return if either condition is false
                                              ]
                                        },
                                        {
                                            $multiply: [
                                                { $toInt: { $ifNull: ["$hraInfo.hra_processing_amount", 0] } },
                                                { $toInt: { $ifNull: ["$hraInfo.shops_no", 0] } },
                                            ]
                                        }
                                    ]
                                }, else: 0
                            }
                        }
                    },
                    approved: {
                        $sum: {
                            $cond: {
                                if: { $eq: ["$checkStatus", "Approved"] }, then: {
                                    $sum: [
                                        {
                                            $multiply: [
                                                { $toInt: { $ifNull: ["$fostacInfo.fostac_processing_amount", 0] } },
                                                { $toInt: { $ifNull: ["$fostacInfo.recipient_no", 0] } },
                                            ]
                                        },
                                        {
                                            $multiply: [
                                                { $toInt: { $ifNull: ["$foscosInfo.foscos_processing_amount", 0] } },
                                                { $toInt: { $ifNull: ["$foscosInfo.shops_no", 0] } },
                                            ]
                                        },
                                        {
                                            $toInt: { $ifNull: ["$foscosInfo.water_test_fee", 0] },
                                        },
                                        {
                                            $cond: [
                                                {
                                                  $and: [
                                                    { $gt: [{ $type: '$foscosInfo' }, 'missing'] }, // Check if foscosInfo exists
                                                    { $ne: ['$foscosInfo.water_test_fee', '0'] }       // Check if water_test_fee is not equal to 0
                                                  ]
                                                },
                                                -1200, // Value to return if both conditions are true
                                                0   // Value to return if either condition is false
                                              ]
                                        },
                                        {
                                            $multiply: [
                                                { $toInt: { $ifNull: ["$hraInfo.hra_processing_amount", 0] } },
                                                { $toInt: { $ifNull: ["$hraInfo.shops_no", 0] } },
                                            ]
                                        }
                                    ]
                                }, else: 0
                            }
                        }
                    }

                }
            }
        ];


        const pipeline = [
            {
                $facet: {
                    today: [
                        {
                            $match: {
                                createdAt: { $gte: startOfToday },
                            }
                        },
                        ...pipeLineArr
                    ],
                    this_week: [
                        {
                            $match: {
                                createdAt: { $gte: startOfThisWeek },
                            }
                        },
                        ...pipeLineArr
                    ],
                    this_month: [
                        {
                            $match: {
                                createdAt: { $gte: startOfThisMonth },
                            }
                        },
                        ...pipeLineArr
                    ],
                    prev_month: [
                        {
                            $match: {
                                createdAt: { $gte: startOfPrevMonth, $lt: startOfThisMonth },
                            }
                        },
                        ...pipeLineArr
                    ],
                    this_year: [
                        {
                            $match: {
                                createdAt: { $gte: startOfThisFinancialYear },
                            }
                        },
                        ...pipeLineArr
                    ],
                    till_now: [
                        ...pipeLineArr
                    ],
                }
            }
        ];

        if (req.user.designation !== 'Director') {
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
            salesInfo = await salesModel.find({}).populate([
                {
                    path: 'fboInfo',
                    select: 'fbo_name owner_name customer_id state district _id createdAt business_type gst_number address email owner_contact pincode village tehsil boInfo',
                    options: { lean: true },
                    populate: {
                        path: 'boInfo',
                        select: 'customer_id',
                        options: { lean: true }
                    }
                },
                {
                    path: 'employeeInfo',
                    select: 'employee_name',
                    options: { lean: true }
                }
            ]).lean();
        } else {
            salesInfo = await salesModel.find({ employeeInfo: req.user.id }).populate(
                {
                    path: 'fboInfo',
                    select: 'fbo_name owner_name customer_id state district _id createdAt business_type gst_number address email owner_contact pincode village tehsil boInfo',
                    options: { lean: true },
                    populate: {
                        path: 'boInfo',
                        select: 'customer_id',
                        options: { lean: true }
                    }
                }
            ).select('-employeeInfo');
        }

        // salesInfo = await salesModel.aggregate([
        //     {
        //         $match: {
        //             employeeInfo: req.user._id
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'fbo_registers',
        //             localField: 'fboInfo',
        //             foreignField: '_id',
        //             as: 'fboInfo'
        //         },
        //     },
        //     {
        //         $unwind: "$fboInfo"
        //     },
        //     {
        //         $lookup: {
        //             from: 'bo_registers',
        //             localField: 'fboInfo.boInfo',
        //             foreignField: '_id',
        //             as: 'fboInfo.boInfo'
        //         },
        //     },
        //     {
        //         $unwind: "$fboInfo.boInfo"
        //     },
        //     // {
        //     //     $lookup: {
        //     //         from: 'staff_registers',
        //     //         localField: 'employeeInfo',
        //     //         foreignField: '_id',
        //     //         as: 'employeeInfo'
        //     //     }
        //     // },
        //     // {
        //     //     $unwind: "$employeeInfo"
        //     // },
        //     {
        //         $group: {
        //             _id: "$_id",
        //             product_name: {
        //                 $first: "$product_name"
        //             },
        //             payment_mode: {
        //                 $first: "$payment_mode"
        //             },
        //             checkStatus: {
        //                 $first: "$checkStatus"
        //             },
        //             grand_total: {
        //                 $first: "$grand_total"
        //             },
        //             invoiceId: {
        //                 $first: "$invoiceId"
        //             },
        //             createdAt: {
        //                 $first: "$createdAt"
        //             },
        //             updatedAt: {
        //                 $first: "$updatedAt"
        //             },
        //             fostacInfo: {
        //                 $first: "$fostacInfo"
        //             },
        //             foscosInfo: {
        //                 $first: "$foscosInfo"
        //             },
        //             hraInfo: {
        //                 $first: "$hraInfo"
        //             },
        //             fboInfo: {
        //                 $first: {
        //                     fbo_name: "$fboInfo.fbo_name",
        //                     owner_name: "$fboInfo.owner_name",
        //                     customer_id: "$fboInfo.customer_id",
        //                     state: "$fboInfo.state",
        //                     district: "$fboInfo.district",
        //                     _id: "$fboInfo._id",
        //                     createdAt: "$fboInfo.createdAt",
        //                     business_type: "$fboInfo.business_type",
        //                     gst_number: "$fboInfo.gst_number",
        //                     address: "$fboInfo.address",
        //                     email: "$fboInfo.email",
        //                     owner_contact: "$fboInfo.owner_contact",
        //                     pincode: "$fboInfo.pincode",
        //                     village: "$fboInfo.village",
        //                     tehsil: "$fboInfo.tehsil",
        //                     boInfo: {
        //                         _id: "$fboInfo.boInfo._id",
        //                         customer_id: "$fboInfo.boInfo.customer_id",
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // ]);

        return res.status(200).json({ salesInfo });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getTicketsDocs = async (req, res) => {
    try {

        const salesId = req.params._id;
        const recipients = await recipientModel.aggregate([
            {
                $match: {
                    salesInfo: salesId
                }
            },
            {
                $lookup: {
                    from: 'ticket_deliveries',
                    foreignField: 'recipientInfo',
                    localField: '_id',
                    as: "ticket"
                }
            },
            {
                $unwind: "$ticket"
            },
            {
                $group: {
                    _id: "$salesInfo",
                    cerificates: {
                        $push: "$ticket.certificate"
                    }
                }
            }
        ]);

        return res.status(200).json(recipients)

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
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
