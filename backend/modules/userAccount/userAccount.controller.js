const UserAccount = require('./userAccount.model');
const FamilyMember = require('./familyMember.model');
const Account = require('../user/accountType/account.model');
const Otp = require('../otp/otp.model');
const Address = require('../address/address.model');
const UserService = require("../user/userService/userService.model")
const config = require('../../config/default');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Notification = require('../adminPanel/notification/notification.model');
const sendPushNotification = require("../../utils/sendPush");
const UserLog = require('../userLogs/userLogs.model');
const crypto = require("crypto");
const sendMail = require("../../utils/mailer");
const userResetPasswordTemplate = require("../../template/userResetPasswordTemplate");

exports.startSignUp = async (req, res, next) => {
    const { accountTypeId } = req.body;
    try {
        if (!accountTypeId) {
            return res.status(400).json({
                message: "Account type must be selected"
            })
        }
        const newUser = await UserAccount.create({
            accountTypeId
        })
        res.status(201).json({
            message: "User created",
            userId: newUser._id
        })
    } catch (err) {
        next(err)
    }
}

exports.saveBasicInfo = async (req, res, next) => {
    const { userId, fullName, mobileNumber, email, gender, password, isVerfied } = req.body;
    try {
        const existingUser = await UserAccount.findOne({
            _id: { $ne: userId },
            status: "completed",
            $or: [
                { "basicInfo.mobileNumber": mobileNumber },
                { "basicInfo.email": email }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Account already registered"
            });
        }
        const user = await UserAccount.findById(userId);
        const hashedPassword = await bcrypt.hash(password, 10)
        const addBasicInfo = await UserAccount.findByIdAndUpdate(user, {
            basicInfo: {
                fullName,
                mobileNumber,
                email,
                gender,
                password: hashedPassword
            },
            step: 2,
            ...(isVerfied ? { isVerfied: true } : {})
        })
        res.status(200).json({
            name: fullName,
            mobile: mobileNumber,
            email: email,
            gender: gender,
            message: "Basic info saved",
        })
    } catch (err) {
        next(err)
    }
}

exports.saveAddress = async (req, res, next) => {
    const { userId, address } = req.body;
    try {
        if (!req.body.userId) {
            return res.status(400).json({
                message: "user id needed"
            })
        }
        await Address.create({
            userId,
            ...address
        });

        await UserAccount.findByIdAndUpdate(userId, { step: 3 });
        res.status(200).json({
            message: 'Address saved'
        })
    } catch (err) {
        next(err)
    }
}

exports.sendOtp = async (req, res, next) => {
    const { userId } = req.body;

    try {
        if (!userId) {
            return res.status(400).json({ message: "user id needed" });
        }

        const user = await UserAccount.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        await Otp.create({
            userId,
            otp,
            expiresAt: Date.now() + 1 * 60 * 1000,
        });

        await UserAccount.findByIdAndUpdate(userId, {
            step: 4,
            status: "pending_otp"
        });

        await sendPushNotification(
            user.fcmToken,
            "OTP Verification",
            `Your OTP is ${otp}`
        );

        res.json({ message: "OTP sent", otp: otp });

    } catch (err) {
        next(err);
    }
};

exports.verifyOtp = async (req, res, next) => {
    const { userId, otp } = req.body;
    try {
        if (!req.body.userId) {
            res.status(400).json({
                message: "user id needed"
            })
        }
        const record = await Otp.findOne({ userId }).sort({ createdAt: -1 });

        if (!record) {
            return res.status(400).json({ message: "OTP not found" });
        }

        if (new Date(record.expiresAt).getTime() < Date.now()) {
            await Otp.deleteMany({ userId });
            return res.status(400).json({ message: "OTP expired" });
        }

        if (record.otp !== otp) {
            return res.status(400).json({ message: "OTP mismatch" });
        }
        await Otp.deleteMany({ userId });
        await UserAccount.findByIdAndUpdate(userId, {
            isVerfied: true,
            step: 5
        })
        res.status(200).json({ message: "OTP verified successfully" });
    } catch (err) {
        next(err);
    }
}

exports.uploadIdProof = async (req, res, next) => {
    const { userId } = req.body;
    try {
        if (!req.body.userId) {
            res.status(400).json({
                message: "user id needed"
            })
        }
        const fileNames = req.files.map(file => file.filename);
        await UserAccount.findByIdAndUpdate(userId, {
            idProofUrl: fileNames,
            step: 6
        });
        res.status(200).json({ message: "ID proof(s) uploaded" });
    } catch (err) {
        next(err);
    }
}

