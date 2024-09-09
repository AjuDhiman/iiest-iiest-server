const nodemailer = require('nodemailer');
const mailData = JSON.parse(process.env.NODE_MAILER);
const CONTACT_NUMBERS = JSON.parse(process.env.CONTACT_NUMBERS);
const LANDLINES = JSON.parse(process.env.LANDLINES);
const CB_ADDRESS = JSON.parse(process.env.CB_ADDRESS);
const CB_BRAND_NAME = JSON.parse(process.env.CB_BRAND_NAME);
const FRONT_END = JSON.parse(process.env.FRONT_END);

const sendInvoiceMail = (clientMail, files, isPayLaterMail, data) => {
  // console.log('files console ................', files, clientMail);
  const attachments = files.map(file => {
    // console.log(JSON.stringify(file));
    return {
      filename: file.fileName,
      content: file.encodedString,
      encoding: 'base64'
    }
  });
  console.log(data);
  const transport = nodemailer.createTransport({
    service: 'gmail',
    // host: 'email-smtp.us-east-1.amazonaws.com',
    // port: 587,
    // secure: false,
    auth: {
      user: mailData.email,
      pass: mailData.pass
    }
  });
  const mailOptions = {
    from: mailData.email,
    cc: process.env.DIRECTOR_MAIL,
    to: clientMail,
    subject: `${CB_BRAND_NAME.english} -- ${isPayLaterMail ? 'PERFORMA ADVICE' : 'INVOICE'}`,
    html: `<p>Welcome to the ${CB_BRAND_NAME.english},<br>
    ${CB_BRAND_NAME.english} Portal empowers businesses to meet compliance and legal requirements easily.</p>
        <p>Dear Valued Customer</p>
        <p>Thanks for registering for the services under compliances of - FSSAI GOI. ${!isPayLaterMail ? 'Your invoice is generated and sent to you via this mail.' : ''}<br> You will receive a call within 7 days to verify your details. Kindly do the needful.<br><br>
        The company has zero tolerance towards any bribery, corruption & fraud in business activities.</p>
       
        <p><b>Disclaimer: This mail is system generated please do not replay on this mail</b></p>
        
         ${isPayLaterMail?' <h4><b>Product Detais</b></h4><br>':''}
         
         
        ${isPayLaterMail && data.fostacInfo ? '<b>Fostac Certificate:- </b><br>' : ''}
        ${isPayLaterMail && data.fostacInfo ? '<b>Fostac Service Name:- </b>' + data.fostacInfo.fostac_service_name + '<br>' : ''}
        ${isPayLaterMail && data.fostacInfo ? '<b>Recipient no.:- </b>' + data.fostacInfo.recipient_no + '<br>' : ''}
        ${isPayLaterMail && data.fostacInfo ? '<b>Fostac Total:- </b>' + data.fostacInfo.fostac_total + ' rs (GST inclusive)<br><br>' : ''}

        ${isPayLaterMail && data.foscosInfo ? '<b>Foscos License:- </b><br>' : ''}
        ${isPayLaterMail && data.foscosInfo ? '<b>License Type:- </b>' + data.foscosInfo.foscos_service_name + '<br>' : ''}
        ${isPayLaterMail && data.foscosInfo ? '<b>License Category:- </b>' + data.foscosInfo.license_category + '<br>' : ''}
        ${isPayLaterMail && data.foscosInfo ? '<b>License Duration:- </b>' + data.foscosInfo.license_duration + '<br>' : ''}
        ${isPayLaterMail && data.foscosInfo ? '<b>Fostac Total:- </b>' + (Number(data.foscosInfo.foscos_processing_amount) + Number(data.foscosInfo.foscos_processing_amount * 0.18)) + '(GST inclusive)<br>' : ''}
 ${isPayLaterMail && data.foscosInfo ? '<b>Note:- Received Govt Charge of Rs ' + data.extraFee + '</b><br><br>' : ''}

         ${isPayLaterMail && data.hraInfo ? '<b>HRA Certificate:- </b><br>' : ''}
        ${isPayLaterMail && data.hraInfo ? '<b>HRA Total:- </b>' + data.hraInfo.hra_total + ' rs (GST inclusive)<br><br>' : ''}

         ${isPayLaterMail && data.waterTestInfo ? '<b>Water Test Report:- </b><br>' : ''}
          ${isPayLaterMail && data.waterTestInfo ? '<b>Water Test Type:- </b>' + data.waterTestInfo.water_test_service_name + '<br>' : ''}
        ${isPayLaterMail && data.waterTestInfo ? '<b>Water Test Total:- </b>' + data.waterTestInfo.water_test_total + ' rs (GST inclusive)<br><br>' : ''}

         ${isPayLaterMail && data.medicalInfo ? '<b>Medical certificate:- </b><br>' : ''}
          ${isPayLaterMail && data.medicalInfo ? '<b>Recipient No.:- </b>' + data.medicalInfo.recipient_no + '<br>' : ''}
        ${isPayLaterMail && data.medicalInfo ? '<b>Medical Total:- </b>' + data.medicalInfo.medical_total + ' rs (GST inclusive)<br><br>' : ''}

        
         ${isPayLaterMail && data.khadyaPaalnInfo ? '<b>Khadya Paaln:- </b><br>' : ''}
        ${isPayLaterMail && data.khadyaPaalnInfo ? '<b>Khadya Paaln Total:- </b>' + data.khadyaPaalnInfo.khadya_paaln_total + ' rs (GST inclusive)<br><br>' : ''}
        <p>
        ${isPayLaterMail ? '<b>Total Amount:-' + data.grand_total + ' rs (GST inclusive)' + (data.foscosInfo?' (With Govt Fee)':'') + '</b>' : ''}
        </p>
         ${isPayLaterMail && data.foscosInfo ?'Note:- GST is not applicable on Govt Fee':''}
        
         ${isPayLaterMail ?
        '<p><b>Bank Details:-</b><br>Account Name:- IIEST FEDERATION<br>Bank Name:- HDFC Bank<br>Account No.:- 50200038814644<br>IFSC Code:- HDFC0000313<br>Branch Name:-Connaught Circle<br>Account Type:- Current</p>' : ''
      }
        <br>
         <p>Thank You</p>
         ${isPayLaterMail?'<b>Kindly pay the fee on the given bank details within 2 days</b>':''}
        Brand Name - ${CB_BRAND_NAME.english},<br/>
        Address - ${CB_ADDRESS.english}<br/>
        Website - <a href='https://connectonline.world'>connectonline.world</a><br> 
        Email - customerrelations@iiest.org<br>
        Contact no - ${CONTACT_NUMBERS.connect_bharat}<br>
        Landline - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
        Contact time 10 :00 a.m to 7:00 p.m<br>
        <br>This mail is system generated, please do not replay on it.
        <br><br>
        <hr>
        <br>
        <p>${CB_BRAND_NAME.hindi} फेडरेशन में आपका स्वागत है,<br>
        ${CB_BRAND_NAME.hindi} पोर्टल व्यवसायों को आसानी से अनुपालन और कानूनी आवश्यकताओं को पूरा करने में सक्षम बनाता है।</p>
        <p>प्रिय मूल्यवान ग्राहक</p> 
        <p>परियोजना - ${CB_BRAND_NAME.hindi} भारत सरकार के तहत सेवाओं के लिए पंजीकरण करने के लिए धन्यवाद।<br> आपको अपना विवरण सत्यापित करने के लिए 7 दिनों के भीतर एक कॉल प्राप्त होगी। कृपया आवश्यक कार्रवाई करें।<br><br>
        कंपनी व्यावसायिक गतिविधियों में किसी भी रिश्वतखोरी, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहिष्णुता रखती है।</p>

        <p><b>अस्वीकृति: यह मेल सिस्टम द्वारा उत्पन्न किया गया है, कृपया इस मेल का जवाब न दें</b></p>

${isPayLaterMail ? '<h4><b>उत्पाद विवरण</b></h4><br>' : ''}

${isPayLaterMail && data.fostacInfo ? '<b>फोस्टैक प्रमाणपत्र:- </b><br>' : ''}
${isPayLaterMail && data.fostacInfo ? '<b>फोस्टैक सेवा का नाम:- </b>' + data.fostacInfo.fostac_service_name + '<br>' : ''}
${isPayLaterMail && data.fostacInfo ? '<b>प्राप्तकर्ता संख्या:- </b>' + data.fostacInfo.recipient_no + '<br>' : ''}
${isPayLaterMail && data.fostacInfo ? '<b>फोस्टैक कुल:- </b>' + data.fostacInfo.fostac_total + ' रुपये (जीएसटी समाविष्ट)<br><br>' : ''}

${isPayLaterMail && data.foscosInfo ? '<b>फोस्कोस लाइसेंस:- </b><br>' : ''}
${isPayLaterMail && data.foscosInfo ? '<b>लाइसेंस प्रकार:- </b>' + data.foscosInfo.foscos_service_name + '<br>' : ''}
${isPayLaterMail && data.foscosInfo ? '<b>लाइसेंस श्रेणी:- </b>' + data.foscosInfo.license_category + '<br>' : ''}
${isPayLaterMail && data.foscosInfo ? '<b>लाइसेंस अवधि:- </b>' + data.foscosInfo.license_duration + '<br>' : ''}
${isPayLaterMail && data.foscosInfo ? '<b>फोस्टैक कुल:- </b>' + (Number(data.foscosInfo.foscos_processing_amount) + Number(data.foscosInfo.foscos_processing_amount * 0.18)) + '(जीएसटी समाविष्ट)<br>' : ''}
${isPayLaterMail && data.foscosInfo ? '<b>नोट:- प्राप्त सरकारी शुल्क Rs ' + data.extraFee + '</b><br><br>' : ''}

${isPayLaterMail && data.hraInfo ? '<b>एचआरए प्रमाणपत्र:- </b><br>' : ''}
${isPayLaterMail && data.hraInfo ? '<b>एचआरए कुल:- </b>' + data.hraInfo.hra_total + ' रुपये (जीएसटी समाविष्ट)<br><br>' : ''}

${isPayLaterMail && data.waterTestInfo ? '<b>जल परीक्षण रिपोर्ट:- </b><br>' : ''}
${isPayLaterMail && data.waterTestInfo ? '<b>जल परीक्षण प्रकार:- </b>' + data.waterTestInfo.water_test_service_name + '<br>' : ''}
${isPayLaterMail && data.waterTestInfo ? '<b>जल परीक्षण कुल:- </b>' + data.waterTestInfo.water_test_total + ' रुपये (जीएसटी समाविष्ट)<br><br>' : ''}

${isPayLaterMail && data.medicalInfo ? '<b>चिकित्सीय प्रमाणपत्र:- </b><br>' : ''}
${isPayLaterMail && data.medicalInfo ? '<b>प्राप्तकर्ता संख्या:- </b>' + data.medicalInfo.recipient_no + '<br>' : ''}
${isPayLaterMail && data.medicalInfo ? '<b>चिकित्सीय कुल:- </b>' + data.medicalInfo.medical_total + ' रुपये (जीएसटी समाविष्ट)<br><br>' : ''}

${isPayLaterMail && data.khadyaPaalnInfo ? '<b>खाद्य पालन:- </b><br>' : ''}
${isPayLaterMail && data.khadyaPaalnInfo ? '<b>खाद्य पालन कुल:- </b>' + data.khadyaPaalnInfo.khadya_paaln_total + ' रुपये (जीएसटी समाविष्ट)<br><br>' : ''}
<p>
${isPayLaterMail ? '<b>कुल राशि:- ' + data.grand_total + ' रुपये (जीएसटी समाविष्ट)' + (data.foscosInfo ? ' (सरकारी शुल्क के साथ)' : '') + '</b>' : ''}
</p>
${isPayLaterMail && data.foscosInfo ? 'नोट:- सरकारी शुल्क पर जीएसटी लागू नहीं है' : ''}

        <p>धन्यवाद</p>
        <br>
        ब्रांड नाम = ${CB_BRAND_NAME.hindi}<br>
        पता - ${CB_ADDRESS.hindi}<br/>
        वेबसाइट - <a href='https://connectonline.world'>connectonline.world</a><br>
        ईमेल - customerrelations@iiest.org<br>
        संपर्क नंबर- ${CONTACT_NUMBERS.connect_bharat}<br>
        लैंडलाइन - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br> 
        संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>`,
    attachments: attachments
  }
  transport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.error(error);
    } else {
      ``
      // console.log(response);
    }
  })
}

