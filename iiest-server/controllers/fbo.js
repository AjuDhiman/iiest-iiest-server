const { foscosModel, fostacModel, fboModel } = require('../models/fboSchema');
const pastFboSchema = require('../models/pastFboSchema');
const { generateCustomerId } = require('./empGenerator');
const { generateInvoice } = require('./invoiceGenerate')
const axios = require('axios');
const sha256 = require('sha256');
const uniqid = require('uniqid');
const fs = require('fs');
const fboPaymentSchema = require('../models/fboPaymentSchema');
const mongoose = require('mongoose');

const registrationHandler = async(productName)=>{
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

    let selectedModel;
    if (productName === 'Foscos Training') {
      selectedModel = foscosModel;
    } else {
      selectedModel = fostacModel;
    }
    return { idNumber, generatedCustomerId, date, selectedModel }
}

const invoiceHandler = async(fboName, address, idNum, date, recipientNo, productName, processingAmount)=>{
  const invoiceData = {
    "images": {
      "logo": fs.readFileSync('/Users/bhaveshdaipuria/Desktop/Web Development/iiest/iiest-server/assets/logo-side.png', 'base64')
  },
    "sender": {
      "company": "IIEST Federation",
      "address": "Building No: 55, Opposite Metro Pillar No: 6, Panchkuian Marg, Connaught Place",
      "zip": "110001",
      "city": "Delhi",
      "country": "India",
      "custom1": "Email: info@iiest.org",
      "custom2": "Website: www.iiest.org"
    },
    "client": {
      "company": fboName,
      "address": address,
      "zip": "110001",
      "city": "Delhi",
      "country": "India"
    },
    "information": {
      "date": `${date.getDate()}.${date.getMonth()}.${date.getYear()}`,
      "number": `${Date.now()}_${idNum}`
    },
    "products": [
      {
        "quantity": recipientNo,
        "description": productName,
        "tax-rate": 18,
        "price": processingAmount
      }
    ], 
    "bottom-notice": "Declaration: We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.",
    "settings": {
    "currency": "INR", 
    "format": "A4",
    "tax-notation": "IGST",
    "margin-top": 25,
    "margin-right": 25,
    "margin-left": 25,
    "margin-bottom": 25,
    },
    "translate": {
      "invoice": "IIEST Federation"
    }
  }

  await generateInvoice(idNum, invoiceData);
}

exports.fboPayment = async(req, res)=>{
  try {
  let success = false;

  const formBody = req.body;
  req.session.fboFormData = formBody;

  const existing_owner_contact = await fboModel.findOne({ owner_contact: formBody.owner_contact });
      if (existing_owner_contact) {
        return res.status(401).json({ success, contactErr: "This owner contact is already in use." });
    }
      
  const existing_email = await fboModel.findOne({ email: formBody.email });
      if (existing_email) {
      return res.status(401).json({ success, emailErr: "This email is already in use." });
    }
      
  const existing_address = await fboModel.findOne({ address: formBody.address });
      if(existing_address){
      return res.status(401).json({ success, addressErr: "This address is already in use." })
  }
  
  let tx_uuid = uniqid();

  let normalPayLoad = {
    "merchantId": "PGTESTPAYUAT93",
    "merchantTransactionId": tx_uuid,
    "merchantUserId": "MUID123",
    "amount": formBody.total_amount * 100,
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
    // return res.redirect(response.data.data.instrumentResponse.redirectInfo.url)
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

        const { fbo_name, owner_name, owner_contact, email, state, district, address, product_name, processing_amount, service_name, client_type, recipient_no, water_test_fee, payment_mode, createdBy, license_category, license_duration, total_amount, village, tehsil, pincode } = fetchedFormData

        const { idNumber, generatedCustomerId, date, selectedModel } = await registrationHandler(product_name)

        const fboEntry = await selectedModel.create({
        id_num: idNumber, fbo_name, owner_name, owner_contact, email, state, district, address, product_name, processing_amount, service_name, customer_id: generatedCustomerId, client_type, recipient_no, water_test_fee, createdAt: date, payment_mode, createdBy, license_category, license_duration, total_amount, village, tehsil, pincode
        });

        const buyerId = new mongoose.Types.ObjectId(fboEntry.id);

        console.log(buyerId, req.body.merchantId, req.body.transactionId, req.body.providerReferenceId);

        let buyerData;

        if(fboEntry){
          buyerData = await fboPaymentSchema.create({
            buyerId, merchantId: req.body.merchantId, merchantTransactionId: req.body.transactionId, providerReferenceId: req.body.providerReferenceId, amount: total_amount
          })
        }else{
          return res.status(401).json({success, message: "FBO entry not successful"})
        }

        console.log(buyerData);

        if(buyerData){
          await invoiceHandler(fbo_name, address, idNumber, date, recipient_no, product_name, processing_amount);
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
      let success = false;

      const { fbo_name, owner_name, owner_contact, email, state, district, address, product_name, processing_amount, service_name, client_type, recipient_no, water_test_fee, payment_mode, createdBy, license_category, license_duration, total_amount, village, tehsil, pincode } = req.body;

      
      const existing_owner_contact = await fboModel.findOne({ owner_contact });
      if (existing_owner_contact) {
        return res.status(401).json({ success, contactErr: "This owner contact is already in use." });
      }
      
      const existing_email = await fboModel.findOne({ email });
      if (existing_email) {
      return res.status(401).json({ success, emailErr: "This email is already in use." });
      }
      
      const existing_address = await fboModel.findOne({ address });
      if(existing_address){
      return res.status(401).json({ success, addressErr: "This address is already in use." })
      }

      const { idNumber, generatedCustomerId, date, selectedModel } = await registrationHandler(product_name);

      await selectedModel.create({
      id_num: idNumber, fbo_name, owner_name, owner_contact, email, state, district, address, product_name, processing_amount, service_name, customer_id: generatedCustomerId, client_type, recipient_no, water_test_fee, createdAt: date, payment_mode, createdBy, license_category, license_duration, total_amount, village, tehsil, pincode
      });

      await invoiceHandler(fbo_name, address, idNumber, date, recipient_no, product_name, processing_amount);

      success = true;
    return res.status(201).json({ success, message: "FBO Registration Successful" });
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