exports.addFamilyMember = async (req, res, next) => {
    const {
        userId,
        familyCount,
        password,
        fullName,
        relation,
        mobile,
        email,
        gender,
        address
    } = req.body;
    try {
        if (!userId) {
            return res.status(400).json({ message: "user id needed" });
        }
        const existingUser = await UserAccount.findOne({
            $or: [
                { "basicInfo.mobileNumber": mobile },
                { "basicInfo.email": email }
            ]
        });

        const existingFamily = await FamilyMember.findOne({
            $or: [
                { mobile },
                { email }
            ]
        });

        if (existingUser || existingFamily) {
            return res.status(400).json({ message: "Mobile number or email already registered" });
        }

        const addressDoc = await Address.create({
            ...address
        });

        const hashedPassword = await bcrypt.hash(password, 10);
        const member = await FamilyMember.create({
            userId,
            fullName,
            relation,
            mobile,
            email,
            password: hashedPassword,
            gender,
            addressId: addressDoc._id
        });

        const user = await UserAccount.findById(userId);
        if (familyCount) {
            user.familyCount = familyCount;
        }
        user.familyMembersAdded += 1;
        await user.save();
        const isComplete = user.familyMembersAdded === user.familyCount;
        res.status(201).json({
            message: 'Family member added',
            allMemebersAdded: isComplete,
            data: member
        });
    } catch (err) {
        next(err);
    }
};

exports.termsAndConditionVerify = async (req, res, next) => {
    const { userId, fcmToken } = req.body;
    try {
        if (!req.body.userId) {
            res.status(400).json({
                message: "user id needed"
            })
        }
        await UserAccount.findByIdAndUpdate(userId, {
            termsVerfied: true,
            ...(fcmToken && { fcmToken })
        });
        res.status(200).json({
            message: "verified successfully"
        })
    } catch (err) {
        next(err)
    }
}

exports.completeSignUp = async (req, res, next) => {
    const { userId, isVerfied } = req.body;
    try {
        const user = await UserAccount.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (isVerfied) {
            user.isVerfied = true;
            user.accountVerification = "verified";
            await user.save();
        }
        if (!user.isVerfied) {
            return res.status(400).json({ message: "OTP not verified" });
        }
        if (!user.idProofUrl) {
            return res.status(400).json({ message: "Upload ID proof first" });
        }
        const account = await Account.findById(user.accountTypeId);
        if (!account) {
            return res.status(400).json({ message: "Invalid account type" });
        }
        if (account.type === "FA") {
            if (user.familyMembersAdded !== user.familyCount) {
                return res.status(400).json({
                    message: "Please add all family members before completing signup"
                });
            }
        }
        if (!user.termsVerfied) {
            return res.status(400).json({ message: "need to accept terms and condition" });
        }
        const familyMembers = await FamilyMember.find({ userId });
        for (const member of familyMembers) {
            const existing = await UserAccount.findOne({ "basicInfo.mobileNumber": member.mobile });
            if (existing) continue;
            const newFamilyUser = await UserAccount.create({
                accountTypeId: user.accountTypeId,
                basicInfo: {
                    fullName: member.fullName,
                    mobileNumber: member.mobile,
                    email: member.email,
                    gender: member.gender,
                    password: member.password
                },
                isVerfied: true,
                termsVerfied: true,
                status: "completed",
                singnUpCompleted: true,
                isFamilyMember: true,
                familyOwnerId: user._id,
                familyMemberRef: member._id
            });
            if (member.addressId) {
                await Address.findByIdAndUpdate(member.addressId, { userId: newFamilyUser._id }, { new: true });
            }
            await FamilyMember.findByIdAndUpdate(member._id, { linkedUserId: newFamilyUser._id }, { new: true });
        }
        user.accountStatus = true;
        user.status = "completed";
        user.singnUpCompleted = true;
        await user.save();
        const notification = await Notification.create({
            type: 'signup',
            message: `New user registered: ${user.basicInfo.fullName}`,
            userId: user._id,
            time: new Date(),
            read: false
        });
        await UserLog.create({
            userId: user._id,
            log: "Account created",
            status: "New Account",
            logo: "/assets/user-creation.webp",
            time: new Date()
        })
        const io = req.app.get('io');
        io.emit('notification', notification);
        const token = jwt.sign(
            { id: user._id },
            config.jwt,
            { expiresIn: '30d' }
        );
        res.status(200).json({
            message: 'user registered successfully',
            data: user,
            token: token,
            accountType: account ? account.type : null
        })
    } catch (err) {
        next(err);
    }
}

