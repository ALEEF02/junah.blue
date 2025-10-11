import testRoutes from './testRoutes.js';
import beatsRoutes from './beatsRoutes.js'

const configRoutes = (app) => {
  app.use('/api/test', testRoutes);
  app.use('/api/beats', beatsRoutes)

  app.use((req, res) => {
    res.status(404).json({ error: 'Route Not found' });
  });
}

export default configRoutes;