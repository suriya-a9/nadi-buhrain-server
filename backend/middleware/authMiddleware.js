const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.status(400).json({
      message: "no headers",
    });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(400).json({
      message: "no token",
    });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "server error", error: err.message });
    }
    req.user = decoded;
    next();
  });
};