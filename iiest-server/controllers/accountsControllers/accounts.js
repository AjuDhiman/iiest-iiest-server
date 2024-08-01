const invoiceDataHandler = require("../../fbo/generateInvoice");
const salesModel = require("../../models/employeeModels/employeeSalesSchema");


//Methord for getting invoice list
exports.getInvoiceList = async (req, res) => {
    try {

        let success = false;

        //getting invoice data by using sales modal by doinf some aggregation for getting the result we need
        const invoiceList = await salesModel.aggregate([
            {
                $sort: {
                    "createdAt": -1 //sorting on the basis of creation date
                }
            },
            {
                $lookup: {
                    from: 'fbo_registers',
                    localField: 'fboInfo',
                    foreignField: '_id',
                    as: 'fboInfo'
                }
            },
            {
                $unwind: '$fboInfo'
            },
            {
                $lookup: {
                    from: 'bo_registers',
                    localField: 'fboInfo.boInfo',
                    foreignField: '_id',
                    as: 'fboInfo.boInfo'
                }
            },
            {
                $unwind: '$fboInfo.boInfo'
            },
            {
                $unwind: '$invoiceId' //unwinding the invoice id array so we can get diffrent object for all entry in the invoice id array of single object
            },
            {
                $addFields: {
                    //creating new field of processing amount total amount on the basis of product
                    processing_amount: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: ["$invoiceId.product", "Fostac"]
                                    },
                                    then: "$fostacInfo.fostac_processing_amount"
                                },
                                {
                                    case: {
                                        $eq: ["$invoiceId.product", "Foscos"]
                                    },
                                    then: "$foscosInfo.foscos_processing_amount"
                                },
                                {
                                    case: {
                                        $eq: ["$invoiceId.product", "HRA"]
                                    },
                                    then: "$hraInfo.hra_processing_amount"
                                },
                                {
                                    case: {
                                        $eq: ["$invoiceId.product", "Medical"]
                                    },
                                    then: "$medicalInfo.medical_processing_amount"
                                },
                                {
                                    case: {
                                        $eq: ["$invoiceId.product", "Water Test Report"]
                                    },
                                    then: "$waterTestInfo.water_test_processing_amount"
                                }
                            ],
                            default: ""
                        }
                    },
                    total_amount: {
                        $switch: {
                            branches: [
                                {
                                    case: {
                                        $eq: ["$invoiceId.product", "Fostac"]
                                    },
                                    then: "$fostacInfo.fostac_total"
                                },
                                {
                                    case: {
                                        $eq: ["$invoiceId.product", "Foscos"]
                                    },
                                    then: "$foscosInfo.foscos_total"
                                },
                                {
                                    case: {
                                        $eq: ["$invoiceId.product", "HRA"]
                                    },
                                    then: "$hraInfo.hra_total"
                                },
                                {
                                    case: {
                                        $eq: ["$invoiceId.product", "Medical"]
                                    },
                                    then: "$medicalInfo.medical_total"
                                },
                                {
                                    case: {
                                        $eq: ["$invoiceId.product", "Water Test Report"]
                                    },
                                    then: "$waterTestInfo.water_test_total"
                                }
                            ],
                            default: ""
                        }
                    }
                }
            },
            {
                $project: {
                    "code": "$invoiceId.code",
                    "createdAt": "$createdAt",
                    "src": "$invoiceId.src",
                    "product": "$invoiceId.product",
                    "processing_amount": "$processing_amount",
                    "total_amount": "$total_amount",
                    "business_name": "$fboInfo.boInfo.business_entity",
                    "business_type": "$fboInfo.business_type",
                    "gst_number": "$fboInfo.gst_number",
                    "state": "$fboInfo.state"
                }
            }
        ]);

        //if can fetch data then return the error response to the client
        if (!invoiceList) {
            return res.status(404).json({ success: success, fetchingError: true, message: 'Can\'t fetch from sales model' })
        }

        //if all works fine the we have success = true;
        success = true;

        return res.status(200).json({ success: success, invoiceList: invoiceList });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

exports.reCreateInvoice = async (req, res) => {
    try {

        let success = false;

        const id = req.params.id
        const { product, invoiceCode } = req.body;

        const sale = await salesModel.findOne({ _id: id }).populate([
            {
                path: 'employeeInfo'
            },
            {
                path: 'fboInfo', populate: {
                    path: 'boInfo'
                }
            }
        ]);

        return res.status(200).json({success , sale})



        const invoice = invoiceDataHandler()


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error', success: false })
    }
}