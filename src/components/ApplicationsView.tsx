import { useState } from 'react';
import {
  Award,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MinusCircle,
} from 'lucide-react';
import { ApplicationStatus, JobApplication, JobOpening } from '../types/portal';
import { formatShortDate, getStatusTextTone } from '../utils/portalHelpers';

interface ApplicationsViewProps {
  applications: JobApplication[];
  jobs: JobOpening[];
  savedJobIds: string[];
  onInspectJob: (jobId: string) => void;
  onWithdrawApplication: (applicationId: string) => void;
  onRemoveSaved: (jobId: string) => void;
  onGoToOpportunities: () => void;
}

function StatusIcon({ status }: { status: ApplicationStatus }) {
  switch (status) {
    case ApplicationStatus.Selected:
      return <Award className="w-4 h-4 text-emerald-400 shrink-0" />;
    case ApplicationStatus.Shortlisted:
      return <CheckCircle2 className="w-4 h-4 text-[#E2C265] shrink-0" />;
    case ApplicationStatus.InterviewScheduled:
      return <Calendar className="w-4 h-4 text-amber-400 shrink-0" />;
    case ApplicationStatus.NotSelected:
      return <MinusCircle className="w-4 h-4 text-zinc-500 shrink-0" />;
    case ApplicationStatus.UnderReview:
    default:
      return <Clock className="w-4 h-4 text-zinc-400 shrink-0" />;
  }
}

