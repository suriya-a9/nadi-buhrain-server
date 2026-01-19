const Technician = require('../technician/technician.model');
const UserAccount = require('../../userAccount/userAccount.model');
const UserService = require('../../user/userService/userService.model');
const RequestPointsAdmin = require("../../requests/requestAdmin.model");

exports.dashboardCharts = async (req, res, next) => {
    try {
        const technicianCounts = await Technician.countDocuments();
        const userAccountCounts = await UserAccount.countDocuments({ accountVerification: 'verified' });
        const userServiceCounts = await UserService.countDocuments();
        res.status(200).json({
            technicianCounts: technicianCounts,
            userAccountCounts: userAccountCounts,
            userServiceCounts: userServiceCounts
        })
    } catch (err) {
        next(err)
    }
}

exports.totalCounts = async (req, res, next) => {
    try {
        const technicians = await Technician.find();
        const users = await UserAccount.find({ accountVerification: "verified" });
        const points = await RequestPointsAdmin.find();
        const serviceRequests = await UserService.find();
        res.status(200).json({
            success: true,
            message: "success",
            technicians: technicians,
            users: users,
            serviceRequests: serviceRequests,
            points: points
        })
    } catch (err) {
        next(err)
    }
}