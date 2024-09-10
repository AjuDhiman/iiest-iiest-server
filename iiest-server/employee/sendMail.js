const nodemailer = require('nodemailer');
const mailData = JSON.parse(process.env.NODE_MAILER);

const sendEmployeeInfo = (username, password, empId, clientMail) => {
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
    subject: "Welcome to Connect Bharat - Your Employee Information",
    html: `<p>Welcome to Connect Bharat! We are excited to have you on board. Below, you will find important details regarding your employee account:</p>
              <p><strong>Employee ID:</strong> ${empId}</p>
              <p><strong>Username:</strong> ${username}</p>
              <p><strong>Password:</strong> ${password}</p>
              <p>We look forward to your contributions to the company.</p>
              
               <p><b>Disclaimer: This mail is system generated please do not replay on this mail</b></p>`
              // <p>Best regards,<br>
              // [Your Name]<br>
              // [Your Position]<br>
              // [Company Name]<br>
              // [Contact Information]</p>` 
  }
  transport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.error(error)
    } else {
      console.log(response);
    }
  })
}

const sendTemporaryPass = ( temppass, clientMail) => {
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
    subject: "Connect Bharat - Temporary Password",
    html: `<p>Please Use this temprary password for setting new password</p>
              <p><strong>Temprary Password:</strong> ${temppass}</p>
              <p>We look forward to your contributions to the company.</p>
              
                <p><b>Disclaimer: This mail is system generated please do not replay on this mail</b></p>`
  }
  transport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.error(error)
    } else {
      console.log(response);
    }
  })
}

module.exports = {sendEmployeeInfo, sendTemporaryPass}