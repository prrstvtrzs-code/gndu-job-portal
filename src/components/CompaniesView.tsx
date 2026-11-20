import { useMemo, useState } from 'react';
import { ArrowRight, Building2, Calendar, MapPin, Search } from 'lucide-react';
import { JobOpening, JobType } from '../types/portal';

interface CompaniesViewProps {
  jobs: JobOpening[];
  onExploreCompanyJobs: (companyName: string) => void;
}

interface CompanySummary {
  company: string;
  initials: string;
  industry: string;
  locations: string[];
  openRolesCount: number;
  totalRolesCount: number;
  highestLpa: number;
  hasOnCampusDrive: boolean;
  departments: string[];
}

export function CompaniesView({ jobs, onExploreCompanyJobs }: CompaniesViewProps) {
  const [query, setQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('ALL');

  const companies = useMemo<CompanySummary[]>(() => {
    const map = new Map<string, CompanySummary>();
    for (const job of jobs) {
      const existing = map.get(job.company);
      if (!existing) {
        map.set(job.company, {
          company: job.company,
          initials: job.companyInitials,
          industry: job.industry,
          locations: [job.location],
          openRolesCount: job.isOpen ? 1 : 0,
          totalRolesCount: 1,
          highestLpa: job.packageLpaNumeric,
          hasOnCampusDrive: job.jobType === JobType.OnCampusDrive,
          departments: [...job.eligibleDepartments],
        });
      } else {
        existing.totalRolesCount += 1;
        if (job.isOpen) existing.openRolesCount += 1;
        if (job.packageLpaNumeric > existing.highestLpa) {
          existing.highestLpa = job.packageLpaNumeric;
        }
        if (job.jobType === JobType.OnCampusDrive) existing.hasOnCampusDrive = true;
        if (!existing.locations.includes(job.location)) existing.locations.push(job.location);
        for (const dept of job.eligibleDepartments) {
          if (!existing.departments.includes(dept)) existing.departments.push(dept);
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.highestLpa - a.highestLpa);
  }, [jobs]);

  const industries = useMemo(
    () => Array.from(new Set(companies.map((c) => c.industry))).sort(),
    [companies]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies.filter((c) => {
      if (industryFilter !== 'ALL' && c.industry !== industryFilter) return false;
      if (q) {
        const hay = [c.company, c.industry, ...c.locations, ...c.departments]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [companies, query, industryFilter]);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 pt-10">
      <div className="pb-8 border-b border-zinc-800 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-medium text-[#E5C158]">Verified Partner Organizations</p>
          <h1 className="mt-1.5 font-serif text-3xl sm:text-4xl font-semibold text-white">
            Recruiting Companies at GNDU
          </h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
            Explore national and global organizations hiring Guru Nanak Dev University graduates for
            2026–27 campus placements and final-semester industrial training.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search
              aria-hidden="true"
              className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recruiter or department..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#111114] border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <select
            aria-label="Filter recruiters by industry"
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="px-3.5 py-2 text-sm bg-[#111114] border border-zinc-700 rounded-lg text-zinc-200 focus:border-[#D4AF37] focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Industries</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 border border-zinc-800 rounded-xl bg-[#111114] py-16 px-6 text-center">
          <Building2 className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="mt-3 font-serif text-xl text-white">No matching companies found</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIndustryFilter('ALL');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-lg cursor-pointer"
          >
            Reset Directory Filter
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <article
              key={item.company}
              className="p-6 rounded-xl bg-[#111114] border border-zinc-800 hover:border-[#D4AF37]/50 transition-colors flex flex-col justify-between gap-5"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-lg bg-[#1A1A20] border border-[#D4AF37]/30 flex items-center justify-center font-mono text-sm font-semibold text-[#E5C158] shrink-0">
                      {item.initials}
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-white">{item.company}</h2>
                      <p className="mt-0.5 text-xs text-zinc-400">{item.industry}</p>
                    </div>
                  </div>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-4 py-4 border-y border-zinc-800/80 text-xs">
                  <div>
                    <dt className="text-zinc-500">Top Package</dt>
                    <dd className="mt-1 font-mono text-sm font-medium text-[#E5C158] tabular-nums">
                      ₹{item.highestLpa.toFixed(1)} LPA
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Open Positions</dt>
                    <dd className="mt-1 font-mono text-sm font-medium text-white tabular-nums">
                      {item.openRolesCount} Active
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 space-y-1.5 text-xs text-zinc-400">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{item.locations.join(' · ')}</span>
                  </p>
                  {item.hasOnCampusDrive && (
                    <p className="flex items-center gap-1.5 text-[#E5C158]">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>Scheduled for GNDU On-Campus Drive</span>
                    </p>
                  )}
                  <p className="pt-1 text-zinc-400">
                    Hiring: <span className="text-zinc-200">{item.departments.join(' · ')}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onExploreCompanyJobs(item.company)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#1B1B21] hover:bg-[#B91C1C] border border-zinc-700 hover:border-[#B91C1C] rounded-lg transition-colors cursor-pointer"
              >
                View Open Roles
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