export function ApplicationsView({
  applications,
  jobs,
  savedJobIds,
  onInspectJob,
  onWithdrawApplication,
  onRemoveSaved,
  onGoToOpportunities,
}: ApplicationsViewProps) {
  const [subTab, setSubTab] = useState<'submitted' | 'saved'>('submitted');
  const [pendingWithdrawId, setPendingWithdrawId] = useState<string | null>(null);

  const jobMap = new Map(jobs.map((j) => [j.id, j]));
  const savedJobs = jobs.filter((j) => savedJobIds.includes(j.id));

  const shortlistedCount = applications.filter(
    (a) => a.status === ApplicationStatus.Shortlisted
  ).length;
  const interviewCount = applications.filter(
    (a) =>
      a.status === ApplicationStatus.InterviewScheduled ||
      a.status === ApplicationStatus.Selected
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="pb-8 border-b border-zinc-800">
        <p className="text-xs font-medium text-[#E2C265]">Student Placement Tracker</p>
        <h1 className="mt-1.5 font-serif text-3xl font-semibold text-white">
          My Applications &amp; Saved Openings
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
          Track live shortlisting updates from the GNDU Placement Cell and recruiters, review your
          submitted statements, or revisit bookmarked opportunities.
        </p>

        {/* Clean 4-Column Metrics Row */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-zinc-800 pt-6 border-t border-zinc-800">
          <div className="lg:pr-8">
            <p className="text-xs text-zinc-400">Applications Submitted</p>
            <p className="mt-1 font-mono text-2xl font-medium text-white tabular-nums">
              {applications.length}
            </p>
          </div>
          <div className="lg:px-8">
            <p className="text-xs text-zinc-400">Shortlisted</p>
            <p className="mt-1 font-mono text-2xl font-medium text-[#E2C265] tabular-nums">
              {shortlistedCount}
            </p>
          </div>
          <div className="lg:px-8">
            <p className="text-xs text-zinc-400">Interviews / Offers</p>
            <p className="mt-1 font-mono text-2xl font-medium text-emerald-400 tabular-nums">
              {interviewCount}
            </p>
          </div>
          <div className="lg:pl-8">
            <p className="text-xs text-zinc-400">Saved Openings</p>
            <p className="mt-1 font-mono text-2xl font-medium text-white tabular-nums">
              {savedJobs.length}
            </p>
          </div>
        </div>
      </div>

      {/* Segmented Switcher */}
      <div className="py-6 flex items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Application view tabs"
          className="inline-flex items-center p-1 bg-[#141418] border border-zinc-800 rounded-lg"
        >
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'submitted'}
            onClick={() => setSubTab('submitted')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'submitted'
                ? 'bg-white text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Submitted Applications ({applications.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'saved'}
            onClick={() => setSubTab('saved')}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              subTab === 'saved'
                ? 'bg-white text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Saved Openings ({savedJobs.length})
          </button>
        </div>

        <button
          type="button"
          onClick={onGoToOpportunities}
          className="text-sm font-medium text-[#E2C265] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
        >
          Explore More Roles
        </button>
      </div>

      {/* Submitted Applications Table */}
      {subTab === 'submitted' ? (
        applications.length === 0 ? (
          <div className="border border-zinc-800 rounded-xl bg-[#111114] py-16 px-6 text-center">
            <p className="font-serif text-xl font-medium text-white">
              You have not submitted any applications yet
            </p>
            <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
              Browse verified on-campus drives and off-campus openings tailored to your GNDU department.
            </p>
            <button
              type="button"
              onClick={onGoToOpportunities}
              className="mt-5 px-5 py-2.5 text-sm font-semibold text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-lg transition-colors cursor-pointer"
            >
              Browse Opportunities
            </button>
          </div>
        ) : (
          <div className="border border-zinc-800 rounded-xl bg-[#111114] overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#141418] text-xs font-medium text-zinc-400">
                  <th className="py-3.5 px-5">Role &amp; Organization</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right">Compensation</th>
                  <th className="py-3.5 px-4 text-right">Applied On</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/90 text-sm">
                {applications.map((app) => {
                  const job = jobMap.get(app.jobId);
                  return (
                    <tr key={app.id} className="hover:bg-[#16161B] transition-colors">
                      <td className="py-4 px-5">
                        <p className="font-semibold text-white">
                          {job?.title ?? 'Archived Opening'}
                        </p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {job ? `${job.company} · ${job.location}` : 'Opening removed'}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-1 max-w-md">
                          Note: {app.coverNote}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-xs text-zinc-300 whitespace-nowrap">
                        {job?.jobType ?? '—'}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-xs text-[#E2C265] tabular-nums whitespace-nowrap">
                        {job?.compensationLabel ?? '—'}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-xs text-zinc-400 tabular-nums whitespace-nowrap">
                        {formatShortDate(app.appliedDate)}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${getStatusTextTone(
                            app.status
                          )}`}
                        >
                          <StatusIcon status={app.status} />
                          {app.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-3 text-xs">
                          {job && (
                            <button
                              type="button"
                              onClick={() => onInspectJob(job.id)}
                              className="inline-flex items-center gap-1 font-medium text-[#E2C265] hover:underline cursor-pointer"
                            >
                              View Role
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {pendingWithdrawId === app.id ? (
                            <span className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  onWithdrawApplication(app.id);
                                  setPendingWithdrawId(null);
                                }}
                                className="font-semibold text-red-400 hover:underline cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setPendingWithdrawId(null)}
                                className="text-zinc-400 hover:text-white cursor-pointer"
                              >
                                Keep
                              </button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPendingWithdrawId(app.id)}
                              className="text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              Withdraw
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : savedJobs.length === 0 ? (
        <div className="border border-zinc-800 rounded-xl bg-[#111114] py-16 px-6 text-center">
          <Bookmark className="w-8 h-8 text-zinc-500 mx-auto" />
          <p className="mt-3 font-serif text-xl font-medium text-white">
            No saved openings
          </p>
          <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
            Bookmark openings from the Opportunities directory to compare packages, CGPA criteria,
            and deadlines before applying.
          </p>
          <button
            type="button"
            onClick={onGoToOpportunities}
            className="mt-5 px-5 py-2.5 text-sm font-semibold text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-lg transition-colors cursor-pointer"
          >
            Browse Opportunities
          </button>
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-xl bg-[#111114] divide-y divide-zinc-800">
          {savedJobs.map((job) => (
            <div
              key={job.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#16161B] transition-colors"
            >
              <div>
                <h3 className="text-sm font-semibold text-white">{job.title}</h3>
                <p className="mt-1 text-xs text-zinc-400">
                  {job.company} · {job.location} · {job.jobType} ·{' '}
                  <span className="font-mono text-[#E2C265] tabular-nums">
                    {job.compensationLabel}
                  </span>
                </p>
                <p className="mt-1 text-xs text-zinc-500 tabular-nums">
                  Min. {job.minCgpa.toFixed(1)} CGPA · Closes {formatShortDate(job.deadline)}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => onRemoveSaved(job.id)}
                  className="px-3.5 py-2 text-xs font-medium text-zinc-300 border border-zinc-700 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                >
                  Remove
                </button>
                <button
                  type="button"
                  onClick={() => onInspectJob(job.id)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-lg transition-colors cursor-pointer"
                >
                  Inspect &amp; Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
