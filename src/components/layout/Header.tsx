import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import { navItems } from '../../data/navItems';
import { NavItem } from '../../types';
import Logo from '../ui/Logo';

const Header: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navContainerRef = useRef<HTMLElement>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  const closeAll = () => {
    setIsMobileOpen(false);
    setOpenDesktopDropdown(null);
  };

  useEffect(() => {
    const handleScroll = () => {
      const isPast = window.scrollY > 15;
      setScrolled((prev) => (prev !== isPast ? isPast : prev));
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  // Close menus on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setOpenDesktopDropdown(null);
  }, [location.pathname]);

  // Close desktop dropdown on Escape or outside click
  useEffect(() => {
    if (!openDesktopDropdown) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDesktopDropdown(null);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setOpenDesktopDropdown(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [openDesktopDropdown]);

  const isRouteActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const isGroupActive = (item: NavItem) => {
    if (!item.subItems) return isRouteActive(item.href);
    return item.subItems.some((sub) => isRouteActive(sub.href));
  };

  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current !== null) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleDesktopEnter = (label: string, e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    clearHoverTimeout();
    setOpenDesktopDropdown(label);
  };

  const handleDesktopLeave = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    clearHoverTimeout();
    hoverTimeoutRef.current = window.setTimeout(() => {
      setOpenDesktopDropdown(null);
    }, 120);
  };

  const isHomePage = location.pathname === '/';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isHomePage && !scrolled && !isMobileOpen
          ? 'bg-transparent py-4 md:py-5'
          : 'bg-white/90 backdrop-blur-md border-b border-slate-200/70 shadow-[0_1px_3px_rgba(15,23,42,0.04)] py-3'
      }`}
    >
      <div className="container mx-auto px-5 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between gap-6">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg"
            onClick={closeAll}
          >
            <Logo size={36} />
            <div className="flex flex-col">
              <span className="font-heading font-bold text-base tracking-tight text-slate-900 leading-none group-hover:text-primary-600 transition-colors">
                Sierra Leone Aquatics
              </span>
            </div>
          </Link>

          {/* Single Primary Navigation Landmark */}
          <nav
            ref={navContainerRef}
            aria-label="Primary"
            className="flex items-center gap-2"
          >
            {/* Desktop Inline Links & Dropdowns */}
            <ul className="hidden md:flex items-center gap-1 lg:gap-2">
              {navItems.map((item) => {
                const hasSubItems = Boolean(item.subItems?.length);
                const active = isGroupActive(item);
                const isDropdownOpen = openDesktopDropdown === item.label;
                const submenuId = `desktop-submenu-${item.label.toLowerCase().replace(/\s+/g, '-')}`;

                if (!hasSubItems) {
                  return (
                    <li key={item.label}>
                      <Link
                        to={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center ${
                          active
                            ? 'text-primary-700 bg-primary-50/80 font-semibold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li
                    key={item.label}
                    className="relative"
                    onPointerEnter={(e) => handleDesktopEnter(item.label, e)}
                    onPointerLeave={handleDesktopLeave}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                        setOpenDesktopDropdown((prev) => (prev === item.label ? null : prev));
                      }
                    }}
                  >
                    <button
                      type="button"
                      aria-expanded={isDropdownOpen}
                      aria-controls={submenuId}
                      onClick={() =>
                        setOpenDesktopDropdown((prev) =>
                          prev === item.label ? null : item.label
                        )
                      }
                      className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                        active || isDropdownOpen
                          ? 'text-primary-700 bg-primary-50/80 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        size={14}
                        aria-hidden="true"
                        className={`transition-transform duration-200 ${
                          isDropdownOpen ? 'rotate-180 text-primary-600' : 'text-slate-400'
                        }`}
                      />
                    </button>

                    {isDropdownOpen && (
                      <div
                        id={submenuId}
                        className="absolute left-0 top-full pt-2 w-72 z-50"
                      >
                        <ul className="bg-white rounded-xl border border-slate-200/90 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.14)] p-2 space-y-0.5">
                          {item.subItems!.map((sub) => {
                            const subActive = isRouteActive(sub.href);
                            return (
                              <li key={sub.href}>
                                <Link
                                  to={sub.href}
                                  aria-current={subActive ? 'page' : undefined}
                                  onClick={() => setOpenDesktopDropdown(null)}
                                  className={`block px-3.5 py-2.5 rounded-lg transition-colors ${
                                    subActive
                                      ? 'bg-primary-50 text-primary-700'
                                      : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold">
                                      {sub.label}
                                    </span>
                                    {subActive && (
                                      <span
                                        aria-hidden="true"
                                        className="w-1.5 h-1.5 rounded-full bg-primary-600"
                                      />
                                    )}
                                  </div>
                                  {sub.description && (
                                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                                      {sub.description}
                                    </p>
                                  )}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Desktop Primary Public CTA */}
            <div className="hidden md:flex items-center pl-3 ml-1 border-l border-slate-200/80">
              <Link
                to="/register"
                aria-current={isRouteActive('/register') ? 'page' : undefined}
                className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-xs"
              >
                <span>Lessons</span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-700 hover:text-primary-600 hover:bg-slate-100/80 transition-colors"
              onClick={() => setIsMobileOpen((prev) => !prev)}
              aria-expanded={isMobileOpen}
              aria-controls="mobile-site-menu"
              aria-label={isMobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isMobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileOpen && (
        <div
          id="mobile-site-menu"
          className="md:hidden bg-white border-t border-slate-200/80 shadow-lg max-h-[calc(100dvh-4rem)] overflow-y-auto"
        >
          <div className="px-5 py-5 space-y-2">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const hasSubItems = Boolean(item.subItems?.length);
                const active = isGroupActive(item);
                const isExpanded = openMobileGroup === item.label;
                const mobileSubId = `mobile-submenu-${item.label.toLowerCase().replace(/\s+/g, '-')}`;

                if (!hasSubItems) {
                  return (
                    <li key={item.label}>
                      <Link
                        to={item.href}
                        aria-current={active ? 'page' : undefined}
                        onClick={closeAll}
                        className={`block px-3.5 py-3 rounded-xl text-base font-medium transition-colors ${
                          active
                            ? 'bg-primary-50 text-primary-700 font-semibold'
                            : 'text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={mobileSubId}
                      onClick={() =>
                        setOpenMobileGroup((prev) => (prev === item.label ? null : item.label))
                      }
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-base font-medium transition-colors ${
                        active
                          ? 'bg-primary-50/70 text-primary-700 font-semibold'
                          : 'text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        size={17}
                        aria-hidden="true"
                        className={`text-slate-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-primary-600' : ''
                        }`}
                      />
                    </button>

                    <ul
                      id={mobileSubId}
                      hidden={!isExpanded}
                      className="mt-1 ml-3 pl-3 border-l border-slate-200 space-y-1"
                    >
                      {item.subItems!.map((sub) => {
                        const subActive = isRouteActive(sub.href);
                        return (
                          <li key={sub.href}>
                            <Link
                              to={sub.href}
                              aria-current={subActive ? 'page' : undefined}
                              onClick={closeAll}
                              className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                subActive
                                  ? 'text-primary-700 font-semibold bg-primary-50/60'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              {sub.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/register"
                onClick={closeAll}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                <span>Swimming Lessons</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
