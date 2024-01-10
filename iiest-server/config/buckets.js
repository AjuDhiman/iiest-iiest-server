const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

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

module.exports = {fboEbillBucket, createInvoiceBucket, empSignBucket, empImageBucket};