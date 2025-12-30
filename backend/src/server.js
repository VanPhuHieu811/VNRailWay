import app from './app.js';
import authRoutes from './routes/auth.route.js';
import { getPool } from './config/sqlserver.config.js';

const PORT = process.env.PORT;

app.use('/api/v1/auth', authRoutes);

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
