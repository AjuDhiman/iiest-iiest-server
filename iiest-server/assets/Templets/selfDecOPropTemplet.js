const selfDecOPropTemplet = (verifiedInfo, shopInfo) => {

    const address = getFormatedAddress(verifiedInfo.address);

    const operatorAddress = getFormatedAddress(verifiedInfo.operator_address);

    const today = new Date();

    return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
            body {
                width: 230mm;
                height: 100%;
                margin: 0 auto;
                padding: 0;
                font-size: 12pt;
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
    
            .custom-table {
                border-collapse: collapse;
                width: 100%;
            }
    
            .table-row {
                min-height: 250px;
                /* Adjust the minimum height of rows as needed */
            }
    
            .table-column {
                border: 1px solid #000000;
                /* Add borders to cells */
                padding: 8px;
            }
    
            @page {
                size: A4;
                margin: 0;
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
    
            h1 {
                text-align: center;
            }
    
            p {
                margin-bottom: 8px;
                padding: 5px 5px;
            }
    
            .signature {
                margin-bottom: 40px;
                margin-left: 70%;
    
            }
    
            .signature p {
                margin: 6px;
            }
    
            .signature p:first-child {
                margin-top: 0;
            }
        </style>
    </head>
    
    <body>
        <div class="main-page">
            <div class="sub-page">
                <h1
                    style="font-family: Arial, sans-serif; font-size: 22px; font-weight: bold; text-decoration: underline; text-align: center;">
                    Self-Declaration for Proprietorship</h1>
                <br>
                <p>I, ${verifiedInfo.operator_name} R/O ${operatorAddress} do hereby state and
                    affirm as follows:-</p>
                <ol>
                    <li>I am the proprietor of a business operating under the name and style ${verifiedInfo.fbo_name} operating
                        from address of the premises ${address}.</li>
                    <br>
                    <li>This business is not undertaken /operated by a partnership firm or limited liability company.</li>
                    <br>
                    <li>It is also to declare that below mentioned person is my legal nominee for the said proprietorship
                        concern-
                        <ul>
                            <br>
                            <li>Name _________________</li>
                            <br>
                            <li>Relationship with the proprietor______________________</li>
                        </ul>
                    </li>
                    <br>
                    <li>That the contents of this declare are true and correct to the best of my knowledge and behalf.</li>
                </ol>
                <table class="custom-table">
                    <tr class="table-row" height="150">
                        <td class="table-column" width="300">
                            <!-- Your cell content goes here -->
                        </td>
                        <td class="table-column" style="vertical-align: bottom;">
                            Signature of the proprietor with Stamp/Seal
                        </td>
                    </tr>
                    <tr class="table-row">
                        <td class="table-column" width="300">
                            <!-- Your cell content goes here -->
                        </td>
                        <td class="table-column">
                            Name ${verifiedInfo.operator_name}
                        </td>
                    </tr>
                    <tr class="table-row">
                        <td class="table-column" width="300">
                            Place ${address}
                        </td>
                        <td class="table-column">
                            Address ${operatorAddress}
                        </td>
                    </tr>
                    <tr class="table-row">
                        <td class="table-column" width="300">
                            Date ${today.getDate().toString().padStart(2, '0')}/${today.getMonth().toString().padStart(2, '0')}/${today.getFullYear()}
                        </td>
                        <td class="table-column">
                            Contact No ${verifiedInfo.operator_contact_no}
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </body>
    
    </html>`
}

// this func relplace "," with ", " in address
function getFormatedAddress(address) {
    let str = address;
    [...address].forEach((char, index) => {
        if (char === ',' && address[index + 1] !== " ") {
            str = address.substring(0, index + 1) + " " + address.substring(index + 1);
        }
    });
    return str;
}

module.exports = selfDecOPropTemplet;