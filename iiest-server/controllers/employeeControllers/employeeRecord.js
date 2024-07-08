const { fostacRevenue, foscosRevenue, hraRevenue, medicalRevenue, waterTestRevenue } = require('../../config/pipeline');
const salesModel = require('../../models/employeeModels/employeeSalesSchema');
const employeeSchema = require('../../models/employeeModels/employeeSchema');
const reportingManagerModel = require('../../models/employeeModels/reportingManagerSchema');
const { recipientModel } = require('../../models/fboModels/recipientSchema');
const { recipientsList } = require('../fboControllers/recipient');

exports.employeeRecord = async (req, res) => { //function for getting data about total, pending and approved sales related to sales officer  
    try {
        const todayDate = new Date(); // getting today's date string
        const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()); //getting time of start of the day
        const startOfThisWeek = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - todayDate.getDay());//getting time of start of this weeek
        const startOfPrevMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);//getting time of start of prev month
        const startOfThisMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);//getting time of start of this month
        const startOfThisFinancialYear = new Date(todayDate.getFullYear(), 3, 1); //getting time of start of this year

        const pipeLineArr = [ // creating pipeline array for performing aggregation on sales model and getting data in required format
            {
                $lookup: { //getting info about fbo from fbo registetrs by the help of foreign key match 
                    from: 'fbo_registers', // The collection name where fboInfo is stored
                    localField: 'fboInfo',
                    foreignField: '_id',
                    as: 'fboInfo'
                }
            },
            {
                $unwind: "$fboInfo" //unwinding fboInfo because data comes in array format
            },
            {
                $group: { //grouping data for total, approved and pending sales ammount
                    _id: 3,
                    totalProcessingAmount: { //aggregating total sales amount
                        $sum: {
                            $sum: [
                                ...fostacRevenue, //getting fostac revenue formula pipeline from pipeline.js
                                ...foscosRevenue, //getting foscos revenue formula pipeline from pipeline.js
                                ...hraRevenue, //getting HRA revenue formula pipeline from pipeline.js
                                ...medicalRevenue, //getting Medical revenue formula pipeline from pipeline.js
                                ...waterTestRevenue, //getting Water Test revenue formula pipeline from pipeline.js
                            ]
                        }
                    },
                    pending: { //grouping data pending sales ammount 
                        $sum: {
                            $cond: { //filtering only those data which contain cheque data and cheque_data.status is equal to Pending
                                if: {
                                    $or: [
                                        // Condition 1: cheque_data exists and cheque_data.status is "Pending"
                                        {
                                            $and: [
                                                { $ne: ["$cheque_data", null] }, // cheque_data exists
                                                { $eq: ["$cheque_data.status", "Pending"] } // cheque_data.status is "Pending"
                                            ]
                                        },
                                        // Condition 2: isBasicDocUploaded is false
                                        { $eq: ["$fboInfo.isBasicDocUploaded", false] }
                                    ]
                                }, then: {
                                    $sum: [ //the sum is same as for total sale only the filtering condition is changed 
                                        ...fostacRevenue, //getting fostac revenue formula pipeline from pipeline.js
                                        ...foscosRevenue, //getting foscos revenue formula pipeline from pipeline.js
                                        ...hraRevenue, //getting HRA revenue formula pipeline from pipeline.js
                                        ...medicalRevenue, //getting Medical revenue formula pipeline from pipeline.js
                                        ...waterTestRevenue, //getting Water Test revenue formula pipeline from pipeline.js
                                    ]
                                }, else: 0
                            }
                        }
                    },
                    approved: { //grouping data approved sales ammount 
                        $sum: {
                            $cond: { //filtering only those data which does not contains cheque data and if contains it's status should be approved and the basic doc uploaded var should be true 
                                if: {
                                    $and: [
                                        {
                                            $or: [
                                                { $eq: [{ $ifNull: ["$cheque_data", null] }, null] }, // Check if cheque_data is null or doesn't exist
                                                { $eq: [{ $ifNull: ["$cheque_data.status", null] }, "Approved"] } // Check if cheque_data.status is "Approved"
                                            ]
                                        },
                                        { $eq: ["$fboInfo.isBasicDocUploaded", true] }
                                    ]
                                }, then: {
                                    $sum: [ //the some is same as for total sale only the filtering condition is changed 
                                        ...fostacRevenue, //getting fostac revenue formula pipeline from pipeline.js
                                        ...foscosRevenue, //getting foscos revenue formula pipeline from pipeline.js
                                        ...hraRevenue, //getting HRA revenue formula pipeline from pipeline.js
                                        ...medicalRevenue, //getting Medical revenue formula pipeline from pipeline.js
                                        ...waterTestRevenue, //getting Water Test revenue formula pipeline from pipeline.js
                                    ]
                                }, else: 0
                            }
                        }
                    }

                }
            }
        ];


        const pipeline = [ //pipeline for aggregation 
            {
                $facet: { // we will use facet for aggregate sales data according to above pipeline arr for diffrent time lines
                    today: [ //filltering only those data which are created after start of today
                        {
                            $match: {
                                createdAt: { $gte: startOfToday },
                            }
                        },
                        ...pipeLineArr
                    ],
                    this_week: [  //filltering only those data which are created after start of this week
                        {
                            $match: {
                                createdAt: { $gte: startOfThisWeek },
                            }
                        },
                        ...pipeLineArr
                    ],
                    this_month: [  //filetering only those data which are created after start of this month
                        {
                            $match: {
                                createdAt: { $gte: startOfThisMonth },
                            }
                        },
                        ...pipeLineArr
                    ],
                    prev_month: [  //filetering only those data which are created after start of prev month before start of current month
                        {
                            $match: {
                                createdAt: { $gte: startOfPrevMonth, $lt: startOfThisMonth },
                            }
                        },
                        ...pipeLineArr
                    ],
                    this_year: [  //filetering only those data which are created after start of this year
                        {
                            $match: {
                                createdAt: { $gte: startOfThisFinancialYear },
                            }
                        },
                        ...pipeLineArr
                    ],
                    till_now: [  //filetering only those data which are created till now
                        ...pipeLineArr
                    ],
                }
            }
        ];

        if (req.user.designation !== 'Director') { //getting only data related only related to user in case of user is not director
            pipeline.unshift({
                $match: {
                    employeeInfo: req.user._id,
                }
            });
        }

        const data = await salesModel.aggregate(pipeline); //performing aggregation

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


