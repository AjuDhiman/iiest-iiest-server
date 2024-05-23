const nodemailer = require('nodemailer');
const mailData = JSON.parse(process.env.NODE_MAILER);

const sendDocumentMail = (clientData) => {
  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: mailData.email,
      pass: mailData.pass
    }
  });
  const mailOptions = {
    from: mailData.email,
    to: clientData.clientMail,
    subject: `IIEST Federation - ${clientData.ticketType}`,
    html: `<p>Dear ${clientData.recipientName},</p>
    <p>Welcome to the IIEST Federation,<br>
    Scheme implementing partner of Govt. Of India.</p>
    <p>We are pleased to inform you that your ${clientData.ticketType} has been generated and is attached to this email.</p>
    <br>
    <p>If you have any questions or require further information, please do not hesitate to contact us.</p>
    <p>Regards,<br>
    IIEST Federation</p>
    <br>
    TP Name - IIEST Federation<br>
    TP No - TPINT133<br>
    Contact no – 9910729809<br>
    Landline - 011-43511788, 011-4681145<br>
    Contact time 10 :00 a.m to 7:00 p.m<br>
    <br><br>
    <hr>
    <br>
    <p>प्रिय ${clientData.recipientName},</p>
    <p>IIEST फेडरेशन में आपका स्वागत है,<br>
    भारत सरकार की योजना कार्यान्वयन भागीदार।</p>
    <p>हमें आपको सूचित करते हुए खुशी हो रही है कि आपका ${clientData.ticketType} को पूरा हो चुका है और इस मेल के साथ संलग्न किया गया है।</p>
    <br>
    <p>यदि आपके कोई और प्रश्न हैं या सहायता की आवश्यकता है, तो कृपया बेझिझक हमसे संपर्क करें</p>
    <p><strong>कंपनी व्यावसायिक गतिविधियों में किसी भी रिश्वतखोरी, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहिष्णुता रखती है।</strong></p>
    <p>"धन्यवाद,<br>
    IIEST Federation</p>
    <br>
    टीपी नाम - IIEST फेडरेशन<br>
    टीपी नंबर - TPINT133<br>
    संपर्क नंबर- 9910729809<br>
    लैंडलाइन  - 011-43511788, 011-4681145<br>
    संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>`,
    attachments: [
      {
        filename: 'fostacCertificate.pdf',
        path: `./${clientData.filePath}`
      }
    ]
  }
  transport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.error(error);
    } else {
    }
  })
};

