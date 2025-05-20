// components/layout/Navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LogoutButton } from '@/components/ui/LogoutButton';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Projects', href: '/dashboard/projects' },
  { label: 'Settings', href: '/dashboard/settings' },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-primary shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="text-white text-xl font-bold">
            🎵 MusicFile
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    relative px-3 py-2 font-medium
                    ${
                      isActive
                        ? 'text-white before:absolute before:-bottom-1 before:left-0 before:w-full before:h-0.5 before:bg-white'
                        : 'text-white/80 hover:text-white hover:before:absolute hover:before:-bottom-1 hover:before:left-0 hover:before:w-full hover:before:h-0.5 hover:before:bg-white'
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User + Logout (desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {session?.user?.email && (
              <span className="text-white text-sm truncate max-w-xs">
                {session.user.email}
              </span>
            )}
            <LogoutButton />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden text-white focus:outline-none"
          >
            {mobileOpen ? (
              <span className="text-2xl">✕</span>
            ) : (
              <span className="text-2xl">☰</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-primary/95">
          <nav className="px-2 pt-2 pb-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    block px-3 py-2 rounded-md font-medium
                    ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}

            {session?.user?.email && (
              <div className="mt-4 px-3 text-white/90 text-sm">
                {session.user.email}
              </div>
            )}
            <div className="px-3 mt-2">
              <LogoutButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
