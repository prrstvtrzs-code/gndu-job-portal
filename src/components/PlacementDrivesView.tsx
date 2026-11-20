import { useState } from 'react';
import { Building2, Calendar, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { ASSET_PATHS } from '../data/seedData';
import { JobOpening, JobType, StudentProfile } from '../types/portal';
import { checkStudentEligibility, formatShortDate } from '../utils/portalHelpers';

interface PlacementDrivesViewProps {
  jobs: JobOpening[];
  profile: StudentProfile;
  registeredDriveIds: string[];
  onToggleDriveRegistration: (jobId: string) => void;
  onInspectJob: (jobId: string) => void;
}

export function PlacementDrivesView({
  jobs,
  profile,
  registeredDriveIds,
  onToggleDriveRegistration,
  onInspectJob,
}: PlacementDrivesViewProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const drives = jobs
    .filter((j) => j.jobType === JobType.OnCampusDrive)
    .sort((a, b) => (a.driveDate ?? a.deadline).localeCompare(b.driveDate ?? b.deadline));

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 pt-10">
      {/* Institutional Header Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pb-10 border-b border-zinc-800">
        <div className="lg:col-span-7 flex flex-col justify-center">
          <p className="text-xs font-medium text-[#E2C265]">
            GNDU Amritsar · Campus Recruitment Calendar
          </p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-semibold text-white leading-tight">
            Upcoming On-Campus Placement Drives
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
            Pre-Placement Talks (PPT), aptitude assessments, and interview panels hosted across
            Guru Nanak Dev University auditoriums and departmental seminar halls. Register in advance
            to reserve your seating pass.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-400">
            <span>
              Scheduled Drives:{' '}
              <strong className="font-mono text-white tabular-nums">{drives.length}</strong>
            </span>
            <span aria-hidden="true" className="text-zinc-700">
              |
            </span>
            <span>
              Your Registered Drives:{' '}
              <strong className="font-mono text-[#E2C265] tabular-nums">
                {registeredDriveIds.length}
              </strong>
            </span>
            <span aria-hidden="true" className="text-zinc-700">
              |
            </span>
            <span>Reporting Time: 30 mins prior to PPT</span>
          </div>
        </div>

        <div className="lg:col-span-5">
          <figure className="h-full min-h-[210px] rounded-xl overflow-hidden border border-[#D4AF37]/30 bg-[#141418] relative">
            {!imgFailed ? (
              <img
                src={ASSET_PATHS.auditoriumDrive}
                alt="University placement auditorium prepared for pre-placement talk"
                referrerPolicy="no-referrer"
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#141418]">
                <Building2 className="w-8 h-8 text-[#D4AF37]/70" />
                <p className="mt-2 font-serif text-base text-white">
                  Dasmesh Auditorium &amp; Seminar Halls
                </p>
              </div>
            )}
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 py-2.5 text-xs text-zinc-100">
              Pre-Placement Talks · GNDU Main Campus, Amritsar
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Drives Schedule List */}
      <section className="pt-8">
        <h2 className="font-serif text-xl font-semibold text-white">
          Confirmed Schedule — Nov / Dec 2026
        </h2>

        {drives.length === 0 ? (
          <div className="mt-5 border border-zinc-800 rounded-xl bg-[#111114] py-12 px-6 text-center text-sm text-zinc-400">
            No on-campus drives are currently scheduled. Placement coordinators can publish new drives
            from the Recruiter Desk.
          </div>
        ) : (
          <div className="mt-5 border border-zinc-800 rounded-xl bg-[#111114] divide-y divide-zinc-800">
            {drives.map((drive) => {
              const isRegistered = registeredDriveIds.includes(drive.id);
              const eligibility = checkStudentEligibility(drive, profile);

              return (
                <div
                  key={drive.id}
                  className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center hover:bg-[#16161B] transition-colors"
                >
                  {/* Date & Time Column */}
                  <div className="lg:col-span-3">
                    <div className="flex items-center gap-2 text-sm font-mono font-medium text-white tabular-nums">
                      <Calendar className="w-4 h-4 text-[#E2C265] shrink-0" />
                      {formatShortDate(drive.driveDate ?? drive.deadline)}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-zinc-400 tabular-nums">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      PPT at {drive.pptTime ?? '09:30 AM'}
                    </div>
                    <div className="mt-1.5 flex items-start gap-2 text-xs text-zinc-400">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                      <span>{drive.campusVenue ?? 'GNDU Main Campus, Amritsar'}</span>
                    </div>
                  </div>

                  {/* Organization & Role Column */}
                  <div className="lg:col-span-6">
                    <p className="text-xs font-medium text-[#E2C265]">{drive.company}</p>
                    <h3 className="mt-0.5 text-base font-semibold text-white">
                      {drive.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-zinc-400">
                      <span className="font-mono font-medium text-white tabular-nums">
                        {drive.compensationLabel}
                      </span>{' '}
                      · Min. {drive.minCgpa.toFixed(1)} CGPA ·{' '}
                      {drive.eligibleDepartments.join(', ')}
                    </p>
                    <p className="mt-1.5 text-xs">
                      {eligibility.eligible ? (
                        <span className="text-emerald-400 font-medium">
                          Your profile is eligible for this drive
                        </span>
                      ) : (
                        <span className="text-amber-300">
                          Criteria note: {eligibility.reasons[0]}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Actions Column */}
                  <div className="lg:col-span-3 flex flex-wrap lg:justify-end items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onInspectJob(drive.id)}
                      className="px-3.5 py-2 text-xs font-medium text-zinc-200 border border-zinc-700 hover:bg-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Role Details
                    </button>

                    <button
                      type="button"
                      disabled={!drive.isOpen && !isRegistered}
                      onClick={() => onToggleDriveRegistration(drive.id)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        isRegistered
                          ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/70 hover:bg-emerald-950/80'
                          : 'bg-[#B91C1C] text-white hover:bg-[#991B1B]'
                      }`}
                    >
                      {isRegistered ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Registered
                        </>
                      ) : drive.isOpen ? (
                        'Register for Drive'
                      ) : (
                        'Drive Closed'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Institutional Guidelines Section */}
      <section className="mt-12 pt-10 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h2 className="font-serif text-lg font-semibold text-white">
            <span className="text-[#E2C265]">01.</span> Mandatory Documents for Campus Drives
          </h2>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            Every participating GNDU candidate must carry an organized folder containing the
            following documents on the day of the Pre-Placement Talk:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300 list-disc pl-5">
            <li>Original Guru Nanak Dev University Student Identity Card.</li>
            <li>Two printed copies of your latest single-page resume in GNDU format.</li>
            <li>Self-attested photocopies of Class X, Class XII, and all semester DMCs.</li>
            <li>Two recent passport-size formal photographs.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-lg font-semibold text-white">
            <span className="text-[#E2C265]">02.</span> Attendance &amp; Placement Cell Policy
          </h2>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            To maintain institutional standards with visiting corporate panels, students registered
            for a drive are expected to observe these guidelines:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300 list-disc pl-5">
            <li>Report to the designated auditorium at least 30 minutes before the PPT begins.</li>
            <li>Formal business attire is compulsory for all pre-placement talks and interviews.</li>
            <li>
              Absence after drive registration without prior written notice to the department
              coordinator may restrict participation in the next drive.
            </li>
            <li>Direct salary negotiation outside the official placement cell channel is prohibited.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
