module.exports = function serviceStatusUpdateTemplate({ name, status }) {
    return `
        <div style="font-family: Arial, sans-serif;">
            <h2>Service Request Status Update</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your service request status has been updated to: <b>${status}</b>.</p>
            <p>If you have any questions, please contact us.</p>
            <br/>
            <p>Regards,<br/>NADI Bahrain Team</p>
        </div>
    `;
};