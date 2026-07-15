import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import rentalRoutes from './routes/rentalRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/reviews', reviewRoutes);

// Server health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Express backend is online',
    database: 'Checking connection...'
  });
});

// Root welcome message
app.get('/', (req, res) => {
  res.status(200).send('Welcome to the Rent Nest / NextKey Backend API Server! Visit /api/health for server status.');
});

async function startServer() {
  try {
    // Attempt database connection on startup
    await connectToDatabase();
  } catch (err: any) {
    console.error('DATABASE CONNECTION WARNING: Server starting but MongoDB is unreachable.', err.message);
  }
  
  app.listen(PORT, () => {
    console.log(`[NextKey Backend Server Configured Successfully]`);
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
