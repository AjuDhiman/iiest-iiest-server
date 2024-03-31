const nodemailer = require('nodemailer');
const mailData = JSON.parse(process.env.NODE_MAILER);

const sendDocumentMail = (clientMail, fileName, filePath) => {
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
    html: `<p>This email contains your ${fileName}</p>`,
    attachments: [
      {
        filename: fileName,
        path: `./${filePath}`
      }
    ]
  }
  transport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.error(error);
    } else {
      console.log(response);
    }
  })
};

// function to send mail to the client after verification process
const sendVerificationMail = (clientData) => {

  let content;

  if(clientData.product == 'fostac') {

    content = `<p>Hi ${clientData.recipientName},</p>
    <p>This mail is to inform you that the information you provided has been successfully verified. We appreciate your cooperation and timely response during the verification process.</p>
    <p>Kindly review the details you have provided below:</p>
    Trainee Name: ${clientData.recipientName}<br>
    Trainee father Name: ${clientData.fatherName}<br>
    Trainee Contact No: ${clientData.recipientContactNo}<br>
    Trainee DOB: ${clientData.dob}<br>
    Trainee Aadhar No: ${clientData.aadharNo}<br>
    Trainee Pancard No: ${clientData.pancard}<br>

    <p>If you have any further questions or need assistance, please feel free to reach out to us</p>
    <p>Regards,</p>
    <p>IIEST Federation</p>`

  } else if(clientData.product == 'foscos') {

    content = `<p>Hi ${clientData.ownerName},</p>
    <p>This mail is to inform you that the information you provided has been successfully verified. We appreciate your cooperation and timely response during the verification process.</p>
    <p>Kindly review the details you have provided below:</p>
    FBO Name: ${clientData.fboName}<br>
    Operator Name: ${clientData.operatorName}<br>
    Owner Name: ${clientData.ownerName}<br>
    Owner Contact No: ${clientData.operatorContactNo}<br>
    Address: ${clientData.address}<br>
    Pincode: ${clientData.pincode}<br>
    Tehsil: ${clientData.tehsil}<br>
    Village: ${clientData.village}<br>

    <p>License Related Information</p>
    License Category: ${clientData.licenseCategory}<br>
    License Duration: ${clientData.licenseDuration}<br>
    Kind of Business: ${clientData.kindOfBusiness}<br>
    Food Category: ${clientData.foodCategory}<br>

    <p>If you have any further questions or need assistance, please feel free to reach out to us</p>
    <p>Regards,</p>
    <p>IIEST Federation</p>`

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
    subject: "IIEST Federation - Information Verified Successfuly",
    html: content
  }
  transport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.error(error)
    } else {
      console.log(response);
    }
  })
}

module.exports = {sendDocumentMail, sendVerificationMail};