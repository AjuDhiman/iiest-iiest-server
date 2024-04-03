const { ObjectId } = require("mongodb");
const { empSignBucket, createInvoiceBucket } = require("../../config/buckets");
const invoiceDataHandler = require("../../fbo/generateInvoice");
const areaAllocationModel = require("../../models/employeeModels/employeeAreaSchema");
const salesModel = require("../../models/employeeModels/employeeSalesSchema");
const employeeSchema = require("../../models/employeeModels/employeeSchema");
const fboModel = require('../../models/fboModels/fboSchema');
const payRequest = require("../../fbo/phonePay");
const fboPaymentSchema = require("../../models/fboModels/fboPaymentSchema");
const sendInvoiceMail = require("../../fbo/sendMail");

exports.existingFboCash = async (req, res) => {
  try {

    const createrObjId = req.params.id;

    let success = false;

    const userInfo = await employeeSchema.findById(createrObjId);
    const signatureFile = userInfo.signatureImage;

    if (!signatureFile) {
      return res.status(404).json({ success, signatureErr: true })
    }

    const areaAlloted = await areaAllocationModel.findOne({ employeeInfo: createrObjId });
    if (!areaAlloted) {
      success = false;
      return res.status(404).json({ success, areaAllocationErr: true })
    }

    const signatureBucket = empSignBucket();

    const signExists = await signatureBucket.find({ "_id": new ObjectId(signatureFile) }).toArray();

    console.log(signExists);

    if (!signExists.length > 0) {
      return res.status(404).json({ success, noSignErr: true })
    }

    const { product_name, payment_mode, grand_total, pincode, fostac_training, foscos_training, hygiene_audit, fostacGST, foscosGST, hygieneGST, foscosFixedCharge, existingFboId } = req.body;

    const existingFboInfo = await fboModel.findOne({ customer_id: existingFboId });

    if (!existingFboInfo) {
      success = false;
      return res.status(404).json({ success, fboMissing: true });
    }

    const pincodeCheck = areaAlloted.pincodes.includes(pincode);

    if (!pincodeCheck) {
      success = false;
      return res.status(404).json({ success, wrongPincode: true });
    }

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

    const fileName = `${Date.now()}_${existingFboInfo.id_num}.pdf`;

    if (product_name.includes('Fostac')) {
      invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);
      total_processing_amount = Number(fostac_training.fostac_processing_amount);
      totalGST = fostacGST;

      const qty = fostac_training.recipient_no;

      invoiceData.push(await invoiceDataHandler(existingFboInfo.id_num, existingFboInfo.email, existingFboInfo.fbo_name, existingFboInfo.address, existingFboInfo.owner_contact, existingFboInfo.email, total_processing_amount, extraFee, totalGST, qty, existingFboInfo.business_type, existingFboInfo.gst_number, fostac_training.fostac_total, 'Fostac', fostac_training, signatureFile, invoiceUploadStream));

      invoiceIdArr.push(invoiceUploadStream.id);
    }

    if (product_name.includes('Foscos')) {
      invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);
      total_processing_amount = Number(foscos_training.foscos_processing_amount);
      totalGST = foscosGST;
      extraFee = foscosFixedCharge;

      const qty = foscos_training.shops_no;

      invoiceData.push(await invoiceDataHandler(existingFboInfo.id_num, existingFboInfo.email, existingFboInfo.fbo_name, existingFboInfo.address, existingFboInfo.owner_contact, existingFboInfo.email, total_processing_amount, extraFee, totalGST, qty, existingFboInfo.business_type, existingFboInfo.gst_number, foscos_training.foscos_total, 'Foscos', foscos_training, signatureFile, invoiceUploadStream));

      invoiceIdArr.push(invoiceUploadStream.id);
    }

    if (product_name.includes('HRA')) {
      invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);
      total_processing_amount = Number(hygiene_audit.hra_processing_amount);
      totalGST = hygieneGST;

      const qty = hygiene_audit.shops_no;

      console.log(qty);

      invoiceData.push(await invoiceDataHandler(existingFboInfo.id_num, existingFboInfo.email, existingFboInfo.fbo_name, existingFboInfo.address, existingFboInfo.owner_contact, existingFboInfo.email, total_processing_amount, extraFee, totalGST, qty, existingFboInfo.business_type, existingFboInfo.gst_number, hygiene_audit.hra_total, 'HRA', hygiene_audit, signatureFile, invoiceUploadStream));

      invoiceIdArr.push(invoiceUploadStream.id);
    }

    const selectedProductInfo = await salesModel.create({ employeeInfo: createrObjId, fboInfo: existingFboInfo._id, product_name, fostacInfo: fostac_training, foscosInfo: foscos_training, hraInfo: hygiene_audit, payment_mode, grand_total, invoiceId: invoiceIdArr });

    if (!selectedProductInfo) {
      success = false;
      return res.status(401).json({ success, randomErr: true });
    }

    success = true;

    sendInvoiceMail(existingFboInfo.email, invoiceData);
    return res.status(200).json({ success })

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

