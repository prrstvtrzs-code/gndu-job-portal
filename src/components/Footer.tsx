import { LogOut } from 'lucide-react';
import { ActiveTab, AuthAccount } from '../types/portal';

interface FooterProps {
  currentUser: AuthAccount;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenProfile: () => void;
  onSignOut: () => void;
}

export function Footer({
  currentUser,
  onSelectTab,
  onOpenProfile,
  onSignOut,
}: FooterProps) {
  return (
    <footer className="border-t border-zinc-800 bg-[#0D0D10] mt-20 print:hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-zinc-800">
          <div className="md:col-span-5">
            <p className="font-serif text-lg font-semibold text-white">
              Directorate of Placement &amp; Career Enhancement
            </p>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed max-w-md">
              Guru Nanak Dev University, Grand Trunk Road, Off NH-1, Amritsar — 143005, Punjab, India.
            </p>
            <p className="mt-3 text-xs text-[#E5C158]">
              Established 1969 · NAAC Accredited &ldquo;A++&rdquo; Grade University
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-sm font-semibold text-white">Portal Navigation</h3>
            <ul className="mt-3 space-y-2 text-sm text-zinc-400">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('home')}
                  className="hover:text-[#E5C158] transition-colors cursor-pointer"
                >
                  Home Overview
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('jobs')}
                  className="hover:text-[#E5C158] transition-colors cursor-pointer"
                >
                  Find Jobs &amp; Compare Roles
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('companies')}
                  className="hover:text-[#E5C158] transition-colors cursor-pointer"
                >
                  Recruiting Companies
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('drives')}
                  className="hover:text-[#E5C158] transition-colors cursor-pointer"
                >
                  Campus Placement Drives
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectTab('workspace')}
                  className="hover:text-[#E5C158] transition-colors cursor-pointer"
                >
                  Applications, Resume &amp; Recruiter Desk
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-sm font-semibold text-white">Placement Cell Office</h3>
            <dl className="mt-3 space-y-2 text-sm text-zinc-400">
              <div className="flex items-baseline justify-between gap-4 border-b border-zinc-800/80 pb-1.5">
                <dt className="text-zinc-500">Office Hours</dt>
                <dd className="tabular-nums text-zinc-200">Mon – Fri, 09:00 – 17:00</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-zinc-800/80 pb-1.5">
                <dt className="text-zinc-500">Helpdesk Email</dt>
                <dd className="text-zinc-200">placements@gndu.ac.in</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-zinc-500">Active Session</dt>
                <dd className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onOpenProfile}
                    className="text-[#E5C158] font-medium hover:underline cursor-pointer"
                  >
                    {currentUser.name}
                  </button>
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Guru Nanak Dev University, Amritsar. Official Academic Placement Portal.</p>
          <p>Signed in as {currentUser.role} · Session saved locally in your browser.</p>
        </div>
      </div>
    </footer>
  );
}
