import app from './app.js';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import staffRoutes from './routes/staff.route.js';
import adminRoutes from './routes/admin.route.js';

import { getPool } from './config/sqlserver.config.js';

const PORT = process.env.PORT || 3000;

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/admin', adminRoutes);      


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