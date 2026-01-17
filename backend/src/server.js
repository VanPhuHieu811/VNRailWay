import app from './app.js';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';

// train route
import tripRoutes from './routes/trip.route.js';
import routeRoutes from './routes/route.route.js';
import trainRoutes from './routes/train.route.js';
import priceRoutes from './routes/price.route.js';
import ticketRoutes from './routes/ticket.routes.js'

// promotion route
import promotionRoutes from './routes/promotion.route.js';

import { errorHandler } from './middlewares/errorHandler.middleware.js';
import staffRoutes from './routes/staff.route.js';
import adminRoutes from './routes/admin.route.js';
import customerRoutes from './routes/customer.route.js';
import masterRoutes from './routes/master.route.js';

import { getPool } from './config/sqlserver.config.js';

import reportRoutes from './routes/report.route.js';
const PORT = process.env.PORT || 3000;

// Authorization
app.use('/api/v1/auth', authRoutes);

// User
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/admin', adminRoutes);      
app.use('/api/v1/schedules', customerRoutes);
app.use('/api/v1/master', masterRoutes);
app.use('/api/v1/customers', customerRoutes);

// Train, route, trip
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/routes', routeRoutes);
app.use('/api/v1/trains', trainRoutes);

//tiket
app.use('/api/v1/tickets', ticketRoutes);

// price
app.use('/api/v1/prices', priceRoutes);
app.use('/api/v1/promotions', promotionRoutes);

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