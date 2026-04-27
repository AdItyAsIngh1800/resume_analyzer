import Job from '../models/Job.js';
import { fetchLiveJobs } from './graphqlJobsFetcher.js';

export async function findMatchingJobs(userSkills) {
  const normalizedUserSkills = new Set(
    userSkills.map((s) => s.name?.toLowerCase().trim()).filter(Boolean)
  );

  // Merge seeded DB jobs with live jobs from GraphQL Jobs API
  const [dbJobs, liveJobs] = await Promise.allSettled([
    Job.find({}).lean(),
    fetchLiveJobs(),
  ]);

  const jobs = [
    ...(dbJobs.status === 'fulfilled' ? dbJobs.value : []),
    ...(liveJobs.status === 'fulfilled' ? liveJobs.value : []),
  ];

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