exports.ticketVerificationData = async (req, res) => { //function for getting data about all of the ticket completed(verified) by a verifier
    try {

        const todayDate = new Date(); // getting today's date string
        const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()); //getting time of start of the day
        const startOfThisWeek = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - todayDate.getDay());//getting time of start of this weeek
        const startOfPrevMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);//getting time of start of prev month
        const startOfThisMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);//getting time of start of this month
        const startOfThisFinancialYear = new Date(todayDate.getFullYear(), 3, 1); //getting time of start of this year

        const pipeLineArr = [
            {
                $lookup: {
                    from: 'recipientdetails',
                    localField: '_id',
                    foreignField: 'salesInfo',
                    as: 'recps'
                }
            },
            {
                $lookup: {
                    from: 'shopdetails',
                    localField: '_id',
                    foreignField: 'salesInfo',
                    as: 'shops'
                }
            },
            {
                $addFields: {
                    shopsSize: { $size: '$shops' },
                }
            },
            {
                $unwind: {
                    path: '$recps',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'fostac_verifications',
                    localField: 'recps._id',
                    foreignField: 'recipientinfo',
                    as: 'recps.verificationInfo'
                }
            },
            {
                $unwind: {
                    path: '$shops',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'foscos_verifications',
                    localField: 'shops._id',
                    foreignField: 'shopInfo',
                    as: 'shops.foscosVerificationInfo'
                }
            },
            {
                $lookup: {
                    from: 'hra_verifications',
                    localField: 'shops._id',
                    foreignField: 'shopInfo',
                    as: 'shops.hraVerificationInfo'
                }
            },
            // {
            //     $match: {
            //         "recp.verificationInfo.operatorInfo": req.user._id
            //     }
            // },
            {
                $group: {
                    _id: '$_id',
                    recps: { $push: '$recps' },
                    foscosShops: {
                        $push: {
                            $cond: {
                                if: { $eq: ['$shops.product_name', 'Foscos'] },
                                then: "$shops",
                                else: null
                            }
                        }
                    },
                    hraShops: {
                        $push: {
                            $cond: {
                                if: { $eq: ['$shops.product_name', 'HRA'] },
                                then: "$shops",
                                else: null
                            }
                        }
                    },
                    fostacInfo: { $first: '$fostacInfo' },
                    foscosInfo: { $first: '$foscosInfo' },
                    hraInfo: { $first: '$hraInfo' }
                }
            },
            {
                $group: {
                    _id: null, // or group by some other field if needed
                    totalTickets: {
                        $sum: {
                            $sum: [
                                { //getting total fostac recp in this sale
                                    $toInt: { $ifNull: ["$fostacInfo.recipient_no", 0] },
                                },
                                {//getting total focos shop in tjis sale
                                    $toInt: { $ifNull: ["$foscosInfo.shops_no", 0] }
                                },
                                {//getting total hra shop in tjis sale
                                    $toInt: { $ifNull: ["$hraInfo.shops_no", 0] }
                                },
                                0
                            ]
                        }
                    },
                    completed: {
                        $sum: {
                            $sum: [
                                {
                                    $cond: [
                                        { $ifNull: ['$fostacInfo', false] },
                                        {
                                            $size: {
                                                $filter: {
                                                    input: '$recps',
                                                    as: 'recp',
                                                    cond: { $gt: [{ $size: '$$recp.verificationInfo' }, 0] }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                {
                                    $cond: [
                                        { $ifNull: ['$foscosInfo', false] },
                                        {
                                            $size: {
                                                $filter: {
                                                    input: '$foscosShops',
                                                    as: 'shop',
                                                    cond: { $ne: ['$$shop', null] }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                {
                                    $cond: [
                                        { $ifNull: ['$hraInfo', false] },
                                        {
                                            $size: {
                                                $filter: {
                                                    input: '$hraShops',
                                                    as: 'shop',
                                                    cond: { $ne: ['$$shop', null] }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                0
                            ]
                        }
                    },
                    pending: {
                        $sum: {
                            $sum: [
                                {
                                    $cond: [
                                        { $ifNull: ['$fostacInfo', false] },
                                        {
                                            $size: {
                                                $filter: {
                                                    input: '$recps',
                                                    as: 'recp',
                                                    cond: { $eq: [{ $size: '$$recp.verificationInfo' }, 0] }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                {
                                    $cond: [
                                        { $ifNull: ['$foscosInfo', false] },
                                        {
                                            $size: {
                                                $filter: {
                                                    input: '$foscosShops',
                                                    as: 'shop',
                                                    cond: { $eq: ['$$shop', null] }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                {
                                    $cond: [
                                        { $ifNull: ['$hraInfo', false] },
                                        {
                                            $size: {
                                                $filter: {
                                                    input: '$hraShops',
                                                    as: 'shop',
                                                    cond: { $eq: ['$$shop', null] }
                                                }
                                            }
                                        },
                                        0
                                    ]
                                },
                                0
                            ]
                        }
                    },

                }
            }
        ];// creating pipeline array for performing aggregation on sales and getting data in required format

        const pipeline = [ //pipeline for aggregation 
            {
                $facet: { // we will use facet for aggregate sales data according to above pipeline arr for diffrent time lines
                    today: [ //filltering only those data which are created after start of today
                        {
                            $match: {
                                createdAt: { $gte: startOfToday },
                            }
                        },
                        ...pipeLineArr
                    ],
                    this_week: [  //filltering only those data which are created after start of this week
                        {
                            $match: {
                                createdAt: { $gte: startOfThisWeek },
                            }
                        },
                        ...pipeLineArr
                    ],
                    this_month: [  //filetering only those data which are created after start of this month
                        {
                            $match: {
                                createdAt: { $gte: startOfThisMonth },
                            }
                        },
                        ...pipeLineArr
                    ],
                    prev_month: [  //filetering only those data which are created after start of prev month before start of current month
                        {
                            $match: {
                                createdAt: { $gte: startOfPrevMonth, $lt: startOfThisMonth },
                            }
                        },
                        ...pipeLineArr
                    ],
                    this_year: [  //filetering only those data which are created after start of this year
                        {
                            $match: {
                                createdAt: { $gte: startOfThisFinancialYear },
                            }
                        },
                        ...pipeLineArr
                    ],
                    till_now: [  //filetering only those data which are created till now
                        ...pipeLineArr
                    ],
                }
            }
        ];


        const ticketData = await salesModel.aggregate(pipeline);

        res.status(200).json(ticketData)

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}


exports.employeeSalesData = async (req, res) => {
    try {
        let salesInfo;
        if (req.user.designation === 'Director') {
            salesInfo = await salesModel.aggregate([
                {
                    $lookup: {
                        from: 'fbo_registers', // The collection name where fboInfo is stored
                        localField: 'fboInfo',
                        foreignField: '_id',
                        as: 'fboInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$fboInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'bo_registers', // The collection name where boInfo is stored
                        localField: 'fboInfo.boInfo',
                        foreignField: '_id',
                        as: 'fboInfo.boInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$fboInfo.boInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $lookup: {
                        from: 'staff_registers', // The collection name where employeeInfo is stored
                        localField: 'employeeInfo',
                        foreignField: '_id',
                        as: 'employeeInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$employeeInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'documents', // The collection name where fboInfo is stored
                        localField: 'fboInfo.customer_id',
                        foreignField: 'handlerId',
                        as: 'docs'
                    }
                },
                {
                    $project: {
                        "_id": 1,
                        "grand_total": 1,
                        "checkStatus": 1,
                        "fboInfo.fbo_name": 1,
                        "fboInfo.owner_name": 1,
                        "fboInfo.email": 1,
                        "fboInfo.owner_contact": 1,
                        "fboInfo.customer_id": 1,
                        "fboInfo.boInfo.customer_id": 1,
                        "fboInfo.boInfo.manager_name": 1,
                        "fboInfo.boInfo.business_entity": 1,
                        "fboInfo.boInfo.business_category": 1,
                        "fboInfo.boInfo.business_ownership_type": 1,
                        "product_name": 1,
                        "fboInfo.state": 1,
                        "fboInfo.address": 1,
                        "fboInfo.pincode": 1,
                        "fboInfo.village": 1,
                        "fboInfo.tehsil": 1,
                        "fboInfo.district": 1,
                        "fboInfo.business_type": 1,
                        "fboInfo.gst_number": 1,
                        "fboInfo.isBasicDocUploaded": 1,
                        "fboInfo.activeStatus": 1,
                        "employeeInfo.employee_name": 1,
                        "fostacInfo": 1,
                        "foscosInfo": 1,
                        "hraInfo": 1,
                        "medicalInfo": 1,
                        "waterTestInfo": 1,
                        "createdAt": 1,
                        "cheque_data": 1,
                        "docs": 1,
                        "InvoiceId": 1,
                        "payment_mode": 1,
                    }
                }

            ]);
        } else if (req.user.designation === 'Verifier') {
            salesInfo = await salesModel.aggregate([
                {
                    $lookup: {
                        from: 'fbo_registers', // The collection name where fboInfo is stored
                        localField: 'fboInfo',
                        foreignField: '_id',
                        as: 'fboInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$fboInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'bo_registers', // The collection name where boInfo is stored
                        localField: 'fboInfo.boInfo',
                        foreignField: '_id',
                        as: 'fboInfo.boInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$fboInfo.boInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $lookup: {
                        from: 'staff_registers', // The collection name where employeeInfo is stored
                        localField: 'employeeInfo',
                        foreignField: '_id',
                        as: 'employeeInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$employeeInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'documents', // The collection name where fboInfo is stored
                        localField: 'fboInfo.customer_id',
                        foreignField: 'handlerId',
                        as: 'docs'
                    }
                },
                {
                    $project: {
                        "_id": 1,
                        "grand_total": 1,
                        "checkStatus": 1,
                        "fboInfo.fbo_name": 1,
                        "fboInfo.owner_name": 1,
                        "fboInfo.email": 1,
                        "fboInfo.owner_contact": 1,
                        "fboInfo.customer_id": 1,
                        "fboInfo.boInfo.customer_id": 1,
                        "fboInfo.boInfo.business_entity": 1,
                        "fboInfo.boInfo.manager_name": 1,
                        "fboInfo.boInfo.business_category": 1,
                        "fboInfo.boInfo.business_ownership_type": 1,
                        "product_name": 1,
                        "fboInfo.state": 1,
                        "fboInfo.address": 1,
                        "fboInfo.pincode": 1,
                        "fboInfo.village": 1,
                        "fboInfo.tehsil": 1,
                        "fboInfo.district": 1,
                        "fboInfo.business_type": 1,
                        "fboInfo.gst_number": 1,
                        "fboInfo.isBasicDocUploaded": 1,
                        "fboInfo.activeStatus": 1,
                        "employeeInfo.employee_name": 1,
                        "fostacInfo": 1,
                        "foscosInfo": 1,
                        "hraInfo": 1,
                        "medicalInfo": 1,
                        "waterTestInfo": 1,
                        "createdAt": 1,
                        "cheque_data": 1,
                        "docs": 1,
                        "InvoiceId": 1,
                        "payment_mode": 1,
                    }
                }

            ]);
        }
        else {
            salesInfo = await salesModel.aggregate([
                {
                    $match: {
                        employeeInfo: req.user._id
                    }
                },
                {
                    $lookup: {
                        from: 'fbo_registers', // The collection name where fboInfo is stored
                        localField: 'fboInfo',
                        foreignField: '_id',
                        as: 'fboInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$fboInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'bo_registers', // The collection name where boInfo is stored
                        localField: 'fboInfo.boInfo',
                        foreignField: '_id',
                        as: 'fboInfo.boInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$fboInfo.boInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $lookup: {
                        from: 'staff_registers', // The collection name where employeeInfo is stored
                        localField: 'employeeInfo',
                        foreignField: '_id',
                        as: 'employeeInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$employeeInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'documents', // The collection name where fboInfo is stored
                        localField: 'fboInfo.customer_id',
                        foreignField: 'handlerId',
                        as: 'docs'
                    }
                },
                {
                    $project: {
                        "_id": 1,
                        "grand_total": 1,
                        "checkStatus": 1,
                        "fboInfo.fbo_name": 1,
                        "fboInfo.owner_name": 1,
                        "fboInfo.email": 1,
                        "fboInfo.owner_contact": 1,
                        "fboInfo.customer_id": 1,
                        "fboInfo.boInfo.customer_id": 1,
                        "fboInfo.boInfo.business_entity": 1,
                        "fboInfo.boInfo.manager_name": 1,
                        "fboInfo.boInfo.business_category": 1,
                        "fboInfo.boInfo.business_ownership_type": 1,
                        "product_name": 1,
                        "fboInfo.state": 1,
                        "fboInfo.address": 1,
                        "fboInfo.pincode": 1,
                        "fboInfo.village": 1,
                        "fboInfo.tehsil": 1,
                        "fboInfo.district": 1,
                        "fboInfo.business_type": 1,
                        "fboInfo.gst_number": 1,
                        "fboInfo.isBasicDocUploaded": 1,
                        "fboInfo.activeStatus": 1,
                        "employeeInfo.employee_name": 1,
                        "fostacInfo": 1,
                        "foscosInfo": 1,
                        "hraInfo": 1,
                        "medicalInfo": 1,
                        "waterTestInfo": 1,
                        "createdAt": 1,
                        "cheque_data": 1,
                        "docs": 1,
                        "InvoiceId": 1,
                        "payment_mode": 1,
                    }
                }

            ]);
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
