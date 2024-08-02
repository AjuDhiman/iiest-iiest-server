const { doesFileExist, invoicesPath, deleteDocObject, uploadBuffer, coworkInvoicePath, getFileStream } = require("../../config/s3Bucket");
const invoiceDataHandler = require("../../fbo/generateInvoice");
const { sendInvoiceMail } = require("../../fbo/sendMail");
const salesModel = require("../../models/employeeModels/employeeSalesSchema");


//Methord for getting invoice list
exports.getInvoiceList = async (req, res) => {
    try {

        let success = false;

        const todayDate = new Date(); // getting today's date string
        const startOfNewPanel = new Date(2024, 5, 10); //getting time of start of this the new sales panel which is 10th of july 2024


        //getting invoice data by using sales modal by doinf some aggregation for getting the result we need
        const invoiceList = await salesModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfNewPanel },
                }
            },
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
                    "_id": "$_id",
                    "code": "$invoiceId.code",
                    "createdAt": "$createdAt",
                    "src": "$invoiceId.src",
                    "product": "$invoiceId.product",
                    "processing_amount": "$processing_amount",
                    "total_amount": "$total_amount",
                    "business_name": "$fboInfo.boInfo.business_entity",
                    "business_type": "$fboInfo.business_type",
                    "gst_number": "$fboInfo.gst_number",
                    "state": "$fboInfo.state",
                    "email": "$fboInfo.email"
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


//methord for recreating invoice
exports.reCreateInvoice = async (req, res) => {
    try {

        let success = false;

        const id = req.params.id
        const { product, invoiceCode, invoiceSrc } = req.body;

        // extracting sale
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

        //defining inital vars
        let processingAmt = 0;
        let extrafee = 0;
        let taxAmount = 0;
        let qty = 0;
        let totalAmount = 0;
        let productInfo;
        let uploadStream;

        //getting vars configuartion based on product
        if(product === 'Fostac') {
            
            processingAmt = sale.fostacInfo.fostac_processing_amount;
            taxAmount = Math.round(Number(processingAmt) * (18/100));
            qty = sale.fostacInfo.recipient_no;
            totalAmount = Number(processingAmt) + Number(taxAmount);
            productInfo = sale.fostacInfo;

        } else  if(product === 'Foscos') {

            processingAmt = sale.foscosInfo.foscos_processing_amount;
            taxAmount = Math.round(Number(processingAmt) * (18/100));
            qty = sale.foscosInfo.shops_no;
            totalAmount = Number(processingAmt) + Number(taxAmount);
            productInfo = sale.foscosInfo;

        } else  if(product === 'HRA') {

            processingAmt = sale.hraInfo.hra_processing_amount;
            taxAmount = Math.round(Number(processingAmt) * (18/100));
            qty = sale.hraInfo.shops_no;
            totalAmount = Number(processingAmt) + Number(taxAmount);
            productInfo = sale.hraInfo;

        } else  if(product === 'Medical') {

            processingAmt = sale.medicalInfo.medical_processing_amount;
            taxAmount = Math.round(Number(processingAmt) * (18/100));
            qty = sale.medicalInfo.recipient_no;
            totalAmount = sale.medicalInfo.medical_total;
            productInfo = sale.medicalInfo;

        } else  if(product === 'Water Test Report') {

            processingAmt = sale.waterTestInfo.water_test_processing_amount;
            taxAmount = Math.round(Number(processingAmt) * (18/100));
            qty = 1;
            totalAmount = sale.waterTestInfo.water_test_total;
            productInfo = sale.fostacInfo;

        }

        const invoice = await invoiceDataHandler(invoiceCode, sale.fboInfo.email, sale.fboInfo.fbo_name, sale.fboInfo.address, sale.fboInfo.state, sale.fboInfo.district,
            sale.fboInfo.pincode, sale.fboInfo.owner_contact, sale.fboInfo.email, processingAmt, extrafee, taxAmount, qty, sale.fboInfo.business_type,
            sale.fboInfo.gst_number, totalAmount, product, productInfo, sale.employeeInfo.signatureImage, uploadStream, sale.employeeInfo.employee_name,
            sale.fboInfo.customer_id, sale.fboInfo.boInfo
        );

        if (!invoice) {
            return res.status(401).json({ success: success, invoiceErr: true, message: 'Error in generating invoice' });
        }

        //deleting file from s3 if already exsists in s3
        const key = `${invoicesPath}/${invoiceSrc}`;
        const isExsists = await doesFileExist(key);

        if(isExsists) {
            await deleteDocObject(key);
        }

        const newInvoiceSrc = invoice.fileName;

        const newkey = `${invoicesPath}${newInvoiceSrc}`;

        console.log(newkey)

        //uploafing new invoice to s3
        const fileUploaded = await uploadBuffer(newkey, invoice.encodedString);

        // if(!fileUploaded){
        //     return res.status(401).json({success: success, invoiceUploadingErr: true, message: 'Invoice Uploading on S3 Error'})
        // }

        //change old invoice src to new invoice src and updating sale object

        const InvoiceArr = sale.invoiceId;

        InvoiceArr.forEach((a) => {
            if(a.product === product) {
                a.src = newInvoiceSrc;
            }
        });

        const saleObjUpdated = await salesModel.findByIdAndUpdate({_id: id}, {
            $set: {
                invoiceId: InvoiceArr
            }
        });

        if(!saleObjUpdated) {
            return res.status(401).json({success: success, saleUpdatingErr: true, message: 'Sale Updating Error'});
        }

        success = true;

        return res.status(200).json({ success, invoiceCreated: true });


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error', success: false })
    }
}

//methord for resending invoice 
exports.reSendInvoice = async(req, res) => {
    try {

        let success = false;

        const { invoiceSrc, email } = req.body;

        const key = `${invoicesPath}${invoiceSrc}`;

        //check if key exsists or not
        const isExists = await doesFileExist(key);

        if(!isExists) {
            return res.status(404).json({success: false, keyNotFoundErr: true, message: 'Invoice Does Not Exsists'});
        }

        //getting file stream
        const invoiceStream = await getFileStream(key);

        const chunks = [];

        invoiceStream.on('data', (chunk) => {
            chunks.push(chunk);
        });


        invoiceStream.on('error', (error) => {
            return res.status(401).json({message: 'Invoice Err', success: success, invoiceStreamErr: true});
        });

        invoiceStream.on('end', () => {
            const invoiceBuffer = Buffer.concat(chunks);

            //resending mail with invoice
            sendInvoiceMail(email, [{encodedString: invoiceBuffer, fileName: invoiceSrc}]); 

            success = true;

            return res.status(200).json({success: success, message:'Invoice Resend Successfully'});
        })

    } catch(error) {
        console.log(error);
        return res.status(500).json({success: false, message: 'Inernal Server Error'});
    }
}
