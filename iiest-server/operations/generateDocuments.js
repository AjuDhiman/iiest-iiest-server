// const sendInvoiceMail = require('./sendMail');
const htmlToPdf = require('html-pdf-node');
const fs = require('fs');
const fsmsTemplate = require('../assets/Templets/fsmsCertificateTemplet');
const selfDecOPropTemplet = require('../assets/Templets/selfDecOPropTemplet');
const listOPartTemplet = require('../assets/Templets/listOPartTemplet');
const nocTemplet = require('../assets/Templets/nocTemplet');
const rentAgreementTemplet = require('../assets/Templets/rentAgreement');

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

const generateListOProp = async(verifiedInfo, shopInfo) => {

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

const generateListOPart = async(verifiedInfo, shopInfo) => {

    const listOPartTemp = listOPartTemplet(verifiedInfo, shopInfo);

    let file = { content: listOPartTemp };

    let options = { format: 'A4' };

    let fileName = `${Date.now()}_listOPart.pdf`;

    htmlToPdf.generatePdf(file, options).then((pdfBuffer) => {
        if (pdfBuffer) {
            fs.writeFile(`documents/foscos/${fileName}`, pdfBuffer, (err) => {

            });
        }
    })

    return fileName;
}

const generateNOC = async(verifiedInfo, shopInfo) => {

    const nocTemp = nocTemplet(verifiedInfo, shopInfo);

    let file = { content: nocTemp };

    let options = { format: 'A4' };

    let fileName = `${Date.now()}_noc.pdf`;

    htmlToPdf.generatePdf(file, options).then((pdfBuffer) => {
        if (pdfBuffer) {
            fs.writeFile(`documents/foscos/${fileName}`, pdfBuffer, (err) => {

            });
        }
    })

    return fileName;
}

const generateRentAgreement = async(verifiedInfo, shopInfo) => {

    const rentAgreementTemp = rentAgreementTemplet(verifiedInfo, shopInfo);

    let file = { content: rentAgreementTemp };

    let options = { format: 'A4' };

    let fileName = `${Date.now()}_rentAgreement.pdf`;

    htmlToPdf.generatePdf(file, options).then((pdfBuffer) => {
        if (pdfBuffer) {
            fs.writeFile(`documents/foscos/${fileName}`, pdfBuffer, (err) => {

            });
        }
    })

    return fileName;
}

module.exports = { generateFsms, generateSelfDecOProp, generateListOProp, generateListOPart, generateNOC, generateRentAgreement }