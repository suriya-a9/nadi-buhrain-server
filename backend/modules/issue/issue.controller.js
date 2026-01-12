const Issue = require('./issue.model');
const UserLog = require("../userLogs/userLogs.model");

exports.addIssue = async (req, res, next) => {
    const { serviceId, issue } = req.body;
    try {
        const addIssue = await Issue.create({
            serviceId,
            issue
        })
        await UserLog.create({
            userId: req.user.id,
            log: `Created ${addIssue.issue} issue to list`,
            status: "Created",
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
        const issueList = await Issue.find();
        res.status(200).json({
            data: issueList
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
            log: `Updated ${issueUpdate.issue} issue to list`,
            status: "Updated",
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
            log: `Deleted ${issueDelete.issue} issue from list`,
            status: "Deleted",
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