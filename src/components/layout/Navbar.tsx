'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import ProgressRing from '@/components/ui/ProgressRing';
import { useProgressStore } from '@/lib/progress-store';

const navLinks = [
  { href: '/skill-tree', label: 'Skill Tree', icon: '🗺' },
  { href: '/dashboard', label: 'Stats', icon: '📊' },
];

export default function Navbar() {
  const pathname = usePathname();
  const completionPercent = useProgressStore((s) => s.completionPercent());
  const isLanding = pathname === '/';

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: isLanding ? 'transparent' : 'rgba(250,250,248,0.85)',
        backdropFilter: isLanding ? 'none' : 'blur(20px) saturate(1.2)',
        WebkitBackdropFilter: isLanding ? 'none' : 'blur(20px) saturate(1.2)',
        borderBottom: isLanding ? 'none' : '1px solid rgba(0,0,0,0.06)',
      }}
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="text-lg">🍳</span>
          <span
            className="font-semibold text-sm tracking-tight transition-colors duration-200"
            style={{ color: isLanding ? 'rgba(255,255,255,0.9)' : '#1A1A1A' }}
          >
            The Concurrency Kitchen
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200"
                style={{
                  color: isActive
                    ? (isLanding ? '#FF5A1F' : '#FF5A1F')
                    : (isLanding ? 'rgba(255,255,255,0.6)' : '#6B7280'),
                  background: isActive ? 'rgba(255,90,31,0.06)' : 'transparent',
                }}
              >
                <span className="text-xs">{link.icon}</span>
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}

          {/* Divider */}
          <div className="w-px h-5 mx-2" style={{ background: isLanding ? 'rgba(255,255,255,0.15)' : '#E5E5E3' }} />

          {/* Progress indicator */}
          <ProgressRing progress={completionPercent} size={32} strokeWidth={2.5}>
            <span className="font-mono font-bold" style={{ fontSize: '0.6rem', color: '#FF5A1F' }}>
              {completionPercent}
            </span>
          </ProgressRing>
        </div>
      </div>
    </motion.nav>
  );
}
