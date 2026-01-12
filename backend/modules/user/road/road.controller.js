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
    const roadList = await Road.find();
    res.status(200).json({
      data: roadList,
    });
  } catch (err) {
    next(err);
  }
};


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