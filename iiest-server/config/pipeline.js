//this file contains all the general pipelines for aggregation

// ----------------------------------------------------- vars related to pielines  -------------------------------------------------------



//var for timelines usually used in getting for a particular time Interval
const todayDate = new Date(); // getting today's date string
const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()); //getting time of start of the day
const startOfThisWeek = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - todayDate.getDay());//getting time of start of this weeek
const startOfPrevMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);//getting time of start of prev month
const startOfThisMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);//getting time of start of this month
const startOfThisFinancialYear = new Date(todayDate.getFullYear(), 3, 1); //getting time of start of this year








// =================================================================================PIPE LINES======================================================================================



//pipeline for calculating fotac Revenue 
//It follows the formula of revenue = (fostac processing amount * no. of recps) in that sale
const fostacRevenue = [
    {
        $multiply: [
            { $toInt: { $ifNull: ["$fostacInfo.fostac_processing_amount", 0] } },
            { $toInt: { $ifNull: ["$fostacInfo.recipient_no", 0] } },
        ]
    },
];




//pipeline for calculating foscos Revenue 
//It follows the formula of revenue = (foscos processing amount * no. of shops + water test amount in foscos - 1500(only in case of water test fee with foscos != 0)) in that sale
const foscosRevenue = [
    {
        $sum: [
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
                            { $ne: [{ $type: '$foscosInfo' }, 'missing'] },
                            { $ne: [{ $toInt: "$foscosInfo.water_test_fee" }, 0] }
                        ]
                    },
                    -1200,
                    0
                ]
            },
        ]
    }
];






//pipeline for calculating hra Revenue 
//It follows the formula of revenue = (HRA processing amount * no. of shops) in that sale
const hraRevenue = [
    {
        $multiply: [
            { $toInt: { $ifNull: ["$hraInfo.hra_processing_amount", 0] } },
            { $toInt: { $ifNull: ["$hraInfo.shops_no", 0] } },
        ]
    },
];





//pipeline for calculating medical Revenue 
//It follows the formula of revenue = ((Medical processing amount - 250) * no. of Recipients) in that sale
//Here 250 is the medical fees we pays to doctor so we are not counting that in revenue
const medicalRevenue = [
    {
        $multiply: [
            {
                $sum: [
                    { $toInt: { $ifNull: ["$medicalInfo.medical_processing_amount", 0] } },
                    -250
                ]
            },
            { $toInt: { $ifNull: ["$medicalInfo.recipient_no", 0] } },
        ]
    }
];





//pipeline for calculating water test Revenue 
//It follows the formula of revenue = ((Medical processing amount excludes 1000 in case water test service name is "Non NABL"
//excludes 1500 in case water test service name is "NABL" ) in that sale
const waterTestRevenue = [
    {
        $sum: [
            { $toInt: { $ifNull: ["$waterTestInfo.water_test_processing_amount", 0] } },
            {
                $cond: [
                    { $eq: ["$waterTestInfo.water_test_service_name", "NABL"] },
                    -1500,  // Value to add if water_test_service_name is 'NABL'
                    0
                ]
            },
            {
                $cond: [
                    { $eq: ["$waterTestInfo.water_test_service_name", "Non NABL"] },
                    -1000,  // Value to add if water_test_service_name is 'Non NABL'
                    0
                ]

            }
        ]
    }
]


//pipeline for limiting the admin sales data
const limitAdminSalePipeline = [
    {
        $match: {
            "employeeInfo.employee_name": {
                $not: {
                    $regex: "admin",
                    $options: "i"
                }
            }
        }
    }
]


//------------------------------------------------------Conditionl Pipelines----------------------------------------------------------------------


//Pending Sales condition
const salesPendingCond = [
    {
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
    }
]


//Approved Sales condition
const salesApprovalCond = [
    {
        $and: [
            {
                $or: [
                    { $eq: [{ $ifNull: ["$cheque_data", null] }, null] }, // Check if cheque_data is null or doesn't exist
                    { $eq: [{ $ifNull: ["$cheque_data.status", null] }, "Approved"] } // Check if cheque_data.status is "Approved"
                ]
            },
            { $eq: ["$fboInfo.isBasicDocUploaded", true] }
        ]
    }
]

module.exports = { startOfToday, startOfThisWeek, startOfThisMonth, startOfPrevMonth, startOfThisFinancialYear, fostacRevenue, foscosRevenue, hraRevenue, medicalRevenue, waterTestRevenue, salesPendingCond, salesApprovalCond, limitAdminSalePipeline }