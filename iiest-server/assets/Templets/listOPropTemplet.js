const listOpropTemplet = (verifiedInfo, shopInfo) => {

    const address = getFormatedAddress(verifiedInfo.address);

    const ownerAddress = getFormatedAddress(verifiedInfo.owner_address);

    return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
           body{
            height: 1120px;
            width: 800px;
            margin: auto;
            padding-left: 8%;
            padding-right: 8%;
           }
           .title {
            text-align: center;
            width: 100%;
            text-decoration: underline;
            margin-top: 40px;
            margin-bottom: 70px;
           }
           .content{
            font-size: 18px;
            text-align: justify;
            margin-bottom: 70px
           }
           .info {
            padding-top: 0;
            margin-top: 0;
           }
        </style>
    </head>
    
    <body>
    
        <body>
            <div class="container">
                <h1 class="title">LIST OF PROPRIETORSHIP</h1>
                <div class="content">
                    <p>I, <strong>${verifiedInfo.ownername}</strong> S/O <strong>${verifiedInfo.propraitorFatherName}</strong> R/O <strong>1-6/2, ${verifiedInfo.ownerAddress}</strong> is the sole Proprietor of business running under the Name
                        of "<strong>${verifiedInfo.fbo_name}</strong>" at ${verifiedInfo.address}<strong>
                <p class="info">Name – <strong>${verifiedInfo.owner_name}</strong></p>
                <p class="info">Kind of Business – <strong>${verifiedInfo.kob}</strong></p>
                <p class="info">Contact No – <strong>${verifiedInfo.owner_contact_no}</strong></p>
            </div>
        </body>
    
    </body>
    
    </html>`
}

// this func relplace "," with ", " in address
function getFormatedAddress(address) {
    let str = address;
    [...address].forEach((char, index) => {
        if (char === ',' && address[index + 1] !== " ") {
            str = address.substring(0, index + 1) + " " + address.substring(index + 1);
        }
    });
    return str;
}

module.exports = listOpropTemplet;
