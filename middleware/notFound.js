// Ye middleware tab chalega jab upar koi bhi route request ko handle nahi karega.
function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route nahi mila: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = notFound;
