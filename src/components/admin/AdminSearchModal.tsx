import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  Search,
  X,
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  Calendar,
  Image as ImageIcon,
  Ship,
  Users2,
  UserCog,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Loader2,
  Clock
} from 'lucide-react';

interface AdminSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: React.ElementType;
  url: string;
  isExternal?: boolean;
}

const staticNavItems: SearchResultItem[] = [
  {
    id: 'nav-dashboard',
    title: 'Dashboard Overview',
    subtitle: 'System KPIs, resource distribution, and recent activities',
    category: 'Navigation',
    icon: LayoutDashboard,
    url: '/admin'
  },
  {
    id: 'nav-registrations',
    title: 'Swimming Registrations',
    subtitle: 'Manage swimmer enrollment applications and tutor assignments',
    category: 'Navigation',
    icon: ClipboardList,
    url: '/admin/registrations'
  },
  {
    id: 'nav-athletes',
    title: 'Athletes Roster',
    subtitle: 'Manage national aquatic athletes and discipline profiles',
    category: 'Navigation',
    icon: Users,
    url: '/admin/athletes'
  },
  {
    id: 'nav-posts',
    title: 'Press & Media Posts',
    subtitle: 'Publish articles, press releases, and federation updates',
    category: 'Navigation',
    icon: FileText,
    url: '/admin/posts'
  },
  {
    id: 'nav-activities',
    title: 'Activities & Calendar',
    subtitle: 'Aquatic tournaments, training camps, and coaching clinics',
    category: 'Navigation',
    icon: Calendar,
    url: '/admin/activities'
  },
  {
    id: 'nav-gallery',
    title: 'Media Gallery',
    subtitle: 'Federation photo albums and competition video archives',
    category: 'Navigation',
    icon: ImageIcon,
    url: '/admin/gallery'
  },
  {
    id: 'nav-travel',
    title: 'Travel & Logistics',
    subtitle: 'Delegation itineraries, Sea Coach timetables, and hotel stays',
    category: 'Navigation',
    icon: Ship,
    url: '/admin/travel'
  },
  {
    id: 'nav-board',
    title: 'Executive Board',
    subtitle: 'National federation executive committee and leadership directory',
    category: 'Navigation',
    icon: Users2,
    url: '/admin/board'
  },
  {
    id: 'nav-staff',
    title: 'Technical Staff',
    subtitle: 'National coaches, FINA referees, and technical officials',
    category: 'Navigation',
    icon: UserCog,
    url: '/admin/technical-staff'
  },
  {
    id: 'nav-reports',
    title: 'Safe Sport Reports',
    subtitle: 'Confidential athlete welfare and ethics compliance reports',
    category: 'Navigation',
    icon: ShieldAlert,
    url: '/admin/reports'
  },
  {
    id: 'nav-public',
    title: 'View Public Website',
    subtitle: 'Open the live Sierra Leone Aquatics public home portal',
    category: 'Quick Actions',
    icon: ExternalLink,
    url: '/',
    isExternal: true
  }
];

