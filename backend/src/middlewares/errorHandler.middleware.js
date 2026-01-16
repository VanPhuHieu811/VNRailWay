export const errorHandler = (err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again later.'
  });
};