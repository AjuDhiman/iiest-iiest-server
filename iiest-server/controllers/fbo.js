const pastFboSchema = require('../models/pastFboSchema');
const { generateCustomerId } = require('./empGenerator');
const { generateInvoice } = require('./invoiceGenerate')
const axios = require('axios');
const sha256 = require('sha256');
const uniqid = require('uniqid');
const fboPaymentSchema = require('../models/fboPaymentSchema');
const mongoose = require('mongoose');
const fboModel = require('../models/fboSchema');
const employeeSchema = require('../models/employeeSchema');

const registrationHandler = async()=>{
    let isUnique = false;
    let idNumber;

    while (!isUnique) {
      idNumber = Math.floor(10000 + Math.random() * 90000);
      const existingNumber = await fboModel.findOne({ id_num: idNumber });
      if (!existingNumber) {
        isUnique = true;
      }
    }

    const generatedCustomerId = generateCustomerId(idNumber);
    let date = new Date();

    let selectedModel = fboModel

    return { idNumber, generatedCustomerId, date, selectedModel }
}

const invoiceHandler = (idNum, mail, fboName, address, contact, amount, totalAmount, serviceArray, signatureName)=>{

  const tax = (18/100)*amount;

  const date = new Date();
  const dateVal = date.getDate();
  const monthVal = date.getMonth() + 1;
  const yearVal = date.getFullYear();

  const infoObj = {
    date: `${dateVal}-${monthVal}-${yearVal}`,
    receiptNo: idNum,
    transactionId: idNum,
    name: fboName, 
    address: address, 
    contact: contact, 
    amount: amount,
    taxAmount: tax,
    totalAmount: totalAmount,
    chosenServices: serviceArray,
    signatureName: signatureName
  }
  generateInvoice(idNum, mail, infoObj);
}

exports.fboPayment = async(req, res)=>{
  try {
  let success = false;

  const userInfo = await employeeSchema.findById(req.params.id);
  const signatureFile = userInfo.signatureFile;

  if(!signatureFile){
    success = false;
    return res.status(404).json({success, signatureErr: true});
  }

  const formBody = req.body;
  const createrId = req.params.id
  req.session.fboFormData = {...formBody, createrObjId: createrId, signatureFile};

  const existing_owner_contact = await fboModel.findOne({ owner_contact: formBody.owner_contact });
      if (existing_owner_contact) {
        return res.status(401).json({ success, contactErr: true });
  }
      
  const existing_email = await fboModel.findOne({ email: formBody.email });
      if(existing_email){
      return res.status(401).json({ success, emailErr: true });
  }
  
  let tx_uuid = uniqid();

  let normalPayLoad = {
    "merchantId": "PGTESTPAYUAT93",
    "merchantTransactionId": tx_uuid,
    "merchantUserId": "MUID123",
    "amount": formBody.grand_total * 100,
    "redirectUrl": "http://localhost:3000/iiest/fbo-pay-return",
    "redirectMode": "POST",
    "callbackUrl": "http://localhost:3000/iiest/fbo-pay-return",
    "paymentInstrument": {
      "type": "PAY_PAGE"
    }
  }

  let saltKey = '875126e4-5a13-4dae-ad60-5b8c8b629035';
  let saltIndex = 1
  let bufferObj = Buffer.from(JSON.stringify(normalPayLoad), "utf8");
  let base64String = bufferObj.toString("base64");
  
  let string = base64String + '/pg/v1/pay' + saltKey;
  
  let sha256_val = sha256(string);
  let checksum = sha256_val + '###' + saltIndex;

  axios.post('https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay', {
    'request': base64String
  }, {
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'accept': 'application/json'
    }
  }).then(function (response) {
    return res.status(200).json({message: response.data.data.instrumentResponse.redirectInfo.url});
  }).catch(function (error) {
    console.log(error);
  });
  } catch (error) {
    return res.status(500).json({message: 'Internal Server Error'});
  }
}

