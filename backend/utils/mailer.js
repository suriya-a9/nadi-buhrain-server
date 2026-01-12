const nodemailer = require("nodemailer");
const config = require("../config/default")

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.mail_user,
        pass: config.mail_pass,
    },
});

module.exports = async function sendMail({ to, subject, html }) {
    return transporter.sendMail({
        from: `"NADI Admin" <${config.mail_user}>`,
        to,
        subject,
        html,
    });
};