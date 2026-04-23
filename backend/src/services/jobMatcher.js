import Job from '../models/Job.js';

/**
 * Calculates a match score between a user's skills and a job's requirements.
 *
 * Scoring logic:
 * - Each required skill matched: +2 points
 * - Each nice-to-have skill matched: +1 point
 *
 * Then normalizes the score to a percentage (0-100%).
 */
export async function findMatchingJobs(userSkills) {
  // Normalize user skills to lowercase for case-insensitive matching
  const normalizedUserSkills = new Set(
    userSkills.map((s) => s.name?.toLowerCase().trim()).filter(Boolean)
  );

  // Fetch jobs as plain objects (lean) — we don't need Mongoose documents here.
  const jobs = await Job.find({}).lean();

  const matches = jobs.map((job) => {
    let score = 0;
    let maxScore = 0;
    const matchedSkills = [];
    const missingSkills = [];

    // Evaluate required skills
    job.requiredSkills.forEach((skill) => {
      maxScore += 2;
      if (normalizedUserSkills.has(skill.toLowerCase().trim())) {
        score += 2;
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    // Evaluate nice-to-have skills
    job.niceToHaveSkills.forEach((skill) => {
      maxScore += 1;
      if (normalizedUserSkills.has(skill.toLowerCase().trim())) {
        score += 1;
        matchedSkills.push(skill);
      }
    });

    // Avoid division by zero
    const matchPercentage = maxScore === 0 ? 100 : Math.round((score / maxScore) * 100);

    return {
      job,
      matchPercentage,
      matchedSkills,
      missingSkills,
    };
  });

  // Sort by highest match percentage
  matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return matches;
}
