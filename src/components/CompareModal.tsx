import { CheckCircle2, X } from 'lucide-react';
import { JobOpening, StudentProfile } from '../types/portal';
import { checkStudentEligibility, formatShortDate } from '../utils/portalHelpers';

interface CompareModalProps {
  jobs: JobOpening[];
  profile: StudentProfile;
  onRemoveJob: (jobId: string) => void;
  onSelectAndApply: (job: JobOpening) => void;
  onClose: () => void;
}

export function CompareModal({
  jobs,
  profile,
  onRemoveJob,
  onSelectAndApply,
  onClose,
}: CompareModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-[#111114] rounded-xl border border-zinc-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#E5C158]">Side-by-Side Offer Analysis</p>
            <h2
              id="compare-modal-title"
              className="mt-0.5 font-serif text-xl sm:text-2xl font-semibold text-white"
            >
              Compare Placement Opportunities
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close role comparison"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-auto p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="py-3 pr-4 text-xs font-medium text-zinc-500 w-44 align-top">
                  Comparison Criteria
                </th>
                {jobs.map((job) => (
                  <th key={job.id} className="py-3 px-4 align-top min-w-[220px]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-[#E5C158]">{job.company}</p>
                        <p className="mt-0.5 text-sm font-semibold text-white">{job.title}</p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${job.title} from comparison`}
                        onClick={() => onRemoveJob(job.id)}
                        className="text-zinc-500 hover:text-white p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-sm">
              <tr>
                <td className="py-3.5 pr-4 text-xs font-medium text-zinc-400">Compensation</td>
                {jobs.map((job) => (
                  <td key={job.id} className="py-3.5 px-4 font-mono text-sm font-medium text-[#E5C158] tabular-nums">
                    {job.compensationLabel}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-xs font-medium text-zinc-400">Your Eligibility</td>
                {jobs.map((job) => {
                  const elig = checkStudentEligibility(job, profile);
                  return (
                    <td key={job.id} className="py-3.5 px-4 text-xs">
                      {elig.eligible ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Eligible
                        </span>
                      ) : (
                        <span className="text-amber-300">{elig.reasons[0]}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-xs font-medium text-zinc-400">Engagement Type</td>
                {jobs.map((job) => (
                  <td key={job.id} className="py-3.5 px-4 text-xs text-zinc-200">
                    {job.jobType} · {job.workMode}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-xs font-medium text-zinc-400">Location</td>
                {jobs.map((job) => (
                  <td key={job.id} className="py-3.5 px-4 text-xs text-zinc-300">
                    {job.location}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-xs font-medium text-zinc-400">Min. CGPA &amp; Backlogs</td>
                {jobs.map((job) => (
                  <td key={job.id} className="py-3.5 px-4 font-mono text-xs text-zinc-200 tabular-nums">
                    {job.minCgpa.toFixed(1)} CGPA · ≤{job.maxBacklogs} backlogs
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-xs font-medium text-zinc-400">Eligible Branches</td>
                {jobs.map((job) => (
                  <td key={job.id} className="py-3.5 px-4 text-xs text-zinc-300">
                    {job.eligibleDepartments.join(', ')}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-xs font-medium text-zinc-400">Selection Rounds</td>
                {jobs.map((job) => (
                  <td key={job.id} className="py-3.5 px-4 text-xs text-zinc-300">
                    {job.selectionProcess.length} stages ({job.selectionProcess[0]})
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3.5 pr-4 text-xs font-medium text-zinc-400">Apply Before</td>
                {jobs.map((job) => (
                  <td key={job.id} className="py-3.5 px-4 font-mono text-xs text-zinc-300 tabular-nums">
                    {formatShortDate(job.deadline)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 pr-4 text-xs font-medium text-zinc-400">Action</td>
                {jobs.map((job) => (
                  <td key={job.id} className="py-4 px-4">
                    <button
                      type="button"
                      disabled={!job.isOpen}
                      onClick={() => onSelectAndApply(job)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {job.isOpen ? 'Apply Now' : 'Closed'}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
