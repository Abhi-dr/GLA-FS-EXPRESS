function errorHandler(err, req, res, next) {
  // Agar response bhejna shuru ho chuka hai to Express ko error aage handle karne do.
  if (res.headersSent) {
    return next(err);
  }

  // Puri error details terminal mein dekho; client ko stack trace mat bhejo.
  console.error(err);

  // MongoDB mein unique field duplicate hone par error code 11000 milta hai.
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Ye value pehle se maujood hai",
    });
  }

  // Mongoose schema ke required, minlength, enum jaise rules fail hue.
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Data validation fail hui",
      errors: details,
    });
  }

  // MongoDB ID ya field ki value expected format mein nahi hai.
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "ID ya field value valid nahi hai",
    });
  }

  // express.json() ko invalid JSON mila, jaise missing comma ya extra quote.
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Request body mein JSON galat hai",
    });
  }

  // Agar error ka status diya gaya hai to use lo, warna 500 (server error).
  const status = Number(err.statusCode || err.status) || 500;

  return res.status(status).json({
    success: false,
    message: status >= 500 ? "Server mein kuch galat ho gaya" : err.message,
  });
}

module.exports = errorHandler;
