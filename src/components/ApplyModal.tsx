import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { JobOpening, StudentProfile } from '../types/portal';
import { checkStudentEligibility } from '../utils/portalHelpers';

interface ApplyModalProps {
  job: JobOpening;
  profile: StudentProfile;
  onClose: () => void;
  onSubmit: (payload: { resumeUrl: string; coverNote: string }) => void;
  onOpenProfile: () => void;
}

export function ApplyModal({
  job,
  profile,
  onClose,
  onSubmit,
  onOpenProfile,
}: ApplyModalProps) {
  const [resumeUrl, setResumeUrl] = useState(profile.resumeUrl);
  const [coverNote, setCoverNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const eligibility = checkStudentEligibility(job, profile);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedResume = resumeUrl.trim();
    const trimmedNote = coverNote.trim();

    if (!trimmedResume) {
      setError('Please provide a link to your updated resume (PDF or Drive link).');
      return;
    }
    if (trimmedNote.length < 15) {
      setError('Please write a brief statement of interest (at least 15 characters).');
      return;
    }

    setError(null);
    onSubmit({
      resumeUrl: trimmedResume,
      coverNote: trimmedNote,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="apply-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#111114] rounded-xl border border-zinc-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-zinc-800 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#E2C265]">
              {job.company} · {job.jobType}
            </p>
            <h2
              id="apply-modal-title"
              className="mt-1 font-serif text-xl font-semibold text-white"
            >
              Apply for {job.title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close application form"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Student Record Summary */}
          <div className="bg-[#18181B] border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-zinc-200">
                Verified Academic Details
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProfile();
                }}
                className="text-xs font-medium text-[#E2C265] hover:underline cursor-pointer"
              >
                Edit Profile
              </button>
            </div>
            <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="block text-zinc-500">Candidate</span>
                <span className="font-medium text-white">{profile.name}</span>
              </div>
              <div>
                <span className="block text-zinc-500">Roll Number</span>
                <span className="font-mono font-medium text-white">{profile.rollNumber}</span>
              </div>
              <div>
                <span className="block text-zinc-500">Department</span>
                <span className="font-medium text-white">{profile.department}</span>
              </div>
              <div>
                <span className="block text-zinc-500">CGPA</span>
                <span className="font-mono font-medium text-[#E2C265] tabular-nums">
                  {profile.cgpa.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Eligibility Banner */}
          {eligibility.eligible ? (
            <div className="flex items-start gap-2.5 text-sm text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 rounded-lg px-4 py-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                Your academic profile meets all eligibility requirements for this role (min.{' '}
                <span className="tabular-nums font-medium text-white">{job.minCgpa.toFixed(1)}</span>{' '}
                CGPA and approved department).
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 text-sm text-amber-200 bg-amber-950/35 border border-amber-800/60 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-300">Eligibility Notice</p>
                <p className="mt-0.5 text-xs text-amber-200/90">
                  {eligibility.reasons.join(' · ')}. You may still submit for placement officer review.
                </p>
              </div>
            </div>
          )}

          {/* Resume URL */}
          <div>
            <label htmlFor="apply-resume" className="block text-sm font-medium text-zinc-200">
              Resume Link (PDF / Google Drive)
            </label>
            <input
              id="apply-resume"
              type="url"
              required
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://drive.gndu.ac.in/resumes/your-resume.pdf"
              className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-[#09090B] border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          {/* Cover Note */}
          <div>
            <label htmlFor="apply-note" className="block text-sm font-medium text-zinc-200">
              Statement of Interest &amp; Relevant Projects
            </label>
            <textarea
              id="apply-note"
              rows={4}
              required
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Highlight relevant GNDU coursework, academic projects, internships, or technical skills..."
              className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-[#09090B] border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none resize-none"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white bg-transparent border border-zinc-700 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-lg transition-colors cursor-pointer"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
