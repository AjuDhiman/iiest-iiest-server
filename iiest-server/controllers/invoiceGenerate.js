const { createInvoiceBucket } = require('../config/db');
const { sendInvoiceMail } = require('./employeeMail');
const htmlToPdf = require('html-pdf-node');
const invoiceTemplate = require('../assets/invoiceTemplate');

async function generateInvoice(idNumber, clientEmail, fboObj){
    try {
        const fileName = `${Date.now()}_${idNumber}.pdf`;

        const invoiceHTML = invoiceTemplate(fboObj);
        
        let file = { content: invoiceHTML };

        let options = { format: 'A3' };

        htmlToPdf.generatePdf(file, options).then(pdfBuffer =>{
            if(pdfBuffer){
                const invoiceBucket = createInvoiceBucket();
                const invoiceUploadStream = invoiceBucket.openUploadStream(`${fileName}`);
                invoiceUploadStream.write(pdfBuffer);

                invoiceUploadStream.end((err)=>{
                    if(err){
                        console.error(err);
                    }
                    console.log('Invoice stored successfully');
                    sendInvoiceMail(clientEmail, fileName, pdfBuffer);
                    // const invoiceDownloadStream = invoiceBucket.openDownloadStreamByName(fileName);
                    // const filePath = `${__dirname}/invoice/${fileName}`;
                    // const fileWriteStream = fs.createWriteStream(filePath);
        
                    // invoiceDownloadStream.pipe(fileWriteStream);
                    // fileWriteStream.on('finish', () => {
                    //     console.log('Invoice downloaded and saved successfully');
                    // });
                    // fileWriteStream.on('error', (err) => {                  
                    //     console.error('Error saving invoice to folder:', err);
                    // });
                })                
            }
        })
    } catch (error) {
        console.error(error);
    }
}

module.exports = { generateInvoice }