const Road = require("./road.model");
const UserLog = require("../../userLogs/userLogs.model");

exports.addRoad = async (req, res, next) => {
  const { name } = req.body;
  try {
    const roadData = await Road.create({
      name,
    });
    await UserLog.create({
      userId: req.user.id,
      log: `${roadData.name} added`,
      status: "Created",
      role: "admin",
      logo: "/assets/road.webp",
      time: new Date()
    });
    res.status(201).json({
      message: "Created successfully",
      data: roadData,
    });
  } catch (err) {
    next(err);
  }
};

exports.listRoad = async (req, res, next) => {
  try {
    const roadList = await Road.find({ status: true });
    res.status(200).json({
      data: roadList,
    });
  } catch (err) {
    next(err);
  }
};

exports.listAdmin = async (req, res, next) => {
  try {
    const listData = await Road.find();
    res.status(200).json({
      data: listData,
    });
  } catch (err) {
    next(err)
  }
}

exports.updateRoad = async (req, res, next) => {
  const { id, ...updateFields } = req.body;
  try {
    const updateRoad = await Road.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    )
    await UserLog.create({
      userId: req.user.id,
      log: `${updateRoad.name} updated`,
      status: "Updated",
      role: "admin",
      logo: "/assets/road.webp",
      time: new Date()
    });
    res.status(200).json({
      message: 'updated successfully',
      data: updateRoad
    })
  } catch (err) {
    next(err);
  }
}

exports.deleteRoad = async (req, res, next) => {
  const { id } = req.body;
  try {
    const roadData = await Road.findByIdAndDelete(id);
    await UserLog.create({
      userId: req.user.id,
      log: `${roadData.name} deleted`,
      status: "Deleted",
      role: "admin",
      logo: "/assets/road.webp",
      time: new Date()
    });
    res.status(200).json({
      message: 'Deleted successfully'
    })
  } catch (err) {
    next(err)
  }
}

exports.statusToggle = async (req, res, next) => {
  const { roadId, status } = req.body;
  try {
    const road = await Road.findById(roadId);
    if (!road) {
      return res.status(404).json({
        success: false,
        message: "road not found"
      })
    }
    road.status = status;
    await road.save();
    await UserLog.create({
      userId: req.user.id,
      log: `${road.name} status updated`,
      status: "Updated",
      role: "admin",
      logo: "/assets/road.webp",
      time: new Date()
    });
    res.status(200).json({
      success: true,
      message: "road status updated"
    })
  } catch (err) {
    next(err)
  }
}