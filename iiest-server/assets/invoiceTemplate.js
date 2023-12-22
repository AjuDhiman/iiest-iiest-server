const fboLogo = require("./iiestLogo");
const fboStamp = require('./stamp');
const { ToWords } = require('to-words')

const invoiceTemplate = (fboInfo)=>{

    const servicesChosen = fboInfo.chosenServices;

    console.log(servicesChosen);

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

    const logoImg = fboLogo();

    const stampImg = fboStamp();

    const amountInWords = toWords.convert(fboInfo.totalAmount, {currency: true, ignoreZeroCurrency: true})

    return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sales Slip</title>
    </head>
    
    <body style="margin: 0; padding: 30px 80px;">
    
        <header
            style="display: flex; justify-content: center; align-items: center; gap: 20px; padding: 0; margin: 0; box-sizing: border-box;"
            class="first-section">
            <div style="width: 110px; height: 110px; padding: 0; margin: 0; box-sizing: border-box;"
                class="image-container">
                <img src="${logoImg}" alt="IIEST LOGO"
                    style="width: 100%; height: 100%; object-fit: cover; padding: 0; margin: 0; box-sizing: border-box;">
            </div>
            <div style="text-align: center; padding: 0; margin: 0; box-sizing: border-box;" class="text-container">
                <h1
                    style="padding: 0; margin: 0; box-sizing: border-box; border-bottom: 2px solid; padding-bottom: 0px;font-size: 36px;font-weight: 500;margin-bottom: 0;">
                    औद्योगिक उद्यमिता और कौशल प्रशिक्षण महासंघ</h1>
                <p style="padding: 0; margin: 0; box-sizing: border-box; margin-top: 10px;font-size: 14px;">INDUSTRIAL
                    INCUBATION OF ENTREPRENEURSHIP AND SKILL TRAINING FEDERATION</p>
            </div>
        </header>
        <div
            style="padding: 0; margin: 0; box-sizing: border-box; display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; padding: 20px;">
            <div style="padding: 0; margin: 0; box-sizing: border-box; grid-column: span 1;">
                <div style="padding: 0; margin: 0; box-sizing: border-box; grid-row: 1;">
                    <p style="padding: 0; margin: 0; box-sizing: border-box;">Corporate Office No-55, Opposite Metro Pillar
                        No.6, Panchkulan Marg, Connaught Place, Delhi-110001.</p>
                </div>
                <div style="padding: 0; margin: 0; box-sizing: border-box; grid-row: 2;">
                    <p style="padding: 0; margin: 0; box-sizing: border-box;"><strong
                            style="padding: 0; margin: 0; box-sizing: border-box;">Email:</strong> info@ilest.org, <strong
                            style="padding: 0; margin: 0; box-sizing: border-box;">Website:</strong> <a
                            style="padding: 0; margin: 0; box-sizing: border-box;" href="http://www.liest.org"
                            target="_blank">www.liest.org</a></p>
                </div>
                <div style="padding: 0; margin: 0; box-sizing: border-box; grid-row: 3; ">
                    <p style="padding: 0; margin: 0; box-sizing: border-box;"><strong
                            style="padding: 0; margin: 0; box-sizing: border-box;">Landline No:</strong> 011-43511788
                        <strong style="padding: 0; margin: 0; box-sizing: border-box;">Mobile No:</strong> +91-9910729809,
                        9289310979</p>
                </div>
            </div>
            <div style="padding: 0; margin: 0; box-sizing: border-box; grid-column: span 1;">
                <div style="padding: 0; margin: 0; box-sizing: border-box; grid-row: 1;">
                    <p style="padding: 0; margin: 0; box-sizing: border-box;">Center Office, Flat No. 102, 1st Floor, Plot
                        13, Cyber Heights, Huda Layout, Beside NTR Trust Line Road No. 2, Banjara Hills, Hyderabad - 500034
                    </p>
                </div>
                <div style="padding: 0; margin: 0; box-sizing: border-box; grid-row: 2;">
                    <p style="padding: 0; margin: 0; box-sizing: border-box;"><strong
                            style="padding: 0; margin: 0; box-sizing: border-box;">Mobile No:</strong> +91-9154150561,
                        +91-9154150563</p>
                </div>
            </div>
        </div>
        <p class="head"
            style="padding: 0; margin: 0; box-sizing: border-box; font-weight: 700; font-size: 24px; text-align: center;">
            Food Safety Training and Certification (FoSTaC) TP ID - TPINT133</p>
        <div
            style="padding: 0; margin: 0; box-sizing: border-box; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px;">
            <div class="padding: 0; margin: 0; box-sizing: border-box; recipt-no">
                <p style="padding: 0; margin: 0; box-sizing: border-box;"><strong
                        style="padding: 0; margin: 0; box-sizing: border-box;">Receipt No: ${fboInfo.receiptNo}</strong></p>
            </div>
            <div style="padding: 0; margin: 0; box-sizing: border-box; display: grid; grid-template-rows: repeat(2, auto); gap: 10px;">
                <div class="date" style="padding: 0; margin: 0; box-sizing: border-box; display: grid; grid-template-columns: 7fr 5fr; gap: 10px;">
                    <div style="padding: 0; margin: 0; box-sizing: border-box; text-align: right;"><strong>Date: ${fboInfo.date}</strong></div>
                    <div style="padding: 0; margin: 0; box-sizing: border-box;"></div>
                </div>
                <div class="place" style="padding: 0; margin: 0; box-sizing: border-box; display: grid; grid-template-columns: 7fr 5fr; gap: 10px;">
                    <div style="padding: 0; margin: 0; box-sizing: border-box; text-align: right;"><strong style="padding: 0; margin: 0; box-sizing: border-box;">Place:</strong></div>
                    <div style="padding: 0; margin: 0; box-sizing: border-box;"></div>
                </div>
            </div>
        </div>
        <div style="padding: 0; margin: 0; box-sizing: border-box; display: grid; grid-template-rows: repeat(7, auto); gap: 10px; padding: 20px;">
            <div style="padding: 0; margin: 0; box-sizing: border-box;" class="name">
                <p style="padding: 0; margin: 0; box-sizing: border-box;"><strong style="padding: 0; margin: 0; box-sizing: border-box;">Name of the Candidate: ${fboInfo.name} </strong> </p>
            </div>
            <div style="display: grid; grid-template-columns: 8fr 4fr; gap: 10px;">
                <div style="padding: 0; margin: 0; box-sizing: border-box;" class="address">
                    <p style="padding: 0; margin: 0; box-sizing: border-box;"><strong style="padding: 0; margin: 0; box-sizing: border-box;">Address: ${fboInfo.address} </strong></p>
                </div>
                <div style="padding: 0; margin: 0; box-sizing: border-box;" class="contact">
                    <p style="padding: 0; margin: 0; box-sizing: border-box;"><strong style="padding: 0; margin: 0; box-sizing: border-box;">Contact: ${fboInfo.contact} </strong></p>
                </div>
            </div>
            <div style="padding: 0; margin: 0; box-sizing: border-box; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                <div style="padding: 0; margin: 0; box-sizing: border-box;" class="fostac-program-type">
                    <p style="padding: 0; margin: 0; box-sizing: border-box;"><strong style="padding: 0; margin: 0; box-sizing: border-box;">Fostac Program Type</strong></p>
                </div>
                <div>
                    <input style="padding: 0; margin: 0; box-sizing: border-box;" type="checkbox" id="basicCatering" name="basicCatering" ${servicesChosen.includes('Catering') ? 'checked' : ''}>
                    <label style="padding: 0; margin: 0; box-sizing: border-box;" for="basicCatering">Basic Catering</label>
                </div>
                <div style="padding: 0; margin: 0; box-sizing: border-box;">
                    <input style="padding: 0; margin: 0; box-sizing: border-box;" type="checkbox" id="basicRetail" name="basicRetail" ${servicesChosen.includes('Retail') ? 'checked' : ''}>
                    <label style="padding: 0; margin: 0; box-sizing: border-box;" for="basicRetail">Basic Retail</label>
                </div>
                <div style="padding: 0; margin: 0; box-sizing: border-box;"></div>
            </div>
            <div style="padding: 0; margin: 0; box-sizing: border-box; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                <div class="license-program-type" style="padding: 0; margin: 0; box-sizing: border-box;">
                    <p style="padding: 0; margin: 0; box-sizing: border-box;"><strong style="padding: 0; margin: 0; box-sizing: border-box;">License Program Type</strong></p>
                </div>
                <div style="padding: 0; margin: 0; box-sizing: border-box;">
                    <input style="padding: 0; margin: 0; box-sizing: border-box;" type="checkbox" id="registration" name="registration" ${servicesChosen.includes('Registration') ? 'checked' : ''}>
                    <label style="padding: 0; margin: 0; box-sizing: border-box;" for="registration" >Registration</label>
                </div>
                <div style="padding: 0; margin: 0; box-sizing: border-box;">
                    <input style="padding: 0; margin: 0; box-sizing: border-box;" type="checkbox" id="state" name="state" ${servicesChosen.includes('State') ? 'checked' : ''}>
                    <label style="padding: 0; margin: 0; box-sizing: border-box;" for="state">State</label>
                </div>
                <div style="padding: 0; margin: 0; box-sizing: border-box;">
                    <input style="padding: 0; margin: 0; box-sizing: border-box;" type="checkbox" id="sfhpEdpMembership" name="sfhpEdpMembership">
                    <label style="padding: 0; margin: 0; box-sizing: border-box;" for="sfhpEdpMembership">SFHP/EDP/Membership</label>
                </div>
            </div>
            <div style="padding: 0; margin: 0; box-sizing: border-box; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div style="padding: 0; margin: 0; box-sizing: border-box;" class="date-of-training">
                    <p style="padding: 0; margin: 0; box-sizing: border-box;"><strong style="padding: 0; margin: 0; box-sizing: border-box;">Date of Training </strong> </p>
                </div>
                <div style="padding: 0; margin: 0; box-sizing: border-box;" class="batch-code">
                    <p style="padding: 0; margin: 0; box-sizing: border-box;"><strong style="padding: 0; margin: 0; box-sizing: border-box;">Batch Code </strong></p>
                </div>
            </div>
            <div style="padding: 0; margin: 0; box-sizing: border-box; display: grid; grid-template-columns: 7fr 5fr; gap: 10px;">
                <div style="padding: 0; margin: 0; box-sizing: border-box;" class="payment-mode">
                    <p style="padding: 0; margin: 0; box-sizing: border-box;"><strong style="padding: 0; margin: 0; box-sizing: border-box;">By Cash/Check/Paytm/UPI </strong> </p>
                </div>
                <div style="padding: 0; margin: 0; box-sizing: border-box;" class="transaction-id">
                    <p style="padding: 0; margin: 0; box-sizing: border-box;"><strong style="padding: 0; margin: 0; box-sizing: border-box;">Transaction ID: ${fboInfo.transactionId} </strong></p>
                </div>
            </div>
            <div class="total-amount-in-words" style="padding: 0; margin: 0; box-sizing: border-box;">
                <p style="padding: 0; margin: 0; box-sizing: border-box;"><strong style="padding: 0; margin: 0; box-sizing: border-box;">Total Amount in Words: ${amountInWords} </strong></p>
            </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 20px; box-sizing: border-box;">
            <div class="online-payment-detail" style="padding: 10px; box-sizing: border-box; ">
                <h3 style="margin: 0; padding: 0; box-sizing: border-box; text-decoration: underline;">Online Payment</h3>
                <p style="margin: 0; padding: 0; box-sizing: border-box;"><strong>IIEST Account No.:</strong> 50200038814644</p>
                <p style="margin: 0; padding: 0; box-sizing: border-box;"><strong>IFSC Code:</strong> HDFC0000313</p>
                <p style="margin: 0; padding: 0; box-sizing: border-box;"><strong>Bank name:</strong> HDFC Back</p>
                <p style="margin: 0; padding: 0; box-sizing: border-box;"><strong>Account Holder:</strong> IIEST Federation</p>
                <p style="margin: 0; padding: 0; box-sizing: border-box;"><strong>GST no.</strong> 07AADCI2920D1Z2</p>
                <p style="margin: 0; padding: 0; box-sizing: border-box;">Fee includes all above service charges.</p>
                <p style="margin: 0; padding: 0; box-sizing: border-box;">Fee is non refundable</p>
                <p style="margin: 0; padding: 0; box-sizing: border-box;">Course fees details are avilable here</p>    
                <p style="margin: 0; padding: 0; box-sizing: border-box;"><a href="https://fostac.fssai.gov.in/index">https://fostac.fssai.gov.in/index</a></p>
            </div>
            <div style="padding: 0px; box-sizing: border-box;">
                <div style="border: 1px solid #000; display: grid; grid-template-columns: 1fr 1fr; margin-top: 5px;">
    
                    <div style="border: 1px solid #000;text-align: center; padding: 10px;"><strong>Fostac Course fee</strong></div>
                    <div style="border: 1px solid #000; text-align: center;  padding: 10px;"><strong>Amount</strong></div>
                    <div style="border: 1px solid #000;text-align: center;  padding: 10px;">Amount</div>
                    <div style="border: 1px solid #000; text-align: center;  padding: 10px;">${fboInfo.amount}</div>
                    <div style="border: 1px solid #000;  text-align: center;  padding: 10px;">CGST@9% <br> SGST@9%</div>
                    <div style="border: 1px solid #000; text-align: center;  padding: 10px;">${fboInfo.taxAmount}</div>
                    <div style="border: 1px solid #000;text-align: center;  padding: 10px;">Total</div>
                    <div style="border: 1px solid #000;text-align: center;  padding: 10px;">${fboInfo.totalAmount}</div>
                
                </div>
            </div>
            <div style="padding-right: 40px; margin-top: 20px; position: relative; box-sizing: border-box; display: flex; justify-content: flex-end;">
                <img src="${stampImg}" alt="Stamp" style="width: 150px; height: 150px; object-fit: cover; margin: 0; padding: 0; box-sizing: border-box;">
            </div>
        </div>
    </body>
    </html>`
}

module.exports = invoiceTemplate;

