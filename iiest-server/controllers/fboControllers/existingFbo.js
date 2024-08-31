const { ObjectId } = require("mongodb");
const { empSignBucket, createInvoiceBucket } = require("../../config/buckets");
const invoiceDataHandler = require("../../fbo/generateInvoice");
const areaAllocationModel = require("../../models/employeeModels/employeeAreaSchema");
const salesModel = require("../../models/employeeModels/employeeSalesSchema");
const employeeSchema = require("../../models/employeeModels/employeeSchema");
const fboModel = require('../../models/fboModels/fboSchema');
const payRequest = require("../../fbo/phonePay");
const fboPaymentSchema = require("../../models/fboModels/fboPaymentSchema");
const { sendInvoiceMail, sendCheckMail } = require("../../fbo/sendMail");
const sessionModel = require("../../models/generalModels/sessionDataSchema");
const boModel = require("../../models/BoModels/boSchema");
const { shopModel } = require("../../models/fboModels/recipientSchema");
const { generateInvoiceCode } = require("../../fbo/generateCredentials");
const generalDataSchema = require("../../models/generalModels/generalDataSchema");
const { doesFileExist, employeeDocsPath } = require("../../config/s3Bucket");
const FRONT_END = JSON.parse(process.env.FRONT_END);
const BACK_END = process.env.BACK_END;

//api for exsisting fbo by cash sale
exports.existingFboCash = async (req, res) => {
  try {

    const createrObjId = req.params.id;

    let success = false;

    const userInfo = await employeeSchema.findById(createrObjId);
    const signatureFile = userInfo.signatureImage;
    const officerName = userInfo.employee_name;

    if (!signatureFile) {
      return res.status(404).json({ success, signatureErr: true })
    }

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

    const { product_name, payment_mode, grand_total, pincode, fostac_training, foscos_training, hygiene_audit, fostacGST, foscosGST, hygieneGST, foscosFixedCharge, existingFboId } = req.body;

    const existingFboInfo = await fboModel.findOne({ customer_id: existingFboId }).populate({ path: 'boInfo' });

    if (!existingFboInfo) {
      success = false;
      return res.status(404).json({ success, fboMissing: true });
    }

    if (!panIndiaAllowedIds.includes(req.user.employee_id) && panelType !== 'FSSAI Relationship Panel') {
      const pincodeCheck = areaAlloted.pincodes.includes(pincode);
      if (!pincodeCheck) {
        success = false;
        return res.status(404).json({ success, wrongPincode: true });
      }
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

    let fileName;
    if (product_name.includes('Fostac')) {
      fileName = `${Date.now()}_${existingFboInfo.id_num}.pdf`;
      invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);
      total_processing_amount = Number(fostac_training.fostac_processing_amount);
      totalGST = fostacGST;

      const qty = fostac_training.recipient_no;

      invoiceData.push(await invoiceDataHandler(existingFboInfo.id_num, existingFboInfo.email, existingFboInfo.fbo_name, existingFboInfo.address, existingFboInfo.state, existingFboInfo.owner_contact, existingFboInfo.email, total_processing_amount, extraFee, totalGST, qty, existingFboInfo.business_type, existingFboInfo.gst_number, fostac_training.fostac_total, 'Fostac', fostac_training, signatureFile, invoiceUploadStream, officerName, existingFboId, existingFboInfo.boInfo.customer_id));

      invoiceIdArr.push({ src: invoiceUploadStream.id, code: invoiceCode });
    }

    if (product_name.includes('Foscos')) {
      fileName = `${Date.now()}_${existingFboInfo.id_num}.pdf`;
      invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);
      total_processing_amount = Number(foscos_training.foscos_processing_amount);
      totalGST = foscosGST;
      extraFee = foscosFixedCharge;

      const foscos_total = Number(foscos_training.foscos_total) - extraFee - Number(foscos_training.water_test_fee);;

      const qty = foscos_training.shops_no;

      invoiceData.push(await invoiceDataHandler(existingFboInfo.id_num, existingFboInfo.email, existingFboInfo.fbo_name, existingFboInfo.address, existingFboInfo.state, existingFboInfo.owner_contact, existingFboInfo.email, total_processing_amount, extraFee, totalGST, qty, existingFboInfo.business_type, existingFboInfo.gst_number, foscos_total, 'Foscos', foscos_training, signatureFile, invoiceUploadStream, officerName, existingFboId, existingFboInfo.boInfo.customer_id));

      invoiceIdArr.push({ src: invoiceUploadStream.id, code: invoiceCode });
    }

    if (product_name.includes('HRA')) {
      fileName = `${Date.now()}_${existingFboInfo.id_num}.pdf`;
      invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);
      total_processing_amount = Number(hygiene_audit.hra_processing_amount);
      totalGST = hygieneGST;

      const qty = hygiene_audit.shops_no;

      invoiceData.push(await invoiceDataHandler(existingFboInfo.id_num, existingFboInfo.email, existingFboInfo.fbo_name, existingFboInfo.address, existingFboInfo.state, existingFboInfo.owner_contact, existingFboInfo.email, total_processing_amount, extraFee, totalGST, qty, existingFboInfo.business_type, existingFboInfo.gst_number, hygiene_audit.hra_total, 'HRA', hygiene_audit, signatureFile, invoiceUploadStream, officerName, existingFboId, existingFboInfo.boInfo.customer_id));

      invoiceIdArr.push({ src: invoiceUploadStream.id, code: invoiceCode });
    }

    const selectedProductInfo = await salesModel.create({ employeeInfo: createrObjId, fboInfo: existingFboInfo._id, product_name, fostacInfo: fostac_training, foscosInfo: foscos_training, hraInfo: hygiene_audit, payment_mode, grand_total, invoiceId: invoiceIdArr });

    if (!selectedProductInfo) {
      success = false;
      return res.status(401).json({ success, randomErr: true });
    }

    success = true;

    const isPayLaterMail = false;
    sendInvoiceMail(existingFboInfo.email, invoiceData, isPayLaterMail, {});
    return res.status(200).json({ success })

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}


