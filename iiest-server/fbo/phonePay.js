const axios = require('axios');
const crypto = require('crypto'); // Correctly using the built-in crypto module
const uniqid = require('uniqid');

// Parse environment variables and ensure they are valid JSON
let PHONE_PE_CREDENTIALS;
let PHONE_PE_CREDENTIALS_TEST;

try {
    PHONE_PE_CREDENTIALS = JSON.parse(process.env.PHONE_PE_CREDENTIALS);
    PHONE_PE_CREDENTIALS_TEST = JSON.parse(process.env.PHONE_PE_CREDENTIALS_TEST);
} catch (error) {
    throw new Error("Failed to parse PHONE_PE_CREDENTIALS or PHONE_PE_CREDENTIALS_TEST. Ensure they are valid JSON.");
}

const productionBaseUrl = 'https://api.phonepe.com/apis/hermes/pg/v1/'
const sandboxBaseUrl = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/';

// Determine whether you're in production or sandbox environment
const isProduction = true; // Change this value as needed based on your environment

// Define the endpoint
const endpoint = 'pay';

const payRequest = (grandTotal, req, res, redirectUrl) => {
  console.log('pay=page',req)
    const tx_uuid = uniqid();
    const user = req;

    if (!user || !user.employee_name) {
        return res.status(400).json({ error: "Invalid user information." });
    }

    const employeeName = user.employee_name;
    console.log("Employee Name:", employeeName);

    // Check if the user is an admin
    const isAdmin = employeeName.toLowerCase().includes('admin');
    console.log('Is Admin:', isAdmin);

    // Select base URL and credentials based on the conditions
    let baseUrl;
    let credentials;

    if (isProduction) {
        if (isAdmin) {
            baseUrl = sandboxBaseUrl; // Use sandbox URL even in production for admins
            credentials = PHONE_PE_CREDENTIALS_TEST;
        } else {
            baseUrl = productionBaseUrl; // Use production URL for non-admins
            credentials = PHONE_PE_CREDENTIALS;
        }
    } else {
        baseUrl = sandboxBaseUrl; // Use sandbox URL in non-production environments
        credentials = PHONE_PE_CREDENTIALS_TEST;
    }

    // Construct the payload
    const normalPayLoad = {
        merchantId: credentials.MERCHANT_ID,
        merchantTransactionId: tx_uuid,
        merchantUserId: "MUID123",
        amount: grandTotal * 100, // Assuming grandTotal is in the lowest denomination (e.g., cents)
        redirectUrl: redirectUrl,
        redirectMode: "POST",
        callbackUrl: redirectUrl,
        paymentInstrument: {
            type: "PAY_PAGE"
        }
    };

    // Log payload for debugging
    console.log("Payload:", JSON.stringify(normalPayLoad, null, 2));

    const saltKey = credentials.SALT_KEY;
    const saltIndex = 1;
    const bufferObj = Buffer.from(JSON.stringify(normalPayLoad), "utf8");
    const base64String = bufferObj.toString("base64");
    const stringToHash = `${base64String}/pg/v1/pay${saltKey}`;
    
    // Use the built-in crypto module to generate SHA256 hash
    const sha256_val = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = `${sha256_val}###${saltIndex}`;

    console.log("Checksum:", checksum);
    console.log("Base64 Payload:", base64String);

    axios.post(`${baseUrl}${endpoint}`, {
        'request': base64String
    }, {
        headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'accept': 'application/json'
        }
    }).then(function (response) {
        return res.status(200).json({ message: response.data.data.instrumentResponse.redirectInfo.url });
    }).catch(function (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to initiate payment." });
    });
};

module.exports = payRequest;
