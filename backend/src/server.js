import app from './app.js';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
// New! train-related
import tripRoutes from './routes/trip.route.js';
import routeRoutes from './routes/route.route.js';
import trainRoutes from './routes/train.route.js';

import { getPool } from './config/sqlserver.config.js';

const PORT = process.env.PORT;

// Middleware
app.use('/api/v1/auth', authRoutes);

// User Routes
app.use('/api/v1/users', userRoutes);

// New! Train Routes
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/routes', routeRoutes);
app.use('/api/v1/trains', trainRoutes);

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