//exsisting fbo sales operations is sales done by pay later
exports.existingFboPayLater = async (req, res) => {
  try {

    const createrObjId = req.params.id; //getting employee info

    let success = false;

    const userInfo = await employeeSchema.findById(createrObjId);
    const signatureFile = userInfo.signatureImage;
    const panelType = userInfo.panel_type;

    if (!signatureFile) {
      return res.status(404).json({ success, signatureErr: true })
    }

    const areaAlloted = await areaAllocationModel.findOne({ employeeInfo: createrObjId }); //cjecking for allocated area
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

    const { product_name, payment_mode, grand_total, pincode, fostac_training, foscos_training, hygiene_audit, medical, khadya_paaln, water_test_report, existingFboId } = req.body;
    const formData = req.body;

    const existingFboInfo = await fboModel.findOne({ customer_id: existingFboId }).populate('boInfo');

    if (!existingFboInfo) {
      success = false;
      return res.status(404).json({ success, fboMissing: true });
    }

    if (!panIndiaAllowedIds.includes(req.user.employee_id) && panelType !== 'FSSAI Relationship Panel') {
      const pincodeCheck = areaAlloted.pincodes.includes(pincode);
      if (!pincodeCheck) {
        success = false;
        return res.status(404).json({ success, wrongPincode: true });
      }
    }

    const selectedProductInfo = await salesModel.create({ employeeInfo: createrObjId, fboInfo: existingFboInfo._id, product_name: product_name, fostacInfo: fostac_training, foscosInfo: foscos_training, hraInfo: hygiene_audit, medicalInfo: medical, khadyaPaalnInfo: khadya_paaln, waterTestInfo: water_test_report, payment_mode, grand_total, invoiceId: [], notificationInfo: [],  pay_later_status: 'Pending', });

    if (!selectedProductInfo) {
      success = false;
      return res.status(401).json({ success, randomErr: true });
    }

    product_name.forEach(async (product) => {
      const addShop = await shopModel.create({ salesInfo: selectedProductInfo._id, managerName: existingFboInfo.boInfo.manager_name, address: existingFboInfo.address, state: existingFboInfo.state, district: existingFboInfo.district, pincode: existingFboInfo.pincode, shopId: existingFboInfo.customer_id, product_name: product, village: existingFboInfo.village, tehsil: existingFboInfo.tehsil, isVerificationLinkSend: true }); //create shop after sale for belongs to this sale
    })

    success = true;

    const invoiceData = [];
    const isPayLaterMail = true;
    sendInvoiceMail(existingFboInfo.email, invoiceData, isPayLaterMail, formData);
    return res.status(200).json({ success })

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

//exsisting fbo sales operations is sales done by cheque
exports.existingFboByCheque = async (req, res) => {
  try {

    const chequeImage = req.files['cheque_image'][0]
    const createrObjId = req.params.id; //getting employee info

    let success = false;

    const userInfo = await employeeSchema.findById(createrObjId);
    const signatureFile = userInfo.signatureImage;
    const officerName = userInfo.employee_name;
    const panelType = userInfo.panel_type;

    if (!signatureFile) {
      return res.status(404).json({ success, signatureErr: true })
    }

    const areaAlloted = await areaAllocationModel.findOne({ employeeInfo: createrObjId }); //cjecking for allocated area
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

    const { product_name, payment_mode, grand_total, pincode, fostac_training, foscos_training, hygiene_audit, medical, khadya_paaln, water_test_report, cheque_data, isFostac, isFoscos, isHygiene, isMedical, isKhadyaPaaln, isWaterTest, existingFboId } = req.body;

    const existingFboInfo = await fboModel.findOne({ customer_id: existingFboId }).populate('boInfo');

    if (!existingFboInfo) {
      success = false;
      return res.status(404).json({ success, fboMissing: true });
    }

    if (!panIndiaAllowedIds.includes(req.user.employee_id) && panelType !== 'FSSAI Relationship Panel') {
      const pincodeCheck = areaAlloted.pincodes.includes(pincode);
      if (!pincodeCheck) {
        success = false;
        return res.status(404).json({ success, wrongPincode: true });
      }
    }

    //convet json to obj of product details comming from frontend
    let fostacTraining = isFostac === 'true' ? JSON.parse(fostac_training) : undefined;
    let foscosTraining = isFoscos === 'true' ? JSON.parse(foscos_training) : undefined;
    let hygieneAudit = isHygiene === 'true' ? JSON.parse(hygiene_audit) : undefined;
    let Medical = isMedical === 'true' ? JSON.parse(medical) : undefined;
    let KhadyaPaaln = isKhadyaPaaln === 'true' ? JSON.parse(khadya_paaln) : undefined;
    let waterTestReport = isWaterTest === 'true' ? JSON.parse(water_test_report) : undefined;
    let chequeData = JSON.parse(cheque_data);
    let productName = product_name.split(',');
    chequeData.status = 'Pending';
    chequeData.cheque_image = chequeImage.key

    const selectedProductInfo = await salesModel.create({ employeeInfo: createrObjId, fboInfo: existingFboInfo._id, product_name: productName, fostacInfo: fostacTraining, foscosInfo: foscosTraining, hraInfo: hygieneAudit, medicalInfo: Medical, khadyaPaalnInfo: KhadyaPaaln, waterTestInfo: waterTestReport, payment_mode, grand_total, invoiceId: [], notificationInfo: [], cheque_data: chequeData });

    if (!selectedProductInfo) {
      success = false;
      return res.status(401).json({ success, randomErr: true });
    }

    productName.forEach(async (product) => {

      const addShop = await shopModel.create({ salesInfo: selectedProductInfo._id, managerName: existingFboInfo.boInfo.manager_name, address: existingFboInfo.address, state: existingFboInfo.state, district: existingFboInfo.district, pincode: existingFboInfo.pincode, shopId: existingFboInfo.customer_id, product_name: product, village: existingFboInfo.village, tehsil: existingFboInfo.tehsil, isVerificationLinkSend: true }); //create shop after sale for belongs to this sale

    })

    success = true;

    let clientData = {
      cheque_data: chequeData
    }
    sendCheckMail(existingFboInfo.email, clientData);
    return res.status(200).json({ success })

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}


exports.existingFboPayPage = async (req, res) => {
  try {
    let success = false;

    const panelType = req.user.panel_type;
    const formBody = req.body;
    const createrId = req.params.id;

    // Validate createrId to ensure it's a valid ObjectId
    if (!ObjectId.isValid(createrId)) {
      return res.status(400).json({ success, message: 'Invalid creator ID format' });
    }

    const userInfo = await employeeSchema.findById(createrId);
    if (!userInfo) {
      return res.status(404).json({ success, message: 'User not found' });
    }

    const signatureFile = userInfo.signatureImage;
    const officerName = userInfo.employee_name;

    if (!signatureFile) {
      return res.status(404).json({ success, signatureErr: true });
    }

    const areaAlloted = await areaAllocationModel.findOne({ employeeInfo: createrId });
    const panIndiaAllowedIds = (await generalDataSchema.find({}))[0].pan_india_allowed_ids;

    if (!panIndiaAllowedIds.includes(req.user.employee_id) && panelType !== 'FSSAI Relationship Panel') {
      if (!areaAlloted) {
        return res.status(404).json({ success, areaAllocationErr: true });
      }
    }

    const signExists = await doesFileExist(`${employeeDocsPath}${signatureFile}`);
    if (!signExists) {
      return res.status(404).json({ success, noSignErr: true });
    }

    const existingFboInfo = await fboModel.findOne({ customer_id: formBody.existingFboId });
    if (!existingFboInfo) {
      return res.status(404).json({ success, fboMissing: true });
    }

    const fboFormData = await sessionModel.create({
      data: {
        ...formBody,
        createrObjId: new ObjectId(createrId),
        signatureFile,
        existingFboInfo,
        officerName
      }
    });

    if (!panIndiaAllowedIds.includes(req.user.employee_id) && panelType !== 'FSSAI Relationship Panel') {
      const pincodeCheck = areaAlloted.pincodes.includes(formBody.pincode);
      if (!pincodeCheck) {
        return res.status(404).json({ success, wrongPincode: true });
      }
    }

    // Call the payment request function
    await payRequest(formBody.grand_total, req.user, res, `${BACK_END}/existingfbo-pay-return/${fboFormData._id}`);
  } catch (error) {
    console.error(error);
    console.log('hi')
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



//API for sale i n case of pay page success


exports.existingFboPayReturn = async (req, res) => {
  let sessionId = req.params.id; //Disclaimer: This sessionId here is used to get stored data from sessionData Model from mongoose this used in place of session because of unaviliblity of session in case of redirect in pm2 server so do not take it as express-session

  try {

    if (req.body.code === 'PAYMENT_SUCCESS' && req.body.merchantId && req.body.transactionId && req.body.providerReferenceId) {
      if (req.body.transactionId) {

        let success = false;

        // const fetchedFormData = req.session.fboFormData;
        let sessionData = await sessionModel.findById(sessionId);
        if (!sessionData) {
          res.redirect(`${FRONT_END.VIEW_URL}/#/fbo`);
          return
        }

        const fetchedFormData = sessionData.data;
        //getting if already this sales api called or not
        let apiCalled = fetchedFormData.apiCalled;
        await sessionModel.findByIdAndUpdate(sessionId, { data: { ...fetchedFormData, apiCalled: true } });

        if (apiCalled) {
          res.redirect(`${FRONT_END.VIEW_URL}/#/fbo`);
          return;
        }

        //destructuring form body
        const {
          product_name,
          payment_mode,
          grand_total,
          fostac_training,
          foscos_training,
          hygiene_audit,
          medical,
          khadya_paaln,
          water_test_report,
          createrObjId,
          signatureFile,
          fostacGST,
          foscosGST,
          hygieneGST,
          medicalGST,
          khadyaPaalnGST,
          waterTestGST,
          foscosFixedCharge,
          medicalFixedCharges,
          existingFboInfo,
          officerName } = fetchedFormData;

        const boData = await boModel.findOne({ _id: existingFboInfo.boInfo }); //getting bo data

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

        if (medical) { //push medical in  case of medical
          serviceArr.push('Medical');
        }

        if (khadya_paaln) { 
          serviceArr.push('Khadya Paaln');
        }

        if (water_test_report) { //push medical in  case of water test
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

        let fileName;
        if (product_name.includes('Fostac')) { // in case sale includes fostac

          const invoiceCode = await generateInvoiceCode(existingFboInfo.business_type);//generating new invoice code
          fileName = `${Date.now()}_${existingFboInfo.id_num}.pdf`;
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

          total_processing_amount = Number(fostac_training.fostac_processing_amount);
          totalGST = fostacGST;

          const qty = fostac_training.recipient_no;

          const invoice = await invoiceDataHandler(invoiceCode, existingFboInfo.email, existingFboInfo.fbo_name, existingFboInfo.address, existingFboInfo.state, existingFboInfo.district, existingFboInfo.pincode, existingFboInfo.owner_contact, existingFboInfo.email, total_processing_amount, extraFee, totalGST, qty, existingFboInfo.business_type, existingFboInfo.gst_number, fostac_training.fostac_total, 'Fostac', fostac_training, signatureFile, invoiceUploadStream, officerName, existingFboInfo.customer_id, boData);
          invoiceData.push(invoice);
          invoiceIdArr.push({ src: invoice.fileName, code: invoiceCode, product: 'Fostac' });

          //createg self notification data for our panel notifications
          //setting is read false for this particular product
          notificationsArr.push({ isRead: false, product: 'Fostac', purpose: 'Verification' });
        }

        if (product_name.includes('Foscos')) {
          const invoiceCode = await generateInvoiceCode(existingFboInfo.business_type);//generating new invoice code
          fileName = `${Date.now()}_${existingFboInfo.id_num}.pdf`;
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

          total_processing_amount = Number(foscos_training.foscos_processing_amount);
          totalGST = foscosGST;
          extraFee = foscosFixedCharge;

          const foscos_total = Number(foscos_training.foscos_total) - extraFee - Number(foscos_training.water_test_fee);

          const qty = foscos_training.shops_no;

          const invoice = await invoiceDataHandler(invoiceCode, existingFboInfo.email, existingFboInfo.fbo_name, existingFboInfo.address, existingFboInfo.state, existingFboInfo.district, existingFboInfo.pincode, existingFboInfo.owner_contact, existingFboInfo.email, total_processing_amount, extraFee, totalGST, qty, existingFboInfo.business_type, existingFboInfo.gst_number, foscos_total, 'Foscos', foscos_training, signatureFile, invoiceUploadStream, officerName, existingFboInfo.customer_id, boData);
          invoiceData.push(invoice);
          invoiceIdArr.push({ src: invoice.fileName, code: invoiceCode, product: 'Foscos' });

          //createg self notification data for our panel notifications
          //setting is read false for this particular product
          notificationsArr.push({ isRead: false, product: 'Foscos', purpose: 'Verification' });
        }

        if (product_name.includes('HRA')) {
          const invoiceCode = await generateInvoiceCode(existingFboInfo.business_type);//generating new invoice code

          fileName = `${Date.now()}_${existingFboInfo.id_num}.pdf`;
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

          total_processing_amount = Number(hygiene_audit.hra_processing_amount);
          totalGST = hygieneGST;

          const qty = hygiene_audit.shops_no;

          const invoice = await invoiceDataHandler(invoiceCode, existingFboInfo.email, existingFboInfo.fbo_name, existingFboInfo.address, existingFboInfo.state, existingFboInfo.district, existingFboInfo.pincode, existingFboInfo.owner_contact, existingFboInfo.email, total_processing_amount, extraFee, totalGST, qty, existingFboInfo.business_type, existingFboInfo.gst_number, hygiene_audit.hra_total, 'HRA', hygiene_audit, signatureFile, invoiceUploadStream, officerName, existingFboInfo.customer_id, boData);

          invoiceData.push(invoice)
          invoiceIdArr.push({ src: invoice.fileName, code: invoiceCode, product: 'HRA' });

          //createg self notification data for our panel notifications
          //setting is read false for this particular product
          notificationsArr.push({ isRead: false, product: 'HRA', purpose: 'Verification' });
        }

        if (product_name.includes('Medical')) {
          const invoiceCode = await generateInvoiceCode(existingFboInfo.business_type);//generating new invoice code

          fileName = `${Date.now()}_${existingFboInfo.id_num}.pdf`;
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

          total_processing_amount = Number(medical.medical_processing_amount);
          totalGST = medicalGST;

          const qty = medical.recipient_no;

          const invoice = await invoiceDataHandler(invoiceCode, existingFboInfo.email, existingFboInfo.fbo_name, existingFboInfo.address, existingFboInfo.state, existingFboInfo.district, existingFboInfo.pincode, existingFboInfo.owner_contact, existingFboInfo.email, total_processing_amount, extraFee, totalGST, qty, existingFboInfo.business_type, existingFboInfo.gst_number, medical.medical_total, 'Medical', medical, signatureFile, invoiceUploadStream, officerName, existingFboInfo.customer_id, boData);

          invoiceData.push(invoice);

          invoiceIdArr.push({ src: invoice.fileName, code: invoiceCode, product: 'Medical' });
        }

        if (product_name.includes('Khadya Paaln')) {
          const invoiceCode = await generateInvoiceCode(existingFboInfo.business_type);//generating new invoice code

          fileName = `${Date.now()}_${existingFboInfo.id_num}.pdf`;
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

          total_processing_amount = Number(khadya_paaln.khadya_paaln_processing_amount);
          totalGST = khadyaPaalnGST;
          

          const qty = 1;

          const invoice = await invoiceDataHandler(invoiceCode, existingFboInfo.email, existingFboInfo.fbo_name, existingFboInfo.address, existingFboInfo.state, existingFboInfo.district, existingFboInfo.pincode, existingFboInfo.owner_contact, existingFboInfo.email, total_processing_amount, extraFee, totalGST, qty, existingFboInfo.business_type, existingFboInfo.gst_number, khadya_paaln.khadya_paaln_total, 'Khadya Paaln', khadya_paaln, signatureFile, invoiceUploadStream, officerName, existingFboInfo.customer_id, boData);

          invoiceData.push(invoice);

          invoiceIdArr.push({ src: invoice.fileName, code: invoiceCode, product: 'Khadya Paaln' });
        }

        if (product_name.includes('Water Test Report')) {
          const invoiceCode = await generateInvoiceCode(existingFboInfo.business_type);//generating new invoice code

          fileName = `${Date.now()}_${existingFboInfo.id_num}.pdf`;
          invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

          total_processing_amount = Number(water_test_report.water_test_processing_amount);
          totalGST = waterTestGST;

          const qty = 1;

          //getting invoice buffer and invoice Id for sending it in mail and saving in d

          //pushing buffer into invoice data array
          const invoice = await invoiceDataHandler(invoiceCode, existingFboInfo.email, existingFboInfo.fbo_name, existingFboInfo.address, existingFboInfo.state, existingFboInfo.district, existingFboInfo.pincode, existingFboInfo.owner_contact, existingFboInfo.email, total_processing_amount, extraFee, totalGST, qty, existingFboInfo.business_type, existingFboInfo.gst_number, water_test_report.water_test_total, 'Water Test Report', water_test_report, signatureFile, invoiceUploadStream, officerName, existingFboInfo.customer_id, boData);

          invoiceData.push(invoice);
          invoiceIdArr.push({ src: invoice.fileName, code: invoiceCode, product: 'Water Test Report' });
        }

        const buyerData = await fboPaymentSchema.create({
          buyerId: existingFboInfo._id, merchantId: req.body.merchantId, merchantTransactionId: req.body.transactionId, providerReferenceId: req.body.providerReferenceId, amount: grand_total
        });

        if (!buyerData) {
          return res.status(401).json({ success, message: "Data not entered in payment collection" });
        }


        //creating new sale record in db
        const selectedProductInfo = await salesModel.create({
          employeeInfo: createrObjId,
          fboInfo: existingFboInfo._id,
          product_name,
          fostacInfo: fostac_training,
          foscosInfo: foscos_training,
          hraInfo: hygiene_audit,
          medicalInfo: medical,
          khadyaPaalnInfo: khadya_paaln,
          waterTestInfo: water_test_report,
          payment_mode,
          grand_total,
          invoiceId: invoiceIdArr,
          notificationInfo: notificationsArr
        });


        //sending error response in case !selectedProductInfo
        if (!selectedProductInfo) {
          return res.status(401).json({
            success,
            message: "Data not entered in employee_sales collection"
          });
        }


        //add shop

        product_name.forEach( async (product) => {
          const addShop = await shopModel.create({
            salesInfo: selectedProductInfo._id,
            managerName: boData.manager_name,
            address: existingFboInfo.address,
            state: existingFboInfo.state,
            district: existingFboInfo.district,
            pincode: existingFboInfo.pincode,
            shopId: existingFboInfo.customer_id,
            product_name: product,
            village: existingFboInfo.village,
            tehsil: existingFboInfo.tehsil,
            isVerificationLinkSend: true
          }); //create shop after sale for belongs  tohis sale
        });

        // if (!addShop) {
        //   return res.status(401).json({ success: false, message: 'Shop creation Error', shopCreErr: true });
        // }

        // req.session.destroy((err) => {
        //   console.log(err);
        // });

        res.redirect(`${FRONT_END.VIEW_URL}/#/fbo`);

        const isPayLaterMail = false;
        sendInvoiceMail(existingFboInfo.email, invoiceData, isPayLaterMail, {});

      }
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    await sessionModel.findByIdAndDelete(sessionId);// delete session data at last in any case sucess or faliure
  }
}