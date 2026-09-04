export function computeMatch(job, profile) {
  if (!job.skills?.length) return 70;
  const profileSkills = profile.skills.map((s) => s.toLowerCase());
  const matched = job.skills.filter((s) => profileSkills.includes(s.toLowerCase())).length;
  const base = Math.round((matched / job.skills.length) * 100);
  // keep a believable floor so unrelated-but-plausible roles still show a match
  return Math.max(55, Math.min(99, base || 60));
}

export function formatSalary(job) {
  return `${job.salaryMin}–${job.salaryMax} LPA`;
}

export function formatPosted(daysAgo) {
  if (daysAgo === 0) return "Today";
  if (daysAgo === 1) return "1 day ago";
  if (daysAgo < 7) return `${daysAgo} days ago`;
  const weeks = Math.floor(daysAgo / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}
