const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

// POST /api/auth/register
// Naya account banane ke liye client name, email aur password bhejega.
router.post("/register", async (req, res) => {
  // req.body mein express.json() se parsed JSON data aata hai.
  const { name, email, password } = req.body || {};

  // Client ka data trust mat karo: pehle type aur basic rules check karo.
  // bcrypt password ke pehle 72 UTF-8 bytes hi use karta hai, isliye byte limit bhi check hai.
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    !name.trim() ||
    !email.trim() ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return res.status(400).json({
      success: false,
      message: "Name, email aur kam se kam 8 characters ka password do (maximum 72 UTF-8 bytes)",
    });
  }

  // Email ko trim aur lowercase kar rahe hain taaki same email ke alag letter-cases
  // se duplicate accounts na ban sakein.
  const normalizedEmail = email.trim().toLowerCase();

  // Pehle check kar lo ki email pehle se registered to nahi.
  // Database ka unique index bhi duplicate ko rokta hai.
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Ye email pehle se registered hai",
    });
  }

  // Raw password database mein kabhi save nahi karna.
  // bcrypt.hash password ko salt ke saath one-way hash mein badalta hai.
  const passwordHash = await bcrypt.hash(password, 12);

  // User document create hoga. 'password' field mein raw password nahi, hash save hoga.
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: passwordHash,
  });

  // Response mein password ya passwordHash kabhi return nahi karte.
  return res.status(201).json({
    success: true,
    message: "Account ban gaya",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

// POST /api/auth/login
// Existing account mein login karne ke liye email aur password verify honge.
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message: "Email aur password dono zaroori hain",
    });
  }

  // User schema password ko normal query se hide karta hai.
  // .select("+password") login ke liye hash ko explicitly query mein laata hai.
  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  }).select("+password");

  // Email galat ho ya password galat, same message bhejo.
  // Isse response se email ke registered hone ka pata nahi chalta.
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Email ya password galat hai",
    });
  }

  // Enter kiye password ko database ke hash se compare karte hain.
  // Password ko decrypt nahi kiya jaata; hash comparison hota hai.
  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    return res.status(401).json({
      success: false,
      message: "Email ya password galat hai",
    });
  }

  // Credentials sahi hain, ab signed JWT banao.
  // 'sub' (subject) mein user ki ID rakh rahe hain.
  // JWT encrypted nahi hota, isliye ismein password/secret mat rakhna.
  const token = jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
  );

  // Client agle protected requests mein is token ko Bearer token ke roop mein bhejega.
  return res.status(200).json({
    success: true,
    message: "Login ho gaya",
    token,
    tokenType: "Bearer",
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

module.exports = router;
