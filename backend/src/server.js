import app from './app.js';
import { poolPromise } from './config/db.js'; // Đảm bảo là /config/ (số ít)

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