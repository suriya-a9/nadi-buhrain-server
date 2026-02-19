// const admin = require("firebase-admin");
// const config = require("./default");

// const serviceAccount = JSON.parse(config.firebase);

// if (!admin.apps.length) {
//     admin.initializeApp({
//         credential: admin.credential.cert(serviceAccount),
//     });
// }

// module.exports = admin;

const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

const mainApp =
  admin.apps.find(app => app.name === "mainApp") ||
  admin.initializeApp(
    {
      credential: admin.credential.cert(serviceAccount),
    },
    "mainApp"
  );

module.exports = mainApp;