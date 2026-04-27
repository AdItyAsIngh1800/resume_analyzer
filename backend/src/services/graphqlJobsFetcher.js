// Fetches live tech jobs from graphql.jobs (no API key required)
// Normalizes results to match the internal Job schema shape used by jobMatcher.js

const GRAPHQL_JOBS_URL = 'https://api.graphql.jobs/';

// Maps GraphQL Jobs commitment values to our internal job type enum
function normalizeType(commitment) {
  if (!commitment) return 'full-time';
  const c = commitment.toLowerCase();
  if (c.includes('full')) return 'full-time';
  if (c.includes('part')) return 'part-time';
  if (c.includes('contract')) return 'contract';
  if (c.includes('freelance')) return 'freelance';
  return 'full-time';
}

// Extracts skill-like keywords from job description and tags
function extractSkillsFromJob(job) {
  const knownSkills = [
    'javascript', 'typescript', 'python', 'java', 'go', 'rust', 'ruby', 'php', 'c#', 'c++',
    'react', 'next.js', 'nextjs', 'vue', 'angular', 'svelte', 'node.js', 'nodejs', 'express',
    'graphql', 'rest', 'grpc', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
    'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform', 'ci/cd', 'github actions',
    'tailwind', 'css', 'html', 'sass', 'webpack', 'vite',
    'machine learning', 'pytorch', 'tensorflow', 'llm', 'openai',
    'git', 'linux', 'bash', 'sql',
  ];

  const haystack = [
    job.title || '',
    job.description || '',
    ...(job.tags?.map((t) => t.name) || []),
  ]
    .join(' ')
    .toLowerCase();

  return knownSkills.filter((skill) => haystack.includes(skill));
}

const JOBS_QUERY = `
  {
    jobs(
      input: {
        first: 100
      }
    ) {
      title
      description
      applyUrl
      commitment { title }
      company { name }
      cities { name country { name } }
      tags { name }
    }
  }
`;

let cache = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function fetchLiveJobs() {
  const now = Date.now();
  if (cache && now < cacheExpiresAt) return cache;

  const response = await fetch(GRAPHQL_JOBS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: JOBS_QUERY }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`GraphQL Jobs API error: ${response.status}`);
  }

  const { data, errors } = await response.json();
  if (errors?.length) {
    throw new Error(`GraphQL Jobs query error: ${errors[0].message}`);
  }

  const normalized = (data?.jobs || []).map((job) => {
    const city = job.cities?.[0];
    const location = city
      ? `${city.name}, ${city.country?.name || ''}`.trim().replace(/,$/, '')
      : 'Remote';

    const skills = extractSkillsFromJob(job);
    const half = Math.ceil(skills.length / 2);

    return {
      _id: job.applyUrl, // use URL as stable pseudo-ID
      title: job.title,
      company: job.company?.name || 'Unknown',
      description: (job.description || '').slice(0, 500),
      location,
      workModel: 'remote',
      type: normalizeType(job.commitment?.title),
      level: 'any',
      requiredSkills: skills.slice(0, half),
      niceToHaveSkills: skills.slice(half),
      salaryRange: {},
      url: job.applyUrl,
      source: 'graphql.jobs',
    };
  });

  cache = normalized;
  cacheExpiresAt = now + CACHE_TTL_MS;
  return normalized;
}
