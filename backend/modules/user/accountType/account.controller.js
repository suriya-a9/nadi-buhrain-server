const Account = require("./account.model");
const UserLog = require("../../userLogs/userLogs.model");

exports.addAccountType = async (req, res, next) => {
  const { name, type } = req.body;
  try {
    const accountTypeData = await Account.create({ name, type });
    await UserLog.create({
      userId: req.user.id,
      log: `Account type - ${accountTypeData.name} added`,
      status: "Created",
      logo: "/assets/account-type.webp",
      time: new Date()
    });
    res.status(201).json({
      message: "Account type created",
      data: accountTypeData,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateAccountType = async (req, res, next) => {
  const { id, ...updateFields } = req.body;
  try {
    const updateAccount = await Account.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    )
    await UserLog.create({
      userId: req.user.id,
      log: `Account type - ${updateAccount.name} Updated`,
      status: "Updated",
      logo: "/assets/account-type.webp",
      time: new Date()
    });
    res.status(200).json({
      message: 'Updated successfully',
      data: updateAccount
    })
  } catch (err) {
    next(err);
  }
}

exports.listAccountType = async (req, res, next) => {
  try {
    const accountTypeList = await Account.find();
    res.status(200).json({
      data: accountTypeList
    })
  } catch (err) {
    next(err);
  }
}

exports.deleteAccountType = async (req, res, next) => {
  const { id } = req.body;
  try {
    const accountTypeDelete = await Account.findByIdAndDelete(id);
    await UserLog.create({
      userId: req.user.id,
      log: `Account type - ${accountTypeDelete.name} Deleted`,
      status: "Deleted",
      logo: "/assets/account-type.webp",
      time: new Date()
    });
    res.status(200).json({
      message: 'Deleted successfully'
    })
  } catch (err) {
    next(err);
  }
}