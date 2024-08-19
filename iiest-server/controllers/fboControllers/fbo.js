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
const { sendInvoiceMail, sendCheckMail, sendFboVerificationMail } = require('../../fbo/sendMail');
const boModel = require('../../models/BoModels/boSchema');
const sessionModel = require('../../models/generalModels/sessionDataSchema');
const { shopModel } = require('../../models/fboModels/recipientSchema');
const generalDataSchema = require('../../models/generalModels/generalDataSchema');
const { getDocObject, invoicesPath, fboBasicDocsPath, uploadDocObject, doesFileExist, employeeDocsPath } = require('../../config/s3Bucket');
const docsModel = require('../../models/operationModels/documentsSchema');
const { default: mongoose } = require('mongoose');
const { logAudit } = require('../generalControllers/auditLogsControllers');
const FRONT_END = JSON.parse(process.env.FRONT_END);
const BACK_END = process.env.BACK_END;

let fboFormData = {};

//methord for initiating payment with phone pe
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
    const panIndiaAllowedIds = (await generalDataSchema.find({}))[0].pan_india_allowed_ids;

    console.log(panIndiaAllowedIds);

    if (!panIndiaAllowedIds.includes(req.user.employee_id) && panelType !== 'FSSAI Relationship Panel') {

      if (!areaAlloted) {
        success = false;
        return res.status(404).json({ success, areaAllocationErr: true })
      }
    }

    const signExists = await doesFileExist(`${employeeDocsPath}${signatureFile}`);
    console.log('sign Exsists:', signExists)

    if (!signExists) {
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

    if (!panIndiaAllowedIds.includes(req.user.employee_id) && panelType !== 'FSSAI Relationship Panel') {
      const pincodeCheck = areaAlloted.pincodes.includes(formBody.pincode);

      if (!pincodeCheck) {
        success = false;
        return res.status(404).json({ success, wrongPincode: true });
      }
    }

    payRequest(formBody.grand_total, req, res, `${BACK_END}/fbo-pay-return/${fboFormData._id}`);

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

    //Do further process in case of Payment Success from phone pe
    if (req.body.code === 'PAYMENT_SUCCESS' && req.body.merchantId && req.body.transactionId && req.body.providerReferenceId) {
      if (req.body.transactionId) {

        let success = false;

        //session related functions starts
        let sessionData = await sessionModel.findById(sessionId); //getting data from session 
        if (!sessionData) { //in case session data is not present or deleted we want front end to route to fbo registeration form
          res.redirect(`${FRONT_END.VIEW_URL}/#/fbo`);
          return
        }
        const fetchedFormData = sessionData.data;

        /* getting is API called or not that will save us from the problrm if the payment success of two screens in case like payment link share 
        so it will prvent from problem of double sale */
        let apiCalled = fetchedFormData.apiCalled;

        //setting api called true 
        await sessionModel.findByIdAndUpdate(sessionId, { data: { ...fetchedFormData, apiCalled: true } });

        //if api is already called then redirect user to fbo form
        if (apiCalled) {
          res.redirect(`${FRONT_END.VIEW_URL}/#/fbo`);
          return;
        }

        //session related functions ends

        //destructuring data
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

        //generating customer id or rather say ShopId
        const { idNumber, generatedCustomerId } = await generatedInfo();

        console.log(signatureFile);

        //getting boInfo
        const boData = await boModel.findOne({ _id: boInfo });

        let serviceArr = [];

        //pushing all the services to array
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

        //array for saving invoices datas
        const invoiceData = [];
        let invoiceUploadStream;

        // arr for saving all invoices buket object keys
        const invoiceIdArr = [];

        //notification data array
        const notificationsArr = [];

        //creating bucket stream of fs bucket
        const invoiceBucket = createInvoiceBucket();

        let fileName;

        //sales operations in case it includes fostac
        if (product_name.includes('Fostac')) {
          //generating new invoice code
          const invoiceCode = await generateInvoiceCode(business_type);

          //getting file name
          fileName = `invoices/${Date.now()}.pdf`;
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

          //getting total processing amount and gst
          total_processing_amount = Number(fostac_training.fostac_processing_amount);
          totalGST = fostacGST;

          //getting total no of recps or rather say quantity of product
          const qty = fostac_training.recipient_no;

          //generating new Invoice and putting into invoice file array
          const invoice = await invoiceDataHandler(invoiceCode, email, fbo_name, address, state, district, pincode, owner_contact, email, total_processing_amount, extraFee, totalGST, qty, business_type, gst_number, fostac_training.fostac_total, 'Fostac', fostac_training, signatureFile, invoiceUploadStream, officerName, generatedCustomerId, boData);

          invoiceData.push(invoice)
          //puttinng data into invoice array
          invoiceIdArr.push({ src: invoice.fileName, code: invoiceCode, product: 'Fostac' });

          //createg self notification data for our panel notifications
          //setting is read false for this particular product
          notificationsArr.push({ isRead: false, product: 'Fostac', purpose: 'Verification' });
        }

        //sales operations in case it includes foscos
        if (product_name.includes('Foscos')) {
          const invoiceCode = await generateInvoiceCode(business_type);//generating new invoice code

          // fileName = `${Date.now()}_${idNumber}.pdf`;
          // invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

          total_processing_amount = Number(foscos_training.foscos_processing_amount);
          totalGST = foscosGST;
          extraFee = foscosFixedCharge;

          const qty = foscos_training.shops_no;
          const invoice = await invoiceDataHandler(invoiceCode, email, fbo_name, address, state, district, pincode, owner_contact, email, total_processing_amount, extraFee, totalGST, qty, business_type, gst_number, foscos_training.foscos_total, 'Foscos', foscos_training, signatureFile, invoiceUploadStream, officerName, generatedCustomerId, boData)
          invoiceData.push(invoice);

          invoiceIdArr.push({ src: invoice.fileName, code: invoiceCode, product: 'Foscos' });

          //createg self notification data for our panel notifications
          //setting is read false for this particular product
          notificationsArr.push({ isRead: false, product: 'Foscos', purpose: 'Verification' });

        }

        //sales operations in case it includes HRA
        if (product_name.includes('HRA')) {
          const invoiceCode = await generateInvoiceCode(business_type);//generating new invoice code

          fileName = `${Date.now()}_${idNumber}.pdf`;
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

          total_processing_amount = Number(hygiene_audit.hra_processing_amount);
          totalGST = hygieneGST;

          const qty = hygiene_audit.shops_no;
          const invoice = await invoiceDataHandler(invoiceCode, email, fbo_name, address, state, district, pincode, owner_contact, email, total_processing_amount, extraFee, totalGST, qty, business_type, gst_number, hygiene_audit.hra_total, 'HRA', hygiene_audit, signatureFile, invoiceUploadStream, officerName, generatedCustomerId, boData);

          invoiceData.push(invoice);
          invoiceIdArr.push({ src: invoice.fileName, code: invoiceCode, product: 'HRA' });

          //createg self notification data for our panel notifications
          //setting is read false for this particular product
          notificationsArr.push({ isRead: false, product: 'HRA', purpose: 'Verification' });
        }

        //sales operations in case it includes medical
        if (product_name.includes('Medical')) {
          const invoiceCode = await generateInvoiceCode(business_type);//generating new invoice code


          fileName = `${Date.now()}_${idNumber}.pdf`;
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

          total_processing_amount = Number(medical.medical_processing_amount);
          totalGST = medicalGST;

          const qty = medical.recipient_no;
          //create medical invoice
          const invoice = await invoiceDataHandler(invoiceCode, email, fbo_name, address, state, district, pincode, owner_contact, email, total_processing_amount, extraFee, totalGST, qty, business_type, gst_number, medical.medical_total, 'Medical', medical, signatureFile, invoiceUploadStream, officerName, generatedCustomerId, boData);

          invoiceData.push(invoice)
          invoiceIdArr.push({ src: invoice.fileName, code: invoiceCode, product: 'Medical' });
        }

        //sales operations in case it includes Water Test
        if (product_name.includes('Water Test Report')) {
          const invoiceCode = await generateInvoiceCode(business_type);//generating new invoice code

          fileName = `${Date.now()}_${idNumber}.pdf`;
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

          total_processing_amount = Number(water_test_report.water_test_processing_amount);
          totalGST = waterTestGST;

          const qty = 1;

          //create water test invoice
          const invoice = await invoiceDataHandler(invoiceCode, email, fbo_name, address, state, district, pincode, owner_contact, email, total_processing_amount, extraFee, totalGST, qty, business_type, gst_number, water_test_report.water_test_total, 'Water Test Report', water_test_report, signatureFile, invoiceUploadStream, officerName, generatedCustomerId, boData);

          invoiceData.push(invoice);
          invoiceIdArr.push({ src: invoice.fileName, code: invoiceCode, product: 'Water Test Report' });
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
          isBasicDocUploaded: false,
          isFboVerified: false,
          isVerificationLinkSend: false
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
          invoiceId: invoiceIdArr,
          notificationInfo: notificationsArr
        });

        if (!selectedProductInfo) {
          return res.status(401).json({ success, message: "Data not entered in employee_sales collection" });
        }

        //creating shop details obj in case of HRA and Foscos
        product_name.forEach(async (product) => {
          const addShop = await shopModel.create({ salesInfo: selectedProductInfo._id, managerName: boData.manager_name, address: address, state: state, district: district, pincode: pincode, shopId: generatedCustomerId, product_name: product, village: village, tehsil: tehsil, isVerificationLinkSend: false }); //create shop after sale for belongs  tohis sale
        })

        //lastly redirect user to fbo form
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
    const panIndiaAllowedIds = (await generalDataSchema.find({}))[0].pan_india_allowed_ids;

    if (!panIndiaAllowedIds.includes(req.user.employee_id) && panelType !== 'FSSAI Relationship Panel') {

      if (!areaAlloted) {
        success = false;
        return res.status(404).json({ success, areaAllocationErr: true })
      }
    }

    const signExists = await doesFileExist(`${employeeDocsPath}${signatureFile}`);
    console.log('sign Exsists:', signExists)

    if (!signExists) {
      return res.status(404).json({ success, noSignErr: true })
    }

    const { fbo_name, owner_name, owner_contact, email, state, district, address, product_name, payment_mode, createdBy, grand_total, business_type, village, tehsil, pincode, fostac_training, foscos_training, hygiene_audit, gst_number, fostacGST, foscosGST, hygieneGST, foscosFixedCharge, boInfo } = req.body;

    const boData = await boModel.findOne({ _id: boInfo });

    if (!panIndiaAllowedIds.includes(req.user.employee_id) && panelType !== 'FSSAI Relationship Panel') {
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
      employeeInfo: createrObjId, boInfo, id_num: idNumber, fbo_name, owner_name, owner_contact, email, state, district, address, customer_id: generatedCustomerId, payment_mode, createdBy, village, tehsil, pincode, business_type, gst_number, activeStatus: true, isBasicDocUploaded: false, isFboVerified: false, isVerificationLinkSend: false
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
    const panIndiaAllowedIds = (await generalDataSchema.find({}))[0].pan_india_allowed_ids;

    if (!panIndiaAllowedIds.includes(req.user.employee_id) && panelType !== 'FSSAI Relationship Panel') {

      if (!areaAlloted) {
        success = false;
        return res.status(404).json({ success, areaAllocationErr: true })
      }
    }

    const signExists = await doesFileExist(`${employeeDocsPath}${signatureFile}`);
    console.log('sign Exsists:', signExists)

    if (!signExists) {
      return res.status(404).json({ success, noSignErr: true })
    }

    const { fbo_name, owner_name, owner_contact, email, state, district, address, product_name, payment_mode, createdBy, grand_total, business_type, village, tehsil, pincode, fostac_training, foscos_training, hygiene_audit, medical, water_test_report, cheque_data, gst_number, boInfo, isFostac, isFoscos, isHygiene, isMedical, isWaterTest } = req.body;//getting data from req body

    const boData = await boModel.findOne({ _id: boInfo });

    if (!panIndiaAllowedIds.includes(req.user.employee_id) && panelType !== 'FSSAI Relationship Panel') { //checking allocated areas
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
    chequeData.cheque_image = chequeImage.key;

    console.log(productName, product_name)

    const fboEntry = await fboModel.create({
      employeeInfo: createrObjId, boInfo, id_num: idNumber, fbo_name, owner_name, owner_contact, email, state, district, address, customer_id: generatedCustomerId, payment_mode, createdBy, village, tehsil, pincode, business_type, gst_number, activeStatus: true, isBasicDocUploaded: false, isFboVerified: true
    });

    if (!fboEntry) {
      success = false;
      return res.status(401).json({ success, randomErr: true })
    }

    const selectedProductInfo = await salesModel.create({ employeeInfo: createrObjId, fboInfo: fboEntry._id, product_name: productName, fostacInfo: fostacTraining, foscosInfo: foscosTraining, hraInfo: hygieneAudit, medicalInfo: Medical, waterTestInfo: waterTestReport, payment_mode, grand_total, invoiceId: [], notificationInfo: [], cheque_data: chequeData });

    if (!selectedProductInfo) {
      success = false;
      return res.status(401).json({ success, randomErr: true })
    }

    productName.forEach(async (product) => {
      const addShop = await shopModel.create({ salesInfo: selectedProductInfo._id, managerName: boData.manager_name, address: address, state: state, district: district, pincode: pincode, shopId: generatedCustomerId, product_name: product, village: village, tehsil: tehsil, isVerificationLinkSend: false
        
       }); //create shop after sale for belongs  tohis sale
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


//methord for getting invoice 
exports.saleInvoice = async (req, res) => {
  try {

    const invoiceId = req.params.id;

    // invoices path is comming from s3.js file in config folder
    const invoiceKey = `${invoicesPath}${invoiceId}`;

    //getting invoice presigned url and sending it to client
    const invoiceConverted = await getDocObject(invoiceKey);


    return res.status(200).json({ success: true, invoiceConverted })

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

    const { handlerId, docsObject } = req.body;

    // //saving path with srcs in doc modal 
    // docsObject.forEach(doc => {
    //   doc.src.forEach(src => {
    //     src = `${fboBasicDocsPath}${src}`;
    //   })
    // });

    //check if doc obj already exsists in documents modalor not for a particular hansler id
    const idExsists = await docsModel.findOne({ handlerId: handlerId });

    //create empty obj if not exsists {}
    if (!idExsists) {
      await docsModel.create({  //create now obj in case of no history avlable
        handlerId: handlerId, documents: []
      });
    }

    // saving each doc to doc array
    docsObject.forEach(async (doc) => {
      let src = '';
      if (doc.isMultiDoc) {
        src = doc.src.map(a => `${fboBasicDocsPath}${a}`)
      } else {
        src = `${fboBasicDocsPath}${doc.src}`;
      }
      await docsModel.findOneAndUpdate({ handlerId: handlerId }, {
        $push: {
          documents: {
            name: doc.name,
            format: doc.format,
            multipleDoc: doc.isMultiDoc,
            src: src,
          }
        }
      });
    })

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

    const notificationsArr = [];

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

      const invoice = await invoiceDataHandler(invoiceCode, fboInfo.email, fboInfo.fbo_name, fboInfo.address, fboInfo.state, fboInfo.district, fboInfo.pincode, fboInfo.owner_contact, fboInfo.email, total_processing_amount, extraFee, totalGST, qty, fboInfo.business_type, fboInfo.gst_number, fostacInfo.fostac_total, 'Fostac', fostacInfo, signatureFile, invoiceUploadStream, employeeInfo.employee_name, fboInfo.customer_id, fboInfo.boInfo)

      invoiceData.push(invoice);

      invoiceIdArr.push({ src: invoice.fileName, code: invoiceCode, product: 'Fostac' });

      //createg self notification data for our panel notifications
      //setting is read false for this particular product
      notificationsArr.push({ isRead: false, product: 'Fostac', purpose: 'Verification' });
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

      //getting government and processing fes on the basis of serice choose
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
      const invoice = await invoiceDataHandler(invoiceCode, fboInfo.email, fboInfo.fbo_name, fboInfo.address, fboInfo.state, fboInfo.district, fboInfo.pincode, fboInfo.owner_contact, fboInfo.email, total_processing_amount, extraFee, totalGST, qty, fboInfo.business_type, fboInfo.gst_number, foscosInfo.foscos_total, 'Foscos', foscosInfo, signatureFile, invoiceUploadStream, employeeInfo.employee_name, fboInfo.customer_id, fboInfo.boInfo);

      invoiceData.push(invoice)
      invoiceIdArr.push({ src: invoice.fileName, code: invoiceCode, product: 'Foscos' });

      //createg self notification data for our panel notifications
      //setting is read false for this particular product
      notificationsArr.push({ isRead: false, product: 'Foscos', purpose: 'Verification' });
    }


    if (product_name.includes('HRA')) { //generating hra Invoivce in case of hra sale\
      const invoiceCode = await generateInvoiceCode(salesInfo.fboInfo.business_type);//generating new imvoice code

      fileName = `${Date.now()}_${fboInfo.id_number}.pdf`;
      invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

      total_processing_amount = Number(hraInfo.hra_processing_amount);
      totalGST = (hraInfo.hra_processing_amount * hraInfo.shops_no) * 18 / 100;

      const qty = hraInfo.shops_no;

      const invoice = await invoiceDataHandler(invoiceCode, fboInfo.email, fboInfo.fbo_name, fboInfo.address, fboInfo.state, fboInfo.district, fboInfo.pincode, fboInfo.owner_contact, fboInfo.email, total_processing_amount, extraFee, totalGST, qty, fboInfo.business_type, fboInfo.gst_number, hraInfo.hra_total, 'HRA', hraInfo, signatureFile, invoiceUploadStream, employeeInfo.employee_name, fboInfo.customer_id, fboInfo.boInfo
      );
      invoiceData.push(invoice);

      invoiceIdArr.push({ src: invoice.fileName, code: invoiceCode, product: 'HRA' });

      //createg self notification data for our panel notifications
      //setting is read false for this particular product
      notificationsArr.push({ isRead: false, product: 'HRA', purpose: 'Verification' });
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
      const invoice = await invoiceDataHandler(invoiceCode, fboInfo.email, fboInfo.fbo_name, fboInfo.address, fboInfo.state, fboInfo.district, fboInfo.pincode, fboInfo.owner_contact, fboInfo.email, total_processing_amount, extraFee, totalGST, qty, fboInfo.business_type, fboInfo.gst_number, medicalInfo.medical_total, 'Medical', medicalInfo, signatureFile, invoiceUploadStream, employeeInfo.employee_name, fboInfo.customer_id, fboInfo.boInfo);

      invoiceData.push(invoice);
      invoiceIdArr.push({ src: invoice.fileName, code: invoiceCode, product: 'Medical' });
    }

    if (product_name.includes('Water Test Report')) { //generating fostac Invoivce in case of fostac sale
      const invoiceCode = await generateInvoiceCode(salesInfo.fboInfo.business_type);//generating new imvoice code

      fileName = `${Date.now()}_${fboInfo.id_num}.pdf`;
      invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

      total_processing_amount = Number(waterTestInfo.water_test_processing_amount);
      totalGST = Math.round((waterTestInfo.water_test_processing_amount) * 18 / 100);

      const qty = 1;

      const invoice = await invoiceDataHandler(invoiceCode, fboInfo.email, fboInfo.fbo_name, fboInfo.address, fboInfo.state, fboInfo.district, fboInfo.pincode, fboInfo.owner_contact, fboInfo.email, total_processing_amount, extraFee, totalGST, qty, fboInfo.business_type, fboInfo.gst_number, waterTestInfo.water_test_total, 'Water Test Report', waterTestInfo, signatureFile, invoiceUploadStream, employeeInfo.employee_name, fboInfo.customer_id, fboInfo.boInfo);

      invoiceData.push(invoice);
      invoiceIdArr.push({ src: invoice.fileName, code: invoiceCode, product: 'Water Test Report' });
    }


    if (cheque_data) {
      await salesInfo.updateOne({ cheque_data: { ...cheque_data, status: 'Approved' }, invoiceId: invoiceIdArr, notificationInfo: notificationsArr });
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

//methord for generatig uplaod url for employeeDocs
exports.getSalesBasicDocUploadURL = async (req, res) => {
  try {
    const filename = req.params.name;
    const format = req.query.format;

    //convering format commoing in formof image_png or image_jpg to image/png or jpeg
    const formatConverted = format.split('_').join('/');

    //generating key for obj
    const key = `${fboBasicDocsPath}${filename}`;

    //generating uolaod url
    const uploadUrl = await uploadDocObject(key, formatConverted);

    return res.status(200).json({ uploadUrl: uploadUrl });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}

//methord for sendinding verification link by mail and  sms
exports.sendFboVerificationLink = async (req, res) => {
  try {

    let success = false;

    const infoToVerify = req.body

    const userName = req.user.employee_name;

    const fboObjId = req.params.fboid;

    infoToVerify.fboObjId = fboObjId;

    infoToVerify.verifier = userName;

    //sending verification mail
    sendFboVerificationMail(infoToVerify.manager_email, infoToVerify);

    success = true;

    // updating verification link send in fboobj
    const dataUpdated = await fboModel.findOneAndUpdate({_id: fboObjId}, {
      $set: {
        isVerificationLinkSend: true
      }
    })

    return res.status(200).json({ success: success, mailSend: true });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' })
  }
}

//methord for updating verification of a fbo
exports.verifyFbo = async (req, res) => {
  try {

    
    const fboObjId = req.params.fboid
    if (!mongoose.Types.ObjectId.isValid(fboObjId)) { //sending error message in case of wrong format of objet id send in parameter
      return res.status(404).json({ success: false, message: "Not A Valid Request" }); //this message will be shown in verifing mail frontend
    }



    const idExsists = await fboModel.findOne({ _id: fboObjId });

    if (idExsists) {//sending already verified mail case of mailor contact already verified 
      if (idExsists.is_email_verified) {
        return res.status(200).json({ success: true, message: 'Already Verified' })
      }

      const verifiedFbo = await fboModel.findOneAndUpdate(
        { _id: fboObjId },
        {
          // isFboVerified: true
          $set: {
            isFboVerified: true
          }
        }
      );

      //in case of verification failed send verificatio  error
      if (!verifiedFbo) {
        return res.status(404).json({ success: false, message: "Verification Failed", emailSendingErr: true });
      }


      const mailInfo = { //aggregating mail info for sending mail to bo with his or her customer id
        boName: idExsists.owner_name,
        purpose: 'onboard',
        customerId: verifiedFbo.customer_id,
        email: idExsists.email,
        contact_no: idExsists.contact_no,
        managerName: idExsists.manager_name
      }

      return res.status(200).json({ success: true, message: "Email Verified" })
    }

    return res.status(404).json({ success: false, message: "Verification Failed" });
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' })
  }
}



//methord for updating fbo info
exports.updateFboInfo = async (req, res) => {
  try {

    let success = false;

    const fboid = req.params.id;

    const user = req.user;

    const { manager_name, fbo_name, owner_name, business_entity, state, district, pincode, address, manager_email, manager_contact } = req.body;

    const fboOldInfo = await fboModel.findOne({ _id: fboid });


    //updating fbo info

    const updatedFbo = await fboModel.findOneAndUpdate({ _id: fboid }, {
      $set: {
        state: state,
        district: district,
        pincode: pincode,
        address: address,
        email: manager_email,
        owner_contact: manager_contact,
        fbo_name: fbo_name,
        owner_name: owner_name
      }
    });

    if (!updatedFbo) {
      return res.status(401).json({ success: success, updationErr: true })
    }

    //auditing log for both fbo and bo
    const fboLog = await logAudit(user._id, 'fbo_registers', fboid, fboOldInfo, updatedFbo, 'FBO Info Updated');

    const boOldInfo = await boModel.findOne({ _id: fboOldInfo.boInfo._id });

    //updating bo info
    const updatedBo = await boModel.findOneAndUpdate({ _id: fboOldInfo.boInfo._id }, {
      $set: {
        business_entity: business_entity,
        email: manager_email,
        contact_no: manager_contact,
        manager_name: manager_name
      }
    });

    if (!updatedBo) {
      return res.status(401).json({ success: success, updationErr: true })
    }

    const boLog = await logAudit(user._id, 'bo_registers', fboOldInfo.boInfo, boOldInfo, updatedBo, 'Bo Info Updated');

    return res.status(200).json({ success: success, updatedFbo: { ...updatedFbo, boInfo: updatedBo } });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" })
  }
}