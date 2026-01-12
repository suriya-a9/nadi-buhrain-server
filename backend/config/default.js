require('dotenv').config();

const config = {
    port: process.env.PORT,
    url: process.env.URL,
    node_env: process.env.NODE_ENV,
    jwt: process.env.JWT_SECRET,
    mail_user: process.env.EMAIL_USER,
    mail_pass: process.env.EMAIL_PASS,
    frontend: process.env.FRONTEND_URL,
    firebase: process.env.FIREBASE_SERVICE_ACCOUNT
}
module.exports = config;