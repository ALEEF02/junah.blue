import express from 'express';
const app = express();
import configRoutes from './routes/index.js';

app.use(express.json());

configRoutes(app);

app.listen(3001, () => {
    console.log('Server started on http://localhost:3001');
});