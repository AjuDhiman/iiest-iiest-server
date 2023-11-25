const { foscosModel, fostacModel, fboModel } = require('../models/fboSchema');
const pastFboSchema = require('../models/pastFboSchema');
const { generateCustomerId } = require('./empGenerator');
const { generateInvoice } = require('./invoiceGenerate')
const axios = require('axios');
const sha256 = require('sha256');
const uniqid = require('uniqid');


//Controller for FBO Registration
exports.fboPayment = async(req, res)=>{
  try {
  
  let tx_uuid = uniqid();

  let normalPayLoad = {
    "merchantId": "PGTESTPAYUAT93",
    "merchantTransactionId": tx_uuid,
    "merchantUserId": "MUID123",
    "amount": req.body.total_amount * 100,
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
    console.log(response.data.data.instrumentResponse.redirectInfo.url);
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

    if (req.body.code == 'PAYMENT_SUCCESS' && req.body.merchantId && req.body.transactionId && req.body.providerReferenceId){
      if (req.body.transactionId) {
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
      let isUnique = false;

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
    if (product_name === 'Foscos Training') {
      selectedModel = foscosModel;
    } else {
      selectedModel = fostacModel;
    }

    const createdFbo = await selectedModel.create({
      id_num: idNumber, fbo_name, owner_name, owner_contact, email, state, district, address, product_name, processing_amount, service_name, customer_id: generatedCustomerId, client_type, recipient_no, water_test_fee, createdAt: date, payment_mode, createdBy, license_category, license_duration, total_amount, village, tehsil, pincode
    });

    console.log(createdFbo);

    const invoiceData = {
      "currency": "INR", 
      "taxNotation": "gst",
      "marginTop": 25,
      "marginRight": 25,
      "marginLeft": 25,
      "marginBottom": 25,
      "sender": {
        "company": "Sample Company",
        "address": "Sample Street 123",
        "zip": "1234 AB",
        "city": "Sampletown",
        "country": "Samplecountry"
      },
      "client": {
        "company": fbo_name,
        "address": address,
        "zip": "5678 CD",
        "city": "Clientcity",
        "country": "Clientcountry"
      },
      "invoiceNumber": idNumber,
      "invoiceDate": date.toISOString(),
      "products": [
        {
          "quantity": 1,
          "description": product_name,
          "tax": 0,
          "price": total_amount
        }
      ],
      "bottomNotice": "Kindly pay your invoice within 15 days.",
    }

    await generateInvoice(idNumber, invoiceData);

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

