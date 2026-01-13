import express from 'express';
import cors from 'cors';
// Import Route vừa tạo
import bookingRoutes from './routes/booking.route.js'; 
import ticketRoutes from './routes/ticket.route.js';

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiV1Router = express.Router();

apiV1Router.use('/booking', bookingRoutes); // -> /api/v1/booking/dat-ve-demo
apiV1Router.use('/tickets', ticketRoutes);  // -> /api/v1/tickets/{code}

app.use('/api/v1', apiV1Router);

export default app;
