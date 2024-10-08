const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const studentSchema = new Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  phone: { type: Number, required: true, unique: true, trim: true },
  linkedinUrl: { type: String, required: true, default: "" },

  languages: {
    type: String,
    enum: [
      "English",
      "Spanish",
      "French",
      "German",
      "Portuguese",
      "Dutch",
      "Other",
    ],
    program: {
      type: String,
      enum: ["Web Dev", "UX/UI", "Data Analytics", "Cybersecurity"],
    },
  },
  background: { type: String, default: "" },

  image: {
    type: String,
    default: "https://i.imgur.com/r8bo8u7.png",
  },
  cohort: { default: {} },
  projects: { enum: [] },
});
const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
