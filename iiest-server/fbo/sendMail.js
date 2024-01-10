const nodemailer = require('nodemailer');
const mailData = JSON.parse(process.env.NODE_MAILER);

const sendInvoiceMail = (clientMail, fileName, encodedString)=>{
    console.log(fileName, encodedString)
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
        subject: 'FBO Invoice',
        html:`<p>This email contains your invoice</p>`,
        attachments: [
          {
            filename: fileName,
            content: encodedString,
            encoding: 'base64'
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

module.exports = sendInvoiceMail