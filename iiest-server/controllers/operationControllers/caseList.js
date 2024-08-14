const { recipientModel, shopModel } = require('../../models/fboModels/recipientSchema');
const employeeSchema = require('../../models/employeeModels/employeeSchema');
const salesModel = require('../../models/employeeModels/employeeSalesSchema');
const areaAllocationModel = require('../../models/employeeModels/employeeAreaSchema');
const {MongoClient, ObjectId} = require('mongodb')

exports.caseList = async (req, res) => {  //api for getting case list data to be shown for opeartion wing
    try {

        const employeePanel = req.user.panel_type; //getting panel type of user by the help of middleware
        
        const employeeOId = new ObjectId(req.user._id.toString());

        //getting allocated area
        const allocatedArea = await areaAllocationModel.findOne({employeeInfo: employeeOId});

        if(!allocatedArea){
            return res.status(404).json({success: false, message: 'Area not allocated', locationArr: true});
        }

        const district = allocatedArea.district;

        let list = {}; //creating an empty object

            list = await shopModel.aggregate([
                {
                    $lookup: {
                        from: 'employee_sales',
                        localField: 'salesInfo',
                        foreignField: '_id',
                        as: 'salesInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$salesInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'staff_registers',
                        localField: 'salesInfo.employeeInfo',
                        foreignField: '_id',
                        as: 'salesInfo.employeeInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$salesInfo.employeeInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'fbo_registers',
                        localField: 'salesInfo.fboInfo',
                        foreignField: '_id',
                        as: 'salesInfo.fboInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$salesInfo.fboInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $match: {
                        district: { $in: district }
                    }
                },
                {
                    $lookup: {
                        from: 'bo_registers',
                        localField: 'salesInfo.fboInfo.boInfo',
                        foreignField: '_id',
                        as: 'salesInfo.fboInfo.boInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$salesInfo.fboInfo.boInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'documents',
                        localField: 'salesInfo.fboInfo.customer_id',
                        foreignField: 'handlerId',
                        as: 'salesInfo.docs'
                    }
                },
                {
                    $lookup: {
                        from: 'shop_verifications',
                        localField: '_id',
                        foreignField: 'shopInfo',
                        as: 'verificationInfo'
                    }
                },
                {
                    $sort: {
                        'salesInfo.createdAt': -1
                    }
                }
            ]).exec();


        // }

          //     list['HRA'] = await shopModel.aggregate([
        //         {
        //             $match: {
        //                 product_name: 'HRA'
        //             }
        //         },
        //         {
        //             $lookup: {
        //                 from: 'employee_sales',
        //                 localField: 'salesInfo',
        //                 foreignField: '_id',
        //                 as: 'salesInfo'
        //             }
        //         },
        //         {
        //             $unwind: {
        //                 path: '$salesInfo',
        //                 preserveNullAndEmptyArrays: true
        //             }
        //         },
        //         {
        //             $lookup: {
        //                 from: 'staff_registers',
        //                 localField: 'salesInfo.employeeInfo',
        //                 foreignField: '_id',
        //                 as: 'salesInfo.employeeInfo'
        //             }
        //         },
        //         {
        //             $unwind: {
        //                 path: '$salesInfo.employeeInfo',
        //                 preserveNullAndEmptyArrays: true
        //             }
        //         },
        //         {
        //             $lookup: {
        //                 from: 'fbo_registers',
        //                 localField: 'salesInfo.fboInfo',
        //                 foreignField: '_id',
        //                 as: 'salesInfo.fboInfo'
        //             }
        //         },
        //         {
        //             $unwind: {
        //                 path: '$salesInfo.fboInfo',
        //                 preserveNullAndEmptyArrays: true
        //             }
        //         },
        //         {
        //             $lookup: {
        //                 from: 'bo_registers',
        //                 localField: 'salesInfo.fboInfo.boInfo',
        //                 foreignField: '_id',
        //                 as: 'salesInfo.fboInfo.boInfo'
        //             }
        //         },
        //         {
        //             $unwind: {
        //                 path: '$salesInfo.fboInfo.boInfo',
        //                 preserveNullAndEmptyArrays: true
        //             }
        //         },
        //         {
        //             $lookup: {
        //                 from: 'documents',
        //                 localField: 'salesInfo.fboInfo.customer_id',
        //                 foreignField: 'handlerId',
        //                 as: 'salesInfo.docs'
        //             }
        //         },
        //         {
        //             $lookup: {
        //                 from: 'hra_verifications',
        //                 localField: '_id',
        //                 foreignField: 'shopInfo',
        //                 as: 'verificationInfo'
        //             }
        //         },
        //         {
        //             $sort: {
        //                 'salesInfo.createdAt': -1
        //             }
        //         }
        //     ]).exec();


        return res.status(200).json({ caseList: list })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getRecpList = async (req, res) => {
    try {

        const recpList = await recipientModel.aggregate([
                {
                    $lookup: {
                        from: 'employee_sales',  // The name of the salesInfo collection
                        localField: 'salesInfo',
                        foreignField: '_id',
                        as: 'salesInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$salesInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'staff_registers',  // The name of the employee collection
                        localField: 'salesInfo.employeeInfo',
                        foreignField: '_id',
                        as: 'salesInfo.employeeInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$salesInfo.employeeInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'fbo_registers', // The name of the fbo collection
                        localField: 'salesInfo.fboInfo',
                        foreignField: '_id',
                        as: 'salesInfo.fboInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$salesInfo.fboInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'bo_registers', // The name of the boInfo collection
                        localField: 'salesInfo.fboInfo.boInfo',
                        foreignField: '_id',
                        as: 'salesInfo.fboInfo.boInfo'
                    }
                },
                {
                    $unwind: {
                        path: '$salesInfo.fboInfo.boInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'documents', // The name of the documents collection
                        localField: 'salesInfo.fboInfo.customer_id',
                        foreignField: 'handlerId',
                        as: 'salesInfo.docs'
                    }
                },
                {
                    $lookup: {
                        from: 'fostac_verifications', // The name of the verification collection
                        localField: '_id',
                        foreignField: 'recipientInfo',
                        as: 'verificationInfo'
                    }
                },
                {
                    $sort: {
                        'salesInfo.createdAt': -1
                    }
                },
                {
                    $project: { //only showing nessesory fields
                        "_id": 1,
                        "name": 1,
                        "phoneNo": 1,
                        "recipientId": 1,
                        "createdAt": 1,
                        "aadharNo": 1,
                        "updatedAt": 1,
                        "verificationInfo": 1,
                        "salesInfo._id": 1,
                        "salesInfo.fboInfo._id": 1,
                        "salesInfo.fboInfo.fbo_name": 1,
                        "salesInfo.fboInfo.owner_name": 1,
                        "salesInfo.fboInfo.customer_id": 1,
                        "salesInfo.fboInfo.state": 1,
                        "salesInfo.fboInfo.district": 1,
                        "salesInfo.fboInfo.boInfo._id": 1,
                        "salesInfo.fboInfo.boInfo.customer_id": 1,
                        "salesInfo.employeeInfo.employee_name": 1,
                        "salesInfo.product_name": 1,
                        "salesInfo.InvoiceId": 1,
                        "salesInfo.fostacInfo": 1,
                        "salesInfo.createdAt": 1,
                        "salesInfo.updatedAt": 1,
                    }
                }
            ]).exec();

        res.status(200).json({recpList: recpList})

    } catch(error) {
        res.status(500).json({message: 'Inter Server Error'})
    }
}

//methord for getting info aboutthe shop for operation form
exports.caseInfo = async (req, res) => {
    try {

        let success = false;

        const candidateId = req.params.recipientid;

        const product = req.params.product;

        const recipientInfo = await shopModel.findOne({_id: candidateId});

        // if (product === 'Fostac') {
        //     recipientInfo = await recipientModel.findById(recipientId);
        // } else if (product === 'Foscos') {
        //     recipientInfo = await shopModel.findById(recipientId);
        // } else if (product === 'HRA') {
        //     recipientInfo = await shopModel.findById(recipientId);
        // }

        const moreInfo = await (await (await recipientInfo.populate('salesInfo')).populate(['salesInfo.employeeInfo', 'salesInfo.fboInfo'])).populate('salesInfo.fboInfo.boInfo');

        success = true;

        return res.status(200).json({ success, populatedInfo: moreInfo });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.employeeCountDeptWise = async (req, res) => {
    try {

        let success = true;

        const departmentName = req.params.dept;

        const employeeList = await employeeSchema.find({ department: departmentName });

        if (!employeeList) {
            success = false;
            return res.status(404).json({ success, randomErr: true });
        }

        return res.status(200).json({ success, employeeList });

    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}