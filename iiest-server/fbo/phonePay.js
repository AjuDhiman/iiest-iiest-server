const axios = require('axios');
const sha256 = require('sha256');
const uniqid = require('uniqid');
const productionBaseUrl = 'https://api.phonepe.com/apis/pg/v1/';
const sandboxBaseUrl = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/';
const PHONE_PE_CREDENTIALS = JSON.parse(process.env.PHONE_PE_CREDENTIALS);

// Determine whether you're in production or sandbox environment
const isProduction = false; // Change this value as needed based on your environment

// Define the base URL based on the environment
const baseUrl = isProduction ? productionBaseUrl : sandboxBaseUrl;

// Concatenate the base URL with the endpoint
const endpoint = 'pay'; // Modify this if your endpoint varies
const payRequest = (grandTotal, res, redirectUrl)=>{

  let tx_uuid =  uniqid();

  let normalPayLoad = {
    // "merchantId": PHONE_PE_CREDENTIALS.MERCHANT_ID,
    "merchantId": "PGTESTPAYUAT93", 
    "merchantTransactionId": tx_uuid,
    "merchantUserId": "MUID123",
    "amount": grandTotal * 100,
    "redirectUrl": redirectUrl,
    "redirectMode": "POST",
    "callbackUrl": redirectUrl,
    "paymentInstrument": {
      "type": "PAY_PAGE"
    }
  }

  console.log(normalPayLoad)

  let saltKey = PHONE_PE_CREDENTIALS.SALT_KEY;
  let saltIndex = 1
  let bufferObj = Buffer.from(JSON.stringify(normalPayLoad), "utf8");
  let base64String = bufferObj.toString("base64");
  
  let string = base64String + '/pg/v1/pay' + saltKey;
  
  let sha256_val = sha256(string);
  let checksum = sha256_val + '###' + saltIndex;

  console.log(checksum, baseUrl, endpoint)

  axios.post(`${baseUrl}${endpoint}`, {
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
} 

module.exports = payRequest;