exports.existingFboPayPage = async (req, res) => {
  try {

    let success = false;

    const formBody = req.body;
    const createrId = req.params.id

    const userInfo = await employeeSchema.findById(req.params.id);
    const signatureFile = userInfo.signatureImage;

    if (!signatureFile) {
      success = false;
      return res.status(404).json({ success, signatureErr: true });
    }

    const areaAlloted = await areaAllocationModel.findOne({ employeeInfo: req.params.id });

    if (!areaAlloted) {
      success = false;
      return res.status(404).json({ success, areaAllocationErr: true })
    }

    const signatureBucket = empSignBucket();

    console.log(signatureFile);

    const signExists = await signatureBucket.find({ "_id": new ObjectId(signatureFile) }).toArray();

    if (!signExists.length > 0) {
      return res.status(404).json({ success, noSignErr: true })
    }

    const existingFboInfo = await fboModel.findOne({ customer_id: formBody.existingFboId });

    if (!existingFboInfo) {
      success = false;
      return res.status(404).json({ success, fboMissing: true });
    }

    req.session.fboFormData = { ...formBody, createrObjId: createrId, signatureFile, existingFboInfo };

    const pincodeCheck = areaAlloted.pincodes.includes(formBody.pincode);

    if (!pincodeCheck) {
      success = false;
      return res.status(404).json({ success, wrongPincode: true });
    }

    payRequest(formBody.grand_total, res, 'http://localhost:3000/iiest/existingfbo-pay-return');

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

exports.existingFboPayReturn = async (req, res) => {
  try {

    if (req.body.code === 'PAYMENT_SUCCESS' && req.body.merchantId && req.body.transactionId && req.body.providerReferenceId) {
      if (req.body.transactionId) {

        let success = false;

        const fetchedFormData = req.session.fboFormData;

        const { product_name, payment_mode, grand_total, fostac_training, foscos_training, hygiene_audit, createrObjId, signatureFile, fostacGST, foscosGST, hygieneGST, foscosFixedCharge, existingFboInfo } = fetchedFormData;

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

        const fileName = `${Date.now()}_${existingFboInfo.id_num}.pdf`;

        if (product_name.includes('Fostac')) {
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);
    
          total_processing_amount = Number(fostac_training.fostac_processing_amount);
          totalGST = fostacGST;
    
          const qty = fostac_training.recipient_no;
    
          invoiceData.push(await invoiceDataHandler(existingFboInfo.id_num, existingFboInfo.email, existingFboInfo.fbo_name, existingFboInfo.address, existingFboInfo.owner_contact, existingFboInfo.email, total_processing_amount, extraFee, totalGST, qty, existingFboInfo.business_type, existingFboInfo.gst_number, fostac_training.fostac_total, 'Fostac', fostac_training, signatureFile, invoiceUploadStream));
    
          invoiceIdArr.push(invoiceUploadStream.id);
        }
    
        if (product_name.includes('Foscos')) {
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);
    
          total_processing_amount = Number(foscos_training.foscos_processing_amount);
          totalGST = foscosGST;
          extraFee = foscosFixedCharge;
    
          const qty = foscos_training.shops_no;
    
          invoiceData.push(await invoiceDataHandler(existingFboInfo.id_num, existingFboInfo.email, existingFboInfo.fbo_name, existingFboInfo.address, existingFboInfo.owner_contact, existingFboInfo.email, total_processing_amount, extraFee, totalGST, qty, existingFboInfo.business_type, existingFboInfo.gst_number, foscos_training.foscos_total, 'Foscos', foscos_training, signatureFile, invoiceUploadStream));
    
          invoiceIdArr.push(invoiceUploadStream.id);
        }
    
        if (product_name.includes('HRA')) {
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);
    
          total_processing_amount = Number(hygiene_audit.hra_processing_amount);
          totalGST = hygieneGST;
    
          const qty = hygiene_audit.shops_no;
    
          invoiceData.push(await invoiceDataHandler(existingFboInfo.id_num, existingFboInfo.email, existingFboInfo.fbo_name, existingFboInfo.address, existingFboInfo.owner_contact, existingFboInfo.email, total_processing_amount, extraFee, totalGST, qty, existingFboInfo.business_type, existingFboInfo.gst_number, hygiene_audit.hra_total, 'HRA', hygiene_audit, signatureFile, invoiceUploadStream));
    
          invoiceIdArr.push(invoiceUploadStream.id);
        }

        const buyerData = await fboPaymentSchema.create({
          buyerId: existingFboInfo._id, merchantId: req.body.merchantId, merchantTransactionId: req.body.transactionId, providerReferenceId: req.body.providerReferenceId, amount: grand_total
        });

        if (!buyerData) {
          return res.status(401).json({ success, message: "Data not entered in payment collection" });
        }

        const selectedProductInfo = await salesModel.create({ employeeInfo: createrObjId, fboInfo: existingFboInfo._id, product_name, fostacInfo: fostac_training, foscosInfo: foscos_training, hraInfo: hygiene_audit, payment_mode, grand_total, invoiceId: invoiceIdArr });

        if (!selectedProductInfo) {
          return res.status(401).json({ success, message: "Data not entered in employee_sales collection" });
        }

        req.session.destroy((err) => {
          console.log(err);
        });

        res.redirect('http://localhost:4200/fbo');

        sendInvoiceMail(existingFboInfo.email, invoiceData);

      }
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}