const UserAccount = require("../../userAccount/userAccount.model");
const UserService = require("../userService/userService.model");

exports.userDashboardDetails = async (req, res, next) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "user id needed"
            })
        }
        const userData = await UserAccount.findById(userId)
            .populate("accountTypeId");
        const dashboardData = {
            name: userData.basicInfo.fullName,
            points: userData.points ? userData.points : "0",
            account: userData.accountTypeId.name,
            image: userData.basicInfo.image,
        }
        res.status(200).json({
            success: true,
            message: "success",
            data: dashboardData
        })
    } catch (err) {
        next(err)
    }
}

exports.serviceOverview = async (req, res, next) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "user id needed"
            })
        }
        const serviceData = await UserService.find({ userId: userId });
        const serviceCompletedCount = serviceData.filter(s => s.serviceStatus === "completed").length;
        const servicePendingCount = serviceData.filter(s => s.serviceStatus === "submitted").length;
        const serviceProgressCount = serviceData.filter(s => s.serviceStatus === "inProgress").length;
        res.status(200).json({
            success: true,
            message: "success",
            data: {
                serviceCompletedCount,
                servicePendingCount,
                serviceProgressCount
            }
        })
    } catch (err) {
        next(err)
    }
}