const Loading = require("./loading.model");
const fs = require("fs");
const path = require("path");
const UserLog = require("../../userLogs/userLogs.model");

exports.uploadLoadingScreen = async (req, res, next) => {
  try {
    const imageFile = req.files?.image?.[0];
    const videoFile = req.files?.video?.[0];

    if (!imageFile && !videoFile) {
      return res.status(400).json({
        message: "Upload either an image or a video",
      });
    }

    if (imageFile && videoFile) {
      return res.status(400).json({
        message: "Upload only one: image OR video",
      });
    }

    const saved = await Loading.create({
      image: imageFile ? imageFile.filename : null,
      video: videoFile ? videoFile.filename : null,
    });

    await UserLog.create({
      userId: req.user.id,
      log: "Loading content added",
      status: "Created",
      logo: "/assets/loading.webp",
      time: new Date(),
    });

    res.status(201).json({
      message: "Uploaded successfully",
      type: imageFile ? "image" : "video",
      data: saved,
    });
  } catch (err) {
    next(err);
  }
};

exports.loadingScreen = async (req, res, next) => {
  try {
    const loadingData = await Loading.find({ enabled: true });

    if (!loadingData.length) {
      return res.status(200).json({ data: null });
    }

    res.status(200).json({
      data: loadingData
    });
  } catch (err) {
    next(err);
  }
};

const uploadFolder = path.join(process.cwd(), "uploads");

exports.updateLoadingScreen = async (req, res, next) => {
  try {
    const { id } = req.body;
    const imageFile = req.files?.image?.[0];
    const videoFile = req.files?.video?.[0];

    if (!id) return res.status(400).json({ message: "ID required" });
    if (!imageFile && !videoFile)
      return res.status(400).json({ message: "Upload image or video" });
    if (imageFile && videoFile)
      return res.status(400).json({ message: "Only one allowed" });

    const loading = await Loading.findById(id);
    if (!loading) return res.status(404).json({ message: "Not found" });

    const uploadFolder = path.join(process.cwd(), "uploads");

    const oldFile = loading.image || loading.video;
    if (oldFile) {
      const p = path.join(uploadFolder, oldFile);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }

    loading.image = imageFile ? imageFile.filename : null;
    loading.video = videoFile ? videoFile.filename : null;

    await loading.save();

    res.json({ message: "Updated", data: loading });
  } catch (err) {
    next(err);
  }
};

exports.deleteLoadingScreen = async (req, res, next) => {
  try {
    const { id } = req.body;

    const loadingItem = await Loading.findById(id);
    if (!loadingItem) {
      return res.status(404).json({ message: "Not found" });
    }

    const uploadFolder = path.join(process.cwd(), "uploads");
    const fileToDelete = loadingItem.image || loadingItem.video;

    if (fileToDelete) {
      const filePath = path.join(uploadFolder, fileToDelete);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await loadingItem.deleteOne();

    await UserLog.create({
      userId: req.user.id,
      log: "Loading content deleted",
      status: "Deleted",
      logo: "/assets/loading.webp",
      time: new Date(),
    });

    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    next(err);
  }
};

exports.listAllLoadingScreens = async (req, res, next) => {
  try {
    const loadingData = await Loading.find();
    res.status(200).json({ data: loadingData });
  } catch (err) {
    next(err);
  }
};

exports.setLoadingScreenEnabled = async (req, res, next) => {
  try {
    const { id, enabled } = req.body;

    if (!id || typeof enabled !== "boolean") {
      return res.status(400).json({
        message: "ID and enabled(boolean) required",
      });
    }

    if (enabled === true) {
      const alreadyEnabled = await Loading.findOne({
        enabled: true,
        _id: { $ne: id },
      });

      if (alreadyEnabled) {
        return res.status(409).json({
          message: "Another loading screen is already enabled. Disable it first.",
        });
      }
    }

    const loadingItem = await Loading.findByIdAndUpdate(
      id,
      { enabled },
      { new: true }
    );

    if (!loadingItem) {
      return res.status(404).json({
        message: "Loading screen not found",
      });
    }

    res.status(200).json({
      message: enabled ? "Loading screen enabled" : "Loading screen disabled",
      data: loadingItem,
    });
  } catch (err) {
    next(err);
  }
};