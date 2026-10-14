const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

function authenticate(req, res, next) {
  // Client token ko request ke Authorization header mein bhejta hai.
  // Sahi format: Authorization: Bearer yahan_token_aayega
  const authorization = req.headers.authorization;

  // Header ya Bearer prefix nahi mila to user ki identity verify nahi ho sakti.
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token bhejo: Authorization: Bearer <token>",
    });
  }

  // 'Bearer ' ke baad wala actual token nikaal rahe hain.
  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token khaali hai",
    });
  }

  try {
    // jwt.verify signature check karta hai aur expiry bhi check karta hai.
    // Sirf jwt.decode() use mat karna, kyunki decode token ko verify nahi karta.
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Login ke waqt user ki MongoDB ID token ke sub field mein daali thi.
    // ID valid nahi hai to request ko aage nahi bhejenge.
    if (typeof payload.sub !== "string" || !mongoose.isValidObjectId(payload.sub)) {
      return res.status(401).json({
        success: false,
        message: "Token mein valid user ID nahi hai",
      });
    }

    // Express req.user khud nahi banata. Verified user ID hum attach kar rahe hain.
    // Ab agla middleware/route req.user.id se logged-in user ko pehchaan sakta hai.
    req.user = { id: payload.sub };

    // next() request ko agle middleware ya route handler tak bhejta hai.
    return next();
  } catch (error) {
    // Galat signature, tootaa hua token ya expired token is catch mein aayega.
    return res.status(401).json({
      success: false,
      message: "Token galat hai ya expire ho chuka hai",
    });
  }
}

module.exports = authenticate;
