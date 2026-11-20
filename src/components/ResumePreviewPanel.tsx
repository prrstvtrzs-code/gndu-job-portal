import { Download, Edit3, Printer } from 'lucide-react';
import { JobApplication, JobOpening, StudentProfile } from '../types/portal';

interface ResumePreviewPanelProps {
  profile: StudentProfile;
  applications: JobApplication[];
  jobs: JobOpening[];
  onEditProfile: () => void;
}

export function ResumePreviewPanel({
  profile,
  applications,
  jobs,
  onEditProfile,
}: ResumePreviewPanelProps) {
  const jobMap = new Map(jobs.map((j) => [j.id, j]));

  const handleDownloadTextResume = () => {
    const content = [
      `${profile.name.toUpperCase()}`,
      `Guru Nanak Dev University, Amritsar | Roll No: ${profile.rollNumber}`,
      `Email: ${profile.email} | Phone: ${profile.phone}`,
      `Portfolio: ${profile.portfolioUrl}`,
      '',
      'ACADEMIC PROFILE',
      `Program: ${profile.department}`,
      `Current Semester: Semester ${profile.semester} (Class of ${profile.graduationYear})`,
      `CGPA: ${profile.cgpa.toFixed(2)} / 10.00 | Active Backlogs: ${profile.activeBacklogs}`,
      '',
      'SUMMARY',
      profile.bio,
      '',
      'TECHNICAL & DOMAIN SKILLS',
      profile.skills.join(' · '),
      '',
      'CAMPUS PLACEMENT ACTIVITY (2026-27)',
      ...(applications.length > 0
        ? applications.map((a) => {
            const j = jobMap.get(a.jobId);
            return `- ${j?.title ?? 'Role'} at ${j?.company ?? 'Organization'} (${a.status})`;
          })
        : ['- Active candidate in GNDU Placement Session 2026-27']),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.rollNumber}-${profile.name.toLowerCase().replace(/\s+/g, '-')}-resume.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="font-serif text-xl font-semibold text-white">
            Official GNDU Academic Resume Preview
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Automatically synced with your Account Profile for one-page campus drive submissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onEditProfile}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-200 bg-[#111114] border border-zinc-700 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Details
          </button>
          <button
            type="button"
            onClick={handleDownloadTextResume}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-200 bg-[#111114] border border-zinc-700 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download Copy
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Crisp Publication-Grade White Academic CV Sheet */}
      <article className="bg-white text-zinc-900 rounded-xl border border-zinc-300 p-8 sm:p-12 max-w-4xl mx-auto shadow-2xl">
        <header className="pb-6 border-b-2 border-[#B91C1C] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#991B1B]">
              GURU NANAK DEV UNIVERSITY, AMRITSAR · CAMPUS PLACEMENT CV
            </p>
            <h3 className="mt-1.5 font-serif text-3xl font-semibold text-zinc-950">
              {profile.name}
            </h3>
            <p className="mt-1 text-sm text-zinc-700">
              {profile.department} · Roll No.{' '}
              <span className="font-mono font-medium">{profile.rollNumber}</span>
            </p>
          </div>
          <div className="text-xs text-zinc-600 sm:text-right space-y-1">
            <p>{profile.email}</p>
            <p className="font-mono">{profile.phone}</p>
            {profile.portfolioUrl && <p className="text-[#991B1B]">{profile.portfolioUrl}</p>}
          </div>
        </header>

        <div className="mt-6 space-y-6 text-sm leading-relaxed">
          <section>
            <h4 className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
              Career Summary
            </h4>
            <p className="mt-2 text-zinc-800">{profile.bio}</p>
          </section>

          <section className="pt-5 border-t border-zinc-200">
            <h4 className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
              Academic Qualifications
            </h4>
            <div className="mt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div>
                <p className="font-semibold text-zinc-950">
                  {profile.department} — Guru Nanak Dev University, Amritsar
                </p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Main Campus, G.T. Road, Amritsar · Semester {profile.semester} · Expected
                  Graduation {profile.graduationYear}
                </p>
              </div>
              <div className="text-left sm:text-right font-mono text-xs text-zinc-900 tabular-nums shrink-0">
                <p className="font-semibold">CGPA: {profile.cgpa.toFixed(2)} / 10.00</p>
                <p className="text-zinc-600">Active Backlogs: {profile.activeBacklogs}</p>
              </div>
            </div>
          </section>

          <section className="pt-5 border-t border-zinc-200">
            <h4 className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
              Technical &amp; Core Skills
            </h4>
            <p className="mt-2 text-zinc-800">
              {profile.skills.length > 0 ? profile.skills.join(' · ') : 'Add skills in Account Profile'}
            </p>
          </section>

          <section className="pt-5 border-t border-zinc-200">
            <h4 className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
              Verified Placement Portal Record
            </h4>
            <dl className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                <dt className="text-zinc-500">University Verification</dt>
                <dd className="mt-1 font-semibold text-zinc-900">GNDU Placement Cell Record</dd>
              </div>
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                <dt className="text-zinc-500">Active Applications</dt>
                <dd className="mt-1 font-mono font-semibold text-zinc-900 tabular-nums">
                  {applications.length} Submitted
                </dd>
              </div>
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                <dt className="text-zinc-500">Resume Attachment</dt>
                <dd className="mt-1 font-mono text-zinc-700 truncate">{profile.resumeUrl}</dd>
              </div>
            </dl>
          </section>
        </div>
      </article>
    </div>
  );
}
