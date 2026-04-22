import { Router } from 'express';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import Resume from '../models/Resume.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter(_req, file, cb) {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    cb(new Error('Only PDF files are accepted'));
  },
});

// POST /api/resumes/upload
router.post('/upload', requireAuth, (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err?.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File exceeds 5 MB limit' });
    }
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let extractedText = '';
    try {
      const parsed = await pdfParse(req.file.buffer);
      extractedText = parsed.text?.trim() ?? '';
    } catch {
      return res.status(422).json({ error: 'Could not parse PDF — file may be corrupted or scanned' });
    }

    if (!extractedText) {
      return res.status(422).json({ error: 'No readable text found in PDF — try a text-based PDF' });
    }

    const resume = await Resume.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      extractedText,
    });

    res.status(201).json({
      resumeId: resume._id,
      fileName: resume.fileName,
      fileSize: resume.fileSize,
      characterCount: extractedText.length,
      status: resume.status,
      createdAt: resume.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/resumes  — list current user's resumes
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select('-extractedText')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ resumes });
  } catch (err) {
    next(err);
  }
});

// GET /api/resumes/:id  — get single resume (no extracted text by default)
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json({ resume });
  } catch (err) {
    next(err);
  }
});

export default router;
