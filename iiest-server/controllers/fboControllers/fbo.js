const pastFboSchema = require('../../models/historyModels/pastFboSchema');
const { generatedInfo } = require('../../fbo/generateCredentials');
const invoiceDataHandler = require('../../fbo/generateInvoice');
const fboPaymentSchema = require('../../models/fboModels/fboPaymentSchema');
const fboModel = require('../../models/fboModels/fboSchema');
const salesModel = require('../../models/employeeModels/employeeSalesSchema');
const employeeSchema = require('../../models/employeeModels/employeeSchema');
const { ObjectId } = require('mongodb');
const { createInvoiceBucket, empSignBucket } = require('../../config/buckets');
const payRequest = require('../../fbo/phonePay');
const areaAllocationModel = require('../../models/employeeModels/employeeAreaSchema');
const sendInvoiceMail = require('../../fbo/sendMail');
const boModel = require('../../models/BoModels/boSchema');
const FRONT_END = JSON.parse(process.env.FRONT_END);
const BACK_END = JSON.parse(process.env.BACK_END);

exports.fboPayment = async (req, res) => {
  try {
    let success = false;

    const userInfo = await employeeSchema.findById(req.params.id);
    const signatureFile = userInfo.signatureImage;

    if (!signatureFile) {
      success = false;
      return res.status(404).json({ success, signatureErr: true });
    }
    const areaAlloted = await areaAllocationModel.findOne({ employeeInfo: req.params.id });

    if(req.user.employee_id != 'IIEST/FD/0176') {
      if (!areaAlloted) {
        success = false;
        return res.status(404).json({ success, areaAllocationErr: true })
      }
    }

    const signatureBucket = empSignBucket();

    const signExists = await signatureBucket.find({ "_id": new ObjectId(signatureFile) }).toArray();

    if (!signExists.length > 0) {
      return res.status(404).json({ success, noSignErr: true })
    }


    const formBody = req.body;
    const createrId = req.params.id
    req.session.fboFormData = { ...formBody, createrObjId: createrId, signatureFile };

    const pincodeCheck = areaAlloted.pincodes.includes(formBody.pincode);

    if(req.user.employee_id != 'IIEST/FD/0176') {
    if (!pincodeCheck) {
      success = false;
      return res.status(404).json({ success, wrongPincode: true });
    }
  }

    payRequest(formBody.grand_total, res, `${BACK_END.API_URL}/fbo-pay-return`);

  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

exports.fboPayReturn = async (req, res) => {
  try {

    console.log(11);

    if (req.body.code === 'PAYMENT_SUCCESS' && req.body.merchantId && req.body.transactionId && req.body.providerReferenceId) {
      if (req.body.transactionId) {

        let success = false;

        const fetchedFormData = req.session.fboFormData;

        const { fbo_name, owner_name, owner_contact, email, state, district, address, product_name, payment_mode, createdBy, grand_total, business_type, village, tehsil, pincode, fostac_training, foscos_training, hygiene_audit, gst_number, createrObjId, signatureFile, fostacGST, foscosGST, hygieneGST, foscosFixedCharge, boInfo } = fetchedFormData;

        const { idNumber, generatedCustomerId } = await generatedInfo();


        let serviceArr = [];

        if (fostac_training) {
          serviceArr.push(fostac_training.fostac_service_name);
        }

        if (foscos_training) {
          serviceArr.push(foscos_training.foscos_service_name);
        }

        if (hygiene_audit) {
          serviceArr.push(hygiene_audit.hra_service_name);
        }

        let total_processing_amount = 0;
        let totalGST = 0;
        let extraFee = 0;

        const invoiceData = [];
        let invoiceUploadStream;
        const invoiceIdArr = [];

        const invoiceBucket = createInvoiceBucket();

        let fileName;

        if (product_name.includes('Fostac')) {
          fileName = `${Date.now()}_${idNumber}.pdf`;
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

          total_processing_amount += Number(fostac_training.fostac_processing_amount);
          totalGST += fostacGST;

          const qty = fostac_training.recipient_no;
          invoiceData.push(await invoiceDataHandler(idNumber, email, fbo_name, address, owner_contact, email, total_processing_amount, extraFee, totalGST, qty, business_type, gst_number, fostac_training.fostac_total, 'Fostac', fostac_training, signatureFile, invoiceUploadStream));
        }

        if (product_name.includes('Foscos')) {
          fileName = `${Date.now()}_${idNumber}.pdf`;
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

          total_processing_amount += Number(foscos_training.foscos_processing_amount);
          totalGST += foscosGST;
          extraFee += foscosFixedCharge;

          const qty = foscos_training.shops_no;
          invoiceData.push(await invoiceDataHandler(idNumber, email, fbo_name, address, owner_contact, email, total_processing_amount, extraFee, totalGST, qty, business_type, gst_number, foscos_training.foscos_total, 'Foscos', foscos_training, signatureFile, invoiceUploadStream));
        }

        if (product_name.includes('HRA')) {
          fileName = `${Date.now()}_${idNumber}.pdf`;
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

          total_processing_amount += Number(hygiene_audit.hra_processing_amount);
          totalGST += hygieneGST;

          const qty = hygiene_audit.shops_no;
          invoiceData.push(await invoiceDataHandler(idNumber, email, fbo_name, address, owner_contact, email, total_processing_amount, extraFee, totalGST, qty, business_type, gst_number, hygiene_audit.hra_total, 'HRA', hygiene_audit, signatureFile, invoiceUploadStream));
        }

        const fboEntry = await fboModel.create({
          employeeInfo: createrObjId, id_num: idNumber, fbo_name, owner_name, owner_contact, email, state, district, address, product_name, customer_id: generatedCustomerId, payment_mode, createdBy, village, tehsil, pincode, business_type, gst_number, boInfo
        });

        if (!fboEntry) {
          return res.status(401).json({ success, message: "FBO entry not successful" })
        }

        const buyerData = await fboPaymentSchema.create({
          buyerId: fboEntry._id, merchantId: req.body.merchantId, merchantTransactionId: req.body.transactionId, providerReferenceId: req.body.providerReferenceId, amount: grand_total
        });

        if (!buyerData) {
          return res.status(401).json({ success, message: "Data not entered in payment collection" });
        }

        const selectedProductInfo = await salesModel.create({ employeeInfo: createrObjId, fboInfo: fboEntry._id, product_name, fostacInfo: fostac_training, foscosInfo: foscos_training, hraInfo: hygiene_audit, payment_mode, grand_total, invoiceId: invoiceIdArr });

        if (!selectedProductInfo) {
          return res.status(401).json({ success, message: "Data not entered in employee_sales collection" });
        }

        req.session.destroy((err) => {
          if (err) {
            console.log(console.log(err));
          }
        })

        res.redirect(`${FRONT_END.VIEW_URL}/#/fbo`);

        sendInvoiceMail(email, invoiceData);

        // let saltKey = '875126e4-5a13-4dae-ad60-5b8c8b629035';
        // let saltIndex = 1

        // let surl = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/PGTESTPAYUAT93/' + req.body.transactionId;

        // let string = '/pg/v1/status/PGTESTPAYUAT93/' + req.body.transactionId + saltKey;

        // let sha256_val = sha256(string);
        // let checksum = sha256_val + '###' + saltIndex;

        // axios.get(surl, {
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'X-VERIFY': checksum,
        //     'X-MERCHANT-ID': req.body.transactionId
        //   }
        // }).then(function (response) {
        //   console.log(response);
        // }).catch(function (error) {
        //   console.log(error);
        // });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

exports.fboRegister = async (req, res) => {
  try {

    const createrObjId = req.params.id;

    let success = false;

    const userInfo = await employeeSchema.findById(createrObjId);
    const signatureFile = userInfo.signatureImage;

    if (!signatureFile) {
      return res.status(404).json({ success, signatureErr: true })
    }

    if(req.user.employee_id != 'IIEST/FD/0176') {
      const areaAlloted = await areaAllocationModel.findOne({ employeeInfo: createrObjId });
      if (!areaAlloted) {
        success = false;
        return res.status(404).json({ success, areaAllocationErr: true })
      }
    }

    const signatureBucket = empSignBucket();

    const signExists = await signatureBucket.find({ "_id": new ObjectId(signatureFile) }).toArray();

    if (!signExists.length > 0) {
      return res.status(404).json({ success, noSignErr: true })
    }

    const { fbo_name, owner_name, owner_contact, email, state, district, address, product_name, payment_mode, createdBy, grand_total, business_type, village, tehsil, pincode, fostac_training, foscos_training, hygiene_audit, gst_number, fostacGST, foscosGST, hygieneGST, foscosFixedCharge, boInfo } = req.body;

    if(req.user.employee_id != 'IIEST/FD/0176') {
    const pincodeCheck = areaAlloted.pincodes.includes(pincode);

    if (!pincodeCheck) {
      success = false;
      return res.status(404).json({ success, wrongPincode: true });
    }
  }

    const { idNumber, generatedCustomerId } = await generatedInfo();

    let serviceArr = [];

    if (fostac_training) {
      serviceArr.push(fostac_training.fostac_service_name);
    }

    if (foscos_training) {
      serviceArr.push(foscos_training.foscos_service_name);
    }

    if (hygiene_audit) {
      serviceArr.push(hygiene_audit.hra_service_name);
    }

    let total_processing_amount = 0;
    let totalGST = 0;
    let extraFee = 0;

    const invoiceData = [];
    let invoiceUploadStream;
    const invoiceIdArr = [];

    const invoiceBucket = createInvoiceBucket();

    let fileName = `${Date.now()}_${idNumber}.pdf`;

    if (product_name.includes('Fostac')) {
      fileName = `${Date.now()}_${idNumber}.pdf`;
      invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

      total_processing_amount = Number(fostac_training.fostac_processing_amount);
      totalGST = fostacGST;

      const qty = fostac_training.recipient_no;

      invoiceData.push(await invoiceDataHandler(idNumber, email, fbo_name, address, owner_contact, email, total_processing_amount, extraFee, totalGST, qty, business_type, gst_number, fostac_training.fostac_total, 'Fostac', foscos_training, signatureFile, invoiceUploadStream));

      invoiceIdArr.push(invoiceUploadStream.id);
    }

    if (product_name.includes('Foscos')) {
      fileName = `${Date.now()}_${idNumber}.pdf`;
      invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

      total_processing_amount = Number(foscos_training.foscos_processing_amount);
      totalGST = foscosGST;
      extraFee = foscosFixedCharge;

      const qty = foscos_training.shops_no;

      invoiceData.push(await invoiceDataHandler(idNumber, email, fbo_name, address, owner_contact, email, total_processing_amount, extraFee, totalGST, qty, business_type, gst_number, foscos_training.foscos_total, 'Foscos', foscos_training, signatureFile, invoiceUploadStream));

      invoiceIdArr.push(invoiceUploadStream.id);
    }

    if (product_name.includes('HRA')) {
      fileName = `${Date.now()}_${idNumber}.pdf`;
      invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

      total_processing_amount = Number(hygiene_audit.hra_processing_amount);
      totalGST = hygieneGST;

      const qty = hygiene_audit.shops_no;

      invoiceData.push(await invoiceDataHandler(idNumber, email, fbo_name, address, owner_contact, email, total_processing_amount, extraFee, totalGST, qty, business_type, gst_number, hygiene_audit.hra_total, 'HRA', hygiene_audit, signatureFile, invoiceUploadStream));

      invoiceIdArr.push(invoiceUploadStream.id);
    }

    const fboEntry = await fboModel.create({
      employeeInfo: createrObjId, boInfo, id_num: idNumber, fbo_name, owner_name, owner_contact, email, state, district, address, customer_id: generatedCustomerId, payment_mode, createdBy, village, tehsil, pincode, business_type, gst_number
    });

    if (!fboEntry) {
      success = false;
      return res.status(401).json({ success, randomErr: true })
    }

    const selectedProductInfo = await salesModel.create({ employeeInfo: createrObjId, fboInfo: fboEntry._id, product_name, fostacInfo: fostac_training, foscosInfo: foscos_training, hraInfo: hygiene_audit, payment_mode, grand_total, invoiceId: invoiceIdArr });

    if (!selectedProductInfo) {
      success = false;
      return res.status(401).json({ success, randomErr: true })
    }

    success = true;
    sendInvoiceMail(email, invoiceData);
    return res.status(200).json({ success })

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

//Controller for deleting FBO
exports.deleteFbo = async (req, res) => {
  const objId = req.params.id;
  let success = false;

  try {
    const deletedFbo = await fboModel.findByIdAndDelete(objId);
    if (deletedFbo) {

      const { _id, ...pastFbo } = deletedFbo.toObject();
      const { deletedBy } = req.body;

      await pastFboSchema.create({ ...pastFbo, deletedBy: deletedBy }) //Adding deleted fbo to past fbo data

      success = true;
      return res.status(200).json({ success, deletedFbo });
    } else {
      success = false;
      return res.status(401).json({ success, message: "Fbo Not Found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

//Controller for editing FBO data
exports.editFbo = async (req, res) => {

  try {

    let objId = req.params.id;
    let success = false;

    const updatedFboData = req.body;
    const editedBy = req.body.editedBy

    const updatedFbo = await fboModel.findByIdAndUpdate(objId, { ...updatedFboData, lastEdit: editedBy }, { new: true });

    if (!updatedFbo) {
      success = false;
      return res.status(401).json({ success, message: "Employee Not Found" });
    }

    success = true;
    return res.status(201).json({ success, updatedFbo })

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

//Controller to get all FBO List
exports.registerdFBOList = async (req, res) => {
  try {
    const fboList = await fboModel.find().populate({path: 'boInfo'});
    return res.status(200).json({ fboList });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

exports.registerdBOList = async (req, res) => {
  try {
    const boList = await boModel.find({is_contact_verified: true, is_email_verified: true});
    return res.status(200).json({ boList });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}



exports.saleInvoice = async (req, res) => {
  try {

    const invoiceId = req.params.id;

    const invoiceBucket = createInvoiceBucket();

    const invoiceCheck = await invoiceBucket.find({ '_id': new ObjectId(invoiceId) }).toArray();

    if (!invoiceCheck.length > 0) {
      success = false;
      return res.status(404).json({ success, oldInvoiceErr: true });
    }

    const invoiceDownloadStream = invoiceBucket.openDownloadStream(new ObjectId(invoiceId));

    invoiceDownloadStream.on('error', () => {
      success = false;
      return res.status(200).json({ success, randomErr: true });
    })

    let chunks = [];

    invoiceDownloadStream.on('data', (chunk) => {
      chunks.push(chunk);
    });

    invoiceDownloadStream.on('end', () => {
      const invoiceBuffer = Buffer.concat(chunks);
      const invoicePrefix = 'data:application/pdf;base64,';
      const invoiceBase64 = invoiceBuffer.toString('base64');
      const invoiceConverted = `${invoicePrefix}${invoiceBase64}`;
      success = true;
      return res.status(200).json({ success, invoiceConverted })
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

exports.getClientList = async (req, res) => {
  try {

    const todayDate = new Date();
    const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(),0,0, 1);
    const startOfThisMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
    const startOfPrevMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);
    const startOfThisYear = new Date(todayDate.getFullYear(), 0, 1);

    const pipeline = [
      {
        $lookup: {
          from: 'fbo_registers',
          localField: 'fboInfo',
          foreignField: '_id',
          as: 'fbo'
        }
      },
      {
        $unwind: "$fbo"
      },
      {
        $group: {
          _id: {
            owner_name: "$fbo.owner_name",
            customer_id: "$fbo.customer_id"
          },
          total: { $sum: 1 },
          salesDates: {
            $push: "$createdAt"
          },
          lastSalesDate: {
            $max: "$createdAt"
          }
        }
      },
      {
        $sort: {
          total: -1
        }
      },
      {
        $facet: {
          This_Year: [
            {
              $match: {
                lastSalesDate: { $gte: startOfThisYear },
              }
            },
            {
              $addFields: { // Create a new field representing the day of the week
                month: { $month: "$lastSalesDate" }
              }
            },
            {
              $group: {
                _id: "$month",
                total: { $sum: 1 },
              },
            },
            {
              $project: {
                name: "$_id",
                value: "$total"
              }
            },
            {
              $sort: {
                name: 1
              }
            }
          ],
          Till_Now: [
            {
              $addFields: { // Create a new field representing the day of the week
                year: { $year: "$lastSalesDate" }
              }
            },
            {
              $group: {
                _id: "$year",
                total: { $sum: 1 }
              },
            },
            {
              $project: {
                name: "$_id",
                value: "$total"
              }
            },
            {
              $sort: {
                name: 1
              }
            }
          ]
        }
      }
    ];

    const clientList = await salesModel.aggregate(pipeline);

    return res.status(200).json(clientList[0]);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}