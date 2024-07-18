const sendInvoiceMail = require('./sendMail');
const htmlToPdf = require('html-pdf-node');
const PuppeteerHTMLPDF = require('puppeteer-html-pdf');
const invoiceTemplate = require('../assets/invoiceTemplate');
const generalDataSchema = require('../models/generalModels/generalDataSchema')

const generateInvoice = async (idNumber, clientEmail, fboObj) => {
    const fileName = `${Date.now()}.pdf`;
    const invoiceHTML = await invoiceTemplate(fboObj);
    let file = { content: invoiceHTML };
    let options = { format: 'A4', omitBackground: true, pageRanges: '1', printBackground: false };

    try {
        // const pdfBuffer = await new Promise((resolve, reject) => {
        // htmlToPdf.generatePdf(file, options).then(pdfBuffer => {
        //     if (pdfBuffer) {
        //         fboObj.invoiceUploadStream.write(pdfBuffer);
        //         fboObj.invoiceUploadStream.end((err) => {
        //             if (err) {
        //                 console.error(err);
        //                 reject(err);
        //             }
        //             console.log('Invoice stored successfully');
        //             // sendInvoiceMail(clientEmail, fileName, pdfBuffer);
        //             // const invoiceDownloadStream = invoiceBucket.openDownloadStreamByName(fileName);
        //             // const filePath = `${__dirname}/invoice/${fileName}`;
        //             // const fileWriteStream = fs.createWriteStream(filePath);

        //             // invoiceDownloadStream.pipe(fileWriteStream);
        //             // fileWriteStream.on('finish', () => {
        //             //     console.log('Invoice downloaded and saved successfully');
        //             // });
        //             // fileWriteStream.on('error', (err) => {                  
        //             //     console.error('Error saving invoice to folder:', err);
        //             // });
        //             resolve(pdfBuffer);
        //         });
        //     }
        // }).catch(err => reject(err));
        // });
        const htmlPDF = new PuppeteerHTMLPDF();

        htmlPDF.setOptions(options);
        const pdfBuffer = await htmlPDF.create(invoiceHTML);
        if (pdfBuffer) {
            // Write the buffer to the stream and end the stream properly
            await new Promise((resolve, reject) => {
                fboObj.invoiceUploadStream.write(pdfBuffer, (err) => {
                    if (err) {
                        console.error('Error writing to stream:', err);
                        return reject(err);
                    }
                    fboObj.invoiceUploadStream.end((err) => {
                        if (err) {
                            console.error('Error ending stream:', err);
                            return reject(err);
                        }
                        console.log('Invoice stored successfully');
                        resolve();
                    });
                });
            });
        }

        return { encodedString: pdfBuffer, fileName };
    } catch (err) {
        console.error('Error generating invoice:', err);
        return null; // Or handle error as required
    }
}


const invoiceDataHandler = async (invoiceCode, mail, fboName, address, state, district, pincode, contact, email, processingAmount, extraFee, taxAmount, qty, business_Type, gst_number, totalAmount, serviceType, prodDetails, signatureName, uploadStream, officerName, shopId, boData) => {

    //getting date fot the invoice
    const date = new Date();
    const dateVal = date.getDate();
    const monthVal = date.getMonth() + 1;
    const yearVal = date.getFullYear();

    const stateCode = (await generalDataSchema.find({}))[0].state_gst_code.find(obj => obj.state_name === state).code; //var for setting place of supply in invoice

    const { description, code } = getProductSpecificData(serviceType, qty, prodDetails, extraFee);

    const infoObj = {
        date: `${dateVal}-${monthVal}-${yearVal}`,
        receiptNo: invoiceCode,
        transactionId: invoiceCode,
        name: fboName,
        address: address,
        contact: contact,
        email: email,
        extraFee: extraFee,
        amount: processingAmount,
        taxAmount: taxAmount,
        totalAmount: totalAmount,
        chosenService: serviceType,
        signatureName: signatureName,
        businessType: business_Type,
        qty: qty,
        description: description,
        code: code,
        gstNumber: gst_number,
        state: state,
        district: district,
        pincode: pincode,
        gstDescription: getgstDescription(state, business_Type, taxAmount),
        invoiceUploadStream: uploadStream,
        officerName: officerName,
        shopId: shopId,
        boData: boData,
        stateCode: stateCode
    }
    const invoiceData = await generateInvoice(invoiceCode, mail, infoObj);

    return invoiceData;
}

function getProductSpecificData(product, qty, prodDetails, extraFee) {
    let description = '';
    let code = '';
    switch (product) {
        case 'Fostac':
            description = `<b>Capacity Building Training Services</b><br/>
                            Training of ${qty} Candidates`;
            code = `TR-CB`;
            break;
        case 'Foscos':
            description = `<b>Licensing Services</b> <br>
                            ${prodDetails.license_category} Fee Services Charges (Received Govt Charge of Rs ${extraFee}/- for 
                            ${prodDetails.foscos_service_name} license for ${prodDetails.license_duration}yr`;
            if (prodDetails.water_test_fee != 0) {
                description += ` + water test of rs ${prodDetails.water_test_fee})`
            }
            code = `IS-LS`
            break;
        case 'HRA':
            description = `<b>Internal Hygiene Auditing Services</b> <br> Hygiene Rating`
            code = `AU-IAH`
            break;
        case 'Medical':
            description = `<b>Safe Food & Good Hygiene</b> <br> 
                              Medical Certificate of ${qty} ${qty === 1 ? 'Candidate' : 'Candidates'}`
            code = `IS-MT`
            break;
        case 'Water Test Report':
            description = `<b>Safe Food & Good Hygiene</b> <br>
                                Water Test Report`
            code = `IS-WT`
            break;
    }

    return { description, code }
}

function getgstDescription(state, businessType, taxAmount) {

    let gstDescription;

    if (businessType == 'b2b') {

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
    } else if (businessType == 'b2c') {
        gstDescription = `<tr>
        <td style="border-top: 0; border-bottom: 0;"></td>
        <td colspan="2">GST 18%</td>
        <td>₹${Number(taxAmount)}</td>
        </tr>`
    }

    return gstDescription;
}

module.exports = invoiceDataHandler;