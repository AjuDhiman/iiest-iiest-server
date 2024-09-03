const PuppeteerHTMLPDF = require('puppeteer-html-pdf');
const invoiceTemplate = require('../assets/invoiceTemplate');
const generalDataSchema = require('../models/generalModels/generalDataSchema');
const { uploadBuffer, invoicesPath, coworkInvoicePath } = require('../config/s3Bucket');
const coworkInvoiceTemplate = require('../assets/coworkInvoiceTemplet');

const generateInvoice = async (idNumber, clientEmail, data) => {
    const fileName = `invoice_${Date.now()}.pdf`;
    const invoiceHTML = await coworkInvoiceTemplate(data);
    let file = { content: invoiceHTML };
    let options = { format: 'A4', omitBackground: true, pageRanges: '1', printBackground: false };

    try {
        const htmlPDF = new PuppeteerHTMLPDF();

        htmlPDF.setOptions(options);
        const pdfBuffer = await htmlPDF.create(invoiceHTML);
        if (pdfBuffer) {

            //uploading invoice to AWS S3 invoices path is comming from s3.js file in config folder
            await uploadBuffer(`${coworkInvoicePath}${fileName}`, pdfBuffer)

        }

        return { encodedString: pdfBuffer, fileName };
    } catch (err) {
        console.error('Error generating invoice:', err);
        return null; // Or handle error as required
    }
}


const bcInvoiceDataHandler = async (invoiceCode, business_name, address, state, district, pincode, contact, email, processingAmount, invoiceType, gstNumber, gstAmount, qty, totalAmount, product, product_code, narration, invoice_date, behalf_of, signatureName) => {

    //getting date fot the invoice
    const date = new Date(invoice_date.toString());
    const dateVal = date.getDate();
    const monthVal = date.getMonth() + 1;
    const yearVal = date.getFullYear();

    const stateCode = (await generalDataSchema.find({}))[0].state_gst_code.find(obj => obj.state_name === state).code; //var for setting place of supply in invoice

    const infoObj = {
        date: `${dateVal}-${monthVal}-${yearVal}`,
        receiptNo: invoiceCode, 
        transactionId: invoiceCode,
        business_name: business_name,
        address: address,
        contact: contact,
        email: email,
        amount: processingAmount,
        taxAmount: gstAmount,
        totalAmount: totalAmount,
        chosenService: product,
        invoiceType: invoiceType,
        qty: qty,
        description: narration,
        code: product_code,
        gstNumber: gstNumber,
        state: state,
        district: district,
        pincode: pincode,
        gstDescription: getgstDescription(state, invoiceType, gstAmount),
        stateCode: stateCode,
        forCoworks: true,
        behalf_of: behalf_of,
        signatureName: signatureName
    }
    const invoiceData = await generateInvoice(invoiceCode, email, infoObj);

    return invoiceData;
}

function getgstDescription(state, invoiceType, taxAmount) {

    let gstDescription;

    if (invoiceType == 'Tax') {

        if (state == 'Delhi') {
            gstDescription = `<tr>
            <td style="border-top: 0; border-bottom: 0;"></td>
            <td colspan="2">SGST 9%</td>
            <td>₹${Number(taxAmount) / 2}</td>
            </tr>
            <tr>
            <td style="border-top: 0; border-bottom: 0;"></td>
            <td colspan="2">CGST 9%</td>
            <td>₹${Number(taxAmount) / 2}</td>
            </tr>`
        } else {
            gstDescription = `<tr>
            <td style="border-top: 0; border-bottom: 0;"></td>
            <td colspan="2">IGST 18%</td>
            <td>₹${Number(taxAmount)}</td>
            </tr>`
        }
    } else if (invoiceType == 'Customer') {
        gstDescription = `<tr>
        <td style="border-top: 0; border-bottom: 0;"></td>
        <td colspan="2">GST 18%</td>
        <td>₹${Number(taxAmount)}</td>
        </tr>`
    }

    return gstDescription;
}

module.exports = bcInvoiceDataHandler;