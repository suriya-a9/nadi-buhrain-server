module.exports = function technicianMaterialRequestActionTemplate({ name, status, reason }) {
    const normalizedStatus = status?.toLowerCase();
    const isApproved = normalizedStatus === "approved";
    const isRejected = normalizedStatus === "rejected";

    return `
        <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">
            <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center">
                        <table width="100%" style="max-width:600px; background:#ffffff; border-radius:8px; padding:30px;">
                            
                            <tr>
                                <td align="center" style="padding-bottom:20px;">
                                    <img src="https://nadi-bahrain.cnxhub.in/assets/mail-logo.jpg" width="120" />
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <h2 style="color:#1f2937;">
                                        Material Request ${isApproved ? "Approved" : "Rejected"}
                                    </h2>

                                    <p style="color:#4b5563; font-size:15px;">
                                        Hello <strong>${name}</strong>,
                                    </p>

                                    ${isApproved
            ? `
                                                <p style="color:#4b5563;">
                                                    ✅ Your material request has been
                                                    <strong style="color:#16a34a;">approved</strong>.
                                                </p>

                                                <div style="text-align:center; margin:30px 0;">
                                                    <span style="background:#16a34a; color:#fff;
                                                        padding:12px 24px; border-radius:6px;
                                                        font-weight:600;">
                                                        Request Approved
                                                    </span>
                                                </div>
                                            `
            : ""
        }

                                    ${isRejected
            ? `
                                                <p style="color:#4b5563;">
                                                    ❌ Your material request has been rejected.
                                                </p>

                                                <div style="text-align:center; margin:30px 0;">
                                                    <span style="background:#dc2626; color:#fff;
                                                        padding:12px 24px; border-radius:6px;
                                                        font-weight:600;">
                                                        Request Rejected
                                                    </span>
                                                </div>
                                            `
            : ""
        }

                                    <hr style="border:none; border-top:1px solid #e5e7eb; margin:30px 0;" />

                                    <p style="color:#9ca3af; font-size:12px; text-align:center;">
                                        © ${new Date().getFullYear()} NADI Bahrain
                                    </p>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </div>
    `;
};