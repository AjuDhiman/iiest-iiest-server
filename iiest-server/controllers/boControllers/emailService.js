const nodemailer = require('nodemailer');
const mailData = JSON.parse(process.env.NODE_MAILER);

exports.sendMailToBo = async (boMail, customerId) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: mailData.email,
              pass: mailData.pass
            }
          });

        let info = await transporter.sendMail({
            from: mailData.email,
            to: boMail,
            subject: 'IIEST Federation -- Onboard', 
            html: `<p>Welcome to the IIEST Federation,<br>
            Scheme implementing partner of Govt. Of India.</p>
            <p>Dear Valued Customer</p>
            <p>Thanks for registering in the Connect Bharat Project. Your Business Operation(BO) Number is generated and sent to you via this mail, Please use it for refernce whenever you contact us.<br>You have become eligible recipent of various government befits, as per your buiness norms, under the schemes issued for SMEs for business growth. <br>You will receive a call within 7 days to verify your details. Kindly do the needful.
            The company has zero tolerance towards any bribery, corruption & fraud in business activities.</p>
            <p>Thank You</p>
            <br>
            BO Name - IIEST Federation<br>
            BO ID No - ${customerId}<br>

            IIEST Federation 
            Contact no - 9910729809<br>
            Landline - 011-43511788, 011-4681145<br>
            Contact time 10 :00 a.m to 7:00 p.m<br>
            <br><br>
            <hr>
            <br>

            <p>IIEST फेडरेशन में आपका स्वागत है,<br>
            भारत सरकार के योजना कार्यान्वयन साथी।</p>
            <p>प्रिय मूल्यवान ग्राहक</p>
            <p>कनेक्ट भारत परियोजना में पंजीकरण के लिए धन्यवाद। आपका व्यवसायिक संचालन (बीओ) नंबर उत्पन्न किया गया है और आपको इस मेल के माध्यम से भेजा गया है, कृपया जब भी हमसे संपर्क करें तो इसका उपयोग करें।<br>आप विभिन्न सरकारी लाभों के पात्र हो गए हैं, अपने व्यवसाय नियमों के अनुसार, व्यवसाय की वृद्धि के लिए एसएमई के लिए जारी योजनाओं के तहत।<br>आपको अपना विवरण सत्यापित करने के लिए 7 दिनों के भीतर एक कॉल प्राप्त होगा। कृपया आवश्यक कार्रवाई करें।
            कंपनी कारोबार गतिविधियों में किसी भी घूस, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहनशीलता की नीति रखती है।</p>
            <p>धन्यवाद</p>
            <br>
            बीओ नाम - IIEST फेडरेशन<br>
            बीओ आईडी नंबर - ${customerId}<br>
            
            IIEST फेडरेशन 
            संपर्क नंबर - 9910729809<br>
            लैंडलाइन - 011-43511788, 011-4681145<br>
            संपर्क समय 10:00 बजे से 7:00 बजे तक<br>
            <br><br>
            <hr>
            <br>`,
        });

        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error; 
    }
};
