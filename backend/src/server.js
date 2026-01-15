import app from './app.js';
import { poolPromise } from './config/db.js'; // Đảm bảo là /config/ (số ít)
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import staffRoutes from './routes/staff.route.js';
import { getPool } from './config/sqlserver.config.js';
const PORT = process.env.PORT || 5000;

poolPromise
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Server failed to start:', err.message);
    process.exit(1); 
  });



app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/staff', staffRoutes);

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  // Test database connection
  try {
    await getPool();
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
});
