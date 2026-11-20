import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ApplyModal } from './components/ApplyModal';
import { ApplicationsView } from './components/ApplicationsView';
import { AuthScreen } from './components/AuthScreen';
import { CompaniesView } from './components/CompaniesView';
import { CompareModal } from './components/CompareModal';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { Navbar } from './components/Navbar';
import { OpportunitiesView } from './components/OpportunitiesView';
import { PlacementDrivesView } from './components/PlacementDrivesView';
import { ProfileModal } from './components/ProfileModal';
import { RecruiterDeskView } from './components/RecruiterDeskView';
import { ResumePreviewPanel } from './components/ResumePreviewPanel';
import {
  INITIAL_ACCOUNTS,
  INITIAL_APPLICATIONS,
  INITIAL_COMPLETED_PREP_IDS,
  INITIAL_JOBS,
  INITIAL_REGISTERED_DRIVE_IDS,
  INITIAL_SAVED_JOB_IDS,
  INITIAL_STUDENT_PROFILE,
} from './data/seedData';
import {
  ActiveTab,
  ApplicationStatus,
  AuthAccount,
  Department,
  JobApplication,
  JobOpening,
  StudentProfile,
  UserRole,
  WorkspaceSubTab,
} from './types/portal';

const STORAGE_KEY = 'gndu_placement_portal_v3';
const ACCOUNTS_KEY = 'gndu_placement_accounts_v2';

interface PersistedState {
  jobs: JobOpening[];
  applications: JobApplication[];
  profile: StudentProfile;
  savedJobIds: string[];
  registeredDriveIds: string[];
  completedPrepIds: string[];
}

function loadInitialState(): PersistedState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        jobs: INITIAL_JOBS,
        applications: INITIAL_APPLICATIONS,
        profile: INITIAL_STUDENT_PROFILE,
        savedJobIds: INITIAL_SAVED_JOB_IDS,
        registeredDriveIds: INITIAL_REGISTERED_DRIVE_IDS,
        completedPrepIds: INITIAL_COMPLETED_PREP_IDS,
      };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      jobs: Array.isArray(parsed.jobs) && parsed.jobs.length > 0 ? parsed.jobs : INITIAL_JOBS,
      applications: Array.isArray(parsed.applications) ? parsed.applications : INITIAL_APPLICATIONS,
      profile: parsed.profile
        ? { ...INITIAL_STUDENT_PROFILE, ...parsed.profile }
        : INITIAL_STUDENT_PROFILE,
      savedJobIds: Array.isArray(parsed.savedJobIds) ? parsed.savedJobIds : INITIAL_SAVED_JOB_IDS,
      registeredDriveIds: Array.isArray(parsed.registeredDriveIds)
        ? parsed.registeredDriveIds
        : INITIAL_REGISTERED_DRIVE_IDS,
      completedPrepIds: Array.isArray(parsed.completedPrepIds)
        ? parsed.completedPrepIds
        : INITIAL_COMPLETED_PREP_IDS,
    };
  } catch {
    return {
      jobs: INITIAL_JOBS,
      applications: INITIAL_APPLICATIONS,
      profile: INITIAL_STUDENT_PROFILE,
      savedJobIds: INITIAL_SAVED_JOB_IDS,
      registeredDriveIds: INITIAL_REGISTERED_DRIVE_IDS,
      completedPrepIds: INITIAL_COMPLETED_PREP_IDS,
    };
  }
}

function loadStoredAccounts(): AuthAccount[] {
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return INITIAL_ACCOUNTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ACCOUNTS;
  } catch {
    return INITIAL_ACCOUNTS;
  }
}

