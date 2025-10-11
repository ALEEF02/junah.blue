import express from 'express';
import dotenv from 'dotenv';
import { testConnection } from './dbConfig/supabase.js';
import configRoutes from './routes/index.js';

dotenv.config();

const app = express();

app.use(express.json());

configRoutes(app);

testConnection();

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://localhost:${PORT}`);
});