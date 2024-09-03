const { coworkInvoicePath, doesFileExist, deleteDocObject, getDocObject } = require("../../config/s3Bucket");
const bcInvoiceDataHandler = require("../../coworks/generateCoworkInvoice");
const { generateCoworksInvoiceCode } = require("../../coworks/generateCredentials");
const { sendCoworkInvoiceMail } = require("../../coworks/sendMail");
const { sendInvoiceMail } = require("../../fbo/sendMail");
const coworkInvoiceModel = require("../../models/enterpriseModels/coworkInvoiceSchema");


//methotd for creating cowork invoice
exports.createInvoie = async (req, res) => {
    try {

        let success = false;

        const { business_name, address, state, district, pincode, email, contact_no, product_code, invoice_date, gst_amount, gst_number, total_amount, product, processing_amount, invoice_type, behalf_of, narration, qty } = req.body;

        success = true;

        const user = req.user;

        const emailLowerCase = email.toLowerCase();

        //initially we want to send performa invoice
        const invoiceCode = 'Performa';
        // const invoiceCode = await generateCoworksInvoiceCode(invoice_type);
        const invoiceData = await bcInvoiceDataHandler(invoiceCode, business_name, address, state, district,
            pincode, contact_no, emailLowerCase, processing_amount, invoice_type, gst_number, gst_amount, qty, total_amount,
            product, product_code, narration, invoice_date, behalf_of, user.signatuteImage);

        const dataSaved = await coworkInvoiceModel.create({
            business_name: business_name, address: address, state: state, district: district, pincode: pincode, contact_no: contact_no,
            email: emailLowerCase, processing_amount: processing_amount, invoice_type: invoice_type, gst_number: gst_number, gst_amount: gst_amount, qty: qty,
            total_amount: total_amount, product: product, product_code: product_code, narration: narration, invoice_date: invoice_date, behalf_of: behalf_of,
            invoice_code: invoiceCode, invoice_src: invoiceData.fileName, isAmountReceived: false
        });

        if (!dataSaved) {
            return res.status(401).json({ success: false, message: 'Data Saving Error', dataSavingErr: true })
        }

        sendCoworkInvoiceMail(emailLowerCase, [invoiceData]);

        return res.status(200).json({ success: success, invouceSend: true });


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

//metjord for getting invoice list
exports.getCoworkInvoiceList = async (req, res) => {
    try {

        const invoiceList = await coworkInvoiceModel.find({});

        if (!invoiceList) {
            return res.status(201).json({ success: false, dataNotFoundErr: true, message: 'Data Not Found' })
        }

        return res.status(200).json({ success: true, invoiceList: invoiceList });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

//methord for setting reciving info of a cowork invoice
exports.updateRecivingInfo = async (req, res) => {
    try {

        let success = false;

        const invoiceId = req.params.id;

        const user = req.user;

        const { receviedAmount, receivedDate, receivedNarration } = req.body;

        console.log(req.body)

        const oldInvoice = await coworkInvoiceModel.findOne({ _id: invoiceId });

        const oldInvoiceSrc = oldInvoice.invoice_src;

        const oldKey = `${coworkInvoicePath}${oldInvoiceSrc}`;

        //deteting old performa invoice if exsists

        const isExists = await doesFileExist(oldKey);

        console.log(await doesFileExist(oldKey));

        if (isExists) {
            await deleteDocObject(oldKey);
        }

        //generating invoice code
        const invoiceCode = await generateCoworksInvoiceCode(oldInvoice.invoice_type);

        const invoiceData = await bcInvoiceDataHandler(invoiceCode, oldInvoice.business_name, oldInvoice.address, oldInvoice.state, oldInvoice.district,
            oldInvoice.pincode, oldInvoice.contact_no, oldInvoice.email, oldInvoice.processing_amount, oldInvoice.invoice_type, oldInvoice.gst_number,
            oldInvoice.gst_amount, oldInvoice.qty, oldInvoice.total_amount,
            oldInvoice.product, oldInvoice.product_code, oldInvoice.narration, oldInvoice.invoice_date, oldInvoice.behalf_of, user.signatuteImage);

        if (!invoiceData) {
            return res.status(401).json({ success: success, invoiceCreationErr: true, message: 'Erroe while creating invoice' })
        }

        const dataUpdated = await coworkInvoiceModel.findOneAndUpdate({ _id: invoiceId }, {
            $set: {
                invoice_src: invoiceData.fileName, isAmountReceived: true, receivingAmount: receviedAmount,
                receivingDate: receivedDate, receivingNarration: receivedNarration, invoice_code: invoiceCode
            }
        });

        if (!dataUpdated) {
            return res.status(401).json({ success: success, message: 'Data not updated', dataUpdationErr: true })
        }

        // sending mail
        sendCoworkInvoiceMail(oldInvoice.email, [invoiceData]);

        success = true;

        return res.status(200).json({ success: success, invoiceSend: true })


    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false.valueOf, message: 'Internal Server Error' });
    }
}

//methord for getting  cowork invoice 
exports.getCoworkInvoice = async (req, res) => {
    try {

        const invoiceId = req.params.id;

        // invoices path is comming from s3.js file in config folder
        const invoiceKey = `${coworkInvoicePath}${invoiceId}`;

        //getting invoice presigned url and sending it to client
        const invoiceConverted = await getDocObject(invoiceKey);


        return res.status(200).json({ success: true, invoiceConverted })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}