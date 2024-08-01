const bcInvoiceDataHandler = require("../../coworks/generateCoworkInvoice");
const { generateCoworksInvoiceCode } = require("../../coworks/generateCredentials");
const { sendCoworkInvoiceMail } = require("../../coworks/sendMail");
const { sendInvoiceMail } = require("../../fbo/sendMail");
const coworkInvoiceModel = require("../../models/enterpriseModels/coworkInvoiceSchema");


exports.createInvoie = async (req, res) => {
    try {

        let success = false;

        const { business_name, address, state, district, pincode, email, contact_no, product_code, invoice_date, gst_amount, gst_number, total_amount, product, processing_amount, invoice_type, behalf_of, narration, qty } = req.body

        console.log(req.body)

        success = true;

        const invoiceCode = await generateCoworksInvoiceCode(invoice_type);

        const invoiceData = await bcInvoiceDataHandler(invoiceCode, business_name, address, state, district,
            pincode, contact_no, email, processing_amount, invoice_type, gst_number, gst_amount, qty, total_amount,
            product, product_code, narration, invoice_date, behalf_of);

        const dataSaved = await coworkInvoiceModel.create({business_name:  business_name, address: address, state: state, district: district, pincode: pincode, contact_no: contact_no,
            email: email, processing_amount: processing_amount, invoice_type: invoice_type, gst_number: gst_number,  gst_amount: gst_amount, qty: qty,
            total_amount: total_amount, product: product, product_code: product_code, narration: narration, invoice_date: invoice_date, behalf_of: behalf_of,
            invoice_code: invoiceCode, invoice_src: invoiceData.fileName
        });

        if(!dataSaved){
            return res.status(401).json({success: false, message:'Data Saving Error', dataSavingErr: true})
        }

        sendCoworkInvoiceMail(email, [invoiceData]);

        return res.status(200).json({ success: success, invouceSend: true });


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

//metjord for getting invoice list
exports.getCoworkInvoiceList = async(req, res) => {
    try {

        const invoiceList = await coworkInvoiceModel.find({});

        if(!invoiceList) {
            return res.status(201).json({success: false,  dataNotFoundErr: true, message: 'Data Not Found' })
        }

        return res.status(200).json({success: true, invoiceList: invoiceList});

    } catch(error) {
        console.log(error);
        return res.status(500).json({message:'Internal Server Error'});
    }
}