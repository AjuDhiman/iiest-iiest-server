const { createInvoiceBucket } = require('../config/buckets');
const sendInvoiceMail = require('./sendMail');
const htmlToPdf = require('html-pdf-node');
const invoiceTemplate = require('../assets/invoiceTemplate');

const generateInvoice = async(idNumber, clientEmail, fboObj)=>{
    
        const fileName = `${Date.now()}_${idNumber}.pdf`;

        const invoiceHTML = await invoiceTemplate(fboObj);
        
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
}

const invoiceDataHandler = async(idNum, mail, fboName, address, contact, amount, totalAmount, serviceArray, signatureName)=>{

    const tax = (18/100)*amount;
  
    const date = new Date();
    const dateVal = date.getDate();
    const monthVal = date.getMonth() + 1;
    const yearVal = date.getFullYear();
  
    const infoObj = {
      date: `${dateVal}-${monthVal}-${yearVal}`,
      receiptNo: idNum,
      transactionId: idNum,
      name: fboName, 
      address: address, 
      contact: contact, 
      amount: amount,
      taxAmount: tax,
      totalAmount: totalAmount,
      chosenServices: serviceArray,
      signatureName: signatureName
    }
    await generateInvoice(idNum, mail, infoObj);
  }

module.exports = invoiceDataHandler;