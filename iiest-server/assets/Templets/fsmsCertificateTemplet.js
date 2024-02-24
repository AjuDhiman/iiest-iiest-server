
const fsmsTemplate = (verifiedInfo) => {

  const foodCategories = verifiedInfo.food_category.join(", ");

  let today = new Date();

  let foodType = getFoodType(verifiedInfo.kob);

  let ownership = getOwnership(verifiedInfo.ownership_type);

  let address = getFormatedAddress(verifiedInfo.address);

  let operAddress = getFormatedAddress(verifiedInfo.operator_address);

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
      background: rgb(204,204,204); 
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
      box-shadow: 0 0 0.5cm rgba(0,0,0,0.5);
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
      html, body {
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
          margin-bottom:8px;
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
        <h1 style="font-family: Arial, sans-serif; font-size: 15px; font-weight: bold; text-decoration: underline; text-align: center;">DECLARATION REGARDING FOOD SAFETY MANAGEMENT SYSTEM (FSMS)</h1>
        <br>
        <p>I/ We, <b style="text-transform: capitalize;">${verifiedInfo.operator_name}</b>, as a <span style="text-transform: capitalize;"> ${ownership}</span> of M/s <b style="text-transform: capitalize;">“${verifiedInfo.fbo_name}”</b>, at Shop at <b style="text-transform: capitalize;">${address}</b> hereby declare that :</p>
        <br>
        <ol>
          <li>I am /we are an applicant for State license under the food safety and standards Act (FSS ACT), 2006.</li>
          <br>
          <li>The nature of business of my/ our firm is <span style="text-transform: capitalize;">${foodCategories}<span>.</li>
          <br>
          <li>Food Vender of <span style="text-transform: capitalize;">${foodType}<span> items for Customer
            <ul>
              <br>
              <li>${verifiedInfo.food_items}</li>
            </ul>
          </li>
          <br>
          <li>Establishment of Food Services above Mentioned in the product description of the online Form B.</li>
          <br>
          <li>I/We have a food safety plan to ensure that the articles of food, as mentioned above, satisfy the Requirement of the FSS Act, 2006 and the rules and regulations thereunder.</li>
          <br>
          <li>I / We further undertake that I / We shall put in a place a Food Safety Managements System (FSMS) and get the same certified from an Accredited Agency as soon as the accredited agencies are notified by the Food Authority.</li>
          <br>
          <li>Our facility shall comply with general hygiene and sanitary requirement as mentioned in the Schedule 4 of the Food Safety and Standards (Licensing and Registration of Food Business) Regulation, 2011.</li>
        </ol>
        <br>
        <p>Place :- ${address}</p>
        <p>Dated :- ${today.getDate().toString().padStart(2, '0')}/${today.getMonth().toString().padStart(2, '0')}/${today.getFullYear()}</p>
        <br>
        <div class="signature">
          <p>Signature of the Authorised Signatory</p>
          <p style="text-transform: capitalize;">Name   :  ${verifiedInfo.operator_name}</p>
          <p style="text-transform: capitalize;">Address : ${operAddress}</p>
        </div>
      </div>
      </div>
    </body>
    </html>`
}

function getFoodType(kob) {
  switch (kob) {
    case 'Manufacturer':
      return 'Manufactured';
    case 'Retail/Trader':
      return 'Packed';
    case 'Food Service':
      return 'Prepared';
  }
}

function getOwnership(ownership_type) {
  switch (ownership_type) {
    case 'partnership':
      return 'Partner';
    case 'propraitorship':
      return 'Propraitor';
    case 'board of director':
      return 'Director';
  }
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

module.exports = fsmsTemplate;