const nocTemplet = (verifiedInfo, shopInfo) => {
    return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
            body {
                height: 1120px;
                width: 800px;
                padding: 10%;
                margin: auto;
            }
    
            h1 {
                width: 100%;
                text-align: center;
                text-decoration: underline;
                margin-bottom: 60px;
            }
    
            .content {
                text-align: justify;
                font-size: 18px;
                margin-bottom: 40px;
            }
    
            .head {
                text-align: center;
    
            }
    
            .info .name {
                margin-top: 70px;
            }
    
            .info {
                font-size: 18px;
            }
    
            .signature {
                text-align: right;
                width: 100%;
                margin-top: 50px;
            }
        </style>
    </head>
    
    <body>
        <h1>NO OBJECTION CERTIFICATE</h1>
        <div class="content">
            <p class="head"><strong>TO WHOM SO EVER IT MAY CONCERN </strong></p>
            <p>This is to certify that I, <strong>Rajesh Kumar</strong> who is the owner of the property situated at Shop at <strong>Ward No-6 ,
                Opposite Kailash Mandir, Gaushala Road, Near Sabzi Mandi , Nuh , Mewat , Haryana -</strong></p>
            <p>I also certify that I have let out the part of the above mention’s property situated at<strong>D-2/355,Ground Floor
                , KH No-324 , Shop No-2, Gali No-2, Main Road Dayalpur, Karawal Nagar , North East -110094</strong> to My Husband <strong>Mr
                Pappu Kashyap</strong> Who is the Proprietor of <strong>“Pappu Kashyap Chat Bhandar”</strong> for the purpose of carrying on his
                business activities.
            </p>
        </div>
    
        <div class="info name" id="">
            Urmila<br>(Name of Owner of Property)
        </div>
        <div class="info signature" id="">Signature of Owner</div>
    </body>
    
    </html>`
}

module.exports = nocTemplet;