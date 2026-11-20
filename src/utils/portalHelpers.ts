import { ApplicationStatus, JobApplication, JobOpening, StudentProfile } from '../types/portal';

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
}

export function checkStudentEligibility(
  job: JobOpening,
  profile: StudentProfile
): EligibilityResult {
  const reasons: string[] = [];

  if (!job.eligibleDepartments.includes(profile.department)) {
    reasons.push(`Requires ${job.eligibleDepartments.join(', ')}`);
  }
  if (profile.cgpa < job.minCgpa) {
    reasons.push(`Minimum ${job.minCgpa.toFixed(1)} CGPA required (yours: ${profile.cgpa.toFixed(2)})`);
  }
  if (profile.activeBacklogs > job.maxBacklogs) {
    reasons.push(
      job.maxBacklogs === 0
        ? 'No active backlogs permitted'
        : `At most ${job.maxBacklogs} active backlog permitted`
    );
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

export function formatShortDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getStatusTextTone(status: ApplicationStatus): string {
  switch (status) {
    case ApplicationStatus.Selected:
      return 'text-emerald-400';
    case ApplicationStatus.Shortlisted:
      return 'text-[#E5C158]';
    case ApplicationStatus.InterviewScheduled:
      return 'text-amber-400';
    case ApplicationStatus.NotSelected:
      return 'text-zinc-500';
    case ApplicationStatus.UnderReview:
    default:
      return 'text-zinc-200';
  }
}

export function exportApplicationsToCsv(
  applications: JobApplication[],
  jobs: JobOpening[]
): void {
  const jobMap = new Map(jobs.map((j) => [j.id, j]));
  const headers = [
    'Application ID',
    'Student Name',
    'GNDU Roll Number',
    'Department',
    'CGPA',
    'Email',
    'Company',
    'Role',
    'Applied Date',
    'Status',
    'Resume URL',
  ];

  const escapeCsv = (value: string | number) => {
    const str = String(value ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = applications.map((app) => {
    const job = jobMap.get(app.jobId);
    return [
      app.id,
      app.studentName,
      app.studentRollNumber,
      app.studentDepartment,
      app.studentCgpa.toFixed(2),
      app.studentEmail,
      job?.company ?? 'Unknown',
      job?.title ?? 'Unknown',
      app.appliedDate,
      app.status,
      app.resumeUrl,
    ]
      .map(escapeCsv)
      .join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `gndu-placement-applicants-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
