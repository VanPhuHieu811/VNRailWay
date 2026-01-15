import app from './app.js';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
// New! train-related
import tripRoutes from './routes/trip.route.js';
import routeRoutes from './routes/route.route.js';
import trainRoutes from './routes/train.route.js';

import { errorHandler } from './middlewares/errorHandler.middleware.js';
import staffRoutes from './routes/staff.route.js';
import { getPool } from './config/sqlserver.config.js';

import reportRoutes from './routes/report.route.js'; 
const PORT = process.env.PORT || 3000;

// Authorization
app.use('/api/v1/auth', authRoutes);

// User
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/staff', staffRoutes);

// Train, route, trip
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/routes', routeRoutes);
app.use('/api/v1/trains', trainRoutes);

app.use('/api/v1/reports', reportRoutes);
// Global error handler
app.use(errorHandler);

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