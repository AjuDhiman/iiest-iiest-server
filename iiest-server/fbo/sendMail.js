const nodemailer = require('nodemailer');
const mailData = JSON.parse(process.env.NODE_MAILER);

const sendInvoiceMail = (clientMail, files) => {
  console.log('files console ................', files, clientMail);
  const attachments = files.map(file => {
    // console.log(JSON.stringify(file));
    return {
      filename: file.fileName,
      content: file.encodedString,
      encoding: 'base64'
    }
  });
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
    subject: 'IIEST Federation -- INVOICE',
    html: `<p>Welcome to the IIEST Federation,<br>
        Scheme implementing partner of Govt. Of India.</p>
        <p>Dear Valued Customer</p>
        <p>Thanks for registering for the services under project - FSSAI GOI. Your invoice is generated and sent to you via this mail.<br> You will receive a call within 7 days to verify your details. Kindly do the needful.<br><br>
        The company has zero tolerance towards any bribery, corruption & fraud in business activities.</p>
        <p>Thank You</p>
        <br>
        TP Name - IIEST Federation<br>
        TP No - TPINT133<br>
        Address - 1-U, First Floor, DCM Building 16, Barakhamba road New Delhi, Delhi, 110001<br/>
        Contact no - 9910729809<br>
        Landline - 011-43511788, 011-4681145<br>
        Contact time 10 :00 a.m to 7:00 p.m<br>
        <br><br>
        <hr>
        <br>
        <p>IIEST फेडरेशन में आपका स्वागत है,<br>
        भारत सरकार की योजना कार्यान्वयन भागीदार।</p>
        <p>प्रिय मूल्यवान ग्राहक</p> 
        <p>परियोजना - एफएसएसएआई भारत सरकार के तहत सेवाओं के लिए पंजीकरण करने के लिए धन्यवाद।<br> आपको अपना विवरण सत्यापित करने के लिए 7 दिनों के भीतर एक कॉल प्राप्त होगी। कृपया आवश्यक कार्रवाई करें।<br><br>
        कंपनी व्यावसायिक गतिविधियों में किसी भी रिश्वतखोरी, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहिष्णुता रखती है।</p>
        <p>धन्यवाद</p>
        <br>
        टीपी नाम - IIEST फेडरेशन<br>
        टीपी नंबर - TPINT133<br>
        पता - 1-यू, प्रथम मंजिल, डीसीएम भवन, 16, बाराखंबा रोड, नई दिल्ली, दिल्ली, 110001<br/>
        संपर्क नंबर- 9910729809<br>
        लैंडलाइन  - 011-43511788, 011-4681145<br>
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
    subject: 'IIEST Federation -- Cheque Collection Confirmation',
    html: `<p>Welcome to the IIEST Federation,<br>
        Scheme implementing partner of Govt. Of India.</p>
        <p>Dear Valued Customer</p>
        <p>Thanks for registering for the services under project - FSSAI GOI. We are writing to confirm that we have received your cheque.
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
        TP Name - IIEST Federation<br>
        TP No - TPINT133<br>
        Address - 1-U, First Floor, DCM Building 16, Barakhamba road New Delhi, Delhi, 110001<br/>
        Contact no - 9910729809<br>
        Landline - 011-43511788, 011-4681145<br>
        Contact time 10 :00 a.m to 7:00 p.m<br>
        <br><br>
        <hr>
        <br>
        <p>IIEST फेडरेशन में आपका स्वागत है,<br>
        भारत सरकार की योजना कार्यान्वयन भागीदार।</p>
        <p>प्रिय मूल्यवान ग्राहक</p> 
        <p>परियोजना - एफएसएसएआई भारत सरकार के तहत सेवाओं के लिए पंजीकरण करने के लिए धन्यवाद।<br> यह सूचित करते हुए हमें खुशी हो रही है कि आपका चेक प्राप्त हो गया है। <br>
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
        टीपी नाम - IIEST फेडरेशन<br>
        टीपी नंबर - TPINT133<br>
        पता - 1-यू, प्रथम मंजिल, डीसीएम भवन, 16, बाराखंबा रोड, नई दिल्ली, दिल्ली, 110001<br/>
        संपर्क नंबर- 9910729809<br>
        लैंडलाइन  - 011-43511788, 011-4681145<br>
        संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>`,
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

module.exports = {sendInvoiceMail, sendCheckMail}