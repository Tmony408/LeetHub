const User = require("../Models/User");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// To confirm if user is logged in
const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  if (req?.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    try {
      if (token) {
        let decoded;
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
          console.log(error);
          return res
            .status(401)
            .json({ success: false, message: "User not authenticated. Login" });
        }
        const user = await User.findById(decoded?.id);
        if (!user)
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        req.user = user;
        // to check if user is locked out
        if (user.isLockedOut !== false) {
          return res.status(403).json({
            success: false,
            message:
              "Your account has been locked. Please contact support for assistance."
          });
        } else {
          next(); // Call next only if the user is not locked out
        }
      } else {
        return res.status(401).json({
          success: false,
          message: "Not authorized, Token does not exist"
        });
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "internal server Error" });
    }
  } else {
    res.status(401).json({
      success: false,
      message: "There is no attached token to header"
    });
  }
});

// To confirm if user is Admin
const isAdmin = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  try {
    const adminUser = await User.findById(_id);
    if (adminUser.role.toLowerCase() !== "admin") {
      res.status(403).json({
        success: false,
        message: "Admin Access only"
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "internal server Error" });
  }
});

module.exports = { authMiddleware, isAdmin };
