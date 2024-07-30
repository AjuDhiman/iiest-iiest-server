const generalDataSchema = require("../models/generalModels/generalDataSchema");

const generateCoworksInvoiceCode = async (invoice_type) => {  //methord for generating invoice Id

    //generating invoice code of type (company/fianacial year/tax code/invoice number)
    //getting financial year
    const date = new Date();
    let firstYear = '';
    let secondYear = '';
    if (date.getMonth() < 2) {
        firstYear = `${(date.getFullYear() - 1).toString().split('').slice(-2).join('')}`;
        secondYear = `${date.getFullYear().toString().split('').slice(-2).join('')}`;
    } else {
        firstYear = `${date.getFullYear().toString().split('').slice(-2).join('')}`;
        secondYear = `${(date.getFullYear() + 1).toString().split('').slice(-2).join('')}`;
    }

    let financialYear = `${firstYear}-${secondYear}`

    //getting taxcode
    let taxCode = '';

    if (invoice_type === 'Tax') {
        taxCode = 'TX';
    } else if (invoice_type === 'Customer') {
        taxCode = 'CI';
    } else if (invoice_type === 'S') {
        ervice
        taxCode = 'CI';
    }

    //getting invoice number
    const generalData = (await generalDataSchema.find({}))[0];

    console.log(generalData);

    const invoice_details = generalData.cowork_invoice_details;

    console.log(invoice_details);

    let invoice_num;

    if (invoice_type === 'Tax') {
        invoice_num = Number(invoice_details.tax.last_invoice_num);
    } else if (invoice_type === 'Customer'){
        invoice_num = Number(invoice_details.customer.last_invoice_num);
    } else if (invoice_type === 'Service'){
        invoice_num = Number(invoice_details.service.last_invoice_num);
    } 

    const invoice_code = `SW/${financialYear}/${taxCode}/${invoice_num}`;

    //inc last invoice num in general data

    if (invoice_type == 'Tax') {
        await generalDataSchema.findOneAndUpdate({
            _id: generalData._id
        },
            {
                $inc: {
                    "cowork_invoice_details.tax.last_invoice_num": 1
                }
            })
    } else if (invoice_type == 'Customer') {
        await generalDataSchema.findOneAndUpdate(
            {
                _id: generalData._id
            },
            {
                $inc: {
                    "cowork_invoice_details.customer.last_invoice_num": 1
                }
            }
        )
    }else if (invoice_type == 'Service') {
        await generalDataSchema.findOneAndUpdate(
            {
                _id: generalData._id
            },
            {
                $inc: {
                    "cowork_invoice_details.service.last_invoice_num": 1
                }
            }
        )
    }

    return invoice_code;
}

module.exports = { generateCoworksInvoiceCode }