// function to send mail to the client after verification process
const sendVerificationMail = (clientData) => {

  let content;
  let subject;

  if (clientData.product == 'fostac') {

    let todayDate = new Date();
    let nextMonth = new Date(todayDate);
    nextMonth.setMonth(todayDate.getMonth() + 1);
    let formattedNextMonth = nextMonth.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

    subject = `IIEST Federation - Information Verified Successfuly`;
    content = `<p>Dear ${clientData.recipientName},</p>
    <p>Welcome to the IIEST Federation,<br>
    Scheme implementing partner of Govt. Of India.</p>
    <p>Thanks for registering for the FoSTaC Training program by FSSAI Govt Of India.<br>
    The information you have provided has been successfully verified. We appreciate your cooperation and timely response during the verification process.</p>
    <p>Kindly review the details you have provided below:</p>
    Trainee Name -- ${clientData.recipientName}<br>
    Trainee father Name -- ${clientData.fatherName}<br>
    Trainee Contact No -- ${clientData.recipientContactNo}<br>
    Trainee DOB -- ${clientData.dob}<br>
    Trainee Aadhar No -- ${clientData.aadharNo}<br>
    ${clientData.pancard ? ('Trainee Pancard No -- ' + clientData.pancard + '<br>') : ''}

    <p>The tentative training date of your training is ${formattedNextMonth}. The final date and training venue & timings details will be provided to you as per availability of the IIEST-FSSAI training schedule 2-3 days in advance through messages and calls.</p>

    <p>If you have any further questions or need assistance, please feel free to reach out to us</p>
    <p><strong>The company has zero tolerance towards any bribery, corruption & fraud in business activities.</strong></p>
    <p>Regards,<br>
    IIEST Federation</p>
    <br>
    TP Name - IIEST Federation<br>
    TP No - TPINT133<br>
    Contact no – 9910729809<br>
    Landline -011-43511788, 011-4681145<br>
    Contact time 10 :00 a.m to 7:00 p.m<br>
    <br><br>
    <hr>
    <br>
    <p>प्रिय ${clientData.recipientName},</p>
    <p>IIEST फेडरेशन में आपका स्वागत है,<br>
    भारत सरकार की योजना कार्यान्वयन भागीदार।</p>
    <p>भारत सरकार के FSSAI द्वारा आयोजित FoSTaC प्रशिक्षण कार्यक्रम के लिए पंजीकरण के लिए धन्यवाद।<br>
    आपके द्वारा प्रदान की गई जानकारी सफलतापूर्वक सत्यापित कर दी गई है। हम सत्यापन प्रक्रिया के दौरान आपके सहयोग और समय पर प्रतिक्रिया की सराहना करते हैं।</p>
    <p>कृपया नीचे दिए गए विवरण की समीक्षा करें:</p>
    ट्रेनी का नाम -- ${clientData.recipientName}<br>
    ट्रेनी के पिता का नाम -- ${clientData.fatherName}<br>
    ट्रेनी का संपर्क नंबर -- ${clientData.recipientContactNo}<br>
    ट्रेनी का जन्मतिथि -- ${clientData.dob}<br>
    ट्रेनी का आधार नं -- ${clientData.aadharNo}<br>
    ${clientData.pancard ? ('ट्रेनी का पैनकार्ड नं -- ' + clientData.pancard + '<br>') : ''}

    <p>आपके प्रशिक्षण की तारीख की संभावित तिथि ${formattedNextMonth} है। अंतिम तारीख और प्रशिक्षण स्थल और समय का विवरण आपको IIEST-FSSAI प्रशिक्षण कार्यक्रम की उपलब्धता के आधार पर मैसेज और कॉल के माध्यम से 2-3 दिन पहले उपलब्ध कराया जाएगा।</p>

    <p>यदि आपके कोई और प्रश्न हैं या सहायता की आवश्यकता है, तो कृपया बेझिझक हमसे संपर्क करें</p>
    <p><strong>कंपनी व्यावसायिक गतिविधियों में किसी भी रिश्वतखोरी, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहिष्णुता रखती है।</strong></p>
    <p>"धन्यवाद,<br>
    IIEST Federation</p>
    <br>
    टीपी नाम - IIEST फेडरेशन<br>
    टीपी नंबर - TPINT133<br>
    संपर्क नंबर- 9910729809<br>
    लैंडलाइन  - 011-43511788, 011-4681145<br>
    संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>`;

  } else if (clientData.product == 'foscos') {

    subject = `IIEST Federation - Information Verified Successfuly`;
    content = `<p>Dear ${clientData.operatorName},</p>
    <p>Welcome to the IIEST Federation,<br>
    Scheme implementing partner of Govt. Of India.</p>
    <p>Thanks for registering for the FSSAI LICENSE(FoSCoS) program by FSSAI Govt Of India.<br>
    The information you have provided has been successfully verified. We appreciate your cooperation and timely response during the verification process.</p>
    <p>Kindly review the details you have provided below:</p>
    FBO Name -- ${clientData.fboName}<br>
    Operator Name -- ${clientData.operatorName}<br>
    Owner Name -- ${clientData.ownerName}<br>
    Owner Contact No -- ${clientData.operatorContactNo}<br>
    Address -- ${clientData.address}<br>
    Pincode -- ${clientData.pincode}<br>
    Tehsil -- ${clientData.tehsil}<br>
    Village -- ${clientData.village}<br>

    <p>License Related Information</p>
    License Category -- ${clientData.licenseCategory}<br>
    License Duration -- ${clientData.licenseDuration}<br>
    Kind of Business -- ${clientData.kindOfBusiness}<br>
    Food Category -- ${clientData.foodCategory}<br>

    <p>If you have any further questions or need assistance, please feel free to reach out to us</p>
    <p><strong>The company has zero tolerance towards any bribery, corruption & fraud in business activities.</strong></p>
    <p>Regards,<br>
    IIEST Federation</p>
    <br>
    TP Name - IIEST Federation<br>
    TP No - TPINT133<br>
    Contact no – 9910729809<br>
    Landline - 011-43511788, 011-4681145<br>
    Contact time 10 :00 a.m to 7:00 p.m<br>
    <br><br>
    <hr>
    <br>
    <p>प्रिय ${clientData.recipientName},</p>
    <p>IIEST फेडरेशन में आपका स्वागत है,<br>
    भारत सरकार की योजना कार्यान्वयन भागीदार।</p>
    <p>FSSAI भारत सरकार द्वारा FSSAI लाइसेंस (FOSCOS) कार्यक्रम के लिए पंजीकरण करने के लिए धन्यवाद।<br>
    आपके द्वारा प्रदान की गई जानकारी सफलतापूर्वक सत्यापित कर दी गई है। हम सत्यापन प्रक्रिया के दौरान आपके सहयोग और समय पर प्रतिक्रिया की सराहना करते हैं।</p>
    <p>कृपया नीचे दिए गए विवरण की समीक्षा करें:</p>
    FBO का नाम -- ${clientData.fboName}<br>
    ऑपरेटर का नाम -- ${clientData.operatorName}<br>
    मालिक का नाम -- ${clientData.ownerName}<br>
    मालिक का संपर्क नंबर -- ${clientData.operatorContactNo}<br>
    पता -- ${clientData.address}<br>
    पिन कोड -- ${clientData.pincode}<br>
    तहसील -- ${clientData.tehsil}<br>
    गाँव -- ${clientData.village}<br>

    <p>लाइसेंस संबंधी जानकारी</p>
    लाइसेंस श्रेणी -- ${clientData.licenseCategory}<br>
    लाइसेंस अवधि -- ${clientData.licenseDuration}<br>
    व्यवसाय का प्रकार -- ${clientData.kindOfBusiness}<br>
    खाद्य श्रेणी -- ${clientData.foodCategory}<br>

    <p>यदि आपके कोई और प्रश्न हैं या सहायता की आवश्यकता है, तो कृपया बेझिझक हमसे संपर्क करें</p>
    <p><strong>कंपनी व्यावसायिक गतिविधियों में किसी भी रिश्वतखोरी, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहिष्णुता रखती है।</strong></p>
    <p>"धन्यवाद,<br>
    IIEST Federation</p>
    <br>
    टीपी नाम - IIEST फेडरेशन<br>
    टीपी नंबर - TPINT133<br>
    संपर्क नंबर- 9910729809<br>
    लैंडलाइन  - 011-43511788, 011-4681145<br>
    संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>`;

  } else if (clientData.product == 'training_date_allotment') {

    subject = `IIEST Federation - Fostac Training Venue and Date`;
    content = `<p>Dear Customer,</p>
    <p>Welcome to the IIEST Federation,<br>
    Scheme implementing partner of Govt. Of India.</p>
    <p>We are pleased to inform you that your FOSTAC training session has been scheduled for ${clientData.trainingDate}, at the ${clientData.venue} venue. The training will commence promptly as per the scheduled time, and we kindly request your punctual attendance.</p>
    <br>
    Training Date -- ${clientData.trainingDate}<br>
    Venue -- ${clientData.venue}
    <br>
    <p>Should you have any questions or require further information, please do not hesitate to contact us.</p>
    <p>Regards,<br>
    IIEST Federation</p>
    <br>
    TP Name - IIEST Federation<br>
    TP No - TPINT133<br>
    Contact no – 9910729809<br>
    Landline - 011-43511788, 011-4681145<br>
    Contact time 10 :00 a.m to 7:00 p.m<br>
    <br><br>
    <hr>
    <br>
    <p>प्रिय ग्राहक,</p>
    <p>IIEST फेडरेशन में आपका स्वागत है,<br>
    भारत सरकार की योजना कार्यान्वयन भागीदार।</p>
    <p>हमें आपको सूचित करते हुए खुशी हो रही है कि आपका फोस्टैक प्रशिक्षण सत्र ${clientData.trainingDate} को ${clientData.venue} स्थल पर निर्धारित किया गया है। प्रशिक्षण निर्धारित समय के अनुसार तुरंत शुरू होगा, और हम आपसे समय पर उपस्थिति का अनुरोध करते हैं।</p>
    <br>
    Training Date -- ${clientData.trainingDate}<br>
    Venue -- ${clientData.venue}
    <br>
    <p>यदि आपके कोई और प्रश्न हैं या सहायता की आवश्यकता है, तो कृपया बेझिझक हमसे संपर्क करें</p>
    <p><strong>कंपनी व्यावसायिक गतिविधियों में किसी भी रिश्वतखोरी, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहिष्णुता रखती है।</strong></p>
    <p>"धन्यवाद,<br>
    IIEST Federation</p>
    <br>
    टीपी नाम - IIEST फेडरेशन<br>
    टीपी नंबर - TPINT133<br>
    संपर्क नंबर- 9910729809<br>
    लैंडलाइन  - 011-43511788, 011-4681145<br>
    संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>`;

  }
  else if (clientData.product == 'fostac_enrollment') {

    subject = `IIEST Federation - Fostac Training Venue and Date`;
    content = `<p>Dear ${clientData.recipientName},</p>
    <p>Welcome to the IIEST Federation,<br>
    Scheme implementing partner of Govt. Of India.</p>
    <p>We are pleased to inform you that your enrollment number for FOSTAC training session that been scheduled for ${clientData.fostacTrainingDate} is generated and attached with this mail,The training will commence promptly as per the scheduled time, and we kindly request your punctual attendance.</p>
    <br>
    Training Date -- ${clientData.fostacTrainingDate}<br>
    EnrollmentNumber -- ${clientData.enrollmentNumber}<br>
    Venue -- ${clientData.venue}
    <br>
    <p>Should you have any questions or require further information, please do not hesitate to contact us.</p>
    <p>Regards,<br>
    IIEST Federation</p>
    <br>
    TP Name - IIEST Federation<br>
    TP No - TPINT133<br>
    Contact no – 9910729809<br>
    Landline - 011-43511788, 011-4681145<br>
    Contact time 10 :00 a.m to 7:00 p.m<br>
    <br><br>
    <hr>
    <br>
    <p>प्रिय ${clientData.recipientName},</p>
    <p>IIEST फेडरेशन में आपका स्वागत है,<br>
    भारत सरकार की योजना कार्यान्वयन भागीदार।</p>
    <p>
    सूचित किया जाता है कि आपका FOSTAC प्रशिक्षण सत्र के लिए पंजीकरण संख्या ${clientData.fostacTrainingDate} के अनुसार निर्मित किया गया है और इस मेल के साथ संलग्न किया गया है। प्रशिक्षण सत्र समय सारणी के अनुसार बिना किसी देरी के शीघ्र होगा, और हम आपके समय पर उपस्थिति का अनुरोध करते हैं।</p>
    <br>
    Training Date -- ${clientData.fostacTrainingDate}<br>
    EnrollmentNumber -- ${clientData.enrollmentNumber}<br>
    Venue -- ${clientData.venue}
    <br>
    <p>यदि आपके कोई और प्रश्न हैं या सहायता की आवश्यकता है, तो कृपया बेझिझक हमसे संपर्क करें</p>
    <p><strong>कंपनी व्यावसायिक गतिविधियों में किसी भी रिश्वतखोरी, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहिष्णुता रखती है।</strong></p>
    <p>"धन्यवाद,<br>
    IIEST Federation</p>
    <br>
    टीपी नाम - IIEST फेडरेशन<br>
    टीपी नंबर - TPINT133<br>
    संपर्क नंबर- 9910729809<br>
    लैंडलाइन  - 011-43511788, 011-4681145br>
    संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>`;

  }
  else if (clientData.product == 'fostac_attendance') {

    subject = `IIEST Federation - Fostac Training Result`;
    content = `<p>Dear ${clientData.recipientName},</p>
    <p>Welcome to the IIEST Federation,<br>
    Scheme implementing partner of Govt. Of India.</p>
    <p>We are pleased to inform you that the results of your FOSTAC training, conducted on ${clientData.fostacTrainingDate} at ${clientData.venue}, have been received.</p>
    <br>
    Attendance Status -- ${clientData.attendance_status}<br>
    Marks -- ${clientData.marks} <br>
    Your Certificate will we sent in few days(If Passed)
    <br>
    <p>If you have any questions or require further information, please do not hesitate to contact us.</p>
    <p>Regards,<br>
    IIEST Federation</p>
    <br>
    TP Name - IIEST Federation<br>
    TP No - TPINT133<br>
    Contact no – 9910729809<br>
    Landline - 011-43511788, 011-4681145<br>
    Contact time 10 :00 a.m to 7:00 p.m<br>
    <br><br>
    <hr>
    <br>
    <p>प्रिय ${clientData.recipientName},</p>
    <p>IIEST फेडरेशन में आपका स्वागत है,<br>
    भारत सरकार की योजना कार्यान्वयन भागीदार।</p>
    <p>हमें खुशी है कि आपको सूचित किया जा रहा है कि आपकी FOSTAC प्रशिक्षण का परिणाम, ${clientData.venue} पर ${clientData.fostacTrainingDate} को किया गया था, प्राप्त हो गया है।</p>
    Attendance Status -- ${clientData.attendance_status}<br>
    Marks -- ${clientData.marks} <br>
    आपका प्रमाणपत्र कुछ दिनों में भेजा जाएगा (यदि पास हुआ)।
    <br>
    <p>यदि आपके कोई और प्रश्न हैं या सहायता की आवश्यकता है, तो कृपया बेझिझक हमसे संपर्क करें</p>
    <p><strong>कंपनी व्यावसायिक गतिविधियों में किसी भी रिश्वतखोरी, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहिष्णुता रखती है।</strong></p>
    <p>"धन्यवाद,<br>
    IIEST Federation</p>
    <br>
    टीपी नाम - IIEST फेडरेशन<br>
    टीपी नंबर - TPINT133<br>
    संपर्क नंबर- 9910729809<br>
    लैंडलाइन  - 011-43511788, 011-4681145<br>
    संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>`;

  }
  else if (clientData.product == 'hra') {

    subject = `IIEST Federation - Information Verified Successfuly`;
    content = `<p>Dear ${clientData.managerName},</p>
    <p>Welcome to the IIEST Federation,<br>
    Scheme implementing partner of Govt. Of India.</p>
    <p>Thanks for registering for the Hygiene Rating program by FSSAI Govt Of India.<br>
    The information you have provided has been successfully verified. We appreciate your cooperation and timely response during the verification process.</p>
    <p>Kindly review the details you have provided below:</p>
    Manager Name -- ${clientData.managerName}<br>
    Manager's Contact No -- ${clientData.managerContactNo}<br>
    FBO Name -- ${clientData.fboName}<br>
    Owner Name -- ${clientData.ownerName}<br>
    Address -- ${clientData.address}<br>
    No of Food Handler -- ${clientData.foodHandlerNo}<br>
    Kind Of Business -- ${clientData.kindOfBusiness}<br>

    <p>You will receive a call to verify the details and supporting documents.</p>
    <p>Your inspection for Hygiene Rating Program Will be Scheduled on ${clientData.auditDate}, get Ready With the Undermentioned Documents<br>
    1.FSSAI License<br>
    2.FOSTAC Certificate<br>
    3.Water test Report<br>
    4.Medical Certificate of food handlers<br>
    <br>
    Also maintain a proper record of documents attached in mail on a daily basis</p>

    <p>If you have any further questions or need assistance, please feel free to reach out to us</p>
    <p><strong>The company has zero tolerance towards any bribery, corruption & fraud in business activities.</strong></p>
    <p>Regards,<br>
    IIEST Federation</p>
    <br>
    TP Name - IIEST Federation<br>
    TP No - TPINT133<br>
    Contact no – 9910729809<br>
    Landline - 011-43511788, 011-4681145<br>
    Contact time 10 :00 a.m to 7:00 p.m<br>
    <br><br>
    <hr>
    <br>
    <p>प्रिय ${clientData.managerName},</p>
    <p>IIEST फेडरेशन में आपका स्वागत है,<br>
    भारत सरकार की योजना कार्यान्वयन भागीदार।</p>
    <p>भारत सरकार के FSSAI द्वारा आयोजित HRA कार्यक्रम के लिए पंजीकरण के लिए धन्यवाद।<br>
    आपके द्वारा प्रदान की गई जानकारी सफलतापूर्वक सत्यापित कर दी गई है। हम सत्यापन प्रक्रिया के दौरान आपके सहयोग और समय पर प्रतिक्रिया की सराहना करते हैं।</p>
    <p>कृपया नीचे दिए गए विवरण की समीक्षा करें:</p>
    प्रबंधक का नाम -- ${clientData.managerName}<br>
    प्रबंधक का संपर्क नंबर -- ${clientData.managerContactNo}<br>
    FBO का नाम -- ${clientData.fboName}<br>
    Owner Name -- ${clientData.ownerName}<br>
    मालिक का नाम -- ${clientData.address}<br>
    खाद्य संचालक की संख्या -- ${clientData.foodHandlerNo}<br>
    व्यवसाय का प्रकार -- ${clientData.kindOfBusiness}<br>

    <p>आपको विवरण और सहायक दस्तावेजों को सत्यापित करने के लिए एक कॉल प्राप्त होगी।</p>
    <p>स्वच्छता रेटिंग कार्यक्रम के लिए आपका निरीक्षण ${clientData.auditDate} को निर्धारित किया जाएगा, निम्नलिखित दस्तावेजों के साथ तैयार रहें<br>
    1.FSSAI लाइसेंस<br>
    2.FOSTAC प्रमाणपत्र<br>
    3.जल परीक्षण रिपोर्ट<br>
    4.खाद्य संचालकों का चिकित्सा प्रमाण पत्र<br>
    <br>
    दैनिक आधार पर मेल में संलग्न दस्तावेजों का उचित रिकॉर्ड भी रखें</p>

    <p>यदि आपके कोई और प्रश्न हैं या सहायता की आवश्यकता है, तो कृपया बेझिझक हमसे संपर्क करें</p>
    <p><strong>कंपनी व्यावसायिक गतिविधियों में किसी भी रिश्वतखोरी, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहिष्णुता रखती है।</strong></p>
    <p>"धन्यवाद,<br>
    IIEST Federation</p>
    <br>
    टीपी नाम - IIEST फेडरेशन<br>
    टीपी नंबर - TPINT133<br>
    संपर्क नंबर- 9910729809<br>
    लैंडलाइन  - 011-43511788, 011-4681145<br>
    संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>`;

  }

  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: mailData.email,
      pass: mailData.pass
    }
  });
  const mailOptions = {
    from: mailData.email,
    to: clientData.recipientEmail,
    subject: subject,
    html: content
  }
  transport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.error(error)
    } else {
    }
  })
}

module.exports = { sendDocumentMail, sendVerificationMail };