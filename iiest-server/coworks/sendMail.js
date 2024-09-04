const nodemailer = require('nodemailer');
const mailData = JSON.parse(process.env.FINANCE_NODE_MAILER);

const sendCoworkInvoiceMail = (clientMail, files) => {
  // console.log('files console ................', files, clientMail);
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
    cc: [process.env.DIRECTOR_MAIL, 'incubation.iiest@gmail.com'],
    to: clientMail,
    subject: 'IIEST Incubation And Business Centre -- INVOICE',
    html: `<p>Welcome to the IIEST Incubation And Business Centre<br></p>
        <p>Dear Valued Customer</p>
        <p>Thanks for avialing the services under project - Shared Spaces via Startworks. Your invoice is generated and sent to you via this mail.<br> For any queries or assistance please contact below given details.<br><br>
        </p>
        <p>Thank You</p>
        <br>
        Brand Name - Startworks<br>
        Company Name - IIEST Incubation And Business Centre<br>
        Address - 1-U, First Floor, DCM Building 16, Barakhamba road New Delhi, Delhi, 110001<br/>
        Contact no - 9667797391<br>
        Landline - 011-35454931, 011-35457013<br>
        Contact time 10 :00 a.m to 7:00 p.m<br>
        <br>`,
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

module.exports = {sendCoworkInvoiceMail}