export default function App() {
  const initial = useMemo(() => loadInitialState(), []);

  // Always start on the Log In / Sign Up screen when the website opens
  const [currentUser, setCurrentUser] = useState<AuthAccount | null>(null);
  const [accounts, setAccounts] = useState<AuthAccount[]>(() => loadStoredAccounts());

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceSubTab>('applications');

  const [jobs, setJobs] = useState<JobOpening[]>(initial.jobs);
  const [applications, setApplications] = useState<JobApplication[]>(initial.applications);
  const [profile, setProfile] = useState<StudentProfile>(initial.profile);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(initial.savedJobIds);
  const [registeredDriveIds, setRegisteredDriveIds] = useState<string[]>(
    initial.registeredDriveIds
  );
  const [completedPrepIds, setCompletedPrepIds] = useState<string[]>(initial.completedPrepIds);

  // Find Jobs shared search & comparison state
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobDepartmentFilter, setJobDepartmentFilter] = useState<'ALL' | Department>('ALL');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(initial.jobs[0]?.id ?? null);
  const [compareJobIds, setCompareJobIds] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const [applyingJob, setApplyingJob] = useState<JobOpening | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const payload: PersistedState = {
        jobs,
        applications,
        profile,
        savedJobIds,
        registeredDriveIds,
        completedPrepIds,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors in restricted iframe environments
    }
  }, [jobs, applications, profile, savedJobIds, registeredDriveIds, completedPrepIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch {
      // Ignore storage errors
    }
  }, [accounts]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const studentApplications = useMemo(
    () => applications.filter((a) => a.isCurrentStudent),
    [applications]
  );

  const comparedJobs = useMemo(
    () => jobs.filter((j) => compareJobIds.includes(j.id)),
    [jobs, compareJobIds]
  );

  const showToast = (msg: string) => setToastMessage(msg);

  const handleRegisterAccount = (account: AuthAccount) => {
    setAccounts((prev) => [...prev, account]);
  };

  const handleAuthenticate = (user: AuthAccount, isNewSignup = false) => {
    setCurrentUser(user);

    if (user.role === UserRole.Student) {
      setProfile((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber ?? prev.rollNumber,
        department: user.department ?? prev.department,
        cgpa: user.cgpa ?? prev.cgpa,
      }));
      setActiveTab('home');
      setWorkspaceTab('applications');
    } else {
      setActiveTab('workspace');
      setWorkspaceTab('recruiter');
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
    showToast(
      isNewSignup
        ? `Account created. Welcome to GNDU Placements, ${user.name}.`
        : `Welcome back, ${user.name}.`
    );
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setApplyingJob(null);
    setProfileModalOpen(false);
    setCompareModalOpen(false);
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleSearchFromHome = (query: string, department: 'ALL' | Department = 'ALL') => {
    setJobSearchQuery(query);
    setJobDepartmentFilter(department);
    setActiveTab('jobs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreCompanyJobs = (companyName: string) => {
    setJobSearchQuery(companyName);
    setJobDepartmentFilter('ALL');
    setActiveTab('jobs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSave = (jobId: string) => {
    setSavedJobIds((prev) => {
      const exists = prev.includes(jobId);
      if (exists) {
        showToast('Removed opening from saved list.');
        return prev.filter((id) => id !== jobId);
      }
      showToast('Saved opening to Workspace -> My Applications.');
      return [...prev, jobId];
    });
  };

  const handleToggleCompare = (jobId: string) => {
    setCompareJobIds((prev) => {
      if (prev.includes(jobId)) {
        return prev.filter((id) => id !== jobId);
      }
      if (prev.length >= 3) {
        showToast('You can compare up to 3 roles side by side.');
        return prev;
      }
      showToast('Added role to comparison list.');
      return [...prev, jobId];
    });
  };

  const handleTogglePrepItem = (itemId: string) => {
    setCompletedPrepIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSubmitApplication = (payload: { resumeUrl: string; coverNote: string }) => {
    if (!applyingJob) return;
    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      jobId: applyingJob.id,
      studentName: profile.name,
      studentRollNumber: profile.rollNumber,
      studentEmail: profile.email,
      studentDepartment: profile.department,
      studentCgpa: profile.cgpa,
      resumeUrl: payload.resumeUrl,
      coverNote: payload.coverNote,
      appliedDate: new Date().toISOString().slice(0, 10),
      status: ApplicationStatus.UnderReview,
      isCurrentStudent: true,
    };

    setApplications((prev) => [newApp, ...prev]);
    if (applyingJob.jobType === 'On-Campus Drive' && !registeredDriveIds.includes(applyingJob.id)) {
      setRegisteredDriveIds((prev) => [...prev, applyingJob.id]);
    }
    showToast(`Application submitted to ${applyingJob.company}.`);
    setApplyingJob(null);
  };

  const handleWithdrawApplication = (applicationId: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== applicationId));
    showToast('Application withdrawn.');
  };

  const handleToggleDriveRegistration = (jobId: string) => {
    const drive = jobs.find((j) => j.id === jobId);
    setRegisteredDriveIds((prev) => {
      if (prev.includes(jobId)) {
        showToast(`Cancelled drive registration for ${drive?.company ?? 'campus drive'}.`);
        return prev.filter((id) => id !== jobId);
      }
      showToast(`Registered for ${drive?.company ?? 'campus'} on-campus drive.`);
      return [...prev, jobId];
    });
  };

  const handleUpdateApplicationStatus = (applicationId: string, status: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status } : a))
    );
    showToast(`Updated candidate status to "${status}".`);
  };

  const handleCreateJob = (newJobData: Omit<JobOpening, 'id' | 'postedDate' | 'isOpen'>) => {
    const created: JobOpening = {
      ...newJobData,
      id: `job-${Date.now()}`,
      postedDate: new Date().toISOString().slice(0, 10),
      isOpen: true,
    };
    setJobs((prev) => [created, ...prev]);
    setSelectedJobId(created.id);
    showToast(`Published "${created.title}" at ${created.company}.`);
  };

  const handleToggleJobOpen = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, isOpen: !j.isOpen } : j))
    );
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
    setRegisteredDriveIds((prev) => prev.filter((id) => id !== jobId));
    setCompareJobIds((prev) => prev.filter((id) => id !== jobId));
    showToast('Removed opening from portal.');
  };

  const handleInspectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setJobSearchQuery('');
    setJobDepartmentFilter('ALL');
    setActiveTab('jobs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveProfile = (updated: StudentProfile) => {
    setProfile(updated);
    setApplications((prev) =>
      prev.map((app) =>
        app.isCurrentStudent
          ? {
              ...app,
              studentName: updated.name,
              studentRollNumber: updated.rollNumber,
              studentEmail: updated.email,
              studentDepartment: updated.department,
              studentCgpa: updated.cgpa,
            }
          : app
      )
    );
    showToast('Student academic profile updated.');
  };

  const handleResetDemoData = () => {
    setJobs(INITIAL_JOBS);
    setApplications(INITIAL_APPLICATIONS);
    setProfile(INITIAL_STUDENT_PROFILE);
    setSavedJobIds(INITIAL_SAVED_JOB_IDS);
    setRegisteredDriveIds(INITIAL_REGISTERED_DRIVE_IDS);
    setCompletedPrepIds(INITIAL_COMPLETED_PREP_IDS);
    setCompareJobIds([]);
    setSelectedJobId(INITIAL_JOBS[0]?.id ?? null);
    window.localStorage.removeItem(STORAGE_KEY);
    showToast('Restored default GNDU placement records.');
  };

  // Gate entry behind Log In / Sign Up screen when website opens
  if (!currentUser) {
    return (
      <AuthScreen
        accounts={accounts}
        onAuthenticate={handleAuthenticate}
        onRegisterAccount={handleRegisterAccount}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09090B] text-white">
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            jobs={jobs}
            profile={profile}
            savedJobIds={savedJobIds}
            completedPrepIds={completedPrepIds}
            onSearchJobs={handleSearchFromHome}
            onInspectJob={handleInspectJob}
            onToggleSave={handleToggleSave}
            onTogglePrepItem={handleTogglePrepItem}
            onNavigateCompanies={() => {
              setActiveTab('companies');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateDrives={() => {
              setActiveTab('drives');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenResumeBuilder={() => {
              setActiveTab('workspace');
              setWorkspaceTab('resume');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'jobs' && (
          <OpportunitiesView
            jobs={jobs}
            profile={profile}
            savedJobIds={savedJobIds}
            studentApplications={studentApplications}
            selectedJobId={selectedJobId}
            searchQuery={jobSearchQuery}
            departmentFilter={jobDepartmentFilter}
            compareJobIds={compareJobIds}
            onSearchQueryChange={setJobSearchQuery}
            onDepartmentFilterChange={setJobDepartmentFilter}
            onSelectJob={setSelectedJobId}
            onToggleSave={handleToggleSave}
            onToggleCompare={handleToggleCompare}
            onOpenCompare={() => setCompareModalOpen(true)}
            onClearCompare={() => setCompareJobIds([])}
            onStartApply={(job) => setApplyingJob(job)}
            onOpenProfile={() => setProfileModalOpen(true)}
          />
        )}

        {activeTab === 'companies' && (
          <CompaniesView
            jobs={jobs}
            onExploreCompanyJobs={handleExploreCompanyJobs}
          />
        )}

        {activeTab === 'drives' && (
          <PlacementDrivesView
            jobs={jobs}
            profile={profile}
            registeredDriveIds={registeredDriveIds}
            onToggleDriveRegistration={handleToggleDriveRegistration}
            onInspectJob={handleInspectJob}
          />
        )}

        {activeTab === 'workspace' && (
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 pt-8">
            {/* Workspace Mode Switcher Bar */}
            <div className="pb-6 mb-8 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
              <div
                role="tablist"
                aria-label="Workspace modules"
                className="inline-flex items-center p-1 bg-[#141418] border border-zinc-800 rounded-lg overflow-x-auto max-w-full"
              >
                {(
                  [
                    { id: 'applications', label: `My Applications (${studentApplications.length})` },
                    { id: 'resume', label: 'GNDU Resume Preview' },
                    { id: 'recruiter', label: 'Recruiter & Placement Desk' },
                  ] as { id: WorkspaceSubTab; label: string }[]
                ).map((item) => {
                  const active = workspaceTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setWorkspaceTab(item.id)}
                      className={`px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-white text-zinc-950 font-semibold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-zinc-400">
                Signed in as{' '}
                <span className="text-zinc-200 font-medium">{currentUser.name}</span> ·{' '}
                <span className="text-[#E5C158]">{currentUser.role}</span>
              </p>
            </div>

            {workspaceTab === 'applications' && (
              <ApplicationsView
                applications={studentApplications}
                jobs={jobs}
                savedJobIds={savedJobIds}
                onInspectJob={handleInspectJob}
                onWithdrawApplication={handleWithdrawApplication}
                onRemoveSaved={handleToggleSave}
                onGoToOpportunities={() => setActiveTab('jobs')}
              />
            )}

            {workspaceTab === 'resume' && (
              <ResumePreviewPanel
                profile={profile}
                applications={studentApplications}
                jobs={jobs}
                onEditProfile={() => setProfileModalOpen(true)}
              />
            )}

            {workspaceTab === 'recruiter' && (
              <RecruiterDeskView
                jobs={jobs}
                applications={applications}
                onUpdateApplicationStatus={handleUpdateApplicationStatus}
                onCreateJob={handleCreateJob}
                onToggleJobOpen={handleToggleJobOpen}
                onDeleteJob={handleDeleteJob}
              />
            )}
          </div>
        )}
      </main>

      <Footer
        currentUser={currentUser}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenProfile={() => setProfileModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {applyingJob && (
        <ApplyModal
          job={applyingJob}
          profile={profile}
          onClose={() => setApplyingJob(null)}
          onSubmit={handleSubmitApplication}
          onOpenProfile={() => setProfileModalOpen(true)}
        />
      )}

      {compareModalOpen && comparedJobs.length >= 2 && (
        <CompareModal
          jobs={comparedJobs}
          profile={profile}
          onRemoveJob={(id) => {
            const next = compareJobIds.filter((item) => item !== id);
            setCompareJobIds(next);
            if (next.length < 2) setCompareModalOpen(false);
          }}
          onSelectAndApply={(job) => {
            setCompareModalOpen(false);
            setApplyingJob(job);
          }}
          onClose={() => setCompareModalOpen(false)}
        />
      )}

      {profileModalOpen && (
        <ProfileModal
          currentUser={currentUser}
          profile={profile}
          onClose={() => setProfileModalOpen(false)}
          onSave={handleSaveProfile}
          onResetDemoData={handleResetDemoData}
          onSignOut={handleSignOut}
        />
      )}

      {/* Subtle Action Confirmation Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-[#18181C] text-white text-sm px-4 py-3 rounded-lg shadow-2xl border border-[#D4AF37]/40 max-w-md print:hidden"
        >
          <CheckCircle2 className="w-4 h-4 text-[#E5C158] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
