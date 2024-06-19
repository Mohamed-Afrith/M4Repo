const jwt = require("jsonwebtoken");
const authenticateUser = async (req, res, next) => {
  if (
    req.path === "/admin/login" ||
    req.path === "/admin/signup" ||
    req.path === "/mail/remainder" ||
    req.path === "/mail/learnerAdded/:id" ||
    req.path === "/gamereview/addblockreview" ||
    req.path.startsWith("/game/tryout/") ||
    // req.path.startsWith("/game/tryout/preview") ||
    req.path.startsWith("/preview/logs")
  ) {
    return next();
  }
  
  if (!req.headers.authorization) {
    return res
      .status(401)
      .json({
        status: "unAuthorized",
        message: "Unauthorized: Missing Authorization header",
      });
  }
  const length = req.headers.authorization.split(" ").length;
  const token = req.headers.authorization.split(" ")[length - 1];

  try {
    jwt.verify(token, process.env.PRIVATE_KEY, function (err, decoded) {
      req.user = decoded;
      return next();
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "Unauthorized",
        message: "Invalid token",
      });
    } else if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "Unauthorized",
        message: "Token expired",
      });
    } else {
      return res.status(500).json({
        status: "Authentication Failure",
        message: "Cannot verify the token",
      });
    }
  }
};

module.exports = { authenticateUser };
