import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Building2,
  Calendar,
  CheckSquare,
  Search,
  Square,
} from 'lucide-react';
import {
  ASSET_PATHS,
  CAMPUS_NOTICES,
  PREP_CHECKLIST_ITEMS,
} from '../data/seedData';
import { Department, JobOpening, JobType, StudentProfile } from '../types/portal';
import { checkStudentEligibility, formatShortDate } from '../utils/portalHelpers';

interface HomeViewProps {
  jobs: JobOpening[];
  profile: StudentProfile;
  savedJobIds: string[];
  completedPrepIds: string[];
  onSearchJobs: (query: string, department?: 'ALL' | Department) => void;
  onInspectJob: (jobId: string) => void;
  onToggleSave: (jobId: string) => void;
  onTogglePrepItem: (itemId: string) => void;
  onNavigateCompanies: () => void;
  onNavigateDrives: () => void;
  onOpenResumeBuilder: () => void;
}

const POPULAR_SEARCHES = [
  'Software Engineer',
  'Cloud Security Intern',
  'Business Analyst',
  'Management Trainee',
  'Architect',
];

const DEPARTMENT_DESCRIPTIONS: Record<Department, string> = {
  [Department.CSE_IT]: 'Software engineering, cloud security, and full-stack product roles.',
  [Department.MCA]: 'Enterprise application systems, backend APIs, and database engineering.',
  [Department.ECE]: 'Embedded networking, systems engineering, and technology consulting.',
  [Department.MBA]: 'Corporate banking, financial advisory, risk analytics, and leadership tracks.',
  [Department.PHARMACY]: 'Quality assurance, cGMP compliance, and pharmaceutical R&D roles.',
  [Department.ARCH_CIVIL]: 'Urban masterplanning, BIM modeling, and sustainable civic design.',
};

