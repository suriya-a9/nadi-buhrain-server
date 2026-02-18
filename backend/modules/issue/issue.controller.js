const Issue = require('./issue.model');
const UserLog = require("../userLogs/userLogs.model");

exports.addIssue = async (req, res, next) => {
    const { serviceId, issue_ar, issue_en } = req.body;
    try {
        const addIssue = await Issue.create({
            serviceId,
            issue_en,
            issue_ar
        })
        await UserLog.create({
            userId: req.user.id,
            log: `Created issue to list`,
            status: "Created",
            role: "admin",
            logo: "/assets/verification.webp",
            time: new Date()
        });
        res.status(201).json({
            message: 'Issue created',
            data: addIssue
        })
    } catch (err) {
        next(err)
    }
}

exports.listIssue = async (req, res, next) => {
    try {
        const lang = req.query.lang || "en";
        const issueList = await Issue.find().populate('serviceId');
        const data = issueList.map(item => {
            const obj = item.toObject();
            obj.issue = lang === "ar" ? obj.issue_ar : obj.issue_en;
            obj.serviceName = obj.serviceId
                ? (lang === "ar" ? obj.serviceId.name_ar : obj.serviceId.name_en)
                : "";
            obj.serviceId = obj.serviceId ? obj.serviceId._id : null;
            delete obj.issue_en;
            delete obj.issue_ar;
            return obj;
        });
        res.status(200).json({
            data
        })
    } catch (err) {
        next(err)
    }
}

exports.listIssueForAdmin = async (req, res, next) => {
    try {
        const issueList = await Issue.find().populate('serviceId');
        const data = issueList.map(item => {
            const obj = item.toObject();
            obj.serviceName = obj.serviceId
                ? obj.serviceId.name_en
                : "";
            obj.serviceId = obj.serviceId ? obj.serviceId._id : null;
            return obj;
        });
        res.status(200).json({
            data
        })
    } catch (err) {
        next(err)
    }
}

exports.updateIssue = async (req, res, next) => {
    const { id, ...updateFields } = req.body;
    try {
        const issueUpdate = await Issue.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        )
        await UserLog.create({
            userId: req.user.id,
            log: `Updated ${issueUpdate.issue_en} issue to list`,
            status: "Updated",
            role: "admin",
            logo: "/assets/verification.webp",
            time: new Date()
        });
        res.status(200).json({
            message: "updated successfully"
        })
    } catch (err) {
        next(err)
    }
}

exports.deleteIssue = async (req, res, next) => {
    const { id } = req.body;
    try {
        const issueDelete = await Issue.findByIdAndDelete(id);
        await UserLog.create({
            userId: req.user.id,
            log: `Deleted ${issueDelete.issue_en} issue from list`,
            status: "Deleted",
            role: "admin",
            logo: "/assets/verification.webp",
            time: new Date()
        });
        res.status(200).json({
            message: 'deleted successfully'
        })
    } catch (err) {
        next(err)
    }
}