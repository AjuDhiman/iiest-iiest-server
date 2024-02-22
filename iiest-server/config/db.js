const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const { fboEbillBucket, createInvoiceBucket, empSignBucket, empImageBucket } = require('./buckets');

const config = JSON.parse(process.env.CONFIG);
const mongoURL = config.MONGO_URL;

const connectToMongo = async() => {
     await mongoose.connect(mongoURL).then(() => {
        console.log('Now we are connected to the DB');
        fboEbillBucket();
        createInvoiceBucket();
        empSignBucket();
        empImageBucket();
    }).catch((error) => {
        console.log(error);
    });
}

module.exports = connectToMongo;