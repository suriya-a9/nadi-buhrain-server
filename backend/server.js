require("dotenv").config();
const express = require("express");
const app = express();
const config = require("./config/default");
const logger = require("./logger");
const connectDb = require("./config/db");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

const cron = require('node-cron');
const TechnicianUserService = require('./modules/adminPanel/userService/technicianUserService.model');
const UserService = require('./modules/user/userService/userService.model');
const Notification = require('./modules/adminPanel/notification/notification.model');

const serviceRouter = require("./modules/service/service.routes");
const adminRouter = require("./modules/admin/admin.routes");
const loadingRouter = require("./modules/user/loadingScreen/loading.routes");
const introRouter = require("./modules/user/introScreen/intro.routes");
const accountTypeRouter = require("./modules/user/accountType/account.routes");
const roadRouter = require("./modules/user/road/road.routes");
const blockRouter = require("./modules/user/block/block.routes");
const userAccountRouter = require("./modules/userAccount/userAccount.routes");
const termsRouter = require("./modules/adminPanel/termsAndCondition/terms.routes");
const accountVerificationRouter = require("./modules/adminPanel/accountVerification/accountVerification.routes");
const pointsRouter = require("./modules/adminPanel/points/points.routes");
const issueRouter = require("./modules/issue/issue.routes");
const userServiceRouter = require("./modules/user/userService/userService.routes");
const userServiceAdminSideRouter = require("./modules/adminPanel/userService/userServiceRoutes.routes");
const technicalSkillSetRouter = require("./modules/adminPanel/technicianSkillSet/technicianSkillSet.routes");
const technicianRouter = require("./modules/adminPanel/technician/technician.routes");
const technicianPanelRouter = require("./modules/technician/technician.routes");
const notificationRouter = require("./modules/adminPanel/notification/notification.routes");
const userNotificationRouter = require("./modules/adminPanel/notification/userNotification.routes");
const dashboardRouter = require('./modules/adminPanel/dashboard/dashboard.routes');
const inventoryRouter = require('./modules/adminPanel/inventory/inventory.routes');
const materialRequestRouter = require('./modules/adminPanel/materialRequest/materialRequest.routes');
const userLogRouter = require("./modules/userLogs/userLogs.routes");
const roleRouter = require("./modules/roles/role.routes");
const userDashboardRouter = require("./modules/user/dashboard/dashboard.routes");
const questionnaireRouter = require("./modules/adminPanel/Questionnaire/questionnaire.routes");
const aboutRouter = require("./modules/adminPanel/about/about.routes");
const privacyPolicyRouter = require("./modules/adminPanel/privacyPolicy/privacyPolicy.routes");
const helpAndSupport = require("./modules/adminPanel/helpAndSupport/helpAndSupport.routes.js");
const userSpareParts = require("./modules/adminPanel/spareParts/spareParts.routes.js");
const techNotificationRouter = require("./modules/adminPanel/notification/techNotification.routes.js");
const pointTransactionRouter = require("./modules/adminPanel/pointTransaction/pointTransaction.routes.js");

app.use(express.json());
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.originalUrl, req.headers.host, req.protocol, req.secure);
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/assets', express.static('assets'));

app.use(cors());
// app.use(helmet());
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  })
);
// app.set("trust proxy", 1);
app.set("trust proxy", true);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Request limit reached. Please try again later.",
});

app.use((req, res, next) => {
  if (req.path.startsWith("/socket.io")) return next();
  limiter(req, res, next);
});

connectDb();

app.use("/api/admin", adminRouter);
app.use("/api/user/loading", loadingRouter);
app.use("/api/service", serviceRouter);
app.use("/api/intro", introRouter);
app.use("/api/account-type", accountTypeRouter);
app.use("/api/road", roadRouter);
app.use("/api/block", blockRouter);
app.use("/api/user-account", userAccountRouter);
app.use("/api/account-verify", accountVerificationRouter);
app.use("/api/terms", termsRouter);
app.use("/api/points", pointsRouter);
app.use("/api/issue", issueRouter);
app.use("/api/user-service", userServiceRouter);
app.use("/api/user-service-list", userServiceAdminSideRouter);
app.use("/api/technical", technicalSkillSetRouter);
app.use("/api/technician", technicianRouter);
app.use("/api/techie", technicianPanelRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/userNotifications", userNotificationRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/material", materialRequestRouter);
app.use("/api/user-log", userLogRouter);
app.use("/api/role", roleRouter);
app.use("/api/userDashboard", userDashboardRouter);
app.use("/api/questionnaire", questionnaireRouter);
app.use("/api/about", aboutRouter);
app.use("/api/privacy", privacyPolicyRouter);
app.use("/api/help", helpAndSupport);
app.use("/api/spare", userSpareParts);
app.use("/api/techNotifications", techNotificationRouter);
app.use("/api/point-transaction", pointTransactionRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "internal server error",
  });
});

const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: [
      "https://srv1252888.hstgr.cloud",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ["polling", "websocket"]
});

app.set('io', io);

cron.schedule('*/5 * * * * *', async () => {
  const now = new Date();
  const inProgressTechServices = await TechnicianUserService.find({
    status: "in-progress",
    adminNotified: { $ne: true }
  });

  for (const techService of inProgressTechServices) {
    let totalSeconds = techService.workDuration || 0;
    if (techService.workStartedAt) {
      totalSeconds += Math.floor((now - techService.workStartedAt) / 1000);
    }
    if (totalSeconds >= 7200) {
      const userService = await UserService.findById(techService.userServiceId);
      await Notification.create({
        title: "Technician work exceeded 2 hours",
        message: `Service request ${userService?.serviceRequestID || techService.userServiceId} has exceeded 2 hours.`,
        type: "work_overdue"
      });
      techService.adminNotified = true;
      await techService.save();
    }
  }
});
const PORT = config.port
server.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server running on ${PORT} and 0.0.0.0`);
});