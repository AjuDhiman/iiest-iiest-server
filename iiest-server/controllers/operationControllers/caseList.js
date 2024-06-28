const { recipientModel, shopModel, hygieneShopModel } = require('../../models/fboModels/recipientSchema');
const employeeSchema = require('../../models/employeeModels/employeeSchema');

exports.caseList = async (req, res) => {
    try {

        const employeePanel = req.user.panel_type;

        let list = {};

        if (employeePanel === 'Foscos Panel' || employeePanel === 'Verifier Panel') {

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
                        foreignField: '_id', // Adjust this according to the actual foreign key in salesInfo
                        as: 'salesInfo'
                    }
                },
                {
                    $unwind: '$salesInfo'
                },
                {
                    $lookup: {
                        from: 'staff_registers', // The name of the employee collection
                        localField: 'salesInfo.employeeInfo', // Adjust this according to the actual field in salesInfo
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
                        localField: 'salesInfo.fboInfo', // Adjust this according to the actual field in salesInfo
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
                        localField: 'salesInfo.fboInfo.boInfo', // Adjust this according to the actual field in fboInfo
                        foreignField: '_id',
                        as: 'salesInfo.fboInfo.boInfo'
                    }
                },
                {
                   $unwind: '$salesInfo.fboInfo.boInfo'
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
                        from: 'foscos_verifications', 
                        localField: '_id',
                        foreignField: 'shopInfo',
                        as: 'verificationInfo'
                    }
                },
                // {
                //    $unwind: '$verificationInfo'
                // },
                {
                    $sort: { 
                        'salesInfo.createdAt': -1 
                    }
                }
            ]).exec();
            

        } 
        if (employeePanel === 'Fostac Panel' || employeePanel === 'FSSAI Training Panel' || employeePanel === 'Verifier Panel') {

            list['Fostac']= await recipientModel.aggregate([
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
                        from: 'fostac_verifications',
                        localField: '_id',
                        foreignField: 'recipientInfo',
                        as: 'verificationInfo'
                    }
                },
                {
                    $sort: { 
                        'salesInfo.createdAt': -1 
                    }
                }
            ]).exec();
            

        } ;
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