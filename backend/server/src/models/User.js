const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    currentSocketId: {
    type: String,
    default: null,
  }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);