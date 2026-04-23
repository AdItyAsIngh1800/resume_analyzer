import { Router } from 'express';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import Resume from '../models/Resume.js';
import AnalysisResult from '../models/AnalysisResult.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { analyzeResume } from '../services/gemini.js';

const router = Router();

const FREE_ANALYSIS_LIMIT = 3;

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

// GET /api/resumes/:id  — get single resume
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json({ resume });
  } catch (err) {
    next(err);
  }
});

// POST /api/resumes/:id/analyze  — run Gemini analysis on uploaded resume
router.post('/:id/analyze', requireAuth, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Check if already analyzed
    const existingAnalysis = await AnalysisResult.findOne({ resumeId: resume._id });
    if (existingAnalysis) {
      return res.status(409).json({
        error: 'This resume has already been analyzed',
        analysisId: existingAnalysis._id,
      });
    }

    // Enforce free-tier limit
    const user = await User.findById(req.user._id);
    if (user.plan === 'free' && user.analysisCount >= FREE_ANALYSIS_LIMIT) {
      return res.status(403).json({
        error: `Free plan allows ${FREE_ANALYSIS_LIMIT} analyses. Upgrade to Pro for unlimited.`,
      });
    }

    if (!resume.extractedText) {
      return res.status(422).json({ error: 'Resume has no extracted text to analyze' });
    }

    // Run all 3 Gemini analyses in parallel
    let analysisData;
    try {
      analysisData = await analyzeResume(resume.extractedText);
    } catch (err) {
      // Mark resume as errored so user can retry
      resume.status = 'error';
      resume.errorMessage = err.message || 'Gemini API call failed';
      await resume.save();
      return res.status(502).json({
        error: 'Analysis failed — please try again later',
        detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }

    // Save analysis result
    const analysis = await AnalysisResult.create({
      resumeId: resume._id,
      userId: req.user._id,
      ...analysisData,
    });

    // Mark resume as analyzed
    resume.status = 'analyzed';
    await resume.save();

    // Increment user's analysis count
    await User.findByIdAndUpdate(req.user._id, { $inc: { analysisCount: 1 } });

    res.status(201).json({
      analysisId: analysis._id,
      resumeId: resume._id,
      atsScore: analysis.atsScore,
      skillsCount: analysis.skills.length,
      missingSkillsCount: analysis.missingSkills.length,
      processingTimeMs: analysis.processingTimeMs,
      status: 'analyzed',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/resumes/:id/analysis  — retrieve analysis results
router.get('/:id/analysis', requireAuth, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const analysis = await AnalysisResult.findOne({ resumeId: resume._id });
    if (!analysis) {
      return res.status(404).json({ error: 'No analysis found for this resume — run POST /analyze first' });
    }

    res.json({ analysis });
  } catch (err) {
    next(err);
  }
});

// GET /api/resumes/:id/matches  — find matching jobs based on extracted skills
router.get('/:id/matches', requireAuth, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const analysis = await AnalysisResult.findOne({ resumeId: resume._id });
    if (!analysis) {
      return res.status(400).json({ error: 'Resume has not been analyzed yet. Run analysis first.' });
    }

    if (!analysis.skills || analysis.skills.length === 0) {
      return res.json({ matches: [] }); // No skills extracted
    }

    const { findMatchingJobs } = await import('../services/jobMatcher.js');
    const matches = await findMatchingJobs(analysis.skills);

    // Return top 10 matches
    res.json({ matches: matches.slice(0, 10) });
  } catch (err) {
    next(err);
  }
});

// GET /api/resumes/:id/report  — download PDF report of the analysis
router.get('/:id/report', requireAuth, async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const analysis = await AnalysisResult.findOne({ resumeId: resume._id });
    if (!analysis) {
      return res.status(400).json({ error: 'Resume has not been analyzed yet. Run analysis first.' });
    }

    const { generateReportStream } = await import('../services/reportGenerator.js');
    
    // Create the PDF doc stream
    const doc = generateReportStream(analysis, resume.fileName);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Analysis-Report-${resume.fileName}.pdf"`);

    // Pipe the document directly to the response
    doc.pipe(res);
  } catch (err) {
    next(err);
  }
});

export default router;
