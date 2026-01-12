const Admin = require('./admin.model');
const jwt = require('jsonwebtoken');
const config = require('../../config/default');
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const UserLog = require("../userLogs/userLogs.model");
const resetPasswordTemplate = require("../../template/resetPassword.template");
const sendMail = require("../../utils/mailer");

exports.adminRegister = async (req, res, next) => {
    const { name, email, password, role } = req.body;
    try {
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: "Email is already registered"
            });
        }
        if (!email || !name || !password) {
            return res.status(400).json({ success: false, message: "All details required" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const adminData = await Admin.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            data: adminData
        });
    } catch (err) {
        next(err);
    }
};

exports.adminLogin = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password required" });
        }

        const admin = await Admin.findOne({ email }).populate('role');
        if (!admin) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        const permissions = admin.role?.permissions || [];
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: admin._id, email: admin.email, name: admin.name, name: admin.role.name, role: admin.role.name, permissions },
            config.jwt,
            { expiresIn: "1d" }
        );
        await UserLog.create({
            userId: admin._id,
            log: "Signed In",
            status: "Logged",
            logo: "/assets/user-login-logo.webp",
            time: new Date()
        });
        res.status(200).json({ success: true, message: "Logged in", token, name: admin.role.name, role: admin.role.name, permissions });
    } catch (err) {
        next(err);
    }
};

exports.listAdmins = async (req, res, next) => {
    try {
        const admins = await Admin.find().select("-password").populate("role", "name");
        res.json({ success: true, data: admins });
    } catch (err) {
        next(err);
    }
};

exports.updateAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, role, password } = req.body;

        const updateData = { name, role };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedAdmin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        res.json({ success: true, message: "Admin updated", data: updatedAdmin });
    } catch (err) {
        next(err);
    }
};

exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        admin.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        admin.resetPasswordExpires = Date.now() + 2 * 60 * 1000;
        await admin.save();

        const resetUrl = `${config.frontend}/reset-password/${resetToken}`;

        const html = resetPasswordTemplate({
            name: admin.name,
            resetUrl,
        });

        await sendMail({
            to: admin.email,
            subject: "Reset Your Admin Password",
            html,
        });

        res.json({ success: true, message: "Reset link sent to email" });
    } catch (err) {
        next(err);
    }
};

exports.resetPassword = async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const hashedToken = require("crypto")
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const admin = await Admin.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!admin) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }

        admin.password = await bcrypt.hash(password, 10);
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;

        await admin.save();
        res.json({ success: true, message: "Password reset successful" });
    } catch (err) {
        next(err);
    }
};

exports.deleteAdminUser = async (req, res, next) => {
    const { id } = req.body;
    try {
        if (!req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'user id needed'
            })
        }
        const adminUser = await Admin.findByIdAndDelete(id);
        if (!adminUser) {
            return res.status(404).json({
                success: false,
                message: 'user not found'
            })
        }
        res.status(200).json({
            success: true,
            message: "Admin user deleted"
        })
        await UserLog.create({
            userId: req.user.id,
            log: "Deleted admin user",
            status: "Deleted",
            logo: "/assets/user-login-logo.webp",
            time: new Date()
        });
    } catch (err) {
        next(err)
    }
}

exports.detail = async (req, res, next) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(403).json({
                success: false,
                message: "user id needed"
            })
        }
        const userDetail = await Admin.findById(userId)
            .populate("role");
        res.status(200).json({
            success: true,
            data: userDetail
        })
    } catch (err) {
        next(err)
    }
}