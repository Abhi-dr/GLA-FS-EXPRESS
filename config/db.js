const mongoose = require("mongoose");

async function connectDB() {
  // MONGO_URI .env se aata hai. mongoose.connect() Atlas ke saath connection banata hai.
  // await ka matlab: connection complete hone tak neeche wali line par mat jao.
  await mongoose.connect(process.env.MONGO_URI);

  console.log("MongoDB se connection ho gaya");
}

// Is function ko server.js mein import karke call kar sakte hain.
module.exports = connectDB;
