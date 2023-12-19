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
const assetsPath = process.env.ASSETS_PATH;

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

const invoiceHandler = async(fboName, address, idNum, date, recipientNo, processingAmount, clientEmail)=>{

  const invoiceHTML = `<!DOCTYPE html>
  <html Lang="en">
  
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Sales slip</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"
          integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
      <style>
          *{
              margin: 0;
              padding: 0;
          }
          .hindi-head{
              border-bottom: 2px solid;
          }
          .head-sec{
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 20px;
          }
          .detail-field{
              margin-top: 2px;
              margin-bottom: 2px;
          }
          .certificate-heading{
              font-size: 25px;
              font-weight: 700;
          }
          .bank-details{
              font-size: 14px;
          }
          .bank-details .online-payment-heading{
              font-size: 18px !important;
              text-decoration: underline;
          }
          table {
              height: 150px;
          }
          table td, table th{
              border: 1px solid;
          }
          table{
              border: 2px;
          }
      </style>
  </head>
  
  <body class="container">
   <div class="head-sec my-3">
          %logo%
           <div class="head">
        <div class="text-center">INDUSTRIAL INCUBATION OF ENTREPRENEURSHIP AND SKILL TRAINING FEDERATION</div>
           </div>
       </div>
           <div class="row address-sec my-3">
          <div class="col-6 corporate-office-address">
              <div class="address col-12">
                  Corporate Office No-55, Opposite Metro Pillor No.6,
                  Panchkulan Marg, Connaught Place, Delhi-110001.
             </div>
              <div class="email col-12"><b>Email:</b> info@ilest.org, <b> Website: </b><a href="www.liest.org">www.liest.org</a></div>
             <div class="numbers col-12"><b>Landline No:</b>
                   011-43511788 <b>Mobile No:</b> +91-9910729809, 9289310979</div>
         </div>
         <div class="col-6 center-office-address">
              <div class="address col-12">
                  Center Office, Flat No. 102, 1st Floor, Plot 13,
                  Cyber Heights, Huda Layout, Beside NTR Trust Line Road No.
                  2, Banjara Hills, Hyderabad - 500034
               </div>
               <div class="numbers col-12"><b>Mobile No:</b> +91-9154150561, 9154150563</div>
         </div>
      </div>
         <div class="certificate-heading row text-center text-large my-3 mt-4">
           <div class="col-12">Food Safety Training and Certification (FoSTaC) TP ID - TPINT133</div>
     </div>
      <div class="rc_no-N_date_N_place row">
          <div class="col rc_no">
               <b>Recipt No: </b> %number%
           </div>
          <div class="col-6 date_n_place row">
             <div class="date col-12 row">
                  <b class="col-8 pr-1" style="text-align: right">Date: </b>
                   <div class="col-4 px-0">%date%</div>
               </div>
             <div class="place col-12 row">
                   <b class="col-8 pr-1" style="text-align: right">Place:</b>
                   <div class="col-4 px-0"></div>
               </div>
           </div>
      </div>
           <div class="row details my-3">
               <div class="detail-field col-12 name"><b>Name of the Candidate: </b> %company-to%</div>
               <div class="detail-field col-8 sales-address"><b>Address: </b> %address-to%</div>
             <div class="detail-field contact col-4"><b>Contact: </b>${clientEmail}</div>
              <div class="detail-field col-4 fostac-type"><b>Fostac Program Type </b></div>
              <div class="detail-field col-8 fostac-checkbox row">
                  <div class="col-4">
                      <input type="checkbox" name="basic_catering" id="basic_catering">
                      <label for="basic_catering">Basic catering</label>
                  </div>
                   <div class="col-4">
                       <input type="checkbox" name="basic_retail" id="basic_retail">
                       <label for="basic_retail">Basic Retail</label>
                  </div>
               </div>
              <div class="detail-field col-4 license-type"><b>License Program Type </b></div>
               <div class="detail-field col-8 license-checkbox row">
                   <div class="col-4">
                       <input type="checkbox" name="registration" id="registration">
                      <label for="registration">Regitration</label>
                   </div>
                  <div class="col-4">
                       <input type="checkbox" name="state" id="state">
                      <label for="state">State</label>
                 </div>
                  <div class="col-4">
                      <input type="checkbox" name="membership" id="membership">
                      <label for="membership">SFHP/EDP/membership</label>
                  </div>
              </div>
             <div class="detail-field col-6 date-of-training"><b>Date of Training </b></div>
             <div class="detail-field col-6 batch-code"><b>Batch Code </b></div>
             <div class="detail-field col-7 payment-method"><b>By Cash/Check/Paytm/UPI </b></div>
               <div class="detail-field col-5 payment-method"><b>Transaction ID </b></div>
               <div class="detail-field col-12 total-amount-in-words"><b>Total Amount in Words</b></div>
          </div>
              <div class="row footer my-4">
           <div class="bank-details col-4">
               <div class="col-12 online-payment-heading" style="font-size: 18px; text-decoration: underline;"><b>Online Payment</b></div>
               <div class="col-12 acc-no"><b>IIEST Account No.: </b>50200038814644</div>
               <div class="col-12 ifsc-code"><b>IFSC Code : </b>HDFC0000313</div>
               <div class="col-12 Bank-name"><b>Bank name : </b>HDFC Back</div>
             <div class="col-12 acc-holder"><b>Account Holder: </b>IIEST Federation</div>
              <div class="col-12 gst-no"><b>GST no. </b>07AADCI2920D1Z2</div>
               <div class="col-12">Fee includes all above service charges</div>
              <div class="col-12">Fee is non refundable</div>
             <div class="col-12">Course fees details are avilable here <br/> <a target="_blank" href="https://fostac.fssai.gov.in/index">https://fostac.fssai.gov.in/index</a></div>
         </div>
           <table class="col-4 amount-calculations text-center mt-5">
               <tr>
                 <th class="col-6">FoStact Course Fee</th>
                <th class="col-6">Amount</th>
               </tr>
               <tr>
                 <td class="col-6">Amount</td>
                  <td class="col-6">%subtotal%</td>
               </tr>
              <tr>
                  <td class="col-6">CGST@9% <br>SGST@9%</td>
                   <td class="col-6"><tax>%tax%</tax></td>
               </tr>
              <tr>
                 <td class="col-6">Total</td>
                  <td class="col-6">%total%</td>
              </tr>
          </table>
          <div class="signature-n-qr col-4 row mt-5">
              <div class="qr col-6"></div>
               <div class="stamp col-6">
                <img src="iiest-server\assets\stamp.jpg" height="150px" width="150px" alt="IIest Stamp"/>
              </div>
          </div>
     </div>
  </body>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
      integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous">
      </script>
  </html>`

  const invoiceData = {
    customize: {
      template: btoa(invoiceHTML)
    },
    "images": {
      "logo": fs.readFileSync(assetsPath, 'base64')
    },
    "client": {
      "company": fboName,
      "address": address
    },
    "information": {
      "date": `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`,
      "number": `${Date.now()}_${idNum}`
    },
    "products": [
      {
        "quantity": recipientNo,
        "tax-rate": 18,
        "price": processingAmount
      }
    ]
  }

  await generateInvoice(idNum, invoiceData, clientEmail);
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

        let buyerData;

        if(fboEntry){
          buyerData = await fboPaymentSchema.create({
            buyerId, merchantId: req.body.merchantId, merchantTransactionId: req.body.transactionId, providerReferenceId: req.body.providerReferenceId, amount: total_amount
          })
        }else{
          return res.status(401).json({success, message: "FBO entry not successful"})
        }

        if(buyerData){
          await invoiceHandler(fbo_name, address, idNumber, date, recipient_no, processing_amount, email);
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

      const fboEntry = await selectedModel.create({
      id_num: idNumber, fbo_name, owner_name, owner_contact, email, state, district, address, product_name, processing_amount, service_name, customer_id: generatedCustomerId, client_type, recipient_no, water_test_fee, createdAt: date, payment_mode, createdBy, license_category, license_duration, total_amount, village, tehsil, pincode
      });

      if(fboEntry){
        await invoiceHandler(fbo_name, address, idNumber, date, recipient_no, processing_amount, email);
        success = true;
      }else{
        success = false; 
        return res.status(401).json({success, message: "FBO entry not successful"});
      }

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