const AdminSearchModal: React.FC<AdminSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [dbResults, setDbResults] = useState<SearchResultItem[]>([]);
  const [isSearchingDb, setIsSearchingDb] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setDbResults([]);
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Live Supabase query search with debouncing
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setDbResults([]);
      setIsSearchingDb(false);
      return;
    }

    setIsSearchingDb(true);
    const timeout = setTimeout(async () => {
      try {
        const [
          { data: athletesData },
          { data: postsData },
          { data: eventsData }
        ] = await Promise.all([
          supabase
            .from('athletes')
            .select('id, name, discipline, club')
            .ilike('name', `%${trimmed}%`)
            .limit(4),
          supabase
            .from('news_posts')
            .select('id, title, category, author')
            .ilike('title', `%${trimmed}%`)
            .limit(4),
          supabase
            .from('events')
            .select('id, title, category, date')
            .ilike('title', `%${trimmed}%`)
            .limit(4)
        ]);

        const formattedResults: SearchResultItem[] = [];

        if (athletesData) {
          athletesData.forEach(ath => {
            formattedResults.push({
              id: `ath-${ath.id}`,
              title: ath.name,
              subtitle: `Athlete • ${ath.discipline || 'Aquatics'} ${ath.club ? `(${ath.club})` : ''}`,
              category: 'Athletes',
              icon: Users,
              url: '/admin/athletes'
            });
          });
        }

        if (postsData) {
          postsData.forEach(p => {
            formattedResults.push({
              id: `post-${p.id}`,
              title: p.title,
              subtitle: `Article • ${p.category || 'Press Release'} ${p.author ? `by ${p.author}` : ''}`,
              category: 'Articles',
              icon: FileText,
              url: '/admin/posts'
            });
          });
        }

        if (eventsData) {
          eventsData.forEach(ev => {
            formattedResults.push({
              id: `ev-${ev.id}`,
              title: ev.title,
              subtitle: `Event • ${ev.category || 'Tournament'} • ${new Date(ev.date).toLocaleDateString()}`,
              category: 'Events',
              icon: Calendar,
              url: '/admin/activities'
            });
          });
        }

        setDbResults(formattedResults);
      } catch (err) {
        console.error('Error in search:', err);
      } finally {
        setIsSearchingDb(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  // Filter static navigation items
  const filteredNavItems = staticNavItems.filter(item => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const allItems = [...filteredNavItems, ...dbResults];

  // Keyboard navigation inside modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (allItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % allItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allItems.length) % allItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = allItems[selectedIndex];
      if (current) {
        handleSelectItem(current);
      }
    }
  };

  const handleSelectItem = (item: SearchResultItem) => {
    onClose();
    if (item.isExternal) {
      window.open(item.url, '_blank');
    } else {
      navigate(item.url);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col max-h-[80vh] transition-all animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-200 flex items-center px-4 py-3.5 bg-white">
          <Search size={18} className="text-slate-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search pages, athletes, news, events, or actions (⌘K)..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
          />
          {isSearchingDb && (
            <Loader2 size={16} className="animate-spin text-primary-600 mr-2 flex-shrink-0" />
          )}
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setDbResults([]);
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 mr-1"
            >
              <X size={15} />
            </button>
          ) : null}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Scrollable Result List */}
        <div
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100"
        >
          {allItems.length === 0 ? (
            <div className="py-12 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Search size={20} />
              </div>
              <p className="text-sm font-semibold text-slate-800">No matching results found</p>
              <p className="text-xs text-slate-500 mt-1">
                No pages, athletes, or articles match "{query}". Try a different search term.
              </p>
            </div>
          ) : (
            <>
              {/* If query entered, display live database matches section first */}
              {dbResults.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Live Database Results ({dbResults.length})
                  </div>
                  <div className="space-y-0.5">
                    {dbResults.map((item, idx) => {
                      const absoluteIndex = filteredNavItems.length + idx;
                      const isSelected = absoluteIndex === selectedIndex;
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectItem(item)}
                          onMouseEnter={() => setSelectedIndex(absoluteIndex)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-primary-50/90 text-primary-950 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              <Icon size={16} />
                            </div>
                            <div className="truncate">
                              <span className="text-xs font-semibold block truncate">
                                {item.title}
                              </span>
                              <span className="text-[11px] text-slate-500 block truncate font-normal">
                                {item.subtitle}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                              {item.category}
                            </span>
                            <ArrowRight size={13} className={isSelected ? 'text-primary-600' : 'text-slate-300'} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation and System Shortcuts */}
              {filteredNavItems.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {query.trim() ? 'Navigation Matches' : 'Platform Navigation & Shortcuts'}
                  </div>
                  <div className="space-y-0.5">
                    {filteredNavItems.map((item, idx) => {
                      const isSelected = idx === selectedIndex;
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectItem(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-primary-50/90 text-primary-950 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              <Icon size={16} />
                            </div>
                            <div className="truncate">
                              <span className="text-xs font-semibold block truncate">
                                {item.title}
                              </span>
                              <span className="text-[11px] text-slate-500 block truncate font-normal">
                                {item.subtitle}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                            <ArrowRight size={13} className={isSelected ? 'text-primary-600' : 'text-slate-300'} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with Keyboard Hints */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-semibold text-slate-600 shadow-xs">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-semibold text-slate-600 shadow-xs">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-semibold text-slate-600 shadow-xs">↵</kbd>
              <span>select</span>
            </span>
          </div>
          <span>Sierra Leone Aquatics Admin</span>
        </div>
      </div>
    </div>
  );
};

export default AdminSearchModal;
