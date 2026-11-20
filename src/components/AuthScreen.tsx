import React, { useState } from 'react';
import { ArrowRight, Building2, Eye, EyeOff } from 'lucide-react';
import { ASSET_PATHS } from '../data/seedData';
import { AuthAccount, Department, UserRole } from '../types/portal';

interface AuthScreenProps {
  accounts: AuthAccount[];
  onAuthenticate: (account: AuthAccount, isNewSignup?: boolean) => void;
  onRegisterAccount: (newAccount: AuthAccount) => void;
}

export function AuthScreen({
  accounts,
  onAuthenticate,
  onRegisterAccount,
}: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<UserRole>(UserRole.Student);
  const [showPassword, setShowPassword] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login fields
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup fields
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState<Department>(Department.CSE_IT);
  const [cgpa, setCgpa] = useState('8.20');
  const [organization, setOrganization] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedId = identifier.trim().toLowerCase();
    if (!cleanedId || !loginPassword.trim()) {
      setError('Please enter your university email or roll number and password.');
      return;
    }

    const matched = accounts.find(
      (acc) =>
        acc.email.toLowerCase() === cleanedId ||
        (acc.rollNumber && acc.rollNumber.toLowerCase() === cleanedId)
    );

    if (matched) {
      if (matched.password !== loginPassword) {
        setError('Incorrect password. Try "gndu2026" for demo accounts or register a new account.');
        return;
      }
      setError(null);
      onAuthenticate(matched, false);
      return;
    }

    if (cleanedId.includes('@') && loginPassword.length >= 4) {
      const derivedName = cleanedId
        .split('@')[0]
        .replace(/[._-]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());

      const quickAccount: AuthAccount = {
        id: `acc-${Date.now()}`,
        name: derivedName || 'GNDU Candidate',
        email: cleanedId,
        password: loginPassword,
        role,
        ...(role === UserRole.Student
          ? {
              rollNumber: '2023CSA1088',
              department: Department.CSE_IT,
              cgpa: 8.15,
            }
          : {
              organization: 'GNDU Placement Cell',
            }),
      };
      setError(null);
      onRegisterAccount(quickAccount);
      onAuthenticate(quickAccount, true);
      return;
    }

    setError('No matching GNDU account found. Switch to Sign Up or use Quick Demo Access below.');
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fullName.trim();
    const cleanEmail = signupEmail.trim().toLowerCase();

    if (!cleanName || !cleanEmail || signupPassword.length < 6) {
      setError('Enter your full name, valid email address, and a password of at least 6 characters.');
      return;
    }

    if (role === UserRole.Student && !rollNumber.trim()) {
      setError('Please enter your GNDU Roll Number (e.g. 2023CSA1042).');
      return;
    }

    if (accounts.some((acc) => acc.email.toLowerCase() === cleanEmail)) {
      setError('An account with this email already exists. Please switch to Log In.');
      return;
    }

    const newAccount: AuthAccount = {
      id: `acc-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: signupPassword,
      role,
      ...(role === UserRole.Student
        ? {
            rollNumber: rollNumber.trim().toUpperCase(),
            department,
            cgpa: Math.min(10, Math.max(0, parseFloat(cgpa) || 7.5)),
          }
        : {
            organization: organization.trim() || 'Partner Recruiter · GNDU Amritsar',
          }),
    };

    setError(null);
    onRegisterAccount(newAccount);
    onAuthenticate(newAccount, true);
  };

  const demoStudent = accounts.find((a) => a.role === UserRole.Student) ?? accounts[0];
  const demoOfficer = accounts.find((a) => a.role === UserRole.Recruiter) ?? accounts[1];

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 grid grid-cols-1 lg:grid-cols-12">
      {/* Left Architectural Showcase — Real GNDU Amritsar Landmark */}
      <section className="relative lg:col-span-7 min-h-[340px] lg:min-h-screen flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-zinc-800">
        {!imgFailed ? (
          <img
            src={ASSET_PATHS.authCampusBhawan}
            alt="Guru Nanak Dev University Amritsar Sri Guru Granth Sahib Bhawan and campus reflecting pool at golden hour"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#18181B] via-[#09090B] to-[#1C0B0B] flex items-center justify-center">
            <Building2 className="w-16 h-16 text-[#D4AF37]/40" />
          </div>
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/65 to-[#09090B]/40"
        />

        <div className="relative z-10 p-6 sm:p-10 lg:p-14">
          <p className="text-xs font-medium text-[#E5C158] tracking-wide">
            Directorate of Placement &amp; Career Enhancement · Est. 1969
          </p>
          <p className="mt-1.5 font-serif text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Guru Nanak Dev University, Amritsar
          </p>
        </div>

        <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-2xl">
          <div className="w-12 h-0.5 bg-[#D4AF37] mb-5" aria-hidden="true" />
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-semibold text-white leading-[1.12]">
            Find Your <span className="text-[#E5C158]">Dream Career</span>. Build Your Future.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-zinc-200 leading-relaxed">
            The official university career platform connecting GNDU students across Engineering,
            MCA, Management, Pharmacy, and Architecture with verified campus recruiters.
          </p>

          <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-3 gap-6 text-xs">
            <div>
              <p className="font-mono text-lg font-medium text-[#E5C158] tabular-nums">A++</p>
              <p className="mt-0.5 text-zinc-300">NAAC Accredited</p>
            </div>
            <div>
              <p className="font-mono text-lg font-medium text-white tabular-nums">2026–27</p>
              <p className="mt-0.5 text-zinc-300">Placement Cycle</p>
            </div>
            <div>
              <p className="font-mono text-lg font-medium text-white tabular-nums">Amritsar</p>
              <p className="mt-0.5 text-zinc-300">G.T. Road Main Campus</p>
            </div>
          </div>
        </div>
      </section>

      {/* Right Authentication Workspace */}
      <section className="lg:col-span-5 flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14 bg-[#09090B]">
        <div className="w-full max-w-md mx-auto">
          <p className="text-xs font-medium text-[#E5C158]">
            GNDU Placements · Member Access
          </p>
          <h2 className="mt-1.5 font-serif text-2xl sm:text-3xl font-semibold text-white">
            {mode === 'login' ? 'Sign in to your account' : 'Create your GNDU portal account'}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            {mode === 'login'
              ? 'Sign in with your university credentials to explore jobs, compare packages, and apply.'
              : 'Register as a GNDU student or placement coordinator to begin.'}
          </p>

          <div
            role="tablist"
            aria-label="Authentication mode"
            className="mt-7 grid grid-cols-2 p-1 bg-[#141418] border border-zinc-800 rounded-lg"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-zinc-950'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signup'}
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-zinc-950'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <span className="block text-xs font-medium text-zinc-300">Portal Role</span>
                <div className="mt-1.5 grid grid-cols-2 gap-2.5">
                  {[UserRole.Student, UserRole.Recruiter].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors text-center cursor-pointer ${
                        role === r
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#F5E199]'
                          : 'border-zinc-800 bg-[#111114] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {r === UserRole.Student ? 'Student' : 'Placement Cell'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="login-id" className="block text-xs font-medium text-zinc-300">
                  University Email or Roll Number
                </label>
                <input
                  id="login-id"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="harpreet.2023csa1042@gndu.ac.in or 2023CSA1042"
                  className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-[#111114] border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-xs font-medium text-zinc-300">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-[#111114] border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-xs text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-lg transition-colors cursor-pointer"
              >
                Sign In to Portal
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="mt-6 space-y-4">
              <div>
                <span className="block text-xs font-medium text-zinc-300">Register As</span>
                <div className="mt-1.5 grid grid-cols-2 gap-2.5">
                  {[UserRole.Student, UserRole.Recruiter].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors text-center cursor-pointer ${
                        role === r
                          ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#F5E199]'
                          : 'border-zinc-800 bg-[#111114] text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {r === UserRole.Student ? 'GNDU Student' : 'Placement Cell / Recruiter'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="signup-name" className="block text-xs font-medium text-zinc-300">
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Manpreet Singh"
                  className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#111114] border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {role === UserRole.Student ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="signup-roll" className="block text-xs font-medium text-zinc-300">
                      GNDU Roll Number
                    </label>
                    <input
                      id="signup-roll"
                      type="text"
                      required
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                      placeholder="2023CSA1055"
                      className="mt-1.5 w-full px-3 py-2 text-sm font-mono bg-[#111114] border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="signup-cgpa" className="block text-xs font-medium text-zinc-300">
                      Current CGPA
                    </label>
                    <input
                      id="signup-cgpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      required
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      className="mt-1.5 w-full px-3 py-2 text-sm font-mono tabular-nums bg-[#111114] border border-zinc-800 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="signup-dept" className="block text-xs font-medium text-zinc-300">
                      Department / Program
                    </label>
                    <select
                      id="signup-dept"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value as Department)}
                      className="mt-1.5 w-full px-3 py-2 text-sm bg-[#111114] border border-zinc-800 rounded-lg text-white focus:border-[#D4AF37] focus:outline-none"
                    >
                      {Object.values(Department).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label htmlFor="signup-org" className="block text-xs font-medium text-zinc-300">
                    Organization / Placement Office
                  </label>
                  <input
                    id="signup-org"
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. TCS Campus Hiring / GNDU Placement Cell"
                    className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#111114] border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label htmlFor="signup-email" className="block text-xs font-medium text-zinc-300">
                  University / Work Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="name@gndu.ac.in"
                  className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#111114] border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-xs font-medium text-zinc-300">
                  Create Password (min. 6 characters)
                </label>
                <input
                  id="signup-password"
                  type="password"
                  required
                  minLength={6}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  className="mt-1.5 w-full px-3.5 py-2 text-sm bg-[#111114] border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {error && (
                <p role="alert" className="text-xs text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-lg transition-colors cursor-pointer"
              >
                Create Account &amp; Enter Portal
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-zinc-800">
            <p className="text-xs font-medium text-zinc-400">
              Quick Demo Access (University Presentation)
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoStudent && (
                <button
                  type="button"
                  onClick={() => onAuthenticate(demoStudent, false)}
                  className="px-3.5 py-2.5 text-left rounded-lg border border-zinc-800 bg-[#111114] hover:border-[#D4AF37]/60 transition-colors cursor-pointer"
                >
                  <p className="text-xs font-semibold text-white">Demo Student</p>
                  <p className="mt-0.5 text-[11px] text-zinc-400 truncate">
                    {demoStudent.name} · {demoStudent.rollNumber}
                  </p>
                </button>
              )}
              {demoOfficer && (
                <button
                  type="button"
                  onClick={() => onAuthenticate(demoOfficer, false)}
                  className="px-3.5 py-2.5 text-left rounded-lg border border-zinc-800 bg-[#111114] hover:border-[#D4AF37]/60 transition-colors cursor-pointer"
                >
                  <p className="text-xs font-semibold text-[#E5C158]">Placement Officer</p>
                  <p className="mt-0.5 text-[11px] text-zinc-400 truncate">
                    {demoOfficer.name} · Recruiter Desk
                  </p>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
