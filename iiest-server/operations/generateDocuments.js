// const sendInvoiceMail = require('./sendMail');
const htmlToPdf = require('html-pdf-node');
const fs = require('fs');
const fsmsTemplate = require('../assets/Templets/fsmsCertificateTemplet');
const selfDecOPropTemplet = require('../assets/Templets/selfDecOPropTemplet');

const generateFsms = async (verifiedInfo, shopInfo) => {

    const fsmsTemp = fsmsTemplate(verifiedInfo, shopInfo);

    let file = { content: fsmsTemp };

    let options = { format: 'A4' };

    let fileName = `${Date.now()}_fsmsCertificate.pdf`;

    htmlToPdf.generatePdf(file, options).then((pdfBuffer) => {
        if (pdfBuffer) {
            fs.writeFile(`documents/foscos/${fileName}`, pdfBuffer, (err) => {

            });
        }
    })

    return fileName;
}

const generateSelfDecOProp = async(verifiedInfo, shopInfo) => {

    const selfDecOPropTemp = selfDecOPropTemplet(verifiedInfo, shopInfo);

    let file = { content: selfDecOPropTemp };

    let options = { format: 'A4' };

    let fileName = `${Date.now()}_selfDecOProp.pdf`;

    htmlToPdf.generatePdf(file, options).then((pdfBuffer) => {
        if (pdfBuffer) {
            fs.writeFile(`documents/foscos/${fileName}`, pdfBuffer, (err) => {

            });
        }
    })

    return fileName;
};

module.exports = { generateFsms, generateSelfDecOProp }