const nodemailer = require('nodemailer');
const mailData = JSON.parse(process.env.NODE_MAILER);
const CONTACT_NUMBERS = JSON.parse(process.env.CONTACT_NUMBERS);
const LANDLINES = JSON.parse(process.env.LANDLINES);
const CB_ADDRESS = JSON.parse(process.env.CB_ADDRESS);
const CB_BRAND_NAME = JSON.parse(process.env.CB_BRAND_NAME);
const VIEW_URL = JSON.parse(process.env.FRONT_END).VIEW_URL

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
    subject: `${CB_BRAND_NAME.english} - ${clientData.ticketType}`,
    html: `
    <p>Welcome to the ${CB_BRAND_NAME.english},<br>
    ${CB_BRAND_NAME.english} Portal empowers businesses to meet compliance and legal requirements easily.</p>

    <p>Dear ${clientData.recipientName},</p>
    <p>We are pleased to inform you that your ${clientData.ticketType} has been generated and is attached to this email.</p>
    <br>
    <p>If you have any questions or require further information, please do not hesitate to contact us.</p>
    <p>Regards, ${CB_BRAND_NAME.english}<br>
    </p>
    <br>
    Brand Name - ${CB_BRAND_NAME.english},<br/>
            Address - ${CB_ADDRESS.english}<br/>
            Website - <a href='https://connectonline.world'>connectonline.world</a><br> 
            Email = customerrelations@iiest.org<br>
            Contact no - ${CONTACT_NUMBERS.connect_bharat}<br>
            Landline - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
            Contact time 10 :00 a.m to 7:00 p.m<br>
            <br>This mail is system generated, please do not replay on this mail. 
    <br><br>
    <hr>
    <br>
   
    <p>${CB_BRAND_NAME.hindi} में आपका स्वागत है,<br>
    ${CB_BRAND_NAME.hindi} पोर्टल व्यवसायों को आसानी से अनुपालन और कानूनी आवश्यकताओं को पूरा करने में सक्षम बनाता है।</p>
    <p>प्रिय ${clientData.recipientName},</p>
    <p>हमें आपको सूचित करते हुए खुशी हो रही है कि आपका ${clientData.ticketType} को पूरा हो चुका है और इस मेल के साथ संलग्न किया गया है।</p>
    <br>
    <p>यदि आपके कोई और प्रश्न हैं या सहायता की आवश्यकता है, तो कृपया बेझिझक हमसे संपर्क करें</p>
    <p><strong>कंपनी व्यावसायिक गतिविधियों में किसी भी रिश्वतखोरी, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहिष्णुता रखती है।</strong></p>
    <p>"धन्यवाद,<br>
    ${CB_BRAND_NAME.hindi}</p>
    <br>
    ब्रांड नाम = ${CB_BRAND_NAME.hindi}<br>
    पता - ${CB_ADDRESS.hindi}<br/>
    वेबसाइट - <a href='https://connectonline.world'>connectonline.world</a><br>
     ईमेल - customerrelations@iiest.org</br>
    संपर्क नंबर- ${CONTACT_NUMBERS.connect_bharat}<br>
    लैंडलाइन - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
    संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>
    <br>यह ईमेल प्रणाली द्वारा उत्पन्न किया गया है, कृपया इस ईमेल का उत्तर न दें।`,
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

    //all name required docs
    const requireddocs = ['Fostac Certificate', 'Foscos License', 'HRA', 'Medical Certificate', 'Water Test Report']

  if (clientData.product == 'fostac_recipient') {

    let todayDate = new Date();
    let nextMonth = new Date(todayDate);
    nextMonth.setMonth(todayDate.getMonth() + 1);
    let formattedNextMonth = nextMonth.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

    subject = `${CB_BRAND_NAME.english} - Information Verified Successfuly`;
    content = ` <p>Welcome to the ${CB_BRAND_NAME.english},<br>
    ${CB_BRAND_NAME.english} Portal empowers businesses to meet compliance and legal requirements easily.</p>
    <p>Dear ${clientData.recipientName},</p>
    <p>Thanks for registering for the FoSTaC Training program by FSSAI Govt Of India.<br>
    The information you have provided has been successfully verified. We appreciate your cooperation and timely response during the verification process.</p>
    <p>Kindly review the details you have provided below:</p>
    Trainee Name -- ${clientData.recipientName}<br>
    Trainee father Name -- ${clientData.fatherName}<br>
    Trainee Contact No -- ${clientData.recipientContactNo}<br>
    Trainee DOB -- ${clientData.dob}<br>
    Trainee Aadhar No -- ${clientData.aadharNo}<br>
    ${clientData.pancard ? ('Trainee Pancard No -- ' + clientData.pancard + '<br>') : ''}

    <p>The tentative training date of your training is ${formattedNextMonth}. The final date and training venue & timings details will be provided to you as per availability of the ${CB_BRAND_NAME.english}-FSSAI training schedule 2-3 days in advance through messages and calls.</p>

    <p>If you have any further questions or need assistance, please feel free to reach out to us</p>
    <p><strong>The company has zero tolerance towards any bribery, corruption & fraud in business activities.</strong></p>
    <p>Regards,<br>
    ${CB_BRAND_NAME.english}</p>
    <br>
    Brand Name - ${CB_BRAND_NAME.english},<br/>
    Address - ${CB_ADDRESS.english}<br/>
    Website - <a href='https://connectonline.world'>connectonline.world</a><br> 
    Email = customerrelations@iiest.org<br>
    Contact no - ${CONTACT_NUMBERS.connect_bharat}<br>
    Landline - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
    Contact time 10 :00 a.m to 7:00 p.m<br>
    <br>This mail is system generated, please do not replay on this mail. 
    <br><br>
    <hr>
    <br>
    <p>${CB_BRAND_NAME.hindi} में आपका स्वागत है,<br>
    ${CB_BRAND_NAME.hindi} पोर्टल व्यवसायों को आसानी से अनुपालन और कानूनी आवश्यकताओं को पूरा करने में सक्षम बनाता है।</p>
    <p>प्रिय ${clientData.recipientName},</p>
    <p>भारत सरकार के FSSAI द्वारा आयोजित FoSTaC प्रशिक्षण कार्यक्रम के लिए पंजीकरण के लिए धन्यवाद।<br>
    आपके द्वारा प्रदान की गई जानकारी सफलतापूर्वक सत्यापित कर दी गई है। हम सत्यापन प्रक्रिया के दौरान आपके सहयोग और समय पर प्रतिक्रिया की सराहना करते हैं।</p>
    <p>कृपया नीचे दिए गए विवरण की समीक्षा करें:</p>
    ट्रेनी का नाम -- ${clientData.recipientName}<br>
    ट्रेनी के पिता का नाम -- ${clientData.fatherName}<br>
    ट्रेनी का संपर्क नंबर -- ${clientData.recipientContactNo}<br>
    ट्रेनी का जन्मतिथि -- ${clientData.dob}<br>
    ट्रेनी का आधार नं -- ${clientData.aadharNo}<br>
    ${clientData.pancard ? ('ट्रेनी का पैनकार्ड नं -- ' + clientData.pancard + '<br>') : ''}

    <p>आपके प्रशिक्षण की तारीख की संभावित तिथि ${formattedNextMonth} है। अंतिम तारीख और प्रशिक्षण स्थल और समय का विवरण आपको ${CB_BRAND_NAME.english}-FSSAI प्रशिक्षण कार्यक्रम की उपलब्धता के आधार पर मैसेज और कॉल के माध्यम से 2-3 दिन पहले उपलब्ध कराया जाएगा।</p>

    <p>यदि आपके कोई और प्रश्न हैं या सहायता की आवश्यकता है, तो कृपया बेझिझक हमसे संपर्क करें</p>
    <p><strong>कंपनी व्यावसायिक गतिविधियों में किसी भी रिश्वतखोरी, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहिष्णुता रखती है।</strong></p>
    <p>"धन्यवाद,<br>
    ${CB_BRAND_NAME.hindi}</p>
    <br>
    ब्रांड नाम = ${CB_BRAND_NAME.hindi}<br>
    पता - ${CB_ADDRESS.hindi}<br/>
    वेबसाइट - <a href='https://connectonline.world'>connectonline.world</a><br>
     ईमेल - customerrelations@iiest.org</br>
    संपर्क नंबर- ${CONTACT_NUMBERS.connect_bharat}<br>
    लैंडलाइन - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
    संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>
    <br>यह ईमेल प्रणाली द्वारा उत्पन्न किया गया है, कृपया इस ईमेल का उत्तर न दें।`;

  } if (clientData.product == 'fostac') {

    subject = `${CB_BRAND_NAME.english} - Fostac Information Verified Successfuly`;
    content = ` <p>Welcome to the ${CB_BRAND_NAME.english},<br>
    ${CB_BRAND_NAME.english} Portal empowers businesses to meet compliance and legal requirements easily.</p>
    <p>Dear ${clientData.managerName},</p>
    <p>Thanks for registering for the FoSTaC Training program by FSSAI Govt Of India.<br>
    The information you have provided has been successfully verified. We appreciate your cooperation and timely response during the verification process.</p>
    <p>Kindly review the details you have provided below:</p>
    Training Type -- ${clientData.service_name}<br>
    No. Of Recps -- ${clientData.recipient_no}<br><br>

    Data of Recipients:- <br><br>
    ${clientData.recpDetails.map(recp => {
      return(
      "Trainee Name --" + recp.name + "<br>"
      + "Trainee father Name --" + recp.fatherName + "<br>"
      + "Trainee Contact No --" + recp.phoneNo + "<br>"
      +  "Trainee DOB --" + new Date(recp.dob.toString()).getFullYear().toString() + "-" + (new Date(recp.dob.toString()).getMonth() + 1).toString() + "-" + new Date(recp.dob.toString()).getDate().toString() + "<br>"
      + "Trainee Aadhar No --" + recp.aadharNo + "<br>")
    }).join('<br><br>')}
    <br>
    <p>If you have any further questions or need assistance, please feel free to reach out to us</p>
    <p><strong>The company has zero tolerance towards any bribery, corruption & fraud in business activities.</strong></p>
    <p>Technical Officer: ${clientData.technicalOfficer}</p>
    <p>Regards,<br>
    ${CB_BRAND_NAME.english}</p>
    <br>
    Brand Name - ${CB_BRAND_NAME.english},<br/>
    Address - ${CB_ADDRESS.english}<br/>
    Website - <a href='https://connectonline.world'>connectonline.world</a><br> 
    Email = customerrelations@iiest.org<br>
    Contact no - ${CONTACT_NUMBERS.connect_bharat}<br>
    Landline - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
    Contact time 10 :00 a.m to 7:00 p.m<br>
    <br>This mail is system generated, please do not replay on this mail. 
    <br><br>
    <hr>
    <br>
    <p>${CB_BRAND_NAME.hindi} में आपका स्वागत है,<br>
    ${CB_BRAND_NAME.hindi} पोर्टल व्यवसायों को आसानी से अनुपालन और कानूनी आवश्यकताओं को पूरा करने में सक्षम बनाता है।</p>
    <p>प्रिय ${clientData.managerName},</p>
    <p>भारत सरकार के FSSAI द्वारा आयोजित FoSTaC प्रशिक्षण कार्यक्रम के लिए पंजीकरण के लिए धन्यवाद।<br>
    आपके द्वारा प्रदान की गई जानकारी सफलतापूर्वक सत्यापित कर दी गई है। हम सत्यापन प्रक्रिया के दौरान आपके सहयोग और समय पर प्रतिक्रिया की सराहना करते हैं।</p>
    <p>कृपया नीचे दिए गए विवरण की समीक्षा करें:</p>

प्रशिक्षण प्रकार -- ${clientData.service_name}<br>
प्राप्तकर्ताओं की संख्या -- ${clientData.recipient_no}<br>
    <br>
    प्राप्तकर्ताओं का डेटा:- <br><br>
    ${clientData.recpDetails.forEach(recp => {

    `ट्रेनी का नाम -- ${recp.recipientName}<br>
    ट्रेनी के पिता का नाम -- ${recp.fatherName}<br>
    ट्रेनी का संपर्क नंबर -- ${recp.phoneNo}<br>
    ट्रेनी का जन्मतिथि -- ${recp.dob}<br>
    ट्रेनी का आधार नं -- ${recp.aadharNo}<br>`
    })}

    <p>यदि आपके कोई और प्रश्न हैं या सहायता की आवश्यकता है, तो कृपया बेझिझक हमसे संपर्क करें</p>
    <p><strong>कंपनी व्यावसायिक गतिविधियों में किसी भी रिश्वतखोरी, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहिष्णुता रखती है।</strong></p>
    <p>"धन्यवाद,</p>
    <p>तकनीकी अधिकारी: ${clientData.technicalOfficer}</p>
    <p>${CB_BRAND_NAME.hindi}</p>
    <br>
    ब्रांड नाम = ${CB_BRAND_NAME.hindi}<br>
    पता - ${CB_ADDRESS.hindi}<br/>
    वेबसाइट - <a href='https://connectonline.world'>connectonline.world</a><br>
     ईमेल - customerrelations@iiest.org</br>
    संपर्क नंबर- ${CONTACT_NUMBERS.connect_bharat}<br>
    लैंडलाइन - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
    संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>
    <br>यह ईमेल प्रणाली द्वारा उत्पन्न किया गया है, कृपया इस ईमेल का उत्तर न दें।`;

  } else if (clientData.product == 'foscos') {

    subject = `${CB_BRAND_NAME.english} - Foscos Information Verified Successfuly`;
    content = `<p>Welcome to the ${CB_BRAND_NAME.english},<br>
    ${CB_BRAND_NAME.english} Portal empowers businesses to meet compliance and legal requirements easily.</p>
    <p>Dear ${clientData.managerName},</p>
    <p>Thanks for registering for the FSSAI LICENSE(FoSCoS) program by FSSAI Govt Of India.<br>
    The information you have provided has been successfully verified. We appreciate your cooperation and timely response during the verification process.</p>
    <p>Kindly review the details you have provided below:</p>

    <p>License Related Information</p>
    License Category -- ${clientData.licenseCategory}<br>
    License Duration -- ${clientData.licenseDuration}<br>
    Kind of Business -- ${clientData.kindOfBusiness}<br>
    Food Category -- ${clientData.foodCategory}<br>

    <p>If you have any further questions or need assistance, please feel free to reach out to us</p>
    <p><strong>The company has zero tolerance towards any bribery, corruption & fraud in business activities.</strong></p>
    <p>Technical Officer: ${clientData.technicalOfficer}</p>
    <p>Regards,<br>
    ${CB_BRAND_NAME.english}</p>
    <br>
    Brand Name - ${CB_BRAND_NAME.english},<br/>
    Address - ${CB_ADDRESS.english}<br/>
    Website - <a href='https://connectonline.world'>connectonline.world</a><br> 
    Email = customerrelations@iiest.org<br>
    Contact no - ${CONTACT_NUMBERS.connect_bharat}<br>
    Landline - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
    Contact time 10 :00 a.m to 7:00 p.m<br>
    <br>This mail is system generated, please do not replay on this mail. 
    <br><br>
    <hr>
    <br>
    <p>${CB_BRAND_NAME.hindi} में आपका स्वागत है,<br>
    ${CB_BRAND_NAME.hindi} पोर्टल व्यवसायों को आसानी से अनुपालन और कानूनी आवश्यकताओं को पूरा करने में सक्षम बनाता है।</p>
    <p>प्रिय ${clientData.recipientName},</p>
    <p>FSSAI भारत सरकार द्वारा FSSAI लाइसेंस (FOSCOS) कार्यक्रम के लिए पंजीकरण करने के लिए धन्यवाद।<br>
    आपके द्वारा प्रदान की गई जानकारी सफलतापूर्वक सत्यापित कर दी गई है। हम सत्यापन प्रक्रिया के दौरान आपके सहयोग और समय पर प्रतिक्रिया की सराहना करते हैं।</p>
    <p>कृपया नीचे दिए गए विवरण की समीक्षा करें:</p>

    <p>लाइसेंस संबंधी जानकारी</p>
    लाइसेंस श्रेणी -- ${clientData.licenseCategory}<br>
    लाइसेंस अवधि -- ${clientData.licenseDuration}<br>
    व्यवसाय का प्रकार -- ${clientData.kindOfBusiness}<br>
    खाद्य श्रेणी -- ${clientData.foodCategory}<br>

    <p>यदि आपके कोई और प्रश्न हैं या सहायता की आवश्यकता है, तो कृपया बेझिझक हमसे संपर्क करें</p>
    <p><strong>कंपनी व्यावसायिक गतिविधियों में किसी भी रिश्वतखोरी, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहिष्णुता रखती है।</strong></p>
    <p>"धन्यवाद,</p>
     <p>तकनीकी अधिकारी: ${clientData.technicalOfficer}</p>
    <p>${CB_BRAND_NAME.hindi}</p>
    <br>
    ब्रांड नाम = ${CB_BRAND_NAME.hindi}<br>
    पता - ${CB_ADDRESS.hindi}<br/>'
    वेबसाइट - <a href='https://connectonline.world'>connectonline.world</a><br>
     ईमेल - customerrelations@iiest.org</br>
    संपर्क नंबर- ${CONTACT_NUMBERS.connect_bharat}<br>
    लैंडलाइन - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
    संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>
    <br>यह ईमेल प्रणाली द्वारा उत्पन्न किया गया है, कृपया इस ईमेल का उत्तर न दें।`;

  } else if (clientData.product == 'training_date_allotment') {

    subject = `${CB_BRAND_NAME.english} - Fostac Training Venue and Date`;
    content = `<p>Welcome to the ${CB_BRAND_NAME.english},<br>
    ${CB_BRAND_NAME.english} Portal empowers businesses to meet compliance and legal requirements easily.</p>
    <p>Dear Customer,</p>
    <p>We are pleased to inform you that your FOSTAC training session has been scheduled for ${clientData.trainingDate}, at the ${clientData.venue} venue. The training will commence promptly as per the scheduled time, and we kindly request your punctual attendance.</p>
    <br>
    Training Date -- ${clientData.trainingDate}<br>
    Venue -- ${clientData.venue}
    <br>
    <p>Should you have any questions or require further information, please do not hesitate to contact us.</p>
    <p>Regards,<br>
    ${CB_BRAND_NAME.english}</p>
    <br>
    Brand Name - ${CB_BRAND_NAME.english},<br/>
    Address - ${CB_ADDRESS.english}<br/>
    Website - <a href='https://connectonline.world'>connectonline.world</a><br> 
    Email = customerrelations@iiest.org<br>
    Contact no - ${CONTACT_NUMBERS.connect_bharat}<br>
    Landline - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
    Contact time 10 :00 a.m to 7:00 p.m<br>
    <br>This mail is system generated, please do not replay on this mail. 
    <br><br>
    <hr>
    <br>
    <p>${CB_BRAND_NAME.hindi} में आपका स्वागत है,<br>
    ${CB_BRAND_NAME.hindi} पोर्टल व्यवसायों को आसानी से अनुपालन और कानूनी आवश्यकताओं को पूरा करने में सक्षम बनाता है।</p>
    <p>प्रिय ग्राहक,</p>
    <p>हमें आपको सूचित करते हुए खुशी हो रही है कि आपका फोस्टैक प्रशिक्षण सत्र ${clientData.trainingDate} को ${clientData.venue} स्थल पर निर्धारित किया गया है। प्रशिक्षण निर्धारित समय के अनुसार तुरंत शुरू होगा, और हम आपसे समय पर उपस्थिति का अनुरोध करते हैं।</p>
    <br>
    Training Date -- ${clientData.trainingDate}<br>
    Venue -- ${clientData.venue}
    <br>
    <p>यदि आपके कोई और प्रश्न हैं या सहायता की आवश्यकता है, तो कृपया बेझिझक हमसे संपर्क करें</p>
    <p><strong>कंपनी व्यावसायिक गतिविधियों में किसी भी रिश्वतखोरी, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहिष्णुता रखती है।</strong></p>
    <p>"धन्यवाद,</p>
    <p>तकनीकी अधिकारी: ${clientData.technicalOfficer}</p>
    <p>${CB_BRAND_NAME.hindi}</p>
    <br>
    ब्रांड नाम = ${CB_BRAND_NAME.hindi}<br>
    पता - ${CB_ADDRESS.hindi}<br/>
    वेबसाइट - <a href='https://connectonline.world'>connectonline.world</a><br>
     ईमेल - customerrelations@iiest.org</br>
    संपर्क नंबर- ${CONTACT_NUMBERS.connect_bharat}<br>
    लैंडलाइन - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
    संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>
    <br>यह ईमेल प्रणाली द्वारा उत्पन्न किया गया है, कृपया इस ईमेल का उत्तर न दें।`;

  }
  else if (clientData.product == 'fostac_enrollment') {

    subject = `${CB_BRAND_NAME.english} - Fostac Training Venue and Date`;
    content = `<p>Welcome to the ${CB_BRAND_NAME.english},<br>
    ${CB_BRAND_NAME.english} Portal empowers businesses to meet compliance and legal requirements easily.</p>
    <p>Dear ${clientData.recipientName},</p>
    <p>We are pleased to inform you that your enrollment number for FOSTAC training session that been scheduled for ${clientData.fostacTrainingDate} is generated and attached with this mail,The training will commence promptly as per the scheduled time, and we kindly request your punctual attendance.</p>
    <br>
    Training Date -- ${clientData.fostacTrainingDate}<br>
    EnrollmentNumber -- ${clientData.enrollmentNumber}<br>
    Venue -- ${clientData.venue}
    <br>
    <p>Should you have any questions or require further information, please do not hesitate to contact us.</p>
    <p>Regards,<br>
    ${CB_BRAND_NAME.english}</p>
    <br>
    Brand Name - ${CB_BRAND_NAME.english},<br/>
    Address - ${CB_ADDRESS.english}<br/>
    Website - <a href='https://connectonline.world'>connectonline.world</a><br> 
    Email = customerrelations@iiest.org<br>
    Contact no - ${CONTACT_NUMBERS.connect_bharat}<br>
    Landline - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
    Contact time 10 :00 a.m to 7:00 p.m<br>
    <br>This mail is system generated, please do not replay on this mail. 
    <br><br>
    <hr>
    <br>
    <p>${CB_BRAND_NAME.hindi} में आपका स्वागत है,<br>
    ${CB_BRAND_NAME.hindi} पोर्टल व्यवसायों को आसानी से अनुपालन और कानूनी आवश्यकताओं को पूरा करने में सक्षम बनाता है।</p>
    <p>प्रिय ${clientData.recipientName},</p>
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
    ${CB_BRAND_NAME.hindi}</p>
    <br>
    ब्रांड नाम = ${CB_BRAND_NAME.hindi}<br>
    पता - ${CB_ADDRESS.hindi}<br/>
    वेबसाइट - <a href='https://connectonline.world'>connectonline.world</a><br>
     ईमेल - customerrelations@iiest.org</br>
    संपर्क नंबर- ${CONTACT_NUMBERS.connect_bharat}<br>
    लैंडलाइन - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
    संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>
    <br>यह ईमेल प्रणाली द्वारा उत्पन्न किया गया है, कृपया इस ईमेल का उत्तर न दें।`;

  }
  else if (clientData.product == 'fostac_attendance') {

    subject = `${CB_BRAND_NAME.english} - Fostac Training Result`;
    content = `<p>Welcome to the ${CB_BRAND_NAME.english},<br>
    ${CB_BRAND_NAME.english} Portal empowers businesses to meet compliance and legal requirements easily.</p>
    <p>Dear ${clientData.recipientName},</p>
    <p>We are pleased to inform you that the results of your FOSTAC training, conducted on ${clientData.fostacTrainingDate} at ${clientData.venue}, have been received.</p>
    <br>
    Attendance Status -- ${clientData.attendance_status}<br>
    Marks -- ${clientData.marks} <br>
    Your Certificate will we sent in few days(If Passed)
    <br>
    <p>If you have any questions or require further information, please do not hesitate to contact us.</p>
    <p>Regards,<br>
    ${CB_BRAND_NAME.english}</p>
    <br>
    Brand Name - ${CB_BRAND_NAME.english},<br/>
    Address - ${CB_ADDRESS.english}<br/>
    Website - <a href='https://connectonline.world'>connectonline.world</a><br> 
    Email = customerrelations@iiest.org<br>
    Contact no - ${CONTACT_NUMBERS.connect_bharat}<br>
    Landline - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
    Contact time 10 :00 a.m to 7:00 p.m<br>
    <br>This mail is system generated, please do not replay on this mail. 
    <br><br>
    <hr>
    <br>
    <p>${CB_BRAND_NAME.hindi} में आपका स्वागत है,<br>
    ${CB_BRAND_NAME.hindi} पोर्टल व्यवसायों को आसानी से अनुपालन और कानूनी आवश्यकताओं को पूरा करने में सक्षम बनाता है।</p>
    <p>प्रिय ${clientData.recipientName},</p>
    <p>हमें खुशी है कि आपको सूचित किया जा रहा है कि आपकी FOSTAC प्रशिक्षण का परिणाम, ${clientData.venue} पर ${clientData.fostacTrainingDate} को किया गया था, प्राप्त हो गया है।</p>
    Attendance Status -- ${clientData.attendance_status}<br>
    Marks -- ${clientData.marks} <br>
    आपका प्रमाणपत्र कुछ दिनों में भेजा जाएगा (यदि पास हुआ)।
    <br>
    <p>यदि आपके कोई और प्रश्न हैं या सहायता की आवश्यकता है, तो कृपया बेझिझक हमसे संपर्क करें</p>
    <p><strong>कंपनी व्यावसायिक गतिविधियों में किसी भी रिश्वतखोरी, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहिष्णुता रखती है।</strong></p>
    <p>"धन्यवाद,<br>
    ${CB_BRAND_NAME.hindi}</p>
    <br>
    ब्रांड नाम = ${CB_BRAND_NAME.hindi}<br>
    पता - ${CB_ADDRESS.hindi}<br/>
    वेबसाइट - <a href='https://connectonline.world'>connectonline.world</a><br>
     ईमेल - customerrelations@iiest.org</br>
    संपर्क नंबर- ${CONTACT_NUMBERS.connect_bharat}<br>
    लैंडलाइन - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
    संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>
    <br>यह ईमेल प्रणाली द्वारा उत्पन्न किया गया है, कृपया इस ईमेल का उत्तर न दें।`;

  }
  else if (clientData.product == 'hra') {

    subject = `${CB_BRAND_NAME.english} - HRA Information Verified Successfuly`;
    content = `<p>Welcome to the ${CB_BRAND_NAME.english},<br>
    ${CB_BRAND_NAME.english} Portal empowers businesses to meet compliance and legal requirements easily.</p>
    <p>Dear ${clientData.managerName},</p>
    <p>Thanks for registering for the Hygiene Rating program by FSSAI Govt Of India.<br>
    The information you have provided has been successfully verified. We appreciate your cooperation and timely response during the verification process.</p>
    <p>Kindly review the details you have provided below:</p>
    No of Food Handler -- ${clientData.foodHandlerNo}<br>
    Kind Of Business -- ${clientData.kindOfBusiness}<br>

    <p>If you have any further questions or need assistance, please feel free to reach out to us</p>
    <p><strong>The company has zero tolerance towards any bribery, corruption & fraud in business activities.</strong></p>
    <p>Technical Officer: ${clientData.technicalOfficer}</p>
    <p>Regards,<br>
    ${CB_BRAND_NAME.english}</p>
    <br>
    Brand Name - ${CB_BRAND_NAME.english},<br/>
    Address - ${CB_ADDRESS.english}<br/>
    Website - <a href='https://connectonline.world'>connectonline.world</a><br> 
    Email = customerrelations@iiest.org<br>
    Contact no - ${CONTACT_NUMBERS.connect_bharat}<br>
    Landline - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
    Contact time 10 :00 a.m to 7:00 p.m<br>
    <br>This mail is system generated, please do not replay on this mail. 
    <br><br>
    <hr>
    <br>
    <p>${CB_BRAND_NAME.hindi} में आपका स्वागत है,<br>
    ${CB_BRAND_NAME.hindi} पोर्टल व्यवसायों को आसानी से अनुपालन और कानूनी आवश्यकताओं को पूरा करने में सक्षम बनाता है।</p>
    <p>प्रिय ${clientData.managerName},</p>
    <p>भारत सरकार के FSSAI द्वारा आयोजित HRA कार्यक्रम के लिए पंजीकरण के लिए धन्यवाद।<br>
    आपके द्वारा प्रदान की गई जानकारी सफलतापूर्वक सत्यापित कर दी गई है। हम सत्यापन प्रक्रिया के दौरान आपके सहयोग और समय पर प्रतिक्रिया की सराहना करते हैं।</p>
    <p>कृपया नीचे दिए गए विवरण की समीक्षा करें:</p>
    खाद्य संचालक की संख्या -- ${clientData.foodHandlerNo}<br>
    व्यवसाय का प्रकार -- ${clientData.kindOfBusiness}<br>

    <p>यदि आपके कोई और प्रश्न हैं या सहायता की आवश्यकता है, तो कृपया बेझिझक हमसे संपर्क करें</p>
    <p><strong>कंपनी व्यावसायिक गतिविधियों में किसी भी रिश्वतखोरी, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहिष्णुता रखती है।</strong></p>
    <p>"धन्यवाद,</p>
     <p>तकनीकी अधिकारी: ${clientData.technicalOfficer}</p>
    <p>${CB_BRAND_NAME.hindi}</p>
    <br>
    ब्रांड नाम = ${CB_BRAND_NAME.hindi}<br>
    पता - ${CB_ADDRESS.hindi}<br/>
    वेबसाइट - <a href='https://connectonline.world'>connectonline.world</a><br>
     ईमेल - customerrelations@iiest.org</br>
    संपर्क नंबर- ${CONTACT_NUMBERS.connect_bharat}<br>
    लैंडलाइन - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
    संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>
    <br>यह ईमेल प्रणाली द्वारा उत्पन्न किया गया है, कृपया इस ईमेल का उत्तर न दें।`;

  } else if (clientData.product == 'doc') {

    subject = `${CB_BRAND_NAME.english} - Document Information Verified Successfuly`;
    content = `<p>Welcome to the ${CB_BRAND_NAME.english},<br>
    ${CB_BRAND_NAME.english} Portal empowers businesses to meet compliance and legal requirements easily.</p>
    <p>Dear ${clientData.managerName},</p>
    <p>Thanks for registering for the compliances of - FSSAI GOI.<br>
    The information you have provided has been successfully verified. We appreciate your cooperation and timely response during the verification process.</p>
    <p>The following list of documents have been declared by you for the completion of fssai compliences:-</p>
    ${clientData.checkedDocsName.join('<br>')}
    <p>The following list of pending documents for the completion of fssai compliences:-</p>
    ${requireddocs.filter(doc => !clientData.checkedDocsName.includes(doc)).join('<br>')}
     <p><b>Please mail these docs on customerrelations@iiest.org </b></p>

    <p>click button below for sending documents.</p>
        <a style="text-decoration: none;" href="mailto:customerrelations@iiest.org">
            <button style="display: block;
            width: 100%;
            max-width: 300px;
            background: #20DA9C;
            border-radius: 8px;
            color: #fff;
            font-size: 18px;
            padding: 12px 0;
            margin: 30px auto 0;
            text-decoration: none; cursor: pointer;">Send</button>
        </a>
        <br><br>

    <p>If you have any further questions or need assistance, please feel free to reach out to us</p>
    <p><strong>The company has zero tolerance towards any bribery, corruption & fraud in business activities.</strong></p>
    <p>Technical Officer: ${clientData.technicalOfficer}</p>
    <p>Regards,<br>
    ${CB_BRAND_NAME.english}</p>
    <br>
    Brand Name - ${CB_BRAND_NAME.english},<br/>
    Address - ${CB_ADDRESS.english}<br/>
    Website - <a href='https://connectonline.world'>connectonline.world</a><br> 
    Email = customerrelations@iiest.org<br>
    Contact no - ${CONTACT_NUMBERS.connect_bharat}<br>
    Landline - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
    Contact time 10 :00 a.m to 7:00 p.m<br>
    <br>This mail is system generated, please do not replay on this mail. 
    <br><br>
    <hr>
    <br>
    <p>${CB_BRAND_NAME.hindi} में आपका स्वागत है,<br>
    ${CB_BRAND_NAME.hindi} पोर्टल व्यवसायों को आसानी से अनुपालन और कानूनी आवश्यकताओं को पूरा करने में सक्षम बनाता है।</p>
    <p>प्रिय ${clientData.managerName},</p>
    <p>भारत सरकार के तहत सेवाओं के लिए पंजीकरण करने के लिए धन्यवाद।<br>
    आपके द्वारा प्रदान की गई जानकारी सफलतापूर्वक सत्यापित कर दी गई है। हम सत्यापन प्रक्रिया के दौरान आपके सहयोग और समय पर प्रतिक्रिया की सराहना करते हैं।</p>
    
<p>आपके द्वारा FSSAI अनुपालन की पूर्ति के लिए निम्नलिखित दस्तावेज़ों की घोषणा की गई है:</p>
${clientData.checkedDocsName.join('<br>')}
<p>FSSAI अनुपालन की पूर्ति के लिए निम्नलिखित दस्तावेज़ लंबित हैं:</p>
${requireddocs.filter(doc => !clientData.checkedDocsName.includes(doc)).join('<br>')}

 <p><b>कृपया इन दस्तावेजों को customerrelations@iiest.org पर मेल करें।</b></p>


     <p>अपना ईमेल सत्यापित करने के लिए नीचे दिए गए बटन पर क्लिक करें।</p>
        <a style="text-decoration: none;" href="mailto:customerrelations@iiest.org">
            <button style="display: block;
            width: 100%;
            max-width: 300px;
            background: #20DA9C;
            border-radius: 8px;
            color: #fff;
            font-size: 18px;
            padding: 12px 0;
            margin: 30px auto 0;
            text-decoration: none; cursor: pointer;">भेजें</button>
        </a>
        <br><br>

    <p>यदि आपके कोई और प्रश्न हैं या सहायता की आवश्यकता है, तो कृपया बेझिझक हमसे संपर्क करें</p>
    <p><strong>कंपनी व्यावसायिक गतिविधियों में किसी भी रिश्वतखोरी, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहिष्णुता रखती है।</strong></p>
    <p>"धन्यवाद,</p>
     <p>तकनीकी अधिकारी: ${clientData.technicalOfficer}</p>
    <p>${CB_BRAND_NAME.hindi}</p>
    <br>
    ब्रांड नाम = ${CB_BRAND_NAME.hindi}<br>
    पता - ${CB_ADDRESS.hindi}<br/>
    वेबसाइट - <a href='https://connectonline.world'>connectonline.world</a><br>
     ईमेल - customerrelations@iiest.org</br>
    संपर्क नंबर- ${CONTACT_NUMBERS.connect_bharat}<br>
    लैंडलाइन - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
    संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>
    <br>यह ईमेल प्रणाली द्वारा उत्पन्न किया गया है, कृपया इस ईमेल का उत्तर न दें।`;

  } 
  else if (clientData.product == 'hra schedule') {

    subject = `${CB_BRAND_NAME.english} - HRA Scheduled`;
    content = `<p>Welcome to the ${CB_BRAND_NAME.english},<br>
    ${CB_BRAND_NAME.english} Portal empowers businesses to meet compliance and legal requirements easily.</p>
    <p>Dear ${clientData.managerName},</p>
    <p>Thanks for registering for the Hygiene Rating program by FSSAI Govt Of India.<br>
    Your Hygiene Rating will be sheduled on ${clientData.auditDate}</p>
    <p>Information Related to your HRA:</p>
    Auditor Name -- ${clientData.auditor}<br>

    <p>If you have any further questions or need assistance, please feel free to reach out to us</p>
    <p><strong>The company has zero tolerance towards any bribery, corruption & fraud in business activities.</strong></p>
    <p>Regards,<br>
    ${CB_BRAND_NAME.english}</p>
    <br>
    Brand Name - ${CB_BRAND_NAME.english},<br/>
    Address - ${CB_ADDRESS.english}<br/>
    Website - <a href='https://connectonline.world'>connectonline.world</a><br> 
    Email = customerrelations@iiest.org<br>
    Contact no - ${CONTACT_NUMBERS.connect_bharat}<br>
    Landline - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
    Contact time 10 :00 a.m to 7:00 p.m<br>
    <br>This mail is system generated, please do not replay on this mail. 
    <br><br>
    <hr>
    <br>
    <p>${CB_BRAND_NAME.hindi} में आपका स्वागत है,<br>
    ${CB_BRAND_NAME.hindi} पोर्टल व्यवसायों को आसानी से अनुपालन और कानूनी आवश्यकताओं को पूरा करने में सक्षम बनाता है।</p>
    <p>प्रिय ${clientData.managerName},</p>
    <p>FSSAI भारत सरकार द्वारा हाइजीन रेटिंग प्रोग्राम के लिए पंजीकरण करने के लिए धन्यवाद।<br>आपकी हाइजीन रेटिंग ${clientData.auditDate} को निर्धारित की जाएगी।</p>
    <p>आपके HRA से संबंधित जानकारी:</p>
    ऑडिटर का नाम -- ${clientData.auditor}<br> 
    <p>यदि आपके पास कोई और प्रश्न हैं या सहायता की आवश्यकता है, तो कृपया हमसे संपर्क करने में संकोच न करें।</p>
<p><strong>कंपनी का रिश्वत, भ्रष्टाचार और धोखाधड़ी की व्यावसायिक गतिविधियों के प्रति शून्य सहनशीलता है।</strong></p>
<p>सादर,<br>${CB_BRAND_NAME.hindi}</p>
<br>
ब्रांड नाम = ${CB_BRAND_NAME.hindi}<br>
पता - ${CB_ADDRESS.hindi}<br/>
वेबसाइट - <a href='https://connectonline.world'>connectonline.world</a><br>
 ईमेल - customerrelations@iiest.org</br>
संपर्क नंबर- ${CONTACT_NUMBERS.connect_bharat}<br>
लैंडलाइन - ${LANDLINES.landline1}, ${LANDLINES.landline2}<br>
संपर्क समय प्रातः 10:00 बजे से सायं 7:00 बजे तक<br>
<br>यह ईमेल प्रणाली द्वारा उत्पन्न किया गया है, कृपया इस ईमेल का उत्तर न दें।`;

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