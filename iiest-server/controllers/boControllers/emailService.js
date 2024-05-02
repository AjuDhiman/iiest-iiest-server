const nodemailer = require('nodemailer');
const mailData = JSON.parse(process.env.NODE_MAILER);

exports.sendMailToBo = async (boMail, mailInfo) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: mailData.email,
                pass: mailData.pass
            }
        });

        const { englishContent, hindiContent } = getMailContent(mailInfo);

        if (!englishContent || !hindiContent) {
            return
        }

        let info = await transporter.sendMail({
            from: mailData.email,
            to: boMail,
            subject: 'IIEST Federation -- Onboard',
            html: `<p>Welcome to the IIEST Federation,<br>
            Scheme implementing partner of Govt. Of India.</p>
            <p>Dear Valued Customer</p>
            ${englishContent}

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
            ${hindiContent}
            
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


//this function decides the content of a mail on the basis of pupose comming from mailInfo
function getMailContent(mailInfo) {
    let englishContent = '';
    let hindiContent = '';

    if(mailInfo.purpose == 'verification'){
        englishContent = `<p>Thanks for registering in the Connect Bharat Project. To complete the registration process and activate your 
        account, we need to verify your email address. Please click the button below to verify your email.</p>
        <br/>
        <button style="border:none; color: white; backgraound: green; outline: none"><a href='http://localhost:4200/#/verifyonboard/email/${mailInfo.id}'>Verify</a></button>
        </br>
        <p>Thank You</p>`

        hindiContent = `<p>कनेक्ट भारत परियोजना में पंजीकरण के लिए धन्यवाद। पंजीकरण प्रक्रिया पूरी करने और अपने खाते को सक्रिय करने के लिए, 
        हमें आपके ईमेल पते को सत्यापित करना होगा। कृपया नीचे दिए गए बटन पर क्लिक करके अपना ईमेल सत्यापित करें।</p>
        <br/>
        <button style="border:none; color: white; background: green; outline: none;"><a href='http://localhost:4200/#/verifyonboard/email/${mailInfo.id}'>Verify (वेरीफाई)</a></button>
        <br/>
        <p>धन्यवाद</p>`
    }
    else if (mailInfo.purpose == 'onboard') {
        englishContent = `<p>Thanks for registering in the Connect Bharat Project. Your Business Operation(BO) Number is generated and sent to you via this mail, Please use it for refernce whenever you contact us.<br>You have become eligible recipent of various government befits, as per your buiness norms, under the schemes issued for SMEs for business growth. <br>You will receive a call within 7 days to verify your details. Kindly do the needful.
        The company has zero tolerance towards any bribery, corruption & fraud in business activities.</p>
        <br/>
        <p>Thank You</p>
        <br>
        BO Name - IIEST Federation<br>
        BO ID No - ${mailInfo.customerId}<br>`;

        hindiContent = `<p>कनेक्ट भारत परियोजना में पंजीकरण के लिए धन्यवाद। आपका व्यवसायिक संचालन (बीओ) नंबर उत्पन्न किया गया है और आपको इस मेल के माध्यम से भेजा गया है, कृपया जब भी हमसे संपर्क करें तो इसका उपयोग करें।<br>आप विभिन्न सरकारी लाभों के पात्र हो गए हैं, अपने व्यवसाय नियमों के अनुसार, व्यवसाय की वृद्धि के लिए एसएमई के लिए जारी योजनाओं के तहत।<br>आपको अपना विवरण सत्यापित करने के लिए 7 दिनों के भीतर एक कॉल प्राप्त होगा। कृपया आवश्यक कार्रवाई करें।
        कंपनी कारोबार गतिविधियों में किसी भी घूस, भ्रष्टाचार और धोखाधड़ी के प्रति शून्य सहनशीलता की नीति रखती है।</p>
        <p>धन्यवाद</p>
        <br>
        बीओ नाम - IIEST फेडरेशन<br>
        बीओ आईडी नंबर - ${mailInfo.customerId}<br>`
    }
    return { englishContent, hindiContent }
}
