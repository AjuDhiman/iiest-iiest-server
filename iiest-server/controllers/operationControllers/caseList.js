const { recipientModel, shopModel, hygieneShopModel } = require('../../models/fboModels/recipientSchema');
const employeeSchema = require('../../models/employeeModels/employeeSchema');

exports.caseList = async (req, res) => {
    try {

        const employeePanel = req.user.panel_type;

        let list;

        if (employeePanel === 'Foscos Panel') {

            list = await shopModel.find({})
                // .where('eBillImage')
                // .exists()
                .where('ownerPhoto')
                .exists()
                .where('shopPhoto')
                .exists()
                .where('aadharPhoto')
                .exists()
                .populate({
                    path: 'salesInfo',
                    populate: [{ path: 'employeeInfo', select: 'employee_name' }, { path: 'fboInfo', select: 'fbo_name owner_name owner_contact district state' }],
                    select: 'product_name fostacInfo foscosInfo hraInfo createdAt'
                })
                .lean();

        } else if (employeePanel === 'Fostac Panel' || employeePanel === 'FSSAI Training Panel') {

            list = await recipientModel.find({})
                .populate({
                    path: 'salesInfo',
                    populate: [{ path: 'employeeInfo', select: 'employee_name' }, { path: 'fboInfo', select: 'fbo_name owner_name owner_contact district state' }],
                    select: 'product_name fostacInfo foscosInfo hraInfo createdAt'
                })
                .select('name phoneNo employeeInfo.employee_name')
                .lean();

        } else if (employeePanel === 'HRA Panel') {

            list = await hygieneShopModel.find({})
                // .where('fostacCertificate')
                // .exists()
                // .where('foscosLicense')
                // .exists()
                .populate({
                    path: 'salesInfo',
                    populate: [{ path: 'employeeInfo', select: 'employee_name' }, { path: 'fboInfo', select: 'fbo_name owner_name owner_contact district state' }],
                    select: 'product_name fostacInfo foscosInfo hraInfo createdAt'
                })
                .lean();

        }

        return res.status(200).json({ caseList: list })

    } catch (error) {
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
            recipientInfo = await hygieneShopModel.findById(recipientId);
        }

        const moreInfo = await (await recipientInfo.populate('salesInfo')).populate(['salesInfo.employeeInfo', 'salesInfo.fboInfo']);

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