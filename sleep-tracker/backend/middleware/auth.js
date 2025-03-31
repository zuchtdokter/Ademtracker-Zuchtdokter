const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: "Please authenticate." });
  }
};

const isTherapist = async (req, res, next) => {
  if (req.user.role !== "therapist") {
    return res.status(403).json({ error: "Access denied. Therapist only." });
  }
  next();
};

module.exports = { auth, isTherapist };