const sendPayLaterMail = (clientMail, files, isPayLaterMail, data) => {
  // console.log('files console ................', files, clientMail);
  const attachments = files.map(file => {
    // console.log(JSON.stringify(file));
    return {
      filename: file.fileName,
      content: file.encodedString,
      encoding: 'base64'
    }
  });
  console.log(data);
  const transport = nodemailer.createTransport({
    service: 'gmail',
    // host: 'email-smtp.us-east-1.amazonaws.com',
    // port: 587,
    // secure: false,
    auth: {
      user: mailData.email,
      pass: mailData.pass
    }
  });
  const mailOptions = {
    from: mailData.email,
    cc: process.env.DIRECTOR_MAIL,
    to: clientMail,
    subject: `${CB_BRAND_NAME.english} -- ${isPayLaterMail ? 'PERFORMA ADVICE' : 'INVOICE'}`,
    html: `<p>Welcome to the ${CB_BRAND_NAME.english},<br>
    ${CB_BRAND_NAME.english} Portal empowers businesses to meet compliance and legal requirements easily.</p>
        <p>Dear Valued Customer</p>
        <p>Thanks for registering for the services under compliances of - FSSAI GOI. ${!isPayLaterMail ? 'Your invoice is generated and sent to you via this mail.' : '<b>Kindly pay the fee on the given bank details within 2 days</b>'}<br> You will receive a call within 7 days to verify your details. Kindly do the needful.<br><br>
        The company has zero tolerance towards any bribery, corruption & fraud in business activities.</p>
        
        <p>Thank You</p>
        <br>
         <p>
        ${isPayLaterMail ? '<b>Products:- </b>' + data.product_name.join(', ') : ''}
        <br>
        ${isPayLaterMail ? '<b>Total Amount:- </b>' + data.grand_total : ''}
        </p>
         ${isPayLaterMail ?
        '<p><b>Bank Details:-</b><br>Account Name:- IIEST FEDERATION<br>Bank Name:- HDFC Bank<br>Account No.:- 50200038814644<br>IFSC Code:- HDFC0000313<br>Branch Name:-Connaught Circle<br>Account Type:- Current</p>' : ''
      }

        Brand Name - ${CB_BRAND_NAME.english},<br/>
        Address - ${CB_ADDRESS.english}<br/>
        Website - <a href='https://connectonline.world'>connectonline.world</a><br> 
        Email - customerrelations@iiest.org<br>
        Contact no - ${CONTACT_NUMBERS.connect_bharat}<br>
        Landline - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
        Contact time 10 :00 a.m to 7:00 p.m<br>
        <br>This mail is system generated, please do not replay on it.
        <br><br>
        <hr>
        <br>
        <p>${CB_BRAND_NAME.hindi} फेडरेशन में आपका स्वागत है,<br>
        ${CB_BRAND_NAME.hindi} पोर्टल व्यवसायों को आसानी से अनुपालन और कानूनी आवश्यकताओं को पूरा करने में सक्षम बनाता है।</p>
        <p>प्रिय मूल्यवान ग्राहक</p> 
        <p>परियोजना - ${CB_BRAND_NAME.hindi} भारत सरकार के तहत सेवाओं के लिए पंजीकरण करने के लिए धन्यवाद।<br> आपको अपना विवरण सत्यापित करने के लिए 7 दिनों के भीतर एक कॉल प्राप्त होगी। कृपया आवश्यक कार्रवाई करें।<br><br>
        कंपनी व्यावसायिक गतिविधियों में किसी भी रिश्वतखोरी, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहिष्णुता रखती है।</p>
        <p>धन्यवाद</p>
        <br>
        ब्रांड नाम = ${CB_BRAND_NAME.hindi}<br>
        पता - ${CB_ADDRESS.hindi}<br/>
        वेबसाइट - <a href='https://connectonline.world'>connectonline.world</a><br>
        ईमेल - customerrelations@iiest.org<br>
        संपर्क नंबर- ${CONTACT_NUMBERS.connect_bharat}<br>
        लैंडलाइन - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br> 
        संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>
        <br>यह ईमेल प्रणाली द्वारा उत्पन्न किया गया है, कृपया इस ईमेल का उत्तर न दें।`,
    attachments: attachments
  }
  transport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.error(error);
    } else {
      ``
      // console.log(response);
    }
  })
}

