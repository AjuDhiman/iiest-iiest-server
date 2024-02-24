const nodemailer = require('nodemailer');
const mailData = JSON.parse(process.env.NODE_MAILER);

const sendDocumentMail = (clientMail, fileName, filePath)=>{
    console.log(fileName)
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
        subject: fileName,
        html:`<p>This email contains your ${fileName}</p>`,
        attachments: [
          {
            filename: fileName,
            path: `./${filePath}`
          }
        ]
      }
      transport.sendMail(mailOptions, function(error, response){
        if(error){
          console.error(error);
        }else{
          console.log(response);
        }
      })
}

module.exports = sendDocumentMail;