export function HomeView({
  jobs,
  profile,
  savedJobIds,
  completedPrepIds,
  onSearchJobs,
  onInspectJob,
  onToggleSave,
  onTogglePrepItem,
  onNavigateCompanies,
  onNavigateDrives,
  onOpenResumeBuilder,
}: HomeViewProps) {
  const [heroQuery, setHeroQuery] = useState('');
  const [heroDepartment, setHeroDepartment] = useState<'ALL' | Department>('ALL');
  const [heroBgFailed, setHeroBgFailed] = useState(false);

  const openJobs = useMemo(() => jobs.filter((j) => j.isOpen), [jobs]);
  const campusDrives = useMemo(
    () => openJobs.filter((j) => j.jobType === JobType.OnCampusDrive),
    [openJobs]
  );
  const highestPackage = useMemo(
    () =>
      openJobs.reduce((max, j) => (j.packageLpaNumeric > max ? j.packageLpaNumeric : max), 0),
    [openJobs]
  );
  const uniqueRecruiters = useMemo(() => new Set(jobs.map((j) => j.company)).size, [jobs]);

  const featuredJobs = useMemo(
    () => [...openJobs].sort((a, b) => b.packageLpaNumeric - a.packageLpaNumeric).slice(0, 4),
    [openJobs]
  );

  const categorySummaries = useMemo(() => {
    return Object.values(Department).map((dept) => {
      const deptJobs = openJobs.filter((j) => j.eligibleDepartments.includes(dept));
      const topLpa = deptJobs.reduce(
        (max, j) => (j.packageLpaNumeric > max ? j.packageLpaNumeric : max),
        0
      );
      return {
        department: dept,
        description: DEPARTMENT_DESCRIPTIONS[dept],
        count: deptJobs.length,
        topLpa,
      };
    });
  }, [openJobs]);

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchJobs(heroQuery, heroDepartment);
  };

  const prepProgress = Math.round(
    (completedPrepIds.length / PREP_CHECKLIST_ITEMS.length) * 100
  );

  return (
    <div>
      {/* FULL-WIDTH CENTERED HERO BANNER (Inspired by Reference, in Obsidian Black, Crimson, White & Gold) */}
      <section className="relative w-full overflow-hidden border-b border-zinc-800">
        {/* Authentic GNDU Amritsar Main Campus Backdrop */}
        {!heroBgFailed ? (
          <img
            src={ASSET_PATHS.campusHero}
            alt="Guru Nanak Dev University Amritsar red-brick and white concrete main campus"
            referrerPolicy="no-referrer"
            onError={() => setHeroBgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-35"
          />
        ) : (
          <div className="absolute inset-0 bg-[#09090B]" />
        )}

        {/* Measured Obsidian-to-Deep-Crimson Atmospheric Scrim */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-[#09090B]/95 via-[#22090C]/82 to-[#09090B]/95"
        />

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 pt-20 pb-16 lg:pt-28 lg:pb-20 text-center">
          <p className="text-xs sm:text-sm font-medium tracking-[0.14em] text-[#E5C158]">
            Guru Nanak Dev University, Amritsar · Your Career Starts Here
          </p>

          <h1 className="mt-5 font-serif text-4xl sm:text-5xl lg:text-[4rem] font-semibold tracking-tight text-white leading-[1.1] max-w-4xl mx-auto">
            Find Your <span className="text-[#E5C158]">Dream Job</span>
            <br />
            Build Your Future at GNDU
          </h1>

          <p className="mt-5 text-base sm:text-lg text-zinc-200 leading-relaxed max-w-2xl mx-auto">
            Discover verified on-campus placement drives, full-time roles, and final-semester
            internships from leading recruiters across India.
          </p>

          {/* Elevated Wide Centered Search Bar */}
          <form
            onSubmit={handleHeroSubmit}
            className="mt-10 max-w-4xl mx-auto bg-white rounded-xl p-2 shadow-2xl border border-white/25 flex flex-col md:flex-row items-stretch md:items-center gap-2"
          >
            <div className="relative flex-1 flex items-center">
              <Search
                aria-hidden="true"
                className="w-5 h-5 text-zinc-400 absolute left-4 pointer-events-none"
              />
              <input
                type="search"
                value={heroQuery}
                onChange={(e) => setHeroQuery(e.target.value)}
                placeholder="Search job title, company, or skill..."
                aria-label="Search job title, company, or skill"
                className="w-full pl-12 pr-4 py-3.5 text-sm sm:text-base text-zinc-900 placeholder:text-zinc-500 bg-transparent focus:outline-none"
              />
            </div>

            <div className="hidden md:block w-px h-8 bg-zinc-200" aria-hidden="true" />

            <select
              aria-label="Filter by GNDU department"
              value={heroDepartment}
              onChange={(e) => setHeroDepartment(e.target.value as 'ALL' | Department)}
              className="px-4 py-3 text-sm font-medium text-zinc-700 bg-zinc-50 md:bg-transparent rounded-lg md:rounded-none focus:outline-none cursor-pointer"
            >
              <option value="ALL">All GNDU Departments</option>
              {Object.values(Department).map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="px-8 py-3.5 text-sm font-semibold text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Search Jobs
            </button>
          </form>

          {/* Popular Searches Inline Text Row */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-zinc-300">
            <span className="text-zinc-400">Popular:</span>
            {POPULAR_SEARCHES.map((term, index) => (
              <React.Fragment key={term}>
                <button
                  type="button"
                  onClick={() => onSearchJobs(term, 'ALL')}
                  className="hover:text-[#E5C158] transition-colors cursor-pointer"
                >
                  {term}
                </button>
                {index < POPULAR_SEARCHES.length - 1 && (
                  <span aria-hidden="true" className="text-zinc-600">
                    |
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Full-Width 4-Column Institutional Placement Summary Strip */}
          <div className="mt-14 pt-8 border-t border-white/15 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-white/15 text-left">
            <div className="lg:pr-8">
              <p className="text-xs font-medium text-zinc-400">Active Openings</p>
              <p className="mt-1 font-mono text-2xl sm:text-3xl font-medium text-[#E5C158] tabular-nums">
                {openJobs.length}
              </p>
              <p className="mt-0.5 text-xs text-zinc-400">Verified full-time &amp; internships</p>
            </div>
            <div className="lg:px-8">
              <p className="text-xs font-medium text-zinc-400">On-Campus Drives</p>
              <p className="mt-1 font-mono text-2xl sm:text-3xl font-medium text-white tabular-nums">
                {campusDrives.length}
              </p>
              <p className="mt-0.5 text-xs text-zinc-400">Hosted at GNDU Amritsar</p>
            </div>
            <div className="lg:px-8">
              <p className="text-xs font-medium text-zinc-400">Highest Package Offered</p>
              <p className="mt-1 font-mono text-2xl sm:text-3xl font-medium text-[#E5C158] tabular-nums">
                ₹{highestPackage.toFixed(1)} LPA
              </p>
              <p className="mt-0.5 text-xs text-zinc-400">2026–27 placement ceiling</p>
            </div>
            <div className="lg:pl-8">
              <p className="text-xs font-medium text-zinc-400">Participating Recruiters</p>
              <p className="mt-1 font-mono text-2xl sm:text-3xl font-medium text-white tabular-nums">
                {uniqueRecruiters}
              </p>
              <p className="mt-0.5 text-xs text-zinc-400">Across 6 university faculties</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: EXPLORE BY GNDU DEPARTMENT CATEGORIES */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 pt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <p className="text-xs font-medium text-[#E5C158]">Academic Faculties</p>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-white">
              Browse Openings by GNDU Department
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onSearchJobs('', 'ALL')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#E5C158] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            View All Openings
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categorySummaries.map((cat) => (
            <button
              key={cat.department}
              type="button"
              onClick={() => onSearchJobs('', cat.department)}
              className="group text-left p-6 rounded-xl bg-[#111114] border border-zinc-800 hover:border-[#D4AF37]/60 transition-colors cursor-pointer"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-base font-semibold text-white group-hover:text-[#E5C158] transition-colors">
                  {cat.department}
                </h3>
                <span className="font-mono text-xs text-[#E5C158] tabular-nums shrink-0">
                  {cat.count} {cat.count === 1 ? 'role' : 'roles'}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{cat.description}</p>
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                <span>
                  Top package:{' '}
                  <strong className="font-mono text-zinc-200 tabular-nums">
                    {cat.topLpa > 0 ? `₹${cat.topLpa.toFixed(1)} LPA` : 'Updating'}
                  </strong>
                </span>
                <span className="text-zinc-300 group-hover:text-white inline-flex items-center gap-1">
                  Explore
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 2: FEATURED HIGH-PRIORITY OPENINGS */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 pt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <p className="text-xs font-medium text-[#E5C158]">Priority Recruitment</p>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-white">
              Featured Campus Opportunities
            </h2>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <button
              type="button"
              onClick={onNavigateCompanies}
              className="text-zinc-300 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Recruiting Companies
            </button>
            <button
              type="button"
              onClick={onNavigateDrives}
              className="text-[#E5C158] hover:underline font-medium whitespace-nowrap shrink-0 cursor-pointer"
            >
              Campus Drive Calendar
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {featuredJobs.map((job) => {
            const isSaved = savedJobIds.includes(job.id);
            const eligibility = checkStudentEligibility(job, profile);
            return (
              <article
                key={job.id}
                className="p-6 rounded-xl bg-[#111114] border border-zinc-800 hover:border-zinc-700 transition-colors flex flex-col justify-between gap-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-lg bg-[#1A1A20] border border-[#D4AF37]/30 flex items-center justify-center font-mono text-xs font-semibold text-[#E5C158] shrink-0">
                        {job.companyInitials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-white leading-snug">
                          {job.title}
                        </h3>
                        <p className="mt-1 text-xs text-zinc-400">
                          {job.company} · {job.location} · {job.workMode}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label={isSaved ? `Remove ${job.title} from saved` : `Save ${job.title}`}
                      onClick={() => onToggleSave(job.id)}
                      className="p-2 text-zinc-400 hover:text-[#E5C158] rounded-lg transition-colors cursor-pointer"
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-[#E5C158]" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <p className="mt-4 text-sm text-zinc-300 leading-relaxed line-clamp-2">
                    {job.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-zinc-400 space-y-1">
                    <p>
                      <span className="font-mono font-medium text-[#E5C158] tabular-nums">
                        {job.compensationLabel}
                      </span>{' '}
                      · {job.jobType} · Min. {job.minCgpa.toFixed(1)} CGPA
                    </p>
                    <p className="tabular-nums">
                      Deadline {formatShortDate(job.deadline)} ·{' '}
                      <span className={eligibility.eligible ? 'text-emerald-400' : 'text-zinc-500'}>
                        {eligibility.eligible ? 'Matches your profile' : 'Check criteria'}
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onInspectJob(job.id)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Inspect &amp; Apply
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: OFFICIAL PLACEMENT NOTICES + INTERACTIVE READINESS CHECKLIST */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Official GNDU Notices */}
          <div className="lg:col-span-7 border border-zinc-800 rounded-xl bg-[#111114] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 pb-5 border-b border-zinc-800">
              <div>
                <p className="text-xs font-medium text-[#E5C158]">Official Bulletin</p>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-white">
                  Placement Cell Announcements
                </h2>
              </div>
              <button
                type="button"
                onClick={onNavigateDrives}
                className="text-xs font-medium text-zinc-300 hover:text-[#E5C158] transition-colors cursor-pointer"
              >
                View Drive Dates
              </button>
            </div>

            <div className="divide-y divide-zinc-800">
              {CAMPUS_NOTICES.map((notice) => (
                <article key={notice.id} className="py-5 first:pt-5 last:pb-0">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 text-[#E5C158]" />
                    <span className="font-mono tabular-nums">{formatShortDate(notice.date)}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#E5C158] font-medium">{notice.category}</span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-white">{notice.title}</h3>
                  <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">{notice.summary}</p>
                </article>
              ))}
            </div>
          </div>

          {/* Interactive Student Placement Readiness Checklist */}
          <div className="lg:col-span-5 border border-zinc-800 rounded-xl bg-[#111114] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-zinc-800">
              <div>
                <p className="text-xs font-medium text-[#E5C158]">Student Preparation</p>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-white">
                  Drive Readiness Checklist
                </h2>
              </div>
              <span className="font-mono text-lg font-medium text-[#E5C158] tabular-nums">
                {prepProgress}%
              </span>
            </div>

            {/* Subtle Progress Track */}
            <div className="mt-4 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4AF37] transition-all duration-200"
                style={{ width: `${prepProgress}%` }}
              />
            </div>

            <ul className="mt-5 divide-y divide-zinc-800/80">
              {PREP_CHECKLIST_ITEMS.map((item) => {
                const done = completedPrepIds.includes(item.id);
                return (
                  <li key={item.id} className="py-3 first:pt-1">
                    <button
                      type="button"
                      onClick={() => onTogglePrepItem(item.id)}
                      className="w-full text-left flex items-start gap-3 group cursor-pointer"
                    >
                      {done ? (
                        <CheckSquare className="w-4 h-4 text-[#E5C158] shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p
                          className={`text-sm font-medium transition-colors ${
                            done ? 'text-zinc-400 line-through' : 'text-zinc-100 group-hover:text-white'
                          }`}
                        >
                          {item.label}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">{item.detail}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 pt-5 border-t border-zinc-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Building2 className="w-4 h-4 text-[#E5C158]" />
                <span>Need an official GNDU CV sheet?</span>
              </div>
              <button
                type="button"
                onClick={onOpenResumeBuilder}
                className="text-xs font-semibold text-[#E5C158] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Open Resume Preview
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
