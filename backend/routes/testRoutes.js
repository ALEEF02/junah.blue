import { Router } from "express";
const router = Router();

router.get('/', (req, res) => {
    res.json({
        message: 'Test route working!',
        timestamp: new Date().toISOString(),
        status: 'success'
    });
});

router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

router.post('/echo', (req, res) => {
    res.json({
        message: 'Echo endpoint',
        receivedData: req.body,
        timestamp: new Date().toISOString()
    });
});

export default router;