const pastFboSchema = require('../../models/historyModels/pastFboSchema');
const { generatedInfo, generateInvoiceCode } = require('../../fbo/generateCredentials');
const invoiceDataHandler = require('../../fbo/generateInvoice');
const fboPaymentSchema = require('../../models/fboModels/fboPaymentSchema');
const fboModel = require('../../models/fboModels/fboSchema');
const salesModel = require('../../models/employeeModels/employeeSalesSchema');
const employeeSchema = require('../../models/employeeModels/employeeSchema');
const { ObjectId } = require('mongodb');
const { createInvoiceBucket, empSignBucket } = require('../../config/buckets');
const payRequest = require('../../fbo/phonePay');
const areaAllocationModel = require('../../models/employeeModels/employeeAreaSchema');
const { sendInvoiceMail, sendCheckMail } = require('../../fbo/sendMail');
const boModel = require('../../models/BoModels/boSchema');
const sessionModel = require('../../models/generalModels/sessionDataSchema');
const { shopModel } = require('../../models/fboModels/recipientSchema');
const generalDataSchema = require('../../models/generalModels/generalDataSchema');
const FRONT_END = JSON.parse(process.env.FRONT_END);
const BACK_END = process.env.BACK_END;

let fboFormData = {};

//methord for initiating oayment with phoen pe
exports.fboPayment = async (req, res) => { 
  try {
    let success = false;

    const userInfo = await employeeSchema.findById(req.params.id);
    const signatureFile = userInfo.signatureImage;
    const officerName = userInfo.employee_name;
    const panelType = userInfo.panel_type;

    if (!signatureFile) {
      success = false;
      return res.status(404).json({ success, signatureErr: true });
    }

    const areaAlloted = await areaAllocationModel.findOne({ employeeInfo: req.params.id });
    const panIndiaAllowedIds =(await generalDataSchema.find({}))[0].pan_india_allowed_ids;

    console.log(panIndiaAllowedIds);

    if ( !panIndiaAllowedIds.includes(req.user.employee_id) && panelType !== 'Verifier Panel') {

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

    const fboFormData = await sessionModel.create({
      data: {
        ...formBody, createrObjId: createrId, signatureFile, officerName: officerName,
        apiCalled: false //this property in data chrecks if api for pay page return already called or not in case of payment link share
      }
    });

    if (!panIndiaAllowedIds.includes(req.user.employee_id) && panelType !== 'Verifier Panel') {
      const pincodeCheck = areaAlloted.pincodes.includes(formBody.pincode);

      if (!pincodeCheck) {
        success = false;
        return res.status(404).json({ success, wrongPincode: true });
      }
    }

    payRequest(formBody.grand_total, res, `${BACK_END}/fbo-pay-return/${fboFormData._id}`);

  } catch (error) {
    console.log(error);
    await sessionModel.findByIdAndDelete(fboFormData._id);// delete session in any case of faliure
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

//methord for creating fbo and sale entry and other task that should be done after payment cinfirmation from phone pe
exports.fboPayReturn = async (req, res) => {

  let sessionId = req.params.id; //Disclaimer: This sessionId here is used to get stored data from sessionData Model from mongoose this used in place of session because of unaviliblity of session in case of redirect in pm2 server so do not take it as express-session

  try {

    if (req.body.code === 'PAYMENT_SUCCESS' && req.body.merchantId && req.body.transactionId && req.body.providerReferenceId) {
      if (req.body.transactionId) {

        let success = false;

        let sessionData = await sessionModel.findById(sessionId);
        if (!sessionData) {
          res.redirect(`${FRONT_END.VIEW_URL}/#/fbo`);
          return
        }
        const fetchedFormData = sessionData.data;
        let apiCalled = fetchedFormData.apiCalled;
        await sessionModel.findByIdAndUpdate(sessionId, { data: { ...fetchedFormData, apiCalled: true } });

        if (apiCalled) {
          res.redirect(`${FRONT_END.VIEW_URL}/#/fbo`);
          return;
        }

        const { fbo_name,
          owner_name,
          owner_contact,
          email,
          state,
          district,
          address,
          product_name,
          payment_mode,
          createdBy,
          grand_total,
          business_type,
          village,
          tehsil,
          pincode,
          fostac_training,
          foscos_training,
          hygiene_audit,
          medical,
          water_test_report,
          gst_number,
          createrObjId,
          signatureFile,
          fostacGST,
          foscosGST,
          hygieneGST,
          medicalGST,
          waterTestGST,
          foscosFixedCharge,
          boInfo,
          officerName } = fetchedFormData;

        const { idNumber, generatedCustomerId } = await generatedInfo();

        const boData = await boModel.findOne({ _id: boInfo });

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

        if (medical) {
          serviceArr.push('Medical');
        }

        if (water_test_report) {
          serviceArr.push('Water Test Report');
        }

        let total_processing_amount = 0;
        let totalGST = 0;
        let extraFee = 0;

        const invoiceData = [];
        let invoiceUploadStream;
        const invoiceIdArr = []; // arr for saving all invoices buket object keys

        const invoiceBucket = createInvoiceBucket();

        let fileName;

        if (product_name.includes('Fostac')) {
          const invoiceCode = await generateInvoiceCode(business_type);//generating new invoice code

          fileName = `${Date.now()}_${idNumber}.pdf`;
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

          total_processing_amount = Number(fostac_training.fostac_processing_amount);
          totalGST = fostacGST;

          const qty = fostac_training.recipient_no;
          invoiceData.push(await invoiceDataHandler(invoiceCode, email, fbo_name, address, state, district, pincode, owner_contact, email, total_processing_amount, extraFee, totalGST, qty, business_type, gst_number, fostac_training.fostac_total, 'Fostac', fostac_training, signatureFile, invoiceUploadStream, officerName, generatedCustomerId, boData));

          invoiceIdArr.push({ src: invoiceUploadStream.id, code: invoiceCode });
        }

        if (product_name.includes('Foscos')) {
          const invoiceCode = await generateInvoiceCode(business_type);//generating new invoice code

          fileName = `${Date.now()}_${idNumber}.pdf`;
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

          total_processing_amount = Number(foscos_training.foscos_processing_amount);
          totalGST = foscosGST;
          extraFee = foscosFixedCharge;

          const qty = foscos_training.shops_no;
          invoiceData.push(await invoiceDataHandler(invoiceCode, email, fbo_name, address, state, district, pincode, owner_contact, email, total_processing_amount, extraFee, totalGST, qty, business_type, gst_number, foscos_training.foscos_total, 'Foscos', foscos_training, signatureFile, invoiceUploadStream, officerName, generatedCustomerId, boData));

          invoiceIdArr.push({ src: invoiceUploadStream.id, code: invoiceCode });

        }

        if (product_name.includes('HRA')) {
          const invoiceCode = await generateInvoiceCode(business_type);//generating new invoice code

          fileName = `${Date.now()}_${idNumber}.pdf`;
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

          total_processing_amount = Number(hygiene_audit.hra_processing_amount);
          totalGST = hygieneGST;

          const qty = hygiene_audit.shops_no;
          invoiceData.push(await invoiceDataHandler(invoiceCode, email, fbo_name, address, state, district, pincode, owner_contact, email, total_processing_amount, extraFee, totalGST, qty, business_type, gst_number, hygiene_audit.hra_total, 'HRA', hygiene_audit, signatureFile, invoiceUploadStream, officerName, generatedCustomerId, boData));

          invoiceIdArr.push({ src: invoiceUploadStream.id, code: invoiceCode });
        }

        //checkfor medical
        if (product_name.includes('Medical')) {
          const invoiceCode = await generateInvoiceCode(business_type);//generating new invoice code


          fileName = `${Date.now()}_${idNumber}.pdf`;
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

          total_processing_amount = Number(medical.medical_processing_amount);
          totalGST = medicalGST;

          const qty = medical.recipient_no;
          //create medical invoice
          invoiceData.push(await invoiceDataHandler(invoiceCode, email, fbo_name, address, state, district, pincode, owner_contact, email, total_processing_amount, extraFee, totalGST, qty, business_type, gst_number, medical.medical_total, 'Medical', medical, signatureFile, invoiceUploadStream, officerName, generatedCustomerId, boData));

          invoiceIdArr.push({ src: invoiceUploadStream.id, code: invoiceCode });
        }

        //check for water test
        if (product_name.includes('Water Test Report')) {
          const invoiceCode = await generateInvoiceCode(business_type);//generating new invoice code

          fileName = `${Date.now()}_${idNumber}.pdf`;
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

          total_processing_amount = Number(water_test_report.water_test_processing_amount);
          totalGST = waterTestGST;

          const qty = 1;

          //create water test invoice
          invoiceData.push(await invoiceDataHandler(invoiceCode, email, fbo_name, address, state, district, pincode, owner_contact, email, total_processing_amount, extraFee, totalGST, qty, business_type, gst_number, water_test_report.water_test_total, 'Water Test Report', water_test_report, signatureFile, invoiceUploadStream, officerName, generatedCustomerId, boData));

          invoiceIdArr.push({ src: invoiceUploadStream.id, code: invoiceCode });
        }

        //creating new fbo entry
        const fboEntry = await fboModel.create({
          employeeInfo: createrObjId,
          id_num: idNumber,
          fbo_name,
          owner_name,
          owner_contact,
          email,
          state,
          district,
          address,
          product_name,
          customer_id: generatedCustomerId,
          payment_mode,
          createdBy,
          village,
          tehsil,
          pincode,
          business_type,
          gst_number,
          boInfo,
          activeStatus: true,
          isBasicDocUploaded: false
        });

        if (!fboEntry) {
          return res.status(401).json({ success, message: "FBO entry not successful" })
        }

        //new phone pay transaction obj
        const buyerData = await fboPaymentSchema.create({
          buyerId: fboEntry._id,
          merchantId: req.body.merchantId,
          merchantTransactionId: req.body.transactionId,
          providerReferenceId: req.body.providerReferenceId,
          amount: grand_total
        });

        if (!buyerData) {
          return res.status(401).json({ success, message: "Data not entered in payment collection" });
        }

        //creating new sale object
        const selectedProductInfo = await salesModel.create({
          employeeInfo: createrObjId,
          fboInfo: fboEntry._id,
          product_name,
          fostacInfo: fostac_training,
          foscosInfo: foscos_training,
          hraInfo: hygiene_audit,
          medicalInfo: medical,
          waterTestInfo: water_test_report,
          payment_mode,
          grand_total,
          invoiceId: invoiceIdArr
        });

        if (!selectedProductInfo) {
          return res.status(401).json({ success, message: "Data not entered in employee_sales collection" });
        }

        product_name.forEach(async (product) => {
          if (product === 'Fostac' || product === 'HRA') {
            const addShop = await shopModel.create({ salesInfo: selectedProductInfo._id, managerName: boData.manager_name, address: address, state: state, district: district, pincode: pincode, shopId: generatedCustomerId, product_name: product, village: village, tehsil: tehsil }); //create shop after sale for belongs  tohis sale
          }
        })

        // req.session.destroy((err) => {
        //   if (err) {
        //     console.log(console.log(err));
        //   }
        // });

        res.redirect(`${FRONT_END.VIEW_URL}/#/fbo`);


        sendInvoiceMail(email, invoiceData);

      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await sessionModel.findByIdAndDelete(sessionId);// delete session data at last in any case sucess or faliure
  }
}

//methord for regsitering fbo and saving its sale realted info for a sale by cash but not in working after(10-06-24)
exports.fboRegister = async (req, res) => {
  try {

    const createrObjId = req.params.id;

    let success = false;

    const userInfo = await employeeSchema.findById(createrObjId);
    const signatureFile = userInfo.signatureImage;

    if (!signatureFile) {
      return res.status(404).json({ success, signatureErr: true })
    }

    const officerName = req.user.employee_name;

    const areaAlloted = await areaAllocationModel.findOne({ employeeInfo: createrObjId });
    const panIndiaAllowedIds =(await generalDataSchema.find({}))[0].pan_india_allowed_ids;

    if ( !panIndiaAllowedIds.includes(req.user.employee_id) && panelType !== 'Verifier Panel') {

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

    const boData = await boModel.findOne({ _id: boInfo });

    if ( !panIndiaAllowedIds.includes(req.user.employee_id) && panelType !== 'Verifier Panel') {
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

      invoiceData.push(await invoiceDataHandler(idNumber, email, fbo_name, address, state, district, pincode, owner_contact, email, total_processing_amount, extraFee, totalGST, qty, business_type, gst_number, fostac_training.fostac_total, 'Fostac', foscos_training, signatureFile, invoiceUploadStream, officerName, generatedCustomerId, boData));

      invoiceIdArr.push(invoiceUploadStream.id);
    }

    if (product_name.includes('Foscos')) {
      fileName = `${Date.now()}_${idNumber}.pdf`;
      invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

      total_processing_amount = Number(foscos_training.foscos_processing_amount);
      totalGST = foscosGST;
      extraFee = foscosFixedCharge;

      const qty = foscos_training.shops_no;

      invoiceData.push(await invoiceDataHandler(idNumber, email, fbo_name, address, state, district, pincode, owner_contact, email, total_processing_amount, extraFee, totalGST, qty, business_type, gst_number, foscos_training.foscos_total, 'Foscos', foscos_training, signatureFile, invoiceUploadStream, officerName, generatedCustomerId, boData));

      invoiceIdArr.push(invoiceUploadStream.id);
    }

    if (product_name.includes('HRA')) {
      fileName = `${Date.now()}_${idNumber}.pdf`;
      invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

      total_processing_amount = Number(hygiene_audit.hra_processing_amount);
      totalGST = hygieneGST;

      const qty = hygiene_audit.shops_no;

      invoiceData.push(await invoiceDataHandler(idNumber, email, fbo_name, address, state, district, pincode, owner_contact, email, total_processing_amount, extraFee, totalGST, qty, business_type, gst_number, hygiene_audit.hra_total, 'HRA', hygiene_audit, signatureFile, invoiceUploadStream, officerName,
        generatedCustomerId, boData
      ));

      invoiceIdArr.push(invoiceUploadStream.id);
    }

    const fboEntry = await fboModel.create({
      employeeInfo: createrObjId, boInfo, id_num: idNumber, fbo_name, owner_name, owner_contact, email, state, district, address, customer_id: generatedCustomerId, payment_mode, createdBy, village, tehsil, pincode, business_type, gst_number, activeStatus: true, isBasicDocUploaded: false
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

//methord for registering j
exports.boByCheque = async (req, res) => {
  try {

    console.log(req.files);
    const chequeImage = req.files['cheque_image'][0];

    const createrObjId = req.params.id;

    const panelType = req.user.panel_type;

    let success = false;

    const userInfo = await employeeSchema.findById(createrObjId); //getting employee data and signature form db
    const signatureFile = userInfo.signatureImage;

    if (!signatureFile) {
      return res.status(404).json({ success, signatureErr: true })
    }

    const officerName = req.user.employee_name;

    //checkig for allocated areas
    const areaAlloted = await areaAllocationModel.findOne({ employeeInfo: createrObjId });
    const panIndiaAllowedIds =(await generalDataSchema.find({}))[0].pan_india_allowed_ids;

    if ( !panIndiaAllowedIds.includes(req.user.employee_id) && panelType !== 'Verifier Panel') {

      if (!areaAlloted) {
        success = false;
        return res.status(404).json({ success, areaAllocationErr: true })
      }
    }

    const signatureBucket = empSignBucket(); //getting sign from bucket

    const signExists = await signatureBucket.find({ "_id": new ObjectId(signatureFile) }).toArray();

    if (!signExists.length > 0) {
      return res.status(404).json({ success, noSignErr: true })
    }

    const { fbo_name, owner_name, owner_contact, email, state, district, address, product_name, payment_mode, createdBy, grand_total, business_type, village, tehsil, pincode, fostac_training, foscos_training, hygiene_audit, medical, water_test_report, cheque_data, gst_number, boInfo, isFostac, isFoscos, isHygiene, isMedical, isWaterTest } = req.body;//getting data from req body

    const boData = await boModel.findOne({ _id: boInfo });

    if ( !panIndiaAllowedIds.includes(req.user.employee_id) && panelType !== 'Verifier Panel') { //checking allocated areas
      const pincodeCheck = areaAlloted.pincodes.includes(pincode);

      if (!pincodeCheck) {
        success = false;
        return res.status(404).json({ success, wrongPincode: true });
      }
    }

    const { idNumber, generatedCustomerId } = await generatedInfo(); //generating bo Id

    let fostacTraining = isFostac === 'true' ? JSON.parse(fostac_training) : undefined;
    let foscosTraining = isFoscos === 'true' ? JSON.parse(foscos_training) : undefined;
    let hygieneAudit = isHygiene === 'true' ? JSON.parse(hygiene_audit) : undefined;
    let Medical = isMedical === 'true' ? JSON.parse(medical) : undefined;
    let waterTestReport = isWaterTest === 'true' ? JSON.parse(water_test_report) : undefined;
    let chequeData = JSON.parse(cheque_data);
    let productName = product_name.split(',');
    chequeData.status = 'Pending';
    chequeData.cheque_image = chequeImage.filename;

    console.log(productName, product_name)

    const fboEntry = await fboModel.create({
      employeeInfo: createrObjId, boInfo, id_num: idNumber, fbo_name, owner_name, owner_contact, email, state, district, address, customer_id: generatedCustomerId, payment_mode, createdBy, village, tehsil, pincode, business_type, gst_number, activeStatus: true, isBasicDocUploaded: false
    });

    if (!fboEntry) {
      success = false;
      return res.status(401).json({ success, randomErr: true })
    }

    const selectedProductInfo = await salesModel.create({ employeeInfo: createrObjId, fboInfo: fboEntry._id, product_name: productName, fostacInfo: fostacTraining, foscosInfo: foscosTraining, hraInfo: hygieneAudit, medicalInfo: Medical, waterTestInfo: waterTestReport, payment_mode, grand_total, invoiceId: [],  cheque_data: chequeData });

    if (!selectedProductInfo) {
      success = false;
      return res.status(401).json({ success, randomErr: true })
    }

    productName.forEach(async (product) => {
      if (product === 'Fostac' || product === 'HRA') {
        const addShop = await shopModel.create({ salesInfo: selectedProductInfo._id, managerName: boData.manager_name, address: address, state: state, district: district, pincode: pincode, shopId: generatedCustomerId, product_name: product, village: village, tehsil: tehsil }); //create shop after sale for belongs  tohis sale
      }
    })

    success = true;
    const clientData = {
      cheque_data: chequeData
    }
    sendCheckMail(email, clientData);
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
    const fboList = await fboModel.find().populate({ path: 'boInfo' });
    return res.status(200).json({ fboList });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

//Controller to get all BO List
exports.registerdBOList = async (req, res) => {
  try {
    const boList = await boModel.find({ is_contact_verified: true, is_email_verified: true });
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
    const startOfToday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 0, 0, 1);
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

//methord for upadting is basic doc uploaded property of a fbo objevt stroed in fbo registers in db
exports.updateFboBasicDocStatus = async (req, res) => {
  try {
    const id = req.params.id;

    const updatedFbo = await fboModel.findOneAndUpdate({ _id: id }, { isBasicDocUploaded: true });

    if (!updatedFbo) {
      return res.status(401).json({ success: false, message: 'Basic Doc Status Updating error' })
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

//this methord approves the sale for a pending cheque and send invoice after approval
exports.approveChequeSale = async (req, res) => { 
  try {

    const saleId = req.params.id; //gettimg sales id from route

    const salesInfo = await salesModel.findOne({ _id: saleId }).populate([{ path: 'fboInfo', populate: { path: 'boInfo' } }, { path: 'employeeInfo' }]); // getting sales info related to sales Id

    const { fboInfo, fostacInfo, foscosInfo, hraInfo, medicalInfo, waterTestInfo, employeeInfo, product_name, cheque_data } = salesInfo; //destructuring sales Info

    const signatureFile = employeeInfo.signatureImage; //getting signature file

    if (!signatureFile) {
      return res.status(404).json({ success, signatureErr: true })// checking for signature file
    }

    let serviceArr = []; //service arr will countain info about all the product taken in this sale

    if (fostacInfo) {
      serviceArr.push(fostacInfo.fostac_service_name);
    }

    if (foscosInfo) {
      serviceArr.push(foscosInfo.foscos_service_name);
    }

    if (hraInfo) {
      serviceArr.push(hraInfo.hra_service_name);
    }

    if (medicalInfo) {
      serviceArr.push('Medical');
    }

    if (waterTestInfo) {
      serviceArr.push('Water Test Report');
    }

    let total_processing_amount = 0;
    let totalGST = 0;
    let extraFee = 0;

    const invoiceData = [];
    let invoiceUploadStream;
    const invoiceIdArr = [];

    const invoiceBucket = createInvoiceBucket();

    let fileName = `${Date.now()}_${fboInfo.id_num}.pdf`;

    if (product_name.includes('Fostac')) { //generating fostac Invoivce in case of fostac sale
      const invoiceCode = await generateInvoiceCode(salesInfo.fboInfo.business_type);//generating new imvoice code
      fileName = `${Date.now()}_${fboInfo.id_num}.pdf`;
      invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

      total_processing_amount = Number(fostacInfo.fostac_processing_amount);
      totalGST = (fostacInfo.fostac_processing_amount * fostacInfo.recipient_no) * 18 / 100;

      console.log(totalGST);

      const qty = fostacInfo.recipient_no;

      invoiceData.push(await invoiceDataHandler(invoiceCode, fboInfo.email, fboInfo.fbo_name, fboInfo.address, fboInfo.state, fboInfo.district, fboInfo.pincode, fboInfo.owner_contact, fboInfo.email, total_processing_amount, extraFee, totalGST, qty, fboInfo.business_type, fboInfo.gst_number, fostacInfo.fostac_total, 'Fostac', fostacInfo, signatureFile, invoiceUploadStream, employeeInfo.employee_name, fboInfo.customer_id, fboInfo.boInfo));

      invoiceIdArr.push({ src: invoiceUploadStream.id, code: invoiceCode });
    }

    if (product_name.includes('Foscos')) {//generating foscos Invoivce in case of foscos sale
      const invoiceCode = await generateInvoiceCode(salesInfo.fboInfo.business_type);//generating new imvoice code

      fileName = `${Date.now()}_${fboInfo.id_num}.pdf`;
      invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

      total_processing_amount = Number(foscosInfo.foscos_processing_amount);
      totalGST = (foscosInfo.foscos_processing_amount * foscosInfo.shops_no) * 18 / 100; //calculating foscos gst

      let fixedCharges = 0;

      const category = foscosInfo.license_category;
      const duration = foscosInfo.license_duration;

      let extraFee;

      if (foscosInfo.foscos_service_name === 'Registration') { //calculating foscos goverment fees
        fixedCharges = 100;
        if (category == 'New Licence' || category === 'Renewal') {
          extraFee = fixedCharges * duration;
        }
        if (category === 'Modified') {
          extraFee = fixedCharges;
        }
      }
      if (foscosInfo.foscos_service_name === 'State') {
        if (category == 'New Licence' || category === 'Renewal') {
          fixedCharges = 2000;
          extraFee = fixedCharges * duration;

        }
        if (category === 'Modified') {
          fixedCharges = 1000;
          extraFee = fixedCharges;
        }
      }

      if (Number(foscosInfo.water_test_fee) !== 0) { //getting extra fee in case of water test fee
        extraFee += Number(foscosInfo.water_test_fee)
      }

      console.log(extraFee);

      const qty = foscosInfo.shops_no;

      invoiceData.push(await invoiceDataHandler(invoiceCode, fboInfo.email, fboInfo.fbo_name, fboInfo.address, fboInfo.state, fboInfo.district, fboInfo.pincode, fboInfo.owner_contact, fboInfo.email, total_processing_amount, extraFee, totalGST, qty, fboInfo.business_type, fboInfo.gst_number, foscosInfo.foscos_total, 'Foscos', foscosInfo, signatureFile, invoiceUploadStream, employeeInfo.employee_name, fboInfo.customer_id, fboInfo.boInfo));

      invoiceIdArr.push({ src: invoiceUploadStream.id, code: invoiceCode });
    }


    if (product_name.includes('HRA')) { //generating hra Invoivce in case of hra sale\
      const invoiceCode = await generateInvoiceCode(salesInfo.fboInfo.business_type);//generating new imvoice code

      fileName = `${Date.now()}_${fboInfo.id_number}.pdf`;
      invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

      total_processing_amount = Number(hraInfo.hra_processing_amount);
      totalGST = (hraInfo.hra_processing_amount * hraInfo.shops_no) * 18 / 100;

      const qty = hraInfo.shops_no;

      invoiceData.push(await invoiceDataHandler(invoiceCode, fboInfo.email, fboInfo.fbo_name, fboInfo.address, fboInfo.state, fboInfo.district, fboInfo.pincode, fboInfo.owner_contact, fboInfo.email, total_processing_amount, extraFee, totalGST, qty, fboInfo.business_type, fboInfo.gst_number, hraInfo.hra_total, 'HRA', hraInfo, signatureFile, invoiceUploadStream, employeeInfo.employee_name, fboInfo.customer_id, fboInfo.boInfo
      ));

      invoiceIdArr.push({ src: invoiceUploadStream.id, code: invoiceCode });
    }

    if (product_name.includes('Medical')) { //generating Mediacl Invoivce in case of medical sale
      const invoiceCode = await generateInvoiceCode(salesInfo.fboInfo.business_type);//generating new imvoice code

      fileName = `${Date.now()}_${fboInfo.id_num}.pdf`;
      invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

      total_processing_amount = Number(medicalInfo.medical_processing_amount);
      const eachGSt = Math.round((medicalInfo.medical_processing_amount) * 18 / 100);
      totalGST = eachGSt * medicalInfo.recipient_no;

      console.log(totalGST);

      const qty = medicalInfo.recipient_no;

      invoiceData.push(await invoiceDataHandler(invoiceCode, fboInfo.email, fboInfo.fbo_name, fboInfo.address, fboInfo.state, fboInfo.district, fboInfo.pincode, fboInfo.owner_contact, fboInfo.email, total_processing_amount, extraFee, totalGST, qty, fboInfo.business_type, fboInfo.gst_number, medicalInfo.medical_total, 'Medical', medicalInfo, signatureFile, invoiceUploadStream, employeeInfo.employee_name, fboInfo.customer_id, fboInfo.boInfo));

      invoiceIdArr.push({ src: invoiceUploadStream.id, code: invoiceCode });
    }

    if (product_name.includes('Water Test Report')) { //generating fostac Invoivce in case of fostac sale
      const invoiceCode = await generateInvoiceCode(salesInfo.fboInfo.business_type);//generating new imvoice code

      fileName = `${Date.now()}_${fboInfo.id_num}.pdf`;
      invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

      total_processing_amount = Number(waterTestInfo.water_test_processing_amount);
      totalGST = Math.round((waterTestInfo.water_test_processing_amount) * 18 / 100);

      const qty = 1;

      invoiceData.push(await invoiceDataHandler(invoiceCode, fboInfo.email, fboInfo.fbo_name, fboInfo.address, fboInfo.state, fboInfo.district, fboInfo.pincode, fboInfo.owner_contact, fboInfo.email, total_processing_amount, extraFee, totalGST, qty, fboInfo.business_type, fboInfo.gst_number, waterTestInfo.water_test_total, 'Water Test Report', waterTestInfo, signatureFile, invoiceUploadStream, employeeInfo.employee_name, fboInfo.customer_id, fboInfo.boInfo));

      invoiceIdArr.push({ src: invoiceUploadStream.id, code: invoiceCode });
    }


    if (cheque_data) {
      await salesInfo.updateOne({ cheque_data: { ...cheque_data, status: 'Approved' }, invoiceId: invoiceIdArr });
    }

    await salesInfo.save();

    if (!salesInfo) {
      return res.status(401).json({ success: false, message: 'Sale Approving Error' })
    }

    sendInvoiceMail(fboInfo.email, invoiceData); //sending invoice by mail
    return res.status(200).json({ success: true })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}