exports.userprofile = async (req, res, next) => {
    const { userId } = req.body;
    try {
        if (!userId) {
            return res.status(400).json({
                message: 'user id needed'
            });
        }

        const userProfile = await UserAccount.findById(userId);
        const addresses = await Address.find({ userId });
        const familyMembers = await FamilyMember.find({ userId });

        if (!userProfile) {
            return res.status(404).json({
                message: 'user not found'
            });
        }

        res.status(200).json({
            data: userProfile,
            addresses,
            familyMembers
        });
    } catch (err) {
        next(err);
    }
}

exports.signIn = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await UserAccount.findOne({ "basicInfo.email": email });
        if (!user) {
            return res.status(404).json({
                message: 'No account found with this email'
            });
        }
        if (user.status !== "completed") {
            return res.status(401).json({
                message: 'Account not created. Kindly register'
            })
        }
        if (user.accountStatus !== true) {
            return res.status(401).json({
                message: 'Account disabled'
            })
        }
        const passwordCheck = await bcrypt.compare(password, user.basicInfo.password);
        if (!passwordCheck) {
            return res.status(401).json({
                message: 'Password mismatch'
            });
        }
        const accountType = await Account.findById(user.accountTypeId);

        const token = jwt.sign(
            { id: user._id },
            config.jwt,
            { expiresIn: '30d' }
        );
        await UserLog.create({
            userId: user._id,
            log: 'Signed In',
            status: "Signed In",
            logo: "/assets/user-login-logo.webp",
            time: new Date()
        })
        res.status(200).json({
            userId: user._id,
            name: user.basicInfo.fullName,
            token: token,
            accountType: accountType ? accountType.type : null
        });
    } catch (err) {
        next(err);
    }
}

