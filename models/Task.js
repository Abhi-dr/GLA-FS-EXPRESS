const mongoose = require("mongoose");

// Har task mein kaunse fields honge, ye schema define karta hai.
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task ka title zaroori hai"],
      trim: true,
      maxlength: [150, "Title 150 characters se bada nahi ho sakta"],
    },

    description: {
      type: String,
      default: "", // Description na bheji ho to khaali string save hogi.
      maxlength: [2000, "Description 2000 characters se badi nahi ho sakti"],
    },

    status: {
      type: String,
      // In teen values ke alawa koi status save nahi hona chahiye.
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },

    owner: {
      // Har task ke saath us user ki MongoDB ID save hogi jisne task banaya.
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Ye ID User model ke document ko refer karti hai.
      required: true,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt aur updatedAt automatic milenge.
  }
);

// User ke tasks ko latest-first nikaalne wali query ko efficient banane mein madad karta hai.
taskSchema.index({ owner: 1, createdAt: -1 });

// Task model ke through tasks collection ko read/create/update/delete karenge.
module.exports = mongoose.model("Task", taskSchema);
