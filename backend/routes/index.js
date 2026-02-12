import authRoutes from './authRoutes.js';
import publicRoutes from './publicRoutes.js';
import ownerRoutes from './ownerRoutes.js';

const configRoutes = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/public', publicRoutes);
  app.use('/api/owner', ownerRoutes);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
};

export default configRoutes;
