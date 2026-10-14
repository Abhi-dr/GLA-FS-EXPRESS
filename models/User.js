const mongoose = require("mongoose");

// Schema batata hai ki User document mein kaunse fields aur rules honge.
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Naam dena zaroori hai"],
      trim: true, // Shuru aur end ke extra spaces hata deta hai.
      minlength: [2, "Naam kam se kam 2 characters ka hona chahiye"],
      maxlength: [80, "Naam 80 characters se bada nahi ho sakta"],
    },

    email: {
      type: String,
      required: [true, "Email dena zaroori hai"],
      unique: true, // Database mein do users ka email same nahi ho sakta.
      lowercase: true, // Rahul@Example.com ko rahul@example.com bana deta hai.
      trim: true,
      maxlength: 254,
    },

    password: {
      type: String,
      required: [true, "Password hash dena zaroori hai"],
      // Normal queries mein password field nahi aayegi.
      // Login route mein .select("+password") laga kar ise maangte hain.
      select: false,
    },
  },
  {
    // Mongoose har document mein createdAt aur updatedAt khud add karega.
    timestamps: true,
  }
);

// Schema se User model banta hai. Isi model se users collection par queries karenge.
module.exports = mongoose.model("User", userSchema);
