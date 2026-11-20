import React, { useState } from 'react';
import { LogOut, RotateCcw, User, X } from 'lucide-react';
import { ASSET_PATHS } from '../data/seedData';
import { AuthAccount, Department, StudentProfile } from '../types/portal';

interface ProfileModalProps {
  currentUser: AuthAccount;
  profile: StudentProfile;
  onClose: () => void;
  onSave: (updated: StudentProfile) => void;
  onResetDemoData: () => void;
  onSignOut: () => void;
}

export function ProfileModal({
  currentUser,
  profile,
  onClose,
  onSave,
  onResetDemoData,
  onSignOut,
}: ProfileModalProps) {
  const [form, setForm] = useState<StudentProfile>(profile);
  const [skillsInput, setSkillsInput] = useState(profile.skills.join(', '));
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSave({
      ...form,
      cgpa: Math.min(10, Math.max(0, Number(form.cgpa) || 0)),
      activeBacklogs: Math.max(0, Math.floor(Number(form.activeBacklogs) || 0)),
      semester: Math.min(10, Math.max(1, Math.floor(Number(form.semester) || 1))),
      skills: parsedSkills,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#111114] rounded-xl border border-zinc-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-[#D4AF37]/50 bg-zinc-900 shrink-0 flex items-center justify-center">
              {!avatarFailed ? (
                <img
                  src={ASSET_PATHS.studentAvatar}
                  alt={`${form.name} student portrait`}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-zinc-400" />
              )}
            </div>
            <div>
              <h2
                id="profile-modal-title"
                className="font-serif text-xl font-semibold text-white"
              >
                Account &amp; Academic Profile
              </h2>
              <p className="text-xs text-[#E2C265] mt-0.5">
                Signed in as {currentUser.role} · {currentUser.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close profile editor"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-zinc-200">
                Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="profile-roll" className="block text-sm font-medium text-zinc-200">
                GNDU Roll Number
              </label>
              <input
                id="profile-roll"
                type="text"
                required
                value={form.rollNumber}
                onChange={(e) => setForm({ ...form, rollNumber: e.target.value.toUpperCase() })}
                className="mt-1.5 w-full px-3.5 py-2 text-sm font-mono bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="profile-dept" className="block text-sm font-medium text-zinc-200">
                Department / Program
              </label>
              <select
                id="profile-dept"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value as Department })}
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
              >
                {Object.values(Department).map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-zinc-200">
                University Email
              </label>
              <input
                id="profile-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="profile-cgpa" className="block text-sm font-medium text-zinc-200">
                Current CGPA
              </label>
              <input
                id="profile-cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                value={form.cgpa}
                onChange={(e) => setForm({ ...form, cgpa: parseFloat(e.target.value) || 0 })}
                className="mt-1.5 w-full px-3.5 py-2 text-sm font-mono tabular-nums bg-[#09090B] border border-zinc-700 rounded-lg text-[#E2C265] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="profile-sem" className="block text-sm font-medium text-zinc-200">
                Semester
              </label>
              <input
                id="profile-sem"
                type="number"
                min="1"
                max="10"
                required
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value, 10) || 1 })}
                className="mt-1.5 w-full px-3.5 py-2 text-sm font-mono tabular-nums bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="profile-backlogs" className="block text-sm font-medium text-zinc-200">
                Active Backlogs
              </label>
              <input
                id="profile-backlogs"
                type="number"
                min="0"
                max="12"
                required
                value={form.activeBacklogs}
                onChange={(e) =>
                  setForm({ ...form, activeBacklogs: parseInt(e.target.value, 10) || 0 })
                }
                className="mt-1.5 w-full px-3.5 py-2 text-sm font-mono tabular-nums bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-resume" className="block text-sm font-medium text-zinc-200">
                Default Resume URL
              </label>
              <input
                id="profile-resume"
                type="url"
                value={form.resumeUrl}
                onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })}
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="profile-portfolio" className="block text-sm font-medium text-zinc-200">
                GitHub / Portfolio URL
              </label>
              <input
                id="profile-portfolio"
                type="url"
                value={form.portfolioUrl}
                onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="profile-skills" className="block text-sm font-medium text-zinc-200">
              Key Technical &amp; Domain Skills (comma-separated)
            </label>
            <input
              id="profile-skills"
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="profile-bio" className="block text-sm font-medium text-zinc-200">
              Academic Summary
            </label>
            <textarea
              id="profile-bio"
              rows={2}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#09090B] border border-zinc-700 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none resize-none"
            />
          </div>

          <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>

              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Demo Data
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-zinc-400">Restore defaults?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onResetDemoData();
                      onClose();
                    }}
                    className="font-semibold text-red-400 hover:underline cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="text-zinc-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-zinc-300 border border-zinc-700 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-medium text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-lg transition-colors cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
