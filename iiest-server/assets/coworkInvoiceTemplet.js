// const fboLogo = require("./iiestLogo");
// const fboStamp = require('./stamp');
const { ToWords } = require('to-words');
const { empSignBucket } = require("../config/buckets");
const { ObjectId } = require("mongodb");
const { getFileStream, employeeDocsPath } = require("../config/s3Bucket");
const coworksLogo = require("./coworksLogo");
const coworksStamp = require('./coworkStamp');


const coworkInvoiceTemplate = async (data) => {

    const quantity = data.qty;
    const rate = data.amount;
    const subTotal = quantity * rate;

    let invoiceType = data.invoiceType === "Customer" ? "C U S T O M E R" : "T A X";

    //getting invoic type
    switch (data.invoiceType) {
        case 'Customer':
            invoiceType = "C U S T O M E R";
            break;
        case 'Tax':
            invoiceType = "T A X";
            break;
        case 'Service':
            invoiceType = "S E R V I C E";
            break;
        default:
            invoiceType = ""
            break;
    }

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

    // switch(data.choosenServices) {

    // }

    const signatureName = data.signatureName;

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
    const logoImg = coworksLogo();

    const stampImg = coworksStamp();

    let chunks = [];

    const amountInWords = toWords.convert(data.totalAmount, { currency: true, ignoreZeroCurrency: true });

    //getting signature stream from s3
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
                            <h3>I I E S T&nbsp;&nbsp;&nbsp;I N C U B A T I O N&nbsp;&nbsp;&nbsp;A N D&nbsp;&nbsp;&nbsp;B U S I N E S S&nbsp;&nbsp;&nbsp;C E N T R E</h3>
                        </div>
                        <div class="logo-section">
                            <p>
                                <b>1-U, First Floor, DCM Building 16, Barakhamba road New Delhi, Delhi, 110001
                                <br>
                                Mobile No: +91-9599195097
                                Landline - 011-35454931, 011-35457013  </b><br>
                                <br>
                                Website: startworks.co.in, Email ID: finance.iiest@gmail.com
                                <br/>
                                Start Works, a brand of IIEST Incubation And Business Centre. Invoice issued by IIEST Incubation And Business Centre.
                                <br/>
                                GST: 07AAHFI6394N1ZN
                            </p>
                            <img src="${logoImg}" width="150px" height="110px" alt="coworks logo">
                        </div>
                        <br>
                        <div class="heading">
                            <h3>${invoiceType}&nbsp;&nbsp;&nbsp;I N V O I C E</h3>
                        </div>
                        <h5>BILL TO:</h5>
                        <div class="main-container" style="width:90vw">
                                    <p style = " padding-right: 7px;">
                            <b>Customer Name:</b> ${data.business_name}<br>
                            <b>Customer Address:</b> ${data.address},
                            <br>
                            <b>Pincode:</b> ${data.pincode}<br>
                            <b>District:</b> ${data.district}<br>
                            <b>State:</b> ${data.state}<br>
                            <b>Customer Contact:</b> +91&nbsp;${data.contact}<br>
                            <b>Customer Email:</b>${data.email}
                           
                            <br/><br>
                            ${data.gstNumber ? '<b>Customer GST:</b>' + data.gstNumber : ''}<br>
                            <b>Place of Supply:</b> ${data.stateCode}<br>
                            <b>Behalf of:</b>${data.behalf_of} <br>
                            </p>
                            <table style="width: 50%;">
                                <tr>
                                    <td>Invoice #</td>
                                    <td>${data.receiptNo}</td>
                                </tr>
                                <tr>
                                    <td>Code</td>
                                    <td>${data.code}</td>
                                </tr>
                                <tr>
                                    <td>Invoice Date</td>
                                    <td>${data.date} </td>
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
                                <td> <b>${data.chosenService} Services </b><br/>
                                ${data.description}</td>
                                <td>${quantity}</td>
                                <td>₹${rate}</td>
                                <td>₹${subTotal}</td>
                            </tr>
                            <tr>
                                <td style="border-top: 0; border-bottom: 0;">Amount in Words: <br><br> ${amountInWords}</td>
                                <th colspan="2">Subtotal</th>
                                <td>₹${subTotal}</td>
                            </tr>
                           ${data.gstDescription}
                            <tr>
                                <td style="border-top: 0;"></td>
                                <th colspan="2">Total</th>
                                <td>₹${data.totalAmount}</td>
                            </tr>
                        </table>
            
                        <div>
                            <p>
            
                            </p>
                        </div>
            <div style="display: flex; justify-content: space-between;">
                <div>
                <p><b>Invoice is payable within 2 days *</b><br/>
                <b>Please make invoice payment in our following bank account</b></p>
                <br/>
                <p><b>Account Name: </b>IIEST Incubation and Business Centre</p>
                <p><b>Bank Name: </b>IndusInd Bank</p>
                <p><b>Account No.: </b>250359359359</p>
                <p><b>IFSC Code: </b>INDB0000005</p>
                <p><b>Account Type: </b>Current</p>
                </div>
                <section style="position: relative; margin-top: 40px;">
                    <img src="${stampImg}" height=100 width=100 alt="iiest_stamp"> <br>
                    
                    Piyush Sharma
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

module.exports = coworkInvoiceTemplate;