const sendCheckMail = (clientMail, clientData) => {
  console.log('Client Data', clientData)
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: mailData.email,
      pass: mailData.pass
    }
  });
  const mailOptions = {
    from: mailData.email,
    cc: process.env.DIRECTOR_MAIL,
    to: clientMail,
    subject: `${CB_BRAND_NAME.english} -- Cheque Collection Confirmation`,
    html: `<p>Welcome to the ${CB_BRAND_NAME.english},<br>
        ${CB_BRAND_NAME.english} Portal empowers businesses to meet compliance and legal requirements easily.</p>
        <p>Dear Valued Customer</p>
        <p>Thanks for registering for the compliances of - FSSAI GOI. We are writing to confirm that we have received your cheque.
        <br><br>
        Below are the details of the cheque received:<br>
        Cheque Number: ${clientData.cheque_data.cheque_number}<br>
        Bank: ${clientData.cheque_data.bank_name}<br>
        Account Number: ${clientData.cheque_data.account_number}<br>
        Payee Name: ${clientData.cheque_data.payee_name}<br>
        <br><br>
        The company has zero tolerance towards any bribery, corruption & fraud in business activities.</p>
        <p>Thank You</p>
        <br>
        Brand Name - ${CB_BRAND_NAME.english},<br/>
        Address - ${CB_ADDRESS.english}<br/>
        Website - <a href='https://connectonline.world'>connectonline.world</a><br> 
        Email - customerrelations@iiest.org<br>
        Contact no - ${CONTACT_NUMBERS.connect_bharat}<br>
        Landline - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
        <br>This mail is system generated, please do not replay on it.
        Contact time 10 :00 a.m to 7:00 p.m<br>
        <br><br>
        <hr>
        <br>
        <p>${CB_BRAND_NAME.hindi} फेडरेशन में आपका स्वागत है,<br>
        ${CB_BRAND_NAME.hindi} पोर्टल व्यवसायों को आसानी से अनुपालन और कानूनी आवश्यकताओं को पूरा करने में सक्षम बनाता है।</p>
        <p>प्रिय मूल्यवान ग्राहक</p> 
        <p>परियोजना - ${CB_BRAND_NAME.hindi} भारत सरकार के तहत सेवाओं के लिए पंजीकरण करने के लिए धन्यवाद।<br> यह सूचित करते हुए हमें खुशी हो रही है कि आपका चेक प्राप्त हो गया है। <br>
        <br>
        नीचे चेक की विवरणी दी जा रही है:<br>
        चेक नंबर: ${clientData.cheque_data.cheque_number}<br>
        बैंक: ${clientData.cheque_data.bank_name}<br>
        खाता संख्या: ${clientData.cheque_data.account_number}<br>
        प्राप्तकर्ता का नाम: ${clientData.cheque_data.payee_name}<br>
        <br><br>
        कंपनी व्यावसायिक गतिविधियों में किसी भी रिश्वतखोरी, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहिष्णुता रखती है।</p>
        <p>धन्यवाद</p>
        <br>
        ब्रांड नाम = ${CB_BRAND_NAME.hindi}<br>
        पता - ${CB_ADDRESS.hindi}<br/>
        वेबसाइट - <a href='https://connectonline.world'>connectonline.world</a><br>
         ईमेल - customerrelations@iiest.org</br>
        संपर्क नंबर- ${CONTACT_NUMBERS.connect_bharat}<br>
        लैंडलाइन - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
        संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>
        <br>यह ईमेल प्रणाली द्वारा उत्पन्न किया गया है, कृपया इस ईमेल का उत्तर न दें।`,
  }
  transport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.error(error);
    } else {
      ``
      // console.log(response);
    }
  })
}

