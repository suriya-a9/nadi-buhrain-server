const Terms = require('./terms.model');
const UserLog = require("../../userLogs/userLogs.model");

exports.addTerms = async (req, res, next) => {
    const { content_en, content_ar } = req.body;
    try {
        const termsContent = await Terms.create({
            content_en,
            content_ar
        })
        await UserLog.create({
            userId: req.user.id,
            log: `Created terms and condition`,
            status: "Created",
            role: "admin",
            logo: "/assets/terms-and-conditions.webp",
            time: new Date()
        });
        res.status(201).json({
            message: 'Terms and conditions added',
            data: termsContent,
        })
    } catch (err) {
        next(err);
    }
}

exports.listTerms = async (req, res, next) => {
    try {
        const lang = req.query.lang || "en";
        const termsList = await Terms.find({ enabled: true });
        const data = termsList.map(item => {
            const obj = item.toObject();
            obj.content = lang === "ar" ? obj.content_ar : obj.content_en;
            delete obj.content_en;
            delete obj.content_ar;
            return obj;
        });
        res.status(200).json({
            data
        })
    } catch (err) {
        next(err);
    }
}

exports.updateTerms = async (req, res, next) => {
    const { id, ...updateFields } = req.body;
    try {
        const termsUpdate = await Terms.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        )
        await UserLog.create({
            userId: req.user.id,
            log: `Updated terms and condition`,
            status: "Updated",
            role: "admin",
            logo: "/assets/terms-and-conditions.webp",
            time: new Date()
        });
        res.status(200).json({
            message: "Updated successfully",
            data: termsUpdate
        })
    } catch (err) {
        next(err);
    }
}

exports.deleteTerms = async (req, res, next) => {
    const { id } = req.body;
    try {
        await Terms.findByIdAndDelete(id);
        await UserLog.create({
            userId: req.user.id,
            log: `Deleted terms and condition`,
            status: "Deleted",
            role: "admin",
            logo: "/assets/terms-and-conditions.webp",
            time: new Date()
        });
        res.status(200).json({
            message: 'Deleted successfully'
        })
    } catch (err) {
        next(err)
    }
}

exports.listAllTermsAndCondition = async (req, res, next) => {
    try {
        const termsData = await Terms.find();
        res.status(200).json({ data: termsData });
    } catch (err) {
        next(err);
    }
};

exports.setTermsEnabled = async (req, res, next) => {
    const { id, enabled } = req.body;
    try {
        if (!id || typeof enabled !== "boolean") {
            return res.status(400).json({ message: "ID and enabled(boolean) required" });
        }
        const terms = await Terms.findByIdAndUpdate(id, { enabled }, { new: true });
        if (!terms) {
            return res.status(404).json({ message: "Terms and condition not found" });
        }
        await UserLog.create({
            userId: req.user.id,
            log: `Set terms and condition ${enabled ? "enabled" : "disabled"}`,
            status: enabled ? "Enabled" : "Disabled",
            role: "admin",
            logo: "/assets/terms-and-conditions.webp",
            time: new Date()
        });
        res.status(200).json({ message: "Status updated", data: terms });
    } catch (err) {
        next(err);
    }
};