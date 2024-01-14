const axios = require('axios');
const sha256 = require('sha256');
const uniqid = require('uniqid');

const payRequest = (grandTotal, res)=>{

  let tx_uuid =  uniqid();

  let responseURL;

  let normalPayLoad = {
    "merchantId": "PGTESTPAYUAT93",
    "merchantTransactionId": tx_uuid,
    "merchantUserId": "MUID123",
    "amount": grandTotal * 100,
    "redirectUrl": "http://localhost:3000/iiest/fbo-pay-return",
    "redirectMode": "POST",
    "callbackUrl": "http://localhost:3000/iiest/fbo-pay-return",
    "paymentInstrument": {
      "type": "PAY_PAGE"
    }
  }

  console.log(normalPayLoad)

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
} 

module.exports = payRequest;