exports.sendSignInOtp = async (req, res, next) => {
    const { mobileNumber, fcmToken } = req.body;
    try {
        if (!mobileNumber) {
            return res.status(400).json({ message: "Mobile number required" });
        }
        const user = await UserAccount.findOne({ "basicInfo.mobileNumber": mobileNumber });
        if (!user) {
            return res.status(404).json({ message: "No account found with this mobile number" });
        }
        if (user.status !== "completed") {
            return res.status(401).json({ message: "Account not created. Kindly register" });
        }
        if (user.accountStatus !== true) {
            return res.status(401).json({ message: "Account disabled" });
        }

        let tokenToUse = user.fcmToken;
        if (fcmToken) {
            user.fcmToken = fcmToken;
            await user.save();
            tokenToUse = fcmToken;
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        await Otp.create({
            userId: user._id,
            otp,
            expiresAt: Date.now() + 2 * 60 * 1000,
        });

        await sendPushNotification(
            tokenToUse,
            "OTP Verification",
            `Your OTP is ${otp}. Valid for 1 minute.`,
            { otp }
        );

        res.json({
            success: true,
            otp,
            message: "OTP sent"
        });
    } catch (err) {
        next(err);
    }
};

exports.signInWithOtp = async (req, res, next) => {
    const { mobileNumber, otp } = req.body;
    try {
        if (!mobileNumber || !otp) {
            return res.status(400).json({ message: "Mobile number and OTP required" });
        }
        const user = await UserAccount.findOne({ "basicInfo.mobileNumber": mobileNumber });
        if (!user) {
            return res.status(404).json({ message: "No account found with this mobile number" });
        }
        if (user.status !== "completed") {
            return res.status(401).json({ message: "Account not created. Kindly register" });
        }
        if (user.accountStatus !== true) {
            return res.status(401).json({ message: "Account disabled" });
        }
        const record = await Otp.findOne({ userId: user._id }).sort({ createdAt: -1 });
        if (!record) {
            return res.status(400).json({ message: "OTP not found" });
        }
        if (new Date(record.expiresAt).getTime() < Date.now()) {
            await Otp.deleteMany({ userId: user._id });
            return res.status(400).json({ message: "OTP expired" });
        }
        if (record.otp !== otp) {
            return res.status(400).json({ message: "OTP mismatch" });
        }
        await Otp.deleteMany({ userId: user._id });
        const accountType = await Account.findById(user.accountTypeId);
        const token = jwt.sign(
            { id: user._id },
            config.jwt,
            { expiresIn: '30d' }
        );
        await UserLog.create({
            userId: user._id,
            log: 'Signed In with OTP',
            status: "Signed In",
            logo: "/assets/user-login-logo.webp",
            time: new Date()
        });
        res.status(200).json({
            message: "Signed in successfully",
            userId: user._id,
            name: user.basicInfo.fullName,
            token: token,
            accountType: accountType ? accountType.type : null
        });
    } catch (err) {
        next(err);
    }
}

exports.updateBasicInfoAndAddress = async (req, res, next) => {
    let { userId, basicInfo, address, idProofUrl } = req.body;
    try {
        if (typeof basicInfo === "string") basicInfo = JSON.parse(basicInfo);
        if (typeof address === "string") address = JSON.parse(address);
        if (typeof idProofUrl === "string") idProofUrl = JSON.parse(idProofUrl);

        if (req.files && req.files.length > 0) {
            idProofUrl = req.files.map(file => file.filename);
        }

        let updatedFields = [];

        if (basicInfo) {
            const updateBasic = {};
            for (const key in basicInfo) {
                if (key === "password") {
                    updateBasic["basicInfo.password"] =
                        await bcrypt.hash(basicInfo.password, 10);
                    updatedFields.push("password");
                } else {
                    updateBasic[`basicInfo.${key}`] = basicInfo[key];
                    updatedFields.push(key);
                }
            }
            await UserAccount.findByIdAndUpdate(
                userId,
                { $set: updateBasic },
                { new: true }
            );
        }

        if (address) {
            const updateAddress = {};
            for (const key in address) {
                updateAddress[key] = address[key];
                updatedFields.push(`address.${key}`);
            }
            await Address.findOneAndUpdate(
                { userId },
                { $set: updateAddress },
                { new: true, upsert: true }
            );
        }

        if (idProofUrl) {
            await UserAccount.findByIdAndUpdate(
                userId,
                { idProofUrl },
                { new: true }
            );
            updatedFields.push("idProofUrl");
        }

        if (updatedFields.length > 0) {
            const logMessage = `Updated fields: ${updatedFields.join(", ")}`;
            await UserLog.create({
                userId,
                log: logMessage,
                status: "Signed In",
                logo: "/assets/update-profile.webp",
                time: new Date()
            });
        }
        await UserLog.create({
            userId: userId,
            log: 'Updated profile details',
            status: "Updated",
            logo: "/assets/user-login-logo.webp",
            time: new Date()
        })
        res.status(200).json({
            message: "Basic info, address, and ID proof updated successfully"
        });
    } catch (err) {
        next(err);
    }
};

exports.forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await UserAccount.findOne({ "basicInfo.email": email });

        if (!user) {
            return res.status(404).json({
                message: "No account found with this email"
            });
        }

        if (user.status !== "completed") {
            return res.status(400).json({
                message: "Account not active"
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        const resetUrl = `${config.frontend}/user/reset-password/${resetToken}`;

        const html = userResetPasswordTemplate({
            name: user.basicInfo.fullName,
            resetUrl
        });

        await sendMail({
            to: user.basicInfo.email,
            subject: "Reset Your Password",
            html
        });

        res.status(200).json({
            message: "Password reset link sent to email"
        });

    } catch (err) {
        next(err);
    }
};

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
            .digest("hex");

        const user = await UserAccount.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Reset token is invalid or expired"
            });
        }

        user.basicInfo.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        await UserLog.create({
            userId: user._id,
            log: "Password reset successfully",
            status: "Password Reset",
            logo: "/assets/reset-password.webp",
            time: new Date()
        });

        res.status(200).json({
            message: "Password reset successful"
        });

    } catch (err) {
        next(err);
    }
};

exports.deleteUser = async (req, res, next) => {
    const { id } = req.body;
    try {
        if (!id) {
            return res.status(400).json({ message: "User id required" });
        }

        await UserAccount.findByIdAndDelete(id);

        await Address.deleteMany({ userId: id });

        await UserService.deleteMany({ userId: id });


        res.status(200).json({ message: "User and related data deleted successfully" });
    } catch (err) {
        next(err);
    }
};