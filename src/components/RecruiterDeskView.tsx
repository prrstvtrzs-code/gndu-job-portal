import React, { useMemo, useState } from 'react';
import { CheckCircle2, Download, Plus, Search, Trash2 } from 'lucide-react';
import {
  ApplicationStatus,
  Department,
  JobApplication,
  JobOpening,
  JobType,
  WorkMode,
} from '../types/portal';
import {
  exportApplicationsToCsv,
  formatShortDate,
  getStatusTextTone,
} from '../utils/portalHelpers';

interface RecruiterDeskViewProps {
  jobs: JobOpening[];
  applications: JobApplication[];
  onUpdateApplicationStatus: (applicationId: string, status: ApplicationStatus) => void;
  onCreateJob: (newJob: Omit<JobOpening, 'id' | 'postedDate' | 'isOpen'>) => void;
  onToggleJobOpen: (jobId: string) => void;
  onDeleteJob: (jobId: string) => void;
}

type DeskTab = 'applicants' | 'manage' | 'post';

export function RecruiterDeskView({
  jobs,
  applications,
  onUpdateApplicationStatus,
  onCreateJob,
  onToggleJobOpen,
  onDeleteJob,
}: RecruiterDeskViewProps) {
  const [deskTab, setDeskTab] = useState<DeskTab>('applicants');
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ApplicationStatus>('ALL');
  const [applicantQuery, setApplicantQuery] = useState('');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [postSuccessMessage, setPostSuccessMessage] = useState<string | null>(null);

  // Post New Opening Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('Information Technology');
  const [location, setLocation] = useState('Chandigarh / Mohali');
  const [workMode, setWorkMode] = useState<WorkMode>(WorkMode.Hybrid);
  const [jobType, setJobType] = useState<JobType>(JobType.OnCampusDrive);
  const [compensationLabel, setCompensationLabel] = useState('₹7.50 LPA');
  const [packageLpaNumeric, setPackageLpaNumeric] = useState('7.5');
  const [minCgpa, setMinCgpa] = useState('7.0');
  const [maxBacklogs, setMaxBacklogs] = useState('0');
  const [deadline, setDeadline] = useState('2026-12-20');
  const [eligibleDepartments, setEligibleDepartments] = useState<Department[]>([
    Department.CSE_IT,
    Department.MCA,
  ]);
  const [summary, setSummary] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [campusVenue, setCampusVenue] = useState('Dasmesh Auditorium, GNDU Amritsar');
  const [driveDate, setDriveDate] = useState('2026-12-24');
  const [pptTime, setPptTime] = useState('10:00 AM');
  const [formError, setFormError] = useState<string | null>(null);

  const jobMap = useMemo(() => new Map(jobs.map((j) => [j.id, j])), [jobs]);

  const filteredApplications = useMemo(() => {
    const q = applicantQuery.trim().toLowerCase();
    return applications.filter((app) => {
      if (selectedJobFilter !== 'ALL' && app.jobId !== selectedJobFilter) return false;
      if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
      if (q) {
        const job = jobMap.get(app.jobId);
        const hay = [
          app.studentName,
          app.studentRollNumber,
          app.studentDepartment,
          job?.title ?? '',
          job?.company ?? '',
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [applications, selectedJobFilter, statusFilter, applicantQuery, jobMap]);

  const applicantCountsByJob = useMemo(() => {
    const counts = new Map<string, number>();
    for (const app of applications) {
      counts.set(app.jobId, (counts.get(app.jobId) ?? 0) + 1);
    }
    return counts;
  }, [applications]);

  const toggleDepartment = (dept: Department) => {
    setEligibleDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const handlePublishJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !summary.trim()) {
      setFormError('Please fill in the role title, company name, and role overview.');
      return;
    }
    if (eligibleDepartments.length === 0) {
      setFormError('Select at least one eligible GNDU department.');
      return;
    }

    const initials = company
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('')
      .slice(0, 2);

    const parsedResponsibilities = responsibilitiesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const parsedSkills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onCreateJob({
      title: title.trim(),
      company: company.trim(),
      companyInitials: initials || 'CO',
      industry: industry.trim() || 'Corporate',
      location: location.trim() || 'India',
      workMode,
      jobType,
      compensationLabel: compensationLabel.trim() || 'Competitive',
      packageLpaNumeric: parseFloat(packageLpaNumeric) || 6.0,
      minCgpa: Math.min(10, Math.max(0, parseFloat(minCgpa) || 6.0)),
      maxBacklogs: Math.max(0, parseInt(maxBacklogs, 10) || 0),
      eligibleDepartments,
      deadline,
      summary: summary.trim(),
      responsibilities:
        parsedResponsibilities.length > 0
          ? parsedResponsibilities
          : [
              'Collaborate with engineering and business teams on core deliverables.',
              'Participate in structured onboarding and periodic performance reviews.',
            ],
      skills: parsedSkills.length > 0 ? parsedSkills : ['Problem Solving', 'Communication'],
      selectionProcess: [
        'Shortlisting via GNDU Placement Portal',
        'Online Aptitude / Technical Assessment',
        'Technical & HR Interview Panel',
      ],
      ...(jobType === JobType.OnCampusDrive
        ? {
            campusVenue: campusVenue.trim() || 'Dasmesh Auditorium, GNDU Amritsar',
            driveDate: driveDate || deadline,
            pptTime: pptTime.trim() || '10:00 AM',
          }
        : {}),
    });

    setFormError(null);
    setPostSuccessMessage(`Published "${title.trim()}" at ${company.trim()} to the live GNDU portal.`);
    setTitle('');
    setCompany('');
    setSummary('');
    setResponsibilitiesText('');
    setSkillsText('');
    setDeskTab('manage');
  };

  return (
    <div>
      {/* Header */}
      <div className="pb-8 border-b border-zinc-800 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-medium text-[#E2C265]">
            Placement Coordinator &amp; Recruiter Console
          </p>
          <h1 className="mt-1.5 font-serif text-3xl font-semibold text-white">
            Recruiter &amp; Placement Desk
          </h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
            Publish verified GNDU placement drives, review incoming student applications, update
            shortlisting statuses in real time, and export applicant rosters.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setPostSuccessMessage(null);
            setDeskTab('post');
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Post New Opening
        </button>
      </div>

      {/* Confirmation Banner */}
      {postSuccessMessage && (
        <div className="mt-6 flex items-center justify-between gap-4 bg-emerald-950/45 border border-emerald-800/70 rounded-lg px-4 py-3 text-sm text-emerald-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{postSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setPostSuccessMessage(null)}
            className="text-xs font-medium text-emerald-300 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Segmented Workspace Navigation */}
      <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Recruiter desk sections"
          className="inline-flex items-center p-1 bg-[#141418] border border-zinc-800 rounded-lg overflow-x-auto max-w-full"
        >
          {(
            [
              { id: 'applicants', label: `Applicant Review (${applications.length})` },
              { id: 'manage', label: `Manage Openings (${jobs.length})` },
              { id: 'post', label: 'Post New Opening' },
            ] as { id: DeskTab; label: string }[]
          ).map((tab) => {
            const active = deskTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setDeskTab(tab.id)}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-zinc-950 font-semibold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {deskTab === 'applicants' && (
          <button
            type="button"
            onClick={() => exportApplicationsToCsv(filteredApplications, jobs)}
            disabled={filteredApplications.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#E2C265] bg-[#141418] border border-[#D4AF37]/40 hover:bg-[#D4AF37]/10 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export Roster CSV
          </button>
        )}
      </div>

      {/* TAB 1: APPLICANT REVIEW */}
      {deskTab === 'applicants' && (
        <div>
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                type="search"
                value={applicantQuery}
                onChange={(e) => setApplicantQuery(e.target.value)}
                placeholder="Search by student name, GNDU Roll No., or company..."
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#141418] border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <select
              aria-label="Filter applicants by opening"
              value={selectedJobFilter}
              onChange={(e) => setSelectedJobFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-[#141418] border border-zinc-800 rounded-lg text-zinc-200 focus:border-[#D4AF37] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Openings</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.company} — {job.title}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter applicants by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | ApplicationStatus)}
              className="px-3 py-2 text-xs bg-[#141418] border border-zinc-800 rounded-lg text-zinc-200 focus:border-[#D4AF37] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              {Object.values(ApplicationStatus).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="border border-zinc-800 rounded-xl bg-[#111114] py-14 px-6 text-center text-sm text-zinc-400">
              No student applications match the selected filters.
            </div>
          ) : (
            <div className="border border-zinc-800 rounded-xl bg-[#111114] overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-[#141418] text-xs font-medium text-zinc-400">
                    <th className="py-3.5 px-5">Student &amp; Roll No.</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4 text-right">CGPA</th>
                    <th className="py-3.5 px-4">Applied Position</th>
                    <th className="py-3.5 px-4 text-right">Date</th>
                    <th className="py-3.5 px-5">Decision Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/90 text-sm">
                  {filteredApplications.map((app) => {
                    const job = jobMap.get(app.jobId);
                    const isExpanded = expandedAppId === app.id;
                    return (
                      <React.Fragment key={app.id}>
                        <tr className="hover:bg-[#16161B] transition-colors">
                          <td className="py-3.5 px-5">
                            <button
                              type="button"
                              onClick={() => setExpandedAppId(isExpanded ? null : app.id)}
                              className="text-left group cursor-pointer"
                            >
                              <p className="font-semibold text-white group-hover:text-[#E2C265]">
                                {app.studentName}
                                {app.isCurrentStudent && (
                                  <span className="ml-2 text-[11px] font-normal text-[#E2C265]">
                                    (Active Account)
                                  </span>
                                )}
                              </p>
                              <p className="font-mono text-xs text-zinc-400 mt-0.5">
                                {app.studentRollNumber} · {isExpanded ? 'Hide note' : 'Inspect note'}
                              </p>
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-zinc-300 whitespace-nowrap">
                            {app.studentDepartment}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-xs font-medium text-[#E2C265] tabular-nums whitespace-nowrap">
                            {app.studentCgpa.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="text-xs font-medium text-white">
                              {job?.title ?? 'Removed Opening'}
                            </p>
                            <p className="text-xs text-zinc-400">{job?.company ?? '—'}</p>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-xs text-zinc-400 tabular-nums whitespace-nowrap">
                            {formatShortDate(app.appliedDate)}
                          </td>
                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <select
                              aria-label={`Update status for ${app.studentName}`}
                              value={app.status}
                              onChange={(e) =>
                                onUpdateApplicationStatus(
                                  app.id,
                                  e.target.value as ApplicationStatus
                                )
                              }
                              className={`px-2.5 py-1.5 text-xs font-medium bg-[#09090B] border border-zinc-700 rounded-md focus:border-[#D4AF37] focus:outline-none cursor-pointer ${getStatusTextTone(
                                app.status
                              )}`}
                            >
                              {Object.values(ApplicationStatus).map((st) => (
                                <option key={st} value={st} className="text-zinc-100 bg-[#111114]">
                                  {st}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-[#16161B]">
                            <td colSpan={6} className="px-5 py-4 text-xs text-zinc-300">
                              <div className="max-w-3xl">
                                <p className="font-semibold text-white">
                                  Statement of Interest
                                </p>
                                <p className="mt-1 leading-relaxed text-zinc-300">
                                  {app.coverNote}
                                </p>
                                <p className="mt-2 text-zinc-400">
                                  Contact: {app.studentEmail} · Resume:{' '}
                                  <span className="font-mono text-[#E2C265] break-all">
                                    {app.resumeUrl}
                                  </span>
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANAGE OPENINGS */}
      {deskTab === 'manage' && (
        <div className="border border-zinc-800 rounded-xl bg-[#111114] overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-[#141418] text-xs font-medium text-zinc-400">
                <th className="py-3.5 px-5">Opening &amp; Company</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4 text-right">Package</th>
                <th className="py-3.5 px-4 text-right">Applicants</th>
                <th className="py-3.5 px-4 text-right">Deadline</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/90 text-sm">
              {jobs.map((job) => {
                const count = applicantCountsByJob.get(job.id) ?? 0;
                return (
                  <tr key={job.id} className="hover:bg-[#16161B] transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-semibold text-white">{job.title}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {job.company} · {job.location}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-xs text-zinc-300 whitespace-nowrap">
                      {job.jobType}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-xs text-[#E2C265] tabular-nums whitespace-nowrap">
                      {job.compensationLabel}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-xs text-white tabular-nums whitespace-nowrap">
                      {count}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-xs text-zinc-400 tabular-nums whitespace-nowrap">
                      {formatShortDate(job.deadline)}
                    </td>
                    <td className="py-4 px-4 text-xs font-medium whitespace-nowrap">
                      {job.isOpen ? (
                        <span className="text-emerald-400">Accepting Applications</span>
                      ) : (
                        <span className="text-zinc-500">Closed</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => onToggleJobOpen(job.id)}
                          className="font-medium text-[#E2C265] hover:underline cursor-pointer"
                        >
                          {job.isOpen ? 'Close' : 'Reopen'}
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${job.title}`}
                          onClick={() => onDeleteJob(job.id)}
                          className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: POST NEW OPENING */}
      {deskTab === 'post' && (
        <form
          onSubmit={handlePublishJob}
          className="border border-zinc-800 rounded-xl bg-[#111114] p-6 sm:p-8 max-w-4xl space-y-6"
        >
          <div className="pb-4 border-b border-zinc-800">
            <h2 className="font-serif text-xl font-semibold text-white">
              Publish a Campus Placement Drive or Job Opening
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              New listings immediately appear in the GNDU student Opportunities board and Campus
              Drives calendar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="post-title" className="block text-sm font-medium text-zinc-200">
                Role Title *
              </label>
              <input
                id="post-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Graduate Software Engineer"
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#09090B] border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="post-company" className="block text-sm font-medium text-zinc-200">
                Recruiting Organization *
              </label>
              <input
                id="post-company"
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Capgemini Engineering"
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#09090B] border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="post-type" className="block text-sm font-medium text-zinc-200">
                Engagement Type
              </label>
              <select
                id="post-type"
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType)}
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
              >
                {Object.values(JobType).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="post-mode" className="block text-sm font-medium text-zinc-200">
                Work Mode
              </label>
              <select
                id="post-mode"
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as WorkMode)}
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
              >
                {Object.values(WorkMode).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="post-location" className="block text-sm font-medium text-zinc-200">
                Job Location
              </label>
              <input
                id="post-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="post-industry" className="block text-sm font-medium text-zinc-200">
                Industry Domain
              </label>
              <input
                id="post-industry"
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="post-comp" className="block text-sm font-medium text-zinc-200">
                Package / Stipend Label
              </label>
              <input
                id="post-comp"
                type="text"
                value={compensationLabel}
                onChange={(e) => setCompensationLabel(e.target.value)}
                placeholder="₹7.50 LPA"
                className="mt-1.5 w-full px-3.5 py-2 text-sm font-mono bg-[#09090B] border border-zinc-700 rounded-lg text-[#E2C265] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="post-lpa" className="block text-sm font-medium text-zinc-200">
                Numeric LPA (Sort)
              </label>
              <input
                id="post-lpa"
                type="number"
                step="0.1"
                value={packageLpaNumeric}
                onChange={(e) => setPackageLpaNumeric(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2 text-sm font-mono tabular-nums bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="post-cgpa" className="block text-sm font-medium text-zinc-200">
                Min. CGPA
              </label>
              <input
                id="post-cgpa"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={minCgpa}
                onChange={(e) => setMinCgpa(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2 text-sm font-mono tabular-nums bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="post-deadline" className="block text-sm font-medium text-zinc-200">
                Deadline
              </label>
              <input
                id="post-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2 text-sm font-mono bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          {jobType === JobType.OnCampusDrive && (
            <div className="bg-[#18181B] border border-[#D4AF37]/30 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="post-venue" className="block text-xs font-medium text-zinc-300">
                  GNDU Campus Venue
                </label>
                <input
                  id="post-venue"
                  type="text"
                  value={campusVenue}
                  onChange={(e) => setCampusVenue(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="post-drive-date" className="block text-xs font-medium text-zinc-300">
                  Drive Date
                </label>
                <input
                  id="post-drive-date"
                  type="date"
                  value={driveDate}
                  onChange={(e) => setDriveDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs font-mono bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="post-ppt-time" className="block text-xs font-medium text-zinc-300">
                  PPT Reporting Time
                </label>
                <input
                  id="post-ppt-time"
                  type="text"
                  value={pptTime}
                  onChange={(e) => setPptTime(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs font-mono bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-zinc-200">Eligible GNDU Departments *</p>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.values(Department).map((dept) => {
                const checked = eligibleDepartments.includes(dept);
                return (
                  <label
                    key={dept}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      checked
                        ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#F5E199] font-medium'
                        : 'border-zinc-800 bg-[#09090B] text-zinc-300 hover:bg-[#141418]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDepartment(dept)}
                      className="accent-[#D4AF37]"
                    />
                    <span>{dept}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="post-summary" className="block text-sm font-medium text-zinc-200">
              Role Overview *
            </label>
            <textarea
              id="post-summary"
              rows={3}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Summarize the role, team scope, and training/onboarding structure..."
              className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#09090B] border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="post-resp" className="block text-sm font-medium text-zinc-200">
                Key Responsibilities (one per line)
              </label>
              <textarea
                id="post-resp"
                rows={3}
                value={responsibilitiesText}
                onChange={(e) => setResponsibilitiesText(e.target.value)}
                placeholder={'Design clean backend APIs\nParticipate in sprint code reviews'}
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#09090B] border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="post-skills" className="block text-sm font-medium text-zinc-200">
                  Required Skills (comma-separated)
                </label>
                <input
                  id="post-skills"
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="Java, SQL, React, Data Structures"
                  className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#09090B] border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="post-backlogs" className="block text-sm font-medium text-zinc-200">
                  Max Active Backlogs Allowed
                </label>
                <input
                  id="post-backlogs"
                  type="number"
                  min="0"
                  max="5"
                  value={maxBacklogs}
                  onChange={(e) => setMaxBacklogs(e.target.value)}
                  className="mt-1.5 w-full px-3.5 py-2 text-sm font-mono tabular-nums bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {formError && (
            <p role="alert" className="text-sm text-red-400">
              {formError}
            </p>
          )}

          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeskTab('applicants')}
              className="px-4 py-2 text-sm font-medium text-zinc-300 border border-zinc-700 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-lg transition-colors cursor-pointer"
            >
              Publish Opening
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
