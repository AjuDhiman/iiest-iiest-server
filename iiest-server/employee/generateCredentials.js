const generateUsername = (name, idNumber)=>{ 
    const sanitizedName = name.replace(/\s/g, '').toLowerCase();
    return `${sanitizedName}_iiest_${idNumber}`;
}

const generatePassword = (length)=>{
    let charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
      }
      
    return password;
}

const generateEmployeeID = (companyName, employeeCount)=>{
    let employeeId = ''
    if(companyName === 'Federation'){
        employeeId = `IIEST/FD/${employeeCount}`;
    }else if(companyName === 'Business Center'){
        employeeId = `IIEST/BC/${employeeCount}`;
    }
    return employeeId;
}

module.exports = { generateUsername, generatePassword, generateEmployeeID }
