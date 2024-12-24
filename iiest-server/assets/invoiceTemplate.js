const fboLogo = require("./iiestLogo");
const fboStamp = require('./stamp');
const { ToWords } = require('to-words');
const { empSignBucket } = require("../config/buckets");
const { ObjectId } = require("mongodb");
const { getFileStream, employeeDocsPath } = require("../config/s3Bucket");


const invoiceTemplate = async (fboInfo) => {
console.log('**************8FboDATA*************',fboInfo)
    const quantity = fboInfo.qty;
    const rate = fboInfo.amount;
    const subTotal = quantity * rate;

    const invoiceType = fboInfo.businessType === "b2c" ? "C U S T O M E R" : "T A X";

    let calculateTax = function (invoiceType, state) {
        if (invoiceType === 'TAX') {
            if (state === 'Delhi') {
                return 'CGST   9%, SGST   9%';
            } else {
                return 'IGST   18%';
            }
        } else if (invoiceType === 'TAX' && state !== 'Delhi') {
            return 'IGST   18%';
        }
        else {
            return 'GST   18%';
        }
    };

    // let serviceCode;

    // switch(fboInfo.choosenServices) {

    // }

    const signatureName = fboInfo.signatureName;

    const toWords = new ToWords({
        localeCode: 'en-IN',
        converterOptions: {
            currency: true,
            ignoreDecimal: false,
            ignoreZeroCurrency: false,
            doNotAddOnly: false,
            currencyOptions: {
                name: 'Rupee',
                plural: 'Rupees',
                symbol: '₹',
                fractionalUnit: {
                    name: 'Paisa',
                    plural: 'Paise',
                    symbol: '',
                },
            }
        }
    });

    // const Invoice_Type; 
    const logoImg = fboLogo();

    const stampImg = fboStamp();

    let chunks = [];

    const amountInWords = toWords.convert(fboInfo.totalAmount, { currency: true, ignoreZeroCurrency: true });

    //getting signature stream from s3
    console.log('signature  -----------------------------------------------------------$$$$$', `${employeeDocsPath}${signatureName}`)
    console.log(signatureName)
    const signatureDownloadStream = await getFileStream((`${employeeDocsPath}${signatureName}`));

    signatureDownloadStream.on('error', () => {
        success = false;
        return res.status(200).json({ success, randomErr: true });
    })

    return new Promise((resolve, reject) => {
        signatureDownloadStream.on('data', (chunk) => {
            chunks.push(chunk);
        });

        signatureDownloadStream.on('end', () => {
            const signatureBuffer = Buffer.concat(chunks);
            const signaturePrefix = 'data:image/png;base64,';
            const signaturebase64 = signatureBuffer.toString('base64');
            const signatureConverted = `${signaturePrefix}${signaturebase64}`;

            resolve(`<!DOCTYPE html>
            <html lang="en">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <style>
                body {
                    width: 230mm;
                    height: 100%;
                    margin: 0 auto;
                    padding: 0;
                    font-size: 10pt;
                    background: rgb(204, 204, 204);
                }
            
                * {
                    box-sizing: border-box;
                    -moz-box-sizing: border-box;
                }
            
                .main-page {
                    width: 210mm;
                    min-height: 297mm;
                    margin: 10mm auto;
                    background: white;
                    box-shadow: 0 0 0.5cm rgba(0, 0, 0, 0.5);
                }
            
                .sub-page {
                    padding: 1cm;
                    height: 297mm;
                }
            
                @page {
                    size: A4;
                    margin: 0;
                }
            
                @media print {
                    .heading {
                        background-color: #000 !important;
                        -webkit-print-color-adjust: exact;
            
                    }
                }
            
                @media print {
                    .heading {
                        color: #f2f2f2 !important;
                    }
                }
            
                @media print {
            
                    html,
                    body {
                        width: 210mm;
                        height: 297mm;
                    }
            
                    .main-page {
                        margin: 0;
                        border: initial;
                        border-radius: initial;
                        width: initial;
                        min-height: initial;
                        box-shadow: initial;
                        background: initial;
                        page-break-after: always;
                    }
                }
            
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
            
                td {
                    border: 1px solid black;
                    padding: 5px;
                }
            
                /* Set column widths */
                td:first-child {
                    width: 1fr;
                }
            
                td:last-child {
                    width: 2fr;
                }
            
                table {
                    width: 100%;
                    height: auto;
                    border-collapse: collapse;
                }
            
                th,
                td {
                    border: 1px solid #000;
                    padding: 8px;
                    text-align: center;
                }
            
                th {
                    background-color: #f2f2f2;
                }
            
                tr:nth-child(even) {
                    background-color: #f2f2f2;
                }
            
                .main-container {
                    display: flex;
                    justify-content: space-between;
                }
            
            
                .heading {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: #000;
                    color: #f2f2f2;
                    height: 30px;
                    margin: 10px auto;
                }
            
                .logo-section {
                    display: inline-flex;
                    width: 100%;
                }
            
                img {
                    align-items: flex-end;
                    margin-left: 15%;
                }
            
                .header {
                    display: flex;
                    text-align: center;
                    color: #000;
                    font-size: 10px;
                }
            </style>
            
            <body>
                <div class="main-page">
                    <div class="header">
                        <h4 style="margin-left: 43%;">INVOICE</h4>
                    </div>
            
                    <div class="sub-page">
                        <div class="heading">
                            <h3>C O N N E C T&nbsp;&nbsp;&nbsp;B H A R A T</h3>
                        </div>
                        <div class="logo-section">
                            <p>
                                <b>1-U, First Floor, DCM Building 16, Barakhamba road New Delhi, Delhi, 110001
                                <br>
                                Mobile No: +91-9599195097
                                Landline - 011-35454931, 011-35457013  </b><br>
                                <br>
                                Website: connectonline.world, Email ID: info.iiest@gmail.com
                                <br/>
                                Connect Bharat, a brand of IIEST Federation. Invoice issued by IIEST Federation.
                                <br/>
                                GST: 07AADCI2920D1Z2
                            </p>
                            <img src="${logoImg}" height=120 width=120 alt="iiest_logo"
                                style="border: 2.5px solid black; border-radius: 60px; padding: 5px">
                        </div>
                        <br>
                        <div class="heading">
                            <h3>${invoiceType}&nbsp;&nbsp;&nbsp;I N V O I C E</h3>
                        </div>
                        <h5>BILL TO:</h5>
                        <div class="main-container" style="width:90vw">
                                    <p style = " padding-right: 7px;">
                            <b>Customer Name:</b> ${fboInfo.boData.business_entity}<br>
                            <b>Customer Address:</b> ${fboInfo.address},
                            <br>
                            <b>Pincode:</b> ${fboInfo.pincode}<br>
                            <b>District:</b> ${fboInfo.district}<br>
                            <b>State:</b> ${fboInfo.state}<br>
                            <b>Customer Contact:</b> +91&nbsp;${fboInfo.contact}<br>
                            <b>Customer Email:</b>${fboInfo.email}
                            <br/><br>
                            ${fboInfo.gstNumber? '<b>Customer GST:</b>' + fboInfo.gstNumber: ''}<br>
                            <b>Place of Supply:</b> ${fboInfo.stateCode}<br>
                            </p>
                            <table style="width: 50%;">
                                <tr>
                                    <td>Invoice #</td>
                                    <td>${fboInfo.receiptNo}</td>
                                </tr>
                                <tr>
                                    <td>Code</td>
                                    <td>FED/${fboInfo.code}</td>
                                </tr>
                                <tr>
                                    <td>Invoice Date</td>
                                    <td>${fboInfo.date} </td>
                                </tr>
                                 <tr>
                                    <td>Bo ID</td>
                                    <td>${fboInfo.boData.customer_id} </td>
                                </tr>
                                 <tr>
                                    <td>Shop ID</td>
                                    <td>${fboInfo.shopId} </td>
                                </tr>
                            </table>
            
                        </div>
                        <table style = 'margin-top:15px'>
                            <tr>
                                <th>Particulars</th>
                                <th>Quantity</th>
                                <th>Rate</th>
                                <th>Total</th>
                            </tr>
                            <tr>
                                <td>${fboInfo.description}</td>
                                <td>${quantity}</td>
                                <td>₹${rate}</td>
                                <td>₹${subTotal}</td>
                            </tr>
                            <tr>
                                <td style="border-top: 0; border-bottom: 0;">Amount in Words: <br><br> ${amountInWords}</td>
                                <th colspan="2">Subtotal</th>
                                <td>₹${subTotal}</td>
                            </tr>
                           ${fboInfo.gstDescription}
                            <tr>
                                <td style="border-top: 0;"></td>
                                <th colspan="2">Total</th>
                                <td>₹${fboInfo.totalAmount}</td>
                            </tr>
                        </table>
            
                        <div>
                            <p>
                                ${fboInfo.chosenService === 'Khadya Paaln' ? 
                                    `<b>T&C:<br>
                                    1. Total Amount does not include any government charges. Incurred government fee is to be paid directly to the government during filing by the customer.<br>
                                    2. Service includes auto renewal filing of ${
                                        fboInfo.totalAmount > 20000 
                                        ? 'Fostac Certificate (2) + Foscos License (1) + Health Trade License (1) + Shop and Establishment Certificate (1) + Medical Certificate (2) + Water Test Report (2) + HRA + On-Site Staff Training (1) per shop.<br>'
                                        : 'Fostac Certificate (1) + Foscos License (1) + Health Trade License (1) + Shop and Establishment Certificate (1) + Medical Certificate (1) + Water Test Report (2) per shop.<br>'
                                    }
                                    3. Food technical visit (${fboInfo.totalAmount > 20000 ? '3' : '1'}) per shop per annum.
                                    </b>`
                                    : ''
                                }
                            </p>
                        </div>

            <div style="display: flex; justify-content: space-between;">
                <div>
                </div>
                <section style="position: relative; margin-top: 40px;">
                    <img src="${stampImg}" height=100 width=100 alt="iiest_stamp"> <br>
                    <img src="${signatureConverted}" height=100 width=100 alt="iiest_stamp"
                        style="position: absolute; top: 0; right:0">
                    ${fboInfo.officerName}
                </section>
            </div>
                    </div>
                </div>
            
                </div>
            </body>
            
            </html>`);
        });

        signatureDownloadStream.on('error', (error) => {
            reject(error);
        });
    });
}

module.exports = invoiceTemplate;


