const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
});

const User = model("User", userSchema);

module.exports = User;
