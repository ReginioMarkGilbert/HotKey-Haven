import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI as string)
   .then(() => {
      console.log('Connected to MongoDB');
      // Start server after successful database connection
      app.listen(port, () => {
         console.log(`Server is running on port ${port}`);
      });
   })
   .catch((error) => {
      console.error('MongoDB connection error:', error);
      process.exit(1);
   });