module.exports = function resetPasswordTemplate({ name, resetUrl }) {
    return `
        <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:30px;">
            <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                    <td align="center">
                        <table width="100%" style="max-width:600px; background:#ffffff; border-radius:8px; padding:30px;">
                            
                            <tr>
                                <td align="center" style="padding-bottom:20px;">
                                    <img src="https://nadi-bahrain.cnxhub.in/assets/mail-logo.jpg" alt="Logo" width="120" />
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    <h2 style="color:#1f2937;">Password Reset Request</h2>

                                    <p style="color:#4b5563; font-size:15px;">
                                        Hello <strong>${name}</strong>,
                                    </p>

                                    <p style="color:#4b5563; font-size:15px;">
                                        We received a request to reset your admin account password.
                                        Click the button below to create a new password.
                                    </p>

                                    <div style="text-align:center; margin:30px 0;">
                                        <a href="${resetUrl}"
                                           style="background:#16a34a; color:#ffffff;
                                                  padding:14px 26px; text-decoration:none;
                                                  border-radius:6px; font-weight:600;">
                                            Reset Password
                                        </a>
                                    </div>

                                    <p style="color:#6b7280; font-size:14px;">
                                        This link expires in <strong>2 minutes</strong>.
                                        If you did not request this, please ignore this email.
                                    </p>

                                    <hr style="border:none; border-top:1px solid #e5e7eb; margin:30px 0;"/>

                                    <p style="color:#9ca3af; font-size:12px; text-align:center;">
                                        © ${new Date().getFullYear()} NADI Bahrain. All rights reserved.
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