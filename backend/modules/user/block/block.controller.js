const Block = require("./block.model");
const Road = require("../road/road.model");
const UserLog = require("../../userLogs/userLogs.model");

exports.addBlock = async (req, res, next) => {
  const { roads, name } = req.body;
  try {
    const blockData = await Block.create({
      roads,
      name,
    });
    await UserLog.create({
      userId: req.user.id,
      log: `Block - ${blockData.name} created`,
      status: "Created",
      role: "admin",
      logo: "/assets/apartment.webp",
      time: new Date()
    });
    res.status(201).json({
      message: "Created successfully",
      data: blockData,
    });
  } catch (err) {
    next(err);
  }
};

exports.listBlockWithRoads = async (req, res) => {
  try {
    const data = await Block.find({ status: true }).populate({
      path: "roads",
      match: { status: true }
    });
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listForAdmin = async (req, res) => {
  try {
    const data = await Block.find().populate("roads");
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.updateBlock = async (req, res, next) => {
  const { id, ...updateFields } = req.body;
  try {
    const blockData = await Block.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );
    await UserLog.create({
      userId: req.user.id,
      log: `Block - ${blockData.name} updated`,
      status: "Updated",
      role: "admin",
      logo: "/assets/apartment.webp",
      time: new Date()
    });
    res.status(200).json({
      message: "Updated successfully",
      data: blockData
    })
  } catch (err) {
    next(err)
  }
}

exports.deleteBlock = async (req, res, next) => {
  const { id } = req.body;
  try {
    const blockData = await Block.findByIdAndDelete(id);
    await UserLog.create({
      userId: req.user.id,
      log: `Block - ${blockData.name} Deleted`,
      status: "Deleted",
      role: "admin",
      logo: "/assets/apartment.webp",
      time: new Date()
    });
    res.status(200).json({
      message: "Deleted successfully"
    })
  } catch (err) {
    next(err)
  }
}
exports.statusToggle = async (req, res, next) => {
  const { blockId, status } = req.body;
  try {
    const block = await Block.findById(blockId);
    if (!block) {
      return res.status(404).json({
        success: false,
        message: 'block not found'
      })
    }
    block.status = status;
    await block.save();
    await UserLog.create({
      userId: req.user.id,
      log: `Block - ${block.name} status updated`,
      status: "Updated",
      role: "admin",
      logo: "/assets/apartment.webp",
      time: new Date()
    });
    res.status(200).json({
      success: true,
      message: "status updated"
    })
  } catch (err) {
    next(err)
  }
}