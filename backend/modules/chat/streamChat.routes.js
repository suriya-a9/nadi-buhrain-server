const express = require('express');
const { StreamChat } = require('stream-chat');
const router = express.Router();
const logger = require("../../logger");

const streamClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);

const PUSH_PROVIDER_USER = 'firebase-user';
const PUSH_PROVIDER_TECH = 'firebase-tech';

function parseFirebaseCreds(raw) {
    const creds = JSON.parse(raw);
    creds.private_key = creds.private_key.replace(/\\n/g, '\n');
    if (!creds.token_uri) creds.token_uri = 'https://oauth2.googleapis.com/token';
    if (!creds.auth_uri) creds.auth_uri = 'https://accounts.google.com/o/oauth2/auth';
    if (!creds.auth_provider_x509_cert_url) creds.auth_provider_x509_cert_url = 'https://www.googleapis.com/oauth2/v1/certs';
    return JSON.stringify(creds);
}

async function setupPushProviders() {
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            await streamClient.upsertPushProvider({
                type: 'firebase',
                name: PUSH_PROVIDER_USER,
                firebase_credentials: parseFirebaseCreds(process.env.FIREBASE_SERVICE_ACCOUNT),
            });
            logger.info(`✅ Stream Chat push provider "${PUSH_PROVIDER_USER}" upserted`);
        }

        if (process.env.FIREBASE_SERVICE_ACCOUNT_STAFF) {
            await streamClient.upsertPushProvider({
                type: 'firebase',
                name: PUSH_PROVIDER_TECH,
                firebase_credentials: parseFirebaseCreds(process.env.FIREBASE_SERVICE_ACCOUNT_STAFF),
            });
            logger.info(`✅ Stream Chat push provider "${PUSH_PROVIDER_TECH}" upserted`);
        }
    } catch (err) {
        logger.error('❌ Stream Chat push provider setup failed:', err.message);
    }
}

setupPushProviders();

router.post('/token', async (req, res) => {
    const { userId, name } = req.body;
    await streamClient.upsertUser({
        id: userId,
        name: name || "",
    });
    const token = streamClient.createToken(userId);
    res.json({ token });
});

module.exports = router;