const sendFboVerificationMail = (clientMail, clientData) => {
  console.log('Client Data', clientData)
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: mailData.email,
      pass: mailData.pass
    }
  });
  const mailOptions = {
    from: mailData.email,
    to: clientMail,
    subject: `${CB_BRAND_NAME.english} -- Shop Verification`,
    html: `<p>Welcome to the ${CB_BRAND_NAME.english},<br>
        ${CB_BRAND_NAME.english} Portal empowers businesses to meet compliance and legal requirements easily.</p>
        <p>Dear Valued Customer</p>
        <p>Thanks for registering for the compliances of - FSSAI GOI. To complete the registration process please verify the details given below.
        <br>
        Business Entity: ${clientData.business_entity}<br>
        Fbo Name: ${clientData.fbo_name}<br>
        Owner Name: ${clientData.owner_name}<br>
        Manager Name: ${clientData.manager_name}<br>
        Manager Contact: ${clientData.manager_contact}<br>
        Manager Email: ${clientData.manager_email}<br>
        Address: ${clientData.address}<br>
        State: ${clientData.state}<br>
        District: ${clientData.district}<br>
        Pincode: ${clientData.pincode}<br>
        <br>
        <p>click button below for verifing your email.</p>
        <a style="text-decoration: none;" href='${FRONT_END.VIEW_URL}#/verifyonboard/fbo/${clientData.fboObjId}'>
            <button style="display: block;
            width: 100%;
            max-width: 300px;
            background: #20DA9C;
            border-radius: 8px;
            color: #fff;
            font-size: 18px;
            padding: 12px 0;
            margin: 30px auto 0;
            text-decoration: none; cursor: pointer;">Verify</button>
        </a>
        <br><br>
        The company has zero tolerance towards any bribery, corruption & fraud in business activities.</p>
        <p>Thank You</p>
        <p>Technical Officer: ${clientData.verifier}</p>
        The information provided will be verified by our food technical officer on-site , the date and time will be provided in advance.
        <br><br>
        Brand Name - ${CB_BRAND_NAME.english},<br/>
        Address - ${CB_ADDRESS.english}<br/>
        Website - <a href='https://connectonline.world'>connectonline.world</a><br> 
        Email - customerrelations@iiest.org<br>
        Contact no - ${CONTACT_NUMBERS.connect_bharat}<br>
        Landline - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
        Contact time 10 :00 a.m to 7:00 p.m<br>
        <br>This mail is system generated, please do not replay on it.
        <br><br>
        <hr>
        <br>
        <p>${CB_BRAND_NAME.hindi} फेडरेशन में आपका स्वागत है,<br>
        ${CB_BRAND_NAME.hindi} पोर्टल व्यवसायों को आसानी से अनुपालन और कानूनी आवश्यकताओं को पूरा करने में सक्षम बनाता है।</p>
        <p>प्रिय मूल्यवान ग्राहक</p> 
        <p>परियोजना - ${CB_BRAND_NAME.hindi} भारत सरकार के तहत सेवाओं के लिए पंजीकरण करने के लिए धन्यवाद। पंजीकरण प्रक्रिया को पूरा करने के लिए कृपया नीचे दिए गए विवरणों को सत्यापित करें।
        <br>
        व्यापार इकाई: ${clientData.business_entity}<br>
        एफबीओ का नाम: ${clientData.fbo_name}<br>
        मालिक का नाम: ${clientData.owner_name}<br>
        प्रबंधक का नाम: ${clientData.manager_name}<br>
        प्रबंधक का संपर्क: ${clientData.manager_contact}<br>
        प्रबंधक का ईमेल: ${clientData.manager_email}<br>
        पता: ${clientData.address}<br>
        वेबसाइट - <a href='https://connectonline.world'>connectonline.world</a><br>
        राज्य: ${clientData.state}<br>
        जिला: ${clientData.district}<br>
        पिनकोड: ${clientData.pincode}<br>
        <br>यह ईमेल प्रणाली द्वारा उत्पन्न किया गया है, कृपया इस ईमेल का उत्तर न दें।
        <br>
        <p>अपना ईमेल सत्यापित करने के लिए नीचे दिए गए बटन पर क्लिक करें।</p>
        <a style="text-decoration: none;" href='${FRONT_END.VIEW_URL}#/verifyonboard/fbo/${clientData.fboObjId}'>
            <button style="display: block;
            width: 100%;
            max-width: 300px;
            background: #20DA9C;
            border-radius: 8px;
            color: #fff;
            font-size: 18px;
            padding: 12px 0;
            margin: 30px auto 0;
            text-decoration: none; cursor: pointer;">सत्यापित करें</button>
        </a>
        <br><br>
        कंपनी व्यावसायिक गतिविधियों में किसी भी रिश्वतखोरी, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहिष्णुता रखती है।</p>
        <p>धन्यवाद</p>
        <p>तकनीकी अधिकारी: ${clientData.verifier}</p>
        <br><br>
        ब्रांड नाम = ${CB_BRAND_NAME.hindi}<br>
        पता - ${CB_ADDRESS.hindi}<br/>
        वेबसाइट - <a href='https://connectonline.world'>connectonline.world</a><br>
         ईमेल - customerrelations@iiest.org</br>
        संपर्क नंबर- ${CONTACT_NUMBERS.connect_bharat}<br>
        लैंडलाइन - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
        संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>
        <br>यह ईमेल प्रणाली द्वारा उत्पन्न किया गया है, कृपया इस ईमेल का उत्तर न दें।`,
  }
  transport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.error(error);
    } else {
      ``
      // console.log(response);
    }
  })
}

module.exports = { sendInvoiceMail, sendCheckMail, sendFboVerificationMail }