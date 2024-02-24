// const sendInvoiceMail = require('./sendMail');
const htmlToPdf = require('html-pdf-node');
let fsmsTemplate = require('../assets/Templets/fsmsCertificateTemplet');
const fs = require('fs')

const generateFsms = async (verifiedInfo, shopId) => {

    const fsmsTemp = fsmsTemplate(verifiedInfo);

    let file = { content: fsmsTemp };

    let options = { format: 'A4' };

    console.log(2)

    htmlToPdf.generatePdf(file, options).then((pdfBuffer) => {
        console.log(3)
        if (pdfBuffer) {
            fs.writeFile(`documents/foscos/${shopId}_fsmsCertificate.pdf`, pdfBuffer, (err) => {

            });
        }
    })
}

module.exports = { generateFsms }