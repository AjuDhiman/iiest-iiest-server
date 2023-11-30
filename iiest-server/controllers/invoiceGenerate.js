const easyinvoice = require('easyinvoice')
const fs = require('fs');
const { createInvoiceBucket } = require('../config/db');

async function generateInvoice(idNumber ,data){
    try {
        const result = await easyinvoice.createInvoice(data);

        const bufferdResult = Buffer.from(result.pdf, 'base64');

        const fileName = `${Date.now()}_${idNumber}.pdf`

        const invoiceBucket = createInvoiceBucket();
        const invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);

        invoiceUploadStream.write(bufferdResult);

        invoiceUploadStream.end((err)=>{
            if(err){
                console.error(err);
            }
            console.log('Invoice stored successfully');
            const invoiceDownloadStream = invoiceBucket.openDownloadStreamByName(fileName);
            const filePath = `${__dirname}/invoice/${fileName}`;
            const fileWriteStream = fs.createWriteStream(filePath);

            invoiceDownloadStream.pipe(fileWriteStream);
            fileWriteStream.on('finish', () => {
                console.log('Invoice downloaded and saved successfully');
            });
            fileWriteStream.on('error', (err) => {
                console.error('Error saving invoice to folder:', err);
            });
        })
    } catch (error) {
        console.error(error);
    }
}

module.exports = { generateInvoice }