const HelpAndSupportEnquiry = require("./helpAndSupportEnquiry.model");

exports.send = async (req, res, next) => {
    const { name, phone, message, email } = req.body;
    try {
        await HelpAndSupportEnquiry.create({
            name,
            phone,
            message,
            email
        })
        res.status(200).json({
            success: true,
            message: "Enquiry sent"
        })
    } catch (err) {
        next(err)
    }
}

exports.list = async (req, res, next) => {
    try {
        const list = await HelpAndSupportEnquiry.find();
        res.status(200).json({
            success: true,
            data: list
        })
    } catch (err) {
        next(err)
    }
}