exports.fboPayReturn = async(req, res)=>{
  try {

    if (req.body.code === 'PAYMENT_SUCCESS' && req.body.merchantId && req.body.transactionId && req.body.providerReferenceId){
      if (req.body.transactionId) {

        let success = false;

        const fetchedFormData = req.session.fboFormData;

        const { fbo_name, owner_name, owner_contact, email, state, district, address, product_name, payment_mode, createdBy, grand_total, business_type, village, tehsil, pincode, fostac_training, foscos_training, gst_number, createrObjId, signatureFile } = fetchedFormData;  
        
        const { idNumber, generatedCustomerId, date, selectedModel } = await registrationHandler();

        let serviceArr = [];

        if(fostac_training){
        serviceArr.push(fostac_training.fostac_service_name)
        }

        if(foscos_training){
        serviceArr.push(foscos_training.foscos_service_name)
        }

        let total_processing_amount;

        if(product_name.includes('Fostac Training') && product_name.includes('Foscos Training')){
        total_processing_amount = Number(foscos_training.foscos_processing_amount) + Number(fostac_training.fostac_processing_amount);
        if(foscos_training.water_test_fee !== null){
          total_processing_amount += Number(foscos_training.water_test_fee)
          }
        }else if(product_name.includes('Fostac Training')){
        total_processing_amount = Number(fostac_training.fostac_processing_amount);
        }else if(product_name.includes('Foscos Training')){
        total_processing_amount = Number(foscos_training.foscos_processing_amount);
        if(foscos_training.water_test_fee !== null){
          total_processing_amount += Number(foscos_training.water_test_fee);
          }
        }

        const fboEntry = await selectedModel.create({
        createrId: createrObjId, id_num: idNumber, fbo_name, owner_name, owner_contact, email, state, district, address, product_name, customer_id: generatedCustomerId,   createdAt: date, payment_mode, createdBy, village, tehsil, pincode, grand_total, business_type, foscosInfo: foscos_training, fostacInfo: fostac_training, gst_number
        });

        const buyerId = new mongoose.Types.ObjectId(fboEntry.id);

        let buyerData;

        if(fboEntry){
          buyerData = await fboPaymentSchema.create({
            buyerId, merchantId: req.body.merchantId, merchantTransactionId: req.body.transactionId, providerReferenceId: req.body.providerReferenceId, amount: grand_total
          });
        }else{
          return res.status(401).json({success, message: "FBO entry not successful"})
        }

        if(buyerData){
           invoiceHandler(idNumber, email, fbo_name, address, owner_contact, total_processing_amount, grand_total, serviceArr, signatureFile);
        }else{
          return res.status(401).json({success, message: "Data not entered in payment collection"});
        }

        res.redirect('http://localhost:4200/fbo');

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
    return res.status(500).json({message: "Internal Server Error"});
  }
}

exports.fboRegister = async (req, res) => {
  try {

      const createrObjId = req.params.id;

      let success = false;

      const userInfo = await employeeSchema.findById(createrObjId);
      const signatureFile = userInfo.signatureFile;

      if(!signatureFile){
        return res.status(404).json({success, signatureErr: true})
      }

      const { fbo_name, owner_name, owner_contact, email, state, district, address, product_name, payment_mode, createdBy, grand_total, business_type, village, tehsil, pincode, fostac_training, foscos_training, gst_number } = req.body;
      
      const existing_owner_contact = await fboModel.findOne({ owner_contact });
      if (existing_owner_contact) {
        return res.status(401).json({ success, contactErr: true });
      }
      
      const existing_email = await fboModel.findOne({ email });
      if (existing_email) {
      return res.status(401).json({ success, emailErr: true });
      }

      const { idNumber, generatedCustomerId, date, selectedModel } = await registrationHandler();

      let serviceArr = [];

      if(fostac_training){
        serviceArr.push(fostac_training.fostac_service_name)
      }

      if(foscos_training){
        serviceArr.push(foscos_training.foscos_service_name)
      }

      let total_processing_amount;

      if(product_name.includes('Fostac Training') && product_name.includes('Foscos Training')){
        total_processing_amount = Number(foscos_training.foscos_processing_amount) + Number(fostac_training.fostac_processing_amount);
        if(foscos_training.water_test_fee !== null){
          total_processing_amount += Number(foscos_training.water_test_fee)
        }
      }else if(product_name.includes('Fostac Training')){
        total_processing_amount = Number(fostac_training.fostac_processing_amount);
      }else if(product_name.includes('Foscos Training')){
        total_processing_amount = Number(foscos_training.foscos_processing_amount);
        if(foscos_training.water_test_fee !== null){
          total_processing_amount += Number(foscos_training.water_test_fee)
        }
      }

      const fboEntry = await selectedModel.create({
      createrId: createrObjId, id_num: idNumber, fbo_name, owner_name, owner_contact, email, state, district, address, product_name, customer_id: generatedCustomerId,   createdAt: date, payment_mode, createdBy, village, tehsil, pincode, grand_total, business_type, foscosInfo: foscos_training, fostacInfo: fostac_training, gst_number
      });

      if(fboEntry){
      invoiceHandler(idNumber, email, fbo_name, address, owner_contact, total_processing_amount, grand_total, serviceArr, signatureFile);
      success = true;
      return res.status(201).json({ success });
      }

      success = false; 
      return res.status(401).json({success, registerErr: true});

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

//Controller for deleting FBO
exports.deleteFbo = async(req, res)=>{
    const objId =  req.params.id;
    let success = false;

    let date = new Date();

    try {
        const deletedFbo = await fboModel.findByIdAndDelete(objId);
        if(deletedFbo){

            const {_id, ...pastFbo} = deletedFbo.toObject();
            const{ deletedBy } = req.body;

            await pastFboSchema.create({...pastFbo, deletedAt: date, deletedBy: deletedBy}) //Adding deleted fbo to past fbo data

            success = true;
            return res.status(200).json({success, deletedFbo});
        }else{
            success = false;
            return res.status(401).json({success, message: "Fbo Not Found"});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

//Controller for editing FBO data
exports.editFbo = async(req, res)=>{

    try {

        let objId = req.params.id;
        let success = false;

        const updatedFboData = req.body;
        const editedBy = req.body.editedBy

        const updatedFbo = await fboModel.findByIdAndUpdate(objId, {...updatedFboData, lastEdit: editedBy}, {new: true});

        if(!updatedFbo){
            success = false;
            return res.status(401).json({success, message: "Employee Not Found"});
        }

        success = true;
        return res.status(201).json({success, updatedFbo})

    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

//Controller to get all FBO Data
exports.allFBOData  = async(req, res)=>{
    try {
        const fboData = await fboModel.find({createdBy: `${req.user.employee_name}(${req.user.employee_id})`});
        return res.status(200).json({fboData});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

