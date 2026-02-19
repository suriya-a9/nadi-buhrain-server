const admin = require("../config/firebaseStaff");

const sendPushNotificationStaff = async (token, title, body) => {
    if (!token) return;

    const message = {
        token,
        notification: {
            title,
            body
        },
        android: {
            priority: "high",
            notification: {
                channelId: "high_importance_channel",
                sound: "default"
            }
        },
        apns: {
            payload: {
                aps: {
                    sound: "default"
                }
            }
        }
    };

    try {
        console.log("Sending push notification to:", token, "with title:", title, "and body:", body);
        const response = await admin.messaging().send(message);
        console.log("Push notification sent, response:", response);
    } catch (err) {
        console.error("FCM Error:", err);
    }
};

module.exports = sendPushNotificationStaff;