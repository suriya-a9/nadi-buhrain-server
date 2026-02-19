const Technician = require('./technician.model');
const jwt = require('jsonwebtoken');
const config = require('../../../config/default');
const bcrypt = require('bcrypt');
const UserLog = require("../../userLogs/userLogs.model");
const crypto = require("crypto");
const sendMail = require("../../../utils/mailer");
const technicianResetPasswordTemplate = require("../../../template/technicianResetPassword.template")
const sendPushNotification = require("../../../utils/sendPush");
const DeletedAccounts = require("../deletedAccounts/deletedAccounts.model");

exports.registerTechnician = async (req, res, next) => {
    const { firstName, lastName, email, mobile, gender, password, role } = req.body;
    try {
        if (!req.user.id) {
            return res.status(404).josn({
                message: "user id required"
            })
        }
        const existingUser = await Technician.findOne({
            $or: [
                { "email": email },
                { "mobile": mobile }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Account already registered"
            });
        }
        const image = req.files?.image?.[0]?.filename;
        const hashedPassword = await bcrypt.hash(password, 10);
        if (req.file) {

        }
        const registerData = await Technician.create({
            firstName,
            lastName,
            email,
            mobile,
            gender,
            role,
            image,
            password: hashedPassword
        })
        await UserLog.create({
            userId: req.user.id,
            log: `Created account for techician ${firstName} ${lastName}`,
            status: "Created",
            role: "admin",
            logo: "/assets/technician.webp",
            time: new Date()
        });
        res.status(201).json({
            message: 'registered successfully',
            data: registerData
        })
    } catch (err) {
        next(err)
    }
}

exports.loginTechnician = async (req, res, next) => {
    try {
        const { email, password, fcmToken } = req.body;

        const technician = await Technician.findOne({
            email: email.toLowerCase()
        });

        if (!fcmToken) {
            return res.status(400).json({
                success: false,
                message: "no fcm token"
            })
        }

        if (!technician) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        if (!technician.status) {
            return res.status(403).json({
                message: 'Account disabled'
            });
        }

        const passwordMatch = await bcrypt.compare(password, technician.password);
        if (!passwordMatch) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        if (fcmToken) {
            await Technician.findByIdAndUpdate(technician._id, { fcmToken });
        }

        const token = jwt.sign(
            { id: technician._id, role: technician.role },
            config.jwt,
            { expiresIn: '30d' }
        );

        await UserLog.create({
            userId: technician._id,
            log: 'Signed In',
            status: 'Logged',
            role: "technician",
            logo: '/assets/user-login-logo.webp',
            time: new Date()
        });

        res.status(200).json({
            message: 'Logged in successfully',
            token
        });
    } catch (err) {
        next(err);
    }
};

exports.updateTechnician = async (req, res, next) => {
    const id = req.user.id;
    const updateFields = { ...req.body };

    try {
        if (typeof updateFields.status === "string") {
            updateFields.status = updateFields.status === "true";
        }

        if (updateFields.role && typeof updateFields.role === "string") {
            try {
                updateFields.role = JSON.parse(updateFields.role);
            } catch (e) {
            }
        }

        if (req.files?.image) {
            updateFields.image = req.files.image[0].filename;
        }

        const technicianUpdate = await Technician.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        );
        await UserLog.create({
            userId: req.user.id,
            log: 'Updated profile',
            status: "Updated",
            role: "technician",
            logo: "/assets/update-profile.webp",
            time: new Date()
        });
        res.status(200).json({
            message: "Profile updated successfully",
            data: technicianUpdate
        });
    } catch (err) {
        next(err);
    }
}

exports.adminUpdateTechnician = async (req, res, next) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Technician ID is required" });
        }

        const updateFields = { ...req.body };
        delete updateFields.id;

        if (!updateFields.password) {
            delete updateFields.password;
        }

        if (typeof updateFields.status === "string") {
            updateFields.status = updateFields.status === "true";
        }

        if (updateFields.role && typeof updateFields.role === "string") {
            updateFields.role = updateFields.role;
        }

        if (req.files?.image) {
            updateFields.image = req.files.image[0].filename;
        }

        const technician = await Technician.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        );

        if (!technician) {
            return res.status(404).json({ message: "Technician not found" });
        }

        res.status(200).json({
            message: "Technician updated successfully",
            data: technician
        });

    } catch (err) {
        next(err);
    }
};

exports.deleteTechnician = async (req, res, next) => {
    const { id } = req.body;
    try {
        const technicianDelete = await Technician.findByIdAndDelete(id);
        await UserLog.create({
            userId: req.user.id,
            log: `Deleted Technician ${technicianDelete.firstName} ${technicianDelete.lastName}`,
            status: "Deleted",
            role: "admin",
            logo: "/assets/remove-user.webp",
            time: new Date()
        });
        res.status(200).json({
            message: "Deleted successfully"
        })
    } catch (err) {
        next(err);
    }
}

exports.profile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(404).json({
                message: 'user not found'
            })
        }
        const technicianData = await Technician.findById(userId)
            .populate("role");
        res.status(200).json({
            data: technicianData
        })
    } catch (err) {
        next(err);
    }
}

exports.technicianList = async (req, res, next) => {
    try {
        const technicianList = await Technician.find()
            .populate("role");
        res.status(200).json({
            data: technicianList
        })
    } catch (err) {
        next(err);
    }
}

exports.setUserStatus = async (req, res, next) => {
    const { id, status } = req.body;
    try {
        const techician = await Technician.findByIdAndUpdate(id, { status: status }, { new: true });
        if (!techician) {
            return res.status(404).json({ message: "techician not found" });
        }
        res.status(200).json({
            message: "techician status updated",
            data: techician
        });
    } catch (err) {
        next(err);
    }
};

exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            })
        }

        const technician = await Technician.findOne({
            email: email
        })

        if (!technician) {
            return res.status(404).json({
                message: "No account found with this email"
            });
        }

        if (technician.status !== true) {
            return res.status(400).json({
                message: "Account not active"
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        technician.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex")

        technician.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

        await technician.save();

        const resetUrl = `${config.frontend}/technician/reset-password/${resetToken}`;

        const html = technicianResetPasswordTemplate({
            name: technician.firstName,
            resetUrl
        });

        await sendMail({
            to: technician.email,
            subject: "Reset Your Password",
            html
        });

        res.status(200).json({
            message: "Password reset link sent to email"
        });

    } catch (err) {
        next(err)
    }
}

exports.resetPassword = async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;
    try {
        if (!token || !password) {
            return res.status(400).json({
                message: "Token and new password are required"
            });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex")

        const technician = await Technician.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!technician) {
            return res.status(400).json({
                message: "Reset token is invalid or expired"
            });
        }

        technician.password = await bcrypt.hash(password, 10);
        technician.resetPasswordToken = null;
        technician.resetPasswordExpires = null;

        await technician.save();

        await UserLog.create({
            userId: technician._id,
            log: "Password reset successfully",
            status: "Password reset",
            role: "technician",
            logo: "/assets/reset-password.webp",
            time: new Date()
        })

        res.status(200).json({
            message: "Password reset successful"
        });
    } catch (err) {
        next(err)
    }
}

exports.logout = async (req, res, next) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "user id needed"
            })
        }
        await Technician.findByIdAndUpdate(
            userId,
            { $set: { fcmToken: "" } },
            { new: true }
        )
        await UserLog.create({
            userId: userId,
            log: 'Logout',
            status: "Logged out successfully",
            role: "technician",
            logo: "/assets/logout.webp",
            time: new Date()
        });
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (err) {
        next(err)
    }
}

exports.deleteTechnicianThemself = async (req, res, next) => {
    try {
        const { reasonId } = req.body;
        if (!reasonId) {
            return res.status(400).json({
                success: false,
                message: "Reason required"
            })
        }
        const userId = req.user.id;
        const userData = await Technician.findById(userId);
        await UserLog.create({
            userId: userId,
            log: `${userData.firstName} - Deleted their account`,
            status: "Account Deleted",
            role: "technician",
            logo: "/assets/disabled.webp",
            time: new Date()
        });
        await Technician.findByIdAndDelete(userId);
        await DeletedAccounts.create({
            reasonId: reasonId,
            role: "Technician",
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email
        });
        res.status(200).json({
            success: true,
            message: "Deleted successfully"
        })
    } catch (err) {
        next(err)
    }
}