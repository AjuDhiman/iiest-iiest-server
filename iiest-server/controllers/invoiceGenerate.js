const easyinvoice = require('easyinvoice')
const fs = require('fs');
const { createInvoiceBucket } = require('../config/db');


async function generateInvoice(idNumber ,data){
    try {
        const result = await easyinvoice.createInvoice(data);

        const bufferdResult = Buffer.from(result.pdf, 'base64');

        const invoiceBucket = createInvoiceBucket();
        const invoiceUploadStream = invoiceBucket.openUploadStream(`${Date.now()}_${idNumber}`);

        invoiceUploadStream.write(bufferdResult);

        invoiceUploadStream.end((err)=>{
            if(err){
                console.error(err);
            }
            console.log('Invoice stored successfully');
            const pdfPath = `${__dirname}/invoice/invoice_${idNumber}.pdf`;
            fs.writeFileSync(pdfPath, result.pdf, 'base64')
        })
    } catch (error) {
        console.error(error);
    }
}

module.exports = { generateInvoice }