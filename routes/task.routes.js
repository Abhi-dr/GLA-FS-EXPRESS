const express = require("express");
const mongoose = require("mongoose");

const Task = require("../models/Task");
const authenticate = require("../middleware/auth");

const router = express.Router();

// Is router ke neeche aane wali HAR route par pehle JWT check hoga.
// Token valid hua to authenticate middleware next() chalayega.
router.use(authenticate);

// URL se mila :id valid MongoDB ObjectId hai ya nahi, ye check karo.
function validateTaskId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Task ID valid nahi hai",
    });
  }

  // ID valid hai, ab actual route handler chalao.
  next();
}

// CREATE: POST /api/tasks
router.post("/", async (req, res) => {
  const { title, description } = req.body || {};

  // Title string hona chahiye, khaali nahi hona chahiye aur limit ke andar hona chahiye.
  if (
    typeof title !== "string" ||
    !title.trim() ||
    title.trim().length > 150
  ) {
    return res.status(400).json({
      success: false,
      message: "Title zaroori hai aur 150 characters se bada nahi ho sakta",
    });
  }

  // Description optional hai, lekin bheji ho to string aur limit ke andar honi chahiye.
  if (
    description !== undefined &&
    (typeof description !== "string" || description.length > 2000)
  ) {
    return res.status(400).json({
      success: false,
      message: "Description 2000 characters tak ki string honi chahiye",
    });
  }

  // owner client ke body se nahi le rahe.
  // Logged-in user ki ID verified JWT se req.user.id mein aayi hai.
  const task = await Task.create({
    title: title.trim(),
    description: description ?? "",
    owner: req.user.id,
  });

  return res.status(201).json({
    success: true,
    task,
  });
});

// READ ALL: GET /api/tasks
router.get("/", async (req, res) => {
  // Sirf logged-in user ke tasks lao; doosre users ke tasks nahi.
  // sort() mein createdAt: -1 ka matlab newest task pehle.
  const tasks = await Task.find({ owner: req.user.id })
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: tasks.length,
    tasks,
  });
});

// READ ONE: GET /api/tasks/:id
router.get("/:id", validateTaskId, async (req, res) => {
  // ID aur owner dono match hone chahiye.
  // Sirf valid token hone ka matlab ye nahi ki user har task dekh sakta hai.
  const task = await Task.findOne({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!task) {
    // Task exist na kare ya kisi aur ka ho, dono cases mein same response.
    return res.status(404).json({
      success: false,
      message: "Task nahi mila",
    });
  }

  return res.status(200).json({
    success: true,
    task,
  });
});

// UPDATE: PATCH /api/tasks/:id
// PATCH ka use tab karte hain jab poora document nahi, kuch fields update karni hon.
router.patch("/:id", validateTaskId, async (req, res) => {
  const { title, description, status } = req.body || {};
  const updates = {};

  // Sirf in fields ko update karne denge; req.body ko seedha database mein mat bhejo.
  if (title !== undefined) {
    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.trim().length > 150
    ) {
      return res.status(400).json({
        success: false,
        message: "Title valid nahi hai",
      });
    }

    updates.title = title.trim();
  }

  if (description !== undefined) {
    if (typeof description !== "string" || description.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Description 2000 characters tak ki string honi chahiye",
      });
    }

    updates.description = description;
  }

  if (status !== undefined) {
    // Enum mein di hui teen values mein se hi ek status allow hai.
    if (!["pending", "in-progress", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status pending, in-progress ya completed hona chahiye",
      });
    }

    updates.status = status;
  }

  // Koi allowed field hi nahi bheji to update karne ke liye kuch nahi hai.
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: "Update karne ke liye title, description ya status bhejo",
    });
  }

  const task = await Task.findOneAndUpdate(
    // Ek hi query mein task ID aur owner dono check hote hain.
    {
      _id: req.params.id,
      owner: req.user.id,
    },
    // $set sirf updates object ke fields ko change karta hai.
    { $set: updates },
    {
      new: true,          // Update ke baad wala document return karo.
      runValidators: true // Update par bhi schema ke validators chalao.
    }
  );

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task nahi mila",
    });
  }

  return res.status(200).json({
    success: true,
    task,
  });
});

// DELETE: DELETE /api/tasks/:id
router.delete("/:id", validateTaskId, async (req, res) => {
  // Sirf wahi task delete hoga jo is user ka hai.
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    owner: req.user.id,
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task nahi mila",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Task delete ho gaya",
  });
});

module.exports = router;
