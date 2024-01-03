const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { GridFSBucket } = require('mongodb');
dotenv.config();

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
    })
}

const fboEbillBucket = ()=>{
    if(!mongoose.connection.db){
        throw new Error('MongoDB connection not established');
    }
    console.log('Creating Bucket for fbo ebill');
    return new GridFSBucket(mongoose.connection.db, { bucketName: 'fboEbills'});
}

const empSignBucket = ()=>{
    if(!mongoose.connection.db){
        throw new Error('MongoDB connection not established');
    }
    console.log('Creating Signature Bucket for employee');
    return new GridFSBucket(mongoose.connection.db, { bucketName: 'empSignature' });
}

const empImageBucket = ()=>{
    if(!mongoose.connection.db){
        throw new Error('MongoDB connection not established');
    }
    console.log('Creating Image Bucket for employee');
    return new GridFSBucket(mongoose.connection.db, { bucketName: 'empImage' });
}

const createInvoiceBucket = ()=>{
    if(!mongoose.connection.db){
        throw new Error('MongoDB Connection not established');
    }
    console.log('Creating invoice bucket');
    return new GridFSBucket(mongoose.connection.db, {bucketName: 'fboInvoices'});
}

module.exports = {connectToMongo, fboEbillBucket, createInvoiceBucket, empSignBucket, empImageBucket};