import fakeRoutes from './fake.js';

const configRoutes = (app) => {
  app.use('/fake', fakeRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: 'Route Not found' });
  });
}

export default configRoutes;