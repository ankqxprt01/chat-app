const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (token) => {
  try {
    if (!token) return null;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id);

    return user;
  } catch (error) {
    return null;
  }
};

module.exports = auth;