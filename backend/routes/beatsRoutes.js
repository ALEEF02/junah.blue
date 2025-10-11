import { Router } from "express";
const router = Router();
import multer from "multer";
import {
    downloadBeatFile,
    getBeatFileUrl,
    listBeatFiles
} from "../services/supabaseService.js";

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'audio/wav' || file.originalname.endsWith('.wav')) {
            cb(null, true);
        } else {
            cb(new Error('Only .wav files are allowed'));
        }
    }
});

// GET /beats/file/:fileName - Retrieve a specific file from storage
router.get('/file/:fileName', async (req, res) => {
    try {
        const { fileName } = req.params;

        const result = await downloadBeatFile(fileName);

        if (!result.success) {
            return res.status(404).json({ error: result.error });
        }

        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(result.data);

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /beats/url/:fileName - Get public URL for a file
router.get('/url/:fileName', async (req, res) => {
    try {
        const { fileName } = req.params;

        const result = await getBeatFileUrl(fileName);

        if (!result.success) {
            return res.status(500).json({ error: result.error });
        }

        res.status(200).json(result.data);

    } catch (error) {
        console.error('URL retrieval error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /beats/list - List all files in the storage bucket
router.get('/list', async (_req, res) => {
    try {
        const result = await listBeatFiles();

        if (!result.success) {
            return res.status(500).json({ error: result.error });
        }

        res.status(200).json({
            files: result.data
        });

    } catch (error) {
        console.error('List error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;