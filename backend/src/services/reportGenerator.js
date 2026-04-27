import PDFDocument from 'pdfkit';

/**
 * Generates a PDF document for a given AnalysisResult.
 * Returns the PDFDocument stream which can be piped to an HTTP response or file.
 */
export function generateReportStream(analysis, resumeName = 'Resume') {
  const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });

  // ── Header ──────────────────────────────────────────────
  doc.fontSize(24).font('Helvetica-Bold').text('Resume Analysis Report', { align: 'center' });
  doc.fontSize(14).font('Helvetica').text(`Document: ${resumeName}`, { align: 'center' });
  doc.moveDown();

  doc.fontSize(16).fillColor(analysis.atsScore >= 80 ? 'green' : analysis.atsScore >= 60 ? 'orange' : 'red')
    .text(`Overall ATS Score: ${analysis.atsScore} / 100`, { align: 'center' });
  
  doc.fillColor('black');
  doc.moveDown(2);

  // ── Summary ─────────────────────────────────────────────
  doc.fontSize(18).font('Helvetica-Bold').text('Executive Summary', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica').text(analysis.overallSummary || 'No summary available.', { align: 'justify' });
  doc.moveDown(1.5);

  // ── Strengths ───────────────────────────────────────────
  doc.fontSize(18).font('Helvetica-Bold').text('Key Strengths', { underline: true });
  doc.moveDown(0.5);
  if (analysis.strengths && analysis.strengths.length > 0) {
    analysis.strengths.forEach((s) => {
      doc.fontSize(12).font('Helvetica').text(`• ${s}`);
      doc.moveDown(0.2);
    });
  } else {
    doc.fontSize(12).font('Helvetica-Oblique').text('No strengths identified.');
  }
  doc.moveDown(1);

  // ── Weaknesses ──────────────────────────────────────────
  doc.fontSize(18).font('Helvetica-Bold').text('Areas for Improvement', { underline: true });
  doc.moveDown(0.5);
  if (analysis.weaknesses && analysis.weaknesses.length > 0) {
    analysis.weaknesses.forEach((w) => {
      doc.fontSize(12).font('Helvetica').text(`• ${w}`);
      doc.moveDown(0.2);
    });
  } else {
    doc.fontSize(12).font('Helvetica-Oblique').text('No weaknesses identified.');
  }
  doc.moveDown(1);

  // ── Actionable Improvements ──────────────────────────────
  doc.moveDown(2);
  doc.fontSize(18).font('Helvetica-Bold').text('Actionable Improvements', { underline: true });
  doc.moveDown(1);
  
  if (analysis.improvements && analysis.improvements.length > 0) {
    analysis.improvements.forEach((imp) => {
      // Impact label
      const impactColor = imp.impact === 'high' ? 'red' : imp.impact === 'medium' ? 'orange' : 'green';
      doc.fontSize(12).font('Helvetica-Bold').fillColor(impactColor).text(`[${imp.impact.toUpperCase()}] `, { continued: true });
      doc.fillColor('black').text(imp.area);
      
      // Suggestion
      doc.fontSize(12).font('Helvetica').text(imp.suggestion);
      doc.moveDown(0.8);
    });
  } else {
    doc.fontSize(12).font('Helvetica-Oblique').text('No actionable improvements suggested.');
  }
  doc.moveDown(1);

  // ── Extracted Skills ─────────────────────────────────────
  doc.fontSize(18).font('Helvetica-Bold').text('Extracted Skills', { underline: true });
  doc.moveDown(0.5);
  if (analysis.skills && analysis.skills.length > 0) {
    // Group skills by category
    const skillsByCategory = analysis.skills.reduce((acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    }, {});

    Object.keys(skillsByCategory).forEach((category) => {
      const formattedCategory = category.replace('_', ' ').toUpperCase();
      doc.fontSize(14).font('Helvetica-Bold').text(formattedCategory);
      
      const skillText = skillsByCategory[category]
        .map(s => `${s.name} (${s.proficiency})`)
        .join(', ');
        
      doc.fontSize(12).font('Helvetica').text(skillText);
      doc.moveDown(0.5);
    });
  } else {
    doc.fontSize(12).font('Helvetica-Oblique').text('No technical skills extracted.');
  }
  doc.moveDown(1);

  // ── Missing Skills ───────────────────────────────────────
  doc.moveDown(2);
  doc.fontSize(18).font('Helvetica-Bold').text('Recommended Skills to Learn', { underline: true });
  doc.moveDown(1);

  if (analysis.missingSkills && analysis.missingSkills.length > 0) {
    analysis.missingSkills.forEach((ms) => {
      const impColor = ms.importance === 'critical' ? 'red' : ms.importance === 'recommended' ? 'orange' : 'blue';
      doc.fontSize(12).font('Helvetica-Bold').fillColor(impColor).text(`[${ms.importance.toUpperCase()}] `, { continued: true });
      doc.fillColor('black').text(ms.name);
      
      doc.fontSize(12).font('Helvetica').text(ms.reason);
      doc.moveDown(0.8);
    });
  } else {
    doc.fontSize(12).font('Helvetica-Oblique').text('No missing skills identified.');
  }

  // ── Footer ───────────────────────────────────────────────
  // Temporarily disable auto page break so drawing the footer doesn't trigger new pages
  const originalBottomMargin = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    const text = `Page ${i + 1} of ${pages.count} — Generated by Resume Analyzer`;
    doc.fontSize(10).fillColor('gray').text(text, 50, doc.page.height - 30, { align: 'center', lineBreak: false });
  }

  doc.page.margins.bottom = originalBottomMargin;
  doc.end();
  return doc;
}
