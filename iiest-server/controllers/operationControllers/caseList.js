const { recipientModel, shopModel, hygieneShopModel } = require('../../models/fboModels/recipientSchema');
const employeeSchema = require('../../models/employeeModels/employeeSchema');
const salesModel = require('../../models/employeeModels/employeeSalesSchema');

exports.caseList = async (req, res) => {  //api for getting case list data to be shown for opeartion wing
    try {

        const employeePanel = req.user.panel_type; //getting panel type of user by the help of middleware

        let list = {}; //creating an empty object

        if (employeePanel === 'Foscos Panel' || employeePanel === 'Verifier Panel') { //assigning foscosdata to foscos property of list in case of foscos panel or verifer panel

            list['Foscos'] = await shopModel.aggregate([
                {
                    $match: {
                        product_name: 'Foscos'
                    }
                },
                {
                    $lookup: {
                        from: 'employee_sales', // The name of the salesInfo collection
                        localField: 'salesInfo',
                        foreignField: '_id', 
                        as: 'salesInfo'
                    }
                },
                {
                    $unwind: '$salesInfo'
                },
                {
                    $lookup: {
                        from: 'staff_registers', // The name of the employee collection
                        localField: 'salesInfo.employeeInfo',
                        foreignField: '_id',
                        as: 'salesInfo.employeeInfo'
                    }
                },
                {
                    $unwind: '$salesInfo.employeeInfo'
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
                    $unwind: '$salesInfo.fboInfo'
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
                    $unwind: '$salesInfo.fboInfo.boInfo'
                },
                {
                    $lookup: {
                        from: 'documents',  // The name of the documents collection
                        localField: 'salesInfo.fboInfo.customer_id',
                        foreignField: 'handlerId',
                        as: 'salesInfo.docs'
                    }
                },
                {
                    $lookup: {
                        from: 'foscos_verifications',  // The name of the verification collection
                        localField: '_id',
                        foreignField: 'shopInfo',
                        as: 'verificationInfo'
                    }
                },
                {
                    $sort: {
                        'salesInfo.createdAt': -1
                    }
                },
                // {
                //     $project: { //only showing nessesory fields
                //         "_id": 1,
                //         "name": 1,
                //         "phoneNo": 1,
                //         "shopId": 1,
                //         "createdAt": 1,
                //         "managerName": 1,
                //         "product_name": 1,
                //         "address": 1,
                //         "pincode": 1,
                //         "state": 1,
                //         "district": 1,
                //         "village": 1,
                //         "tehsil": 1,
                //         "updatedAt": 1,
                //         "verificationInfo": 1,
                //         "salesInfo._id": 1,
                //         "salesInfo.fboInfo._id": 1,
                //         "salesInfo.fboInfo.fbo_name": 1,
                //         "salesInfo.fboInfo.owner_name": 1,
                //         "salesInfo.fboInfo.owner_contact": 1,
                //         "salesInfo.fboInfo.email": 1,
                //         "salesInfo.fboInfo.customer_id": 1,
                //         "salesInfo.fboInfo.state": 1,
                //         "salesInfo.fboInfo.district": 1,
                //         "salesInfo.fboInfo.pincode": 1,
                //         "salesInfo.fboInfo.village": 1,
                //         "salesInfo.fboInfo.tehsil": 1,
                //         "salesInfo.fboInfo.business_type": 1,
                //         "salesInfo.fboInfo.gst_number": 1,
                //         "salesInfo.fboInfo.boInfo._id": 1,
                //         "salesInfo.fboInfo.boInfo.business_entity": 1,
                //         "salesInfo.fboInfo.boInfo.customer_id": 1,
                //         "salesInfo.employeeInfo.employee_name": 1,
                //         "salesInfo.product_name": 1,
                //         "salesInfo.foscosInfo": 1,
                //         "salesInfo.fostacInfo": 1,
                //         "salesInfo.hraInfo": 1,
                //         "salesInfo.medicalInfo": 1,
                //         "salesInfo.waterTestInfo": 1,
                //         "salesInfo.payment_mode": 1,
                //         "salesInfo.cheque_data": 1,
                //         "salesInfo.InvoiceId": 1,
                //         "salesInfo.createdAt": 1,
                //         "salesInfo.updatedAt": 1,
                //     }
                // }
            ]).exec();


        }
        if (employeePanel === 'Fostac Panel' || employeePanel === 'FSSAI Training Panel' || employeePanel === 'Verifier Panel') { //assigning fotacdata to fostac property of list in case of foscos panel or verifer panel or fssai training panel

            list['Fostac'] = await salesModel.aggregate([
                {
                    $match: {
                        "fostacInfo": {
                            $exists: true
                        }
                    }
                },
                {
                    $sort: {
                        "createdAt": -1
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
                        "fboInfo._id": 1,
                        "fboInfo.owner_contact": 1,
                        "fboInfo.customer_id": 1,
                        "fboInfo.boInfo._id": 1,
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
                        "invoiceId": 1,
                        "payment_mode": 1,
                    }
                }

            ]);

        };
        if (employeePanel === 'HRA Panel' || employeePanel === 'Verifier Panel') {

            list['HRA'] = await shopModel.aggregate([
                {
                    $match: {
                        product_name: 'HRA'
                    }
                },
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
                        from: 'hra_verifications',
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


        }

        // } else if (employeePanel == 'Verifier Panel') { //show verifier all cases
        //     list = {}
        //     list['Foscos'] = await shopModel.find({})
        //         // .where('eBillImage')
        //         // .exists()
        //         .where('ownerPhoto')
        //         .exists()
        //         .where('shopPhoto')
        //         .exists()
        //         .where('aadharPhoto')
        //         .exists()
        //         .populate({
        //             path: 'salesInfo',
        //             populate: [{ path: 'employeeInfo', select: 'employee_name' }, { path: 'fboInfo', select: 'fbo_name owner_name owner_contact district state' }],
        //             select: 'product_name fostacInfo foscosInfo hraInfo createdAt'
        //         })
        //         .lean();

        //     list['Fostac'] = await recipientModel.find({})
        //         .populate({
        //             path: 'salesInfo',
        //             populate: [{ path: 'employeeInfo', select: 'employee_name' }, { path: 'fboInfo', select: 'fbo_name owner_name owner_contact district state' }],
        //             select: 'product_name fostacInfo foscosInfo hraInfo createdAt'
        //         })
        //         .select('name phoneNo employeeInfo.employee_name')
        //         .lean();

        //     list['HRA'] = await hygieneShopModel.find({})
        //         // .where('fostacCertificate')
        //         // .exists()
        //         // .where('foscosLicense')
        //         // .exists()
        //         .populate({
        //             path: 'salesInfo',
        //             populate: [{ path: 'employeeInfo', select: 'employee_name' }, { path: 'fboInfo', select: 'fbo_name owner_name owner_contact district state' }],
        //             select: 'product_name fostacInfo foscosInfo hraInfo createdAt'
        //         })
        //         .lean();

        // }

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

exports.caseInfo = async (req, res) => {
    try {

        let success = false;

        const recipientId = req.params.recipientid;

        const product = req.params.product;

        let recipientInfo;

        if (product === 'Fostac') {
            recipientInfo = await recipientModel.findById(recipientId);
        } else if (product === 'Foscos') {
            recipientInfo = await shopModel.findById(recipientId);
        } else if (product === 'HRA') {
            recipientInfo = await shopModel.findById(recipientId);
        }

        const moreInfo = await (await (await recipientInfo.populate('salesInfo')).populate(['salesInfo.employeeInfo', 'salesInfo.fboInfo'])).populate('salesInfo.fboInfo.boInfo');

        success = true;

        return res.status(200).json({ success, populatedInfo: moreInfo });

    } catch (error) {
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