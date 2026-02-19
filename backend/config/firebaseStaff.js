const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_STAFF);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

const staffApp =
  admin.apps.find(app => app.name === "staffApp") ||
  admin.initializeApp(
    {
      credential: admin.credential.cert(serviceAccount),
    },
    "staffApp"
  );

module.exports = staffApp;
