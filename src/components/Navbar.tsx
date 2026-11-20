import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ActiveTab } from '../types/portal';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenProfile: () => void;
}

const NAV_ITEMS: { id: ActiveTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'jobs', label: 'Find Jobs' },
  { id: 'companies', label: 'Companies' },
  { id: 'drives', label: 'Campus Drives' },
  { id: 'workspace', label: 'Workspace' },
];

export function Navbar({ activeTab, onSelectTab, onOpenProfile }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#09090B]/95 backdrop-blur-md border-b border-zinc-800 print:hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Two-Tone Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="font-serif text-xl sm:text-[1.35rem] font-semibold tracking-tight text-white hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          GNDU <span className="text-[#E5C158]">Placements</span>
        </button>

        {/* Zone 2: 5 Clean Single-Line Navigation Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-8 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`relative py-5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-[#E5C158] font-semibold'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-[#D4AF37]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenProfile}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Account Profile
          </button>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 text-zinc-300 hover:text-white rounded-lg border border-zinc-800 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-[#09090B] px-4 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#18181B] text-[#E5C158] font-semibold'
                    : 'text-zinc-300 hover:bg-[#141418] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="pt-3 mt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenProfile();
              }}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[#B91C1C] hover:bg-[#991B1B] rounded-lg transition-colors cursor-pointer"
            >
              Account Profile
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
