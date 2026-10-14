// .env file ki values process.env mein load hoti hain.
// Is line ko sabse pehle rakha hai taaki baaki files ko environment variables mil sakein.
require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");

// Alag files mein likhe routes aur middleware ko import kar rahe hain.
const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Client JSON bhejega to Express us JSON ko JavaScript object mein convert karega.
// Iske bina req.body mein JSON data nahi milega.
app.use(express.json({ limit: "20kb" }));

// Basic check: browser mein http://localhost:3000 kholkar dekh sakte hain ki server chal raha hai.
// Ye endpoint sirf server ka response check karta hai, database ka nahi.
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
  });
});

// Router ke andar /register path hai, isliye yahan /api/auth prefix lagane par
// final URL POST /api/auth/register ban jaata hai.
app.use("/api/auth", authRoutes);

// Isi tarah tasks router ke andar ke paths /api/tasks se shuru honge.
app.use("/api/tasks", taskRoutes);

// Middleware ka order important hai:
// Pehle routes ko request handle karne ka mauka milta hai.
// Koi route match na ho to notFound chalega.
// Route mein error aaye to errorHandler usse handle karega.
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  // Server start karne se pehle check kar rahe hain ki zaroori settings maujood hain.
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI missing hai. .env file banao aur MongoDB URL daalo.");
  }

  // JWT_SECRET token sign aur verify karne ke kaam aata hai.
  // Chhota ya missing secret rakhne ke bajay yahin startup rok denge.
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET mein kam se kam 32 characters hone chahiye.");
  }

  // Pehle database connect hoga. Connection fail hua to server requests lena shuru nahi karega.
  await connectDB();

  const port = Number(process.env.PORT) || 3000;

  app.listen(port, () => {
    console.log(`API http://localhost:${port} par chal rahi hai`);
  });
}

// Startup mein koi error aaye to use terminal mein dikhao aur process band karo.
startServer().catch((error) => {
  console.error("Server start nahi hua:", error.message);
  process.exit(1);
});
