import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Calendar,
  CheckCircle2,
  MapPin,
  Scale,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Department,
  JobApplication,
  JobOpening,
  JobType,
  StudentProfile,
  WorkMode,
} from '../types/portal';
import {
  checkStudentEligibility,
  formatShortDate,
  getStatusTextTone,
} from '../utils/portalHelpers';

interface OpportunitiesViewProps {
  jobs: JobOpening[];
  profile: StudentProfile;
  savedJobIds: string[];
  studentApplications: JobApplication[];
  selectedJobId: string | null;
  searchQuery: string;
  departmentFilter: 'ALL' | Department;
  compareJobIds: string[];
  onSearchQueryChange: (q: string) => void;
  onDepartmentFilterChange: (dept: 'ALL' | Department) => void;
  onSelectJob: (jobId: string) => void;
  onToggleSave: (jobId: string) => void;
  onToggleCompare: (jobId: string) => void;
  onOpenCompare: () => void;
  onClearCompare: () => void;
  onStartApply: (job: JobOpening) => void;
  onOpenProfile: () => void;
}

type TypeFilter = 'ALL' | JobType;
type SortOption = 'newest' | 'package' | 'deadline';

export function OpportunitiesView({
  jobs,
  profile,
  savedJobIds,
  studentApplications,
  selectedJobId,
  searchQuery,
  departmentFilter,
  compareJobIds,
  onSearchQueryChange,
  onDepartmentFilterChange,
  onSelectJob,
  onToggleSave,
  onToggleCompare,
  onOpenCompare,
  onClearCompare,
  onStartApply,
  onOpenProfile,
}: OpportunitiesViewProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [workModeFilter, setWorkModeFilter] = useState<'ALL' | WorkMode>('ALL');
  const [minLpaFilter, setMinLpaFilter] = useState<number>(0);
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [onlySaved, setOnlySaved] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const applicationByJobId = useMemo(() => {
    const map = new Map<string, JobApplication>();
    for (const app of studentApplications) {
      map.set(app.jobId, app);
    }
    return map;
  }, [studentApplications]);

  const filteredJobs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const matched = jobs.filter((job) => {
      if (typeFilter !== 'ALL' && job.jobType !== typeFilter) return false;
      if (workModeFilter !== 'ALL' && job.workMode !== workModeFilter) return false;
      if (minLpaFilter > 0 && job.packageLpaNumeric < minLpaFilter) return false;
      if (departmentFilter !== 'ALL' && !job.eligibleDepartments.includes(departmentFilter)) {
        return false;
      }
      if (onlySaved && !savedJobIds.includes(job.id)) return false;
      if (onlyEligible && !checkStudentEligibility(job, profile).eligible) return false;

      if (q) {
        const haystack = [
          job.title,
          job.company,
          job.location,
          job.industry,
          ...job.skills,
          ...job.eligibleDepartments,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return [...matched].sort((a, b) => {
      if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
      if (sortBy === 'package') return b.packageLpaNumeric - a.packageLpaNumeric;
      if (sortBy === 'deadline') return a.deadline.localeCompare(b.deadline);
      return b.postedDate.localeCompare(a.postedDate);
    });
  }, [
    jobs,
    searchQuery,
    typeFilter,
    workModeFilter,
    minLpaFilter,
    departmentFilter,
    onlySaved,
    onlyEligible,
    savedJobIds,
    profile,
    sortBy,
  ]);

  const activeJob = useMemo(() => {
    if (filteredJobs.length === 0) return null;
    return filteredJobs.find((j) => j.id === selectedJobId) ?? filteredJobs[0];
  }, [filteredJobs, selectedJobId]);

  const activeEligibility = activeJob ? checkStudentEligibility(activeJob, profile) : null;
  const activeApplication = activeJob ? applicationByJobId.get(activeJob.id) : undefined;

  const hasActiveFilters =
    Boolean(searchQuery) ||
    typeFilter !== 'ALL' ||
    workModeFilter !== 'ALL' ||
    minLpaFilter > 0 ||
    departmentFilter !== 'ALL' ||
    onlyEligible ||
    onlySaved;

  const resetFilters = () => {
    onSearchQueryChange('');
    onDepartmentFilterChange('ALL');
    setTypeFilter('ALL');
    setWorkModeFilter('ALL');
    setMinLpaFilter(0);
    setOnlyEligible(false);
    setOnlySaved(false);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 pt-10">
      {/* Page Header & Quick Search */}
      <div className="pb-8 border-b border-zinc-800 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-medium text-[#E5C158]">
            GNDU Placement Directory · 2026–27 Session
          </p>
          <h1 className="mt-1.5 font-serif text-3xl sm:text-4xl font-semibold text-white">
            Find Jobs &amp; Campus Openings
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Active profile: <span className="text-zinc-200 font-medium">{profile.name}</span> ·{' '}
            <span className="font-mono">{profile.rollNumber}</span> · {profile.department} ·{' '}
            <span className="font-mono text-[#E5C158] tabular-nums">
              {profile.cgpa.toFixed(2)} CGPA
            </span>{' '}
            <button
              type="button"
              onClick={onOpenProfile}
              className="ml-1.5 text-[#E5C158] hover:underline font-medium cursor-pointer"
            >
              Update
            </button>
          </p>
        </div>

        <div className="relative w-full lg:w-[440px]">
          <Search
            aria-hidden="true"
            className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search role, company, city, or skill..."
            aria-label="Search open positions"
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#111114] border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
          />
        </div>
      </div>

      {/* Comprehensive Filter Toolbar */}
      <div className="py-5 border-b border-zinc-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Segmented Job Type Tabs */}
        <div
          role="tablist"
          aria-label="Filter by opportunity type"
          className="inline-flex items-center p-1 bg-[#141418] border border-zinc-800 rounded-lg overflow-x-auto max-w-full"
        >
          {(
            [
              { value: 'ALL', label: 'All Roles' },
              { value: JobType.OnCampusDrive, label: 'On-Campus Drive' },
              { value: JobType.FullTime, label: 'Full-Time' },
              { value: JobType.Internship, label: 'Internship' },
            ] as { value: TypeFilter; label: string }[]
          ).map((tab) => {
            const active = typeFilter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTypeFilter(tab.value)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
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

        {/* Multi-Dimensional Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Filter by GNDU department"
            value={departmentFilter}
            onChange={(e) => onDepartmentFilterChange(e.target.value as 'ALL' | Department)}
            className="px-3 py-2 text-xs font-medium bg-[#111114] border border-zinc-700 rounded-lg text-zinc-200 focus:border-[#D4AF37] focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {Object.values(Department).map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by work mode"
            value={workModeFilter}
            onChange={(e) => setWorkModeFilter(e.target.value as 'ALL' | WorkMode)}
            className="px-3 py-2 text-xs font-medium bg-[#111114] border border-zinc-700 rounded-lg text-zinc-200 focus:border-[#D4AF37] focus:outline-none cursor-pointer"
          >
            <option value="ALL">Any Work Mode</option>
            {Object.values(WorkMode).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by minimum package"
            value={minLpaFilter}
            onChange={(e) => setMinLpaFilter(Number(e.target.value))}
            className="px-3 py-2 text-xs font-medium bg-[#111114] border border-zinc-700 rounded-lg text-zinc-200 focus:border-[#D4AF37] focus:outline-none cursor-pointer"
          >
            <option value={0}>Any Package</option>
            <option value={6}>₹6.0+ LPA</option>
            <option value={7.5}>₹7.5+ LPA</option>
            <option value={9}>₹9.0+ LPA</option>
          </select>

          <button
            type="button"
            onClick={() => setOnlyEligible((prev) => !prev)}
            aria-pressed={onlyEligible}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              onlyEligible
                ? 'bg-[#B91C1C] text-white border-[#B91C1C]'
                : 'bg-[#111114] text-zinc-300 border-zinc-700 hover:border-zinc-500'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Eligible for Me
          </button>

          <button
            type="button"
            onClick={() => setOnlySaved((prev) => !prev)}
            aria-pressed={onlySaved}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              onlySaved
                ? 'bg-[#D4AF37] text-zinc-950 border-[#D4AF37] font-semibold'
                : 'bg-[#111114] text-zinc-300 border-zinc-700 hover:border-zinc-500'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Saved ({savedJobIds.length})
          </button>

          <select
            aria-label="Sort opportunities"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 text-xs font-medium bg-[#111114] border border-zinc-700 rounded-lg text-zinc-200 focus:border-[#D4AF37] focus:outline-none cursor-pointer"
          >
            <option value="newest">Sort: Newest</option>
            <option value="package">Sort: Highest Package</option>
            <option value="deadline">Sort: Closing Soon</option>
          </select>
        </div>
      </div>

      {/* Status + Compare Roles Strip */}
      <div className="py-4 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-400">
        <div className="flex items-center gap-4">
          <p>
            Showing{' '}
            <span className="font-mono font-medium text-white tabular-nums">
              {filteredJobs.length}
            </span>{' '}
            {filteredJobs.length === 1 ? 'opening' : 'openings'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-[#E5C158] font-medium hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Role Comparison Controls */}
        {compareJobIds.length > 0 && (
          <div className="flex items-center gap-3 bg-[#141418] border border-[#D4AF37]/40 rounded-lg px-3.5 py-2">
            <Scale className="w-3.5 h-3.5 text-[#E5C158]" />
            <span className="text-zinc-200">
              <strong className="font-mono text-[#E5C158] tabular-nums">
                {compareJobIds.length}/3
              </strong>{' '}
              selected to compare
            </span>
            <button
              type="button"
              disabled={compareJobIds.length < 2}
              onClick={onOpenCompare}
              className="px-3 py-1 text-xs font-semibold text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-md transition-colors cursor-pointer disabled:opacity-40"
            >
              Compare Now
            </button>
            <button
              type="button"
              onClick={onClearCompare}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 ? (
        <div className="border border-zinc-800 rounded-xl bg-[#111114] py-16 px-6 text-center">
          <p className="font-serif text-xl font-medium text-white">
            No matching placement openings found
          </p>
          <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
            Broaden your department, package, or work-mode filter to explore all active GNDU roles.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 px-4 py-2 text-sm font-medium text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-lg transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        /* Wide Two-Pane Split Job Directory */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Pane: Job Rows */}
          <div className="lg:col-span-5 border border-zinc-800 rounded-xl bg-[#111114] divide-y divide-zinc-800 overflow-hidden">
            {filteredJobs.map((job) => {
              const isSelected = activeJob?.id === job.id;
              const isSaved = savedJobIds.includes(job.id);
              const isCompared = compareJobIds.includes(job.id);
              const applied = applicationByJobId.get(job.id);
              const elig = checkStudentEligibility(job, profile);

              return (
                <div
                  key={job.id}
                  onClick={() => onSelectJob(job.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectJob(job.id);
                    }
                  }}
                  className={`p-5 transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#19191F]' : 'bg-[#111114] hover:bg-[#15151A]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-lg border flex items-center justify-center font-mono text-xs font-semibold shrink-0 ${
                          isSelected
                            ? 'bg-[#B91C1C]/20 border-[#D4AF37]/60 text-[#E5C158]'
                            : 'bg-[#1A1A20] border-zinc-700 text-zinc-200'
                        }`}
                      >
                        {job.companyInitials}
                      </div>
                      <div className="min-w-0">
                        <h3
                          className={`text-sm font-semibold leading-snug ${
                            isSelected ? 'text-[#E5C158]' : 'text-white'
                          }`}
                        >
                          {job.title}
                        </h3>
                        <p className="mt-1 text-xs text-zinc-400 truncate">
                          {job.company} · {job.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        aria-label={isCompared ? `Remove ${job.title} from comparison` : `Add ${job.title} to comparison`}
                        title="Compare role"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleCompare(job.id);
                        }}
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                          isCompared
                            ? 'text-[#E5C158] bg-[#D4AF37]/15'
                            : 'text-zinc-500 hover:text-zinc-200'
                        }`}
                      >
                        <Scale className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        aria-label={isSaved ? `Remove ${job.title} from saved` : `Save ${job.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSave(job.id);
                        }}
                        className="p-1.5 text-zinc-500 hover:text-[#E5C158] rounded-md transition-colors cursor-pointer"
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-4 h-4 text-[#E5C158]" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3.5 pl-[54px] flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400">
                    <span className="font-mono font-medium text-[#E5C158] tabular-nums">
                      {job.compensationLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{job.jobType}</span>
                    <span aria-hidden="true">·</span>
                    <span>Min. {job.minCgpa.toFixed(1)} CGPA</span>
                  </div>

                  <div className="mt-2 pl-[54px] flex items-center justify-between gap-2 text-xs">
                    <span className="text-zinc-500 tabular-nums">
                      Closes {formatShortDate(job.deadline)}
                    </span>

                    {!job.isOpen ? (
                      <span className="text-zinc-500 font-medium">Closed</span>
                    ) : applied ? (
                      <span className={`font-medium ${getStatusTextTone(applied.status)}`}>
                        Applied · {applied.status}
                      </span>
                    ) : elig.eligible ? (
                      <span className="text-emerald-400 font-medium">Eligible</span>
                    ) : (
                      <span className="text-zinc-500">Criteria mismatch</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Pane: Sticky Detailed Role Inspector */}
          {activeJob && activeEligibility && (
            <article className="lg:col-span-7 lg:sticky lg:top-24 border border-zinc-800 rounded-xl bg-[#111114] p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-zinc-800">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#1A1A20] border border-[#D4AF37]/40 flex items-center justify-center font-mono text-sm font-semibold text-[#E5C158] shrink-0">
                    {activeJob.companyInitials}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#E5C158]">
                      {activeJob.company} · {activeJob.industry}
                    </p>
                    <h2 className="mt-1 font-serif text-2xl font-semibold text-white leading-snug">
                      {activeJob.title}
                    </h2>
                    <p className="mt-1.5 text-sm text-zinc-400">
                      {activeJob.location} · {activeJob.workMode} · {activeJob.jobType}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleCompare(activeJob.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      compareJobIds.includes(activeJob.id)
                        ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#E5C158]'
                        : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    {compareJobIds.includes(activeJob.id) ? 'Comparing' : 'Compare'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleSave(activeJob.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-200 border border-zinc-700 hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {savedJobIds.includes(activeJob.id) ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5 text-[#E5C158]" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        Save
                      </>
                    )}
                  </button>

                  {activeApplication ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 rounded-lg whitespace-nowrap shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Applied
                    </span>
                  ) : !activeJob.isOpen ? (
                    <span className="inline-flex items-center px-4 py-2 text-xs font-medium text-zinc-500 bg-zinc-900 border border-zinc-800 rounded-lg whitespace-nowrap shrink-0">
                      Applications Closed
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onStartApply(activeJob)}
                      className="px-5 py-2 text-xs font-semibold text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>

              <dl className="py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-zinc-800 text-sm">
                <div>
                  <dt className="text-xs text-zinc-500">Compensation</dt>
                  <dd className="mt-1 font-mono font-medium text-[#E5C158] tabular-nums">
                    {activeJob.compensationLabel}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Minimum CGPA</dt>
                  <dd className="mt-1 font-mono font-medium text-white tabular-nums">
                    {activeJob.minCgpa.toFixed(1)} ·{' '}
                    {activeJob.maxBacklogs === 0
                      ? '0 backlogs'
                      : `≤${activeJob.maxBacklogs} backlog`}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Apply Before</dt>
                  <dd className="mt-1 font-mono font-medium text-white tabular-nums">
                    {formatShortDate(activeJob.deadline)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Posted On</dt>
                  <dd className="mt-1 font-mono text-zinc-300 tabular-nums">
                    {formatShortDate(activeJob.postedDate)}
                  </dd>
                </div>
              </dl>

              <div className="mt-5">
                {activeEligibility.eligible ? (
                  <div className="flex items-start gap-2.5 text-sm text-emerald-300 bg-emerald-950/35 border border-emerald-800/60 rounded-lg px-4 py-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p>
                      You meet the eligibility criteria ({profile.department},{' '}
                      <span className="font-mono text-white tabular-nums">
                        {profile.cgpa.toFixed(2)}
                      </span>{' '}
                      CGPA).
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5 text-sm text-amber-200 bg-amber-950/30 border border-amber-800/60 rounded-lg px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-300">Eligibility Check Notice</p>
                      <p className="mt-0.5 text-xs text-amber-200/90">
                        {activeEligibility.reasons.join(' · ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {activeJob.campusVenue && activeJob.driveDate && (
                <div className="mt-5 bg-[#18181C] border border-[#D4AF37]/30 rounded-lg px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#E5C158] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">GNDU On-Campus Drive</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{activeJob.campusVenue}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#E5C158] tabular-nums shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatShortDate(activeJob.driveDate)}
                    {activeJob.pptTime ? ` · ${activeJob.pptTime}` : ''}
                  </div>
                </div>
              )}

              <div className="mt-6 space-y-6 text-sm text-zinc-300 leading-relaxed">
                <div>
                  <h3 className="text-sm font-semibold text-white">Role Overview</h3>
                  <p className="mt-2">{activeJob.summary}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">Key Responsibilities</h3>
                  <ul className="mt-2 space-y-2 list-disc pl-5 text-zinc-300">
                    {activeJob.responsibilities.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 border-t border-zinc-800">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Eligible Departments</h3>
                    <p className="mt-2 text-sm text-zinc-300">
                      {activeJob.eligibleDepartments.join(' · ')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Core Skills &amp; Tools</h3>
                    <p className="mt-2 text-sm text-zinc-300">
                      {activeJob.skills.join(' · ')}
                    </p>
                  </div>
                </div>

                <div className="pt-5 border-t border-zinc-800">
                  <h3 className="text-sm font-semibold text-white">Selection Process</h3>
                  <ol className="mt-2.5 space-y-2">
                    {activeJob.selectionProcess.map((stage, idx) => (
                      <li key={idx} className="flex items-baseline gap-3 text-sm text-zinc-300">
                        <span className="font-mono text-xs text-[#E5C158] tabular-nums shrink-0">
                          0{idx + 1}.
                        </span>
                        <span>{stage}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </article>
          )}
        </div>
      )}
    </div>
  );
}
