import React, { useState, useEffect, useMemo, useRef } from 'react';
import PageHeader from '../components/ui/PageHeader';
import { Calendar, ChevronDown, MapPin, Users, ChevronsUpDown } from 'lucide-react';
import { supabase, cachedQuery } from '../lib/supabase';
import { Database } from '../types/supabase';

type EventRow = Database['public']['Tables']['events']['Row'];

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Activities',
  international: 'International',
  competition: 'Competitions',
  development: 'Development',
  education: 'Education & Coaching',
  governance: 'Governance & Media',
  community: 'Community & Welfare',
  training: 'Training'
};

const CATEGORY_BADGE_STYLES: Record<string, string> = {
  international: 'bg-primary-50 text-primary-700 border-primary-200/80',
  competition: 'bg-amber-50 text-amber-800 border-amber-200/80',
  development: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  education: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  governance: 'bg-slate-100 text-slate-700 border-slate-200',
  community: 'bg-rose-50 text-rose-700 border-rose-200/80',
  training: 'bg-cyan-50 text-cyan-800 border-cyan-200/80'
};

const formatFallbackDate = (dateString: string | null) => {
  if (!dateString) return '';
  const parsed = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateString;
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getEventYear = (dateString: string | null): string => {
  if (!dateString) return 'Archive';
  const match = dateString.match(/^(\d{4})/);
  return match ? match[1] : 'Archive';
};

const ActivitiesPage: React.FC = () => {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [allExpanded, setAllExpanded] = useState(false);
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await cachedQuery<EventRow[]>(
          'all-events',
          () =>
            supabase
              .from('events')
              .select('*')
              .order('date', { ascending: false })
        );

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(events.map((event) => event.category).filter(Boolean) as string[])
    );
    const ordered = [
      'international',
      'competition',
      'development',
      'education',
      'governance',
      'community',
      'training'
    ];
    const sorted = unique.sort((a, b) => {
      const ia = ordered.indexOf(a);
      const ib = ordered.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    return ['all', ...sorted];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return activeCategory === 'all'
      ? events
      : events.filter((event) => event.category === activeCategory);
  }, [events, activeCategory]);

  // Group events chronologically by year (2026 -> 2021, most recent to oldest)
  const groupedByYear = useMemo(() => {
    const groups = new Map<string, EventRow[]>();
    for (const event of filteredEvents) {
      const year = getEventYear(event.date);
      const bucket = groups.get(year) || [];
      bucket.push(event);
      groups.set(year, bucket);
    }
    return Array.from(groups.entries()).sort(([yearA], [yearB]) => {
      const numA = Number(yearA) || 0;
      const numB = Number(yearB) || 0;
      return numB - numA;
    });
  }, [filteredEvents]);

  // Reset expand-all indicator when filter changes
  useEffect(() => {
    setAllExpanded(false);
  }, [activeCategory]);

  // Keep Expand/Collapse All button synced when users toggle individual <details>
  useEffect(() => {
    const container = timelineContainerRef.current;
    if (!container) return;

    const handleToggle = (e: Event) => {
      const target = e.target;
      if (!(target instanceof HTMLDetailsElement)) return;
      const items = container.querySelectorAll<HTMLDetailsElement>('details.timeline-details');
      if (!items.length) {
        setAllExpanded(false);
        return;
      }
      setAllExpanded(Array.from(items).every((el) => el.open));
    };

    container.addEventListener('toggle', handleToggle, { capture: true });
    return () => container.removeEventListener('toggle', handleToggle, { capture: true });
  }, [filteredEvents]);

  const handleToggleAll = () => {
    const container = timelineContainerRef.current;
    if (!container) return;
    const nextOpen = !allExpanded;
    const items = container.querySelectorAll<HTMLDetailsElement>('details.timeline-details');
    items.forEach((el) => {
      el.open = nextOpen;
    });
    setAllExpanded(nextOpen);
  };

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Our Activities"
          description="Chronicle of Sierra Leone Aquatics milestones, competitions, clinics, and programmes from 2021 to 2026."
          image="https://i.ibb.co/zzN3ygJ/Screenshot-2025-05-22-at-10-27-22-PM.png"
        />
        <section className="section bg-white">
          <div className="container-custom">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto" />
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Our Activities"
        description="Chronicle of Sierra Leone Aquatics milestones, competitions, clinics, and programmes from 2021 to 2026."
        image="https://i.ibb.co/zzN3ygJ/Screenshot-2025-05-22-at-10-27-22-PM.png"
      />

      <section className="section bg-white">
        <div className="container-custom max-w-4xl">
          {/* Intro & Controls */}
          <div className="mb-10 pb-8 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 mb-2">
                  2026 – 2021 Activity Timeline
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 font-heading">
                  Federation Milestones
                </h2>
                <p className="text-sm text-slate-600 mt-1.5">
                  Select any heading below to view full details, venues, and athlete delegations.
                </p>
              </div>

              {filteredEvents.length > 0 && (
                <button
                  type="button"
                  onClick={handleToggleAll}
                  aria-expanded={allExpanded}
                  className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-full text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  <ChevronsUpDown size={14} className="text-primary-600" />
                  <span>{allExpanded ? 'Collapse all' : 'Expand all'}</span>
                </button>
              )}
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2 mb-5">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    activeCategory === category
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {CATEGORY_LABELS[category] || category}
                </button>
              ))}
            </div>

            {/* Year quick-jump bar */}
            {groupedByYear.length > 1 && (
              <nav aria-label="Jump to year" className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium mr-1">Jump to year:</span>
                {groupedByYear.map(([year, list]) => (
                  <a
                    key={year}
                    href={`#timeline-year-${year}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-slate-200 text-slate-700 hover:border-primary-500 hover:text-primary-700 transition-colors font-medium"
                  >
                    <span>{year}</span>
                    <span className="text-[10px] text-slate-400">({list.length})</span>
                  </a>
                ))}
              </nav>
            )}
          </div>

          {/* Vertical Chronological Timeline */}
          <div ref={timelineContainerRef} className="space-y-12">
            {groupedByYear.map(([year, yearEvents]) => (
              <div
                key={year}
                id={`timeline-year-${year}`}
                className="scroll-mt-28"
                aria-labelledby={`year-heading-${year}`}
              >
                {/* Year Header */}
                <div className="flex items-center gap-3 mb-5">
                  <h2
                    id={`year-heading-${year}`}
                    className="text-2xl md:text-3xl font-bold text-slate-900 font-heading tracking-tight"
                  >
                    {year}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100">
                    {yearEvents.length} {yearEvents.length === 1 ? 'activity' : 'activities'}
                  </span>
                  <div className="flex-1 h-px bg-slate-200" aria-hidden="true" />
                </div>

                {/* Vertical Timeline Spine */}
                <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-3">
                  {yearEvents.map((event) => {
                    const categoryKey = (event.category || 'governance').toLowerCase();
                    const badgeStyle =
                      CATEGORY_BADGE_STYLES[categoryKey] ||
                      'bg-slate-100 text-slate-700 border-slate-200';
                    const dateLabel = event.display_date || formatFallbackDate(event.date);

                    return (
                      <div key={event.id} className="relative">
                        {/* Timeline Rail Dot */}
                        <span
                          aria-hidden="true"
                          className="absolute -left-[31px] sm:-left-[39px] top-5 h-3 w-3 rounded-full bg-white border-2 border-primary-600 ring-4 ring-white"
                        />

                        <details className="timeline-details group rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 open:border-primary-300/90 open:bg-slate-50/40 transition-colors">
                          <summary className="px-4 sm:px-5 py-4 flex items-start gap-3 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 rounded-xl">
                            <ChevronDown
                              size={18}
                              aria-hidden="true"
                              className="timeline-chevron mt-0.5 flex-shrink-0 text-primary-600"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                {dateLabel && (
                                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                                    <Calendar size={12} aria-hidden="true" />
                                    {dateLabel}
                                  </span>
                                )}
                                {event.category && (
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${badgeStyle}`}
                                  >
                                    {CATEGORY_LABELS[categoryKey] || event.category}
                                  </span>
                                )}
                              </div>
                              <span className="block text-base sm:text-lg font-semibold text-slate-900 group-hover:text-primary-700 transition-colors leading-snug font-heading">
                                {event.title}
                              </span>
                            </div>
                          </summary>

                          {/* Disclosed Details Body */}
                          <div className="px-4 sm:px-5 pb-5 pt-1 pl-11 sm:pl-12 space-y-4 border-t border-slate-100">
                            {event.location && (
                              <div className="flex items-center gap-2 text-xs font-medium text-slate-600 pt-3">
                                <MapPin size={14} className="text-primary-600 flex-shrink-0" aria-hidden="true" />
                                <span>{event.location}</span>
                              </div>
                            )}

                            {event.description && (
                              <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed pt-1">
                                {event.description}
                              </p>
                            )}

                            {event.participants && event.participants.length > 0 && (
                              <div className="pt-1">
                                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                                  <Users size={13} className="text-primary-600" aria-hidden="true" />
                                  <span>Delegation &amp; Participants</span>
                                </div>
                                <ul className="flex flex-wrap gap-2">
                                  {event.participants.map((person, idx) => (
                                    <li
                                      key={`${event.id}-p-${idx}`}
                                      className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700"
                                    >
                                      {person}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {event.image && (
                              <div className="pt-2">
                                <img
                                  src={event.image}
                                  alt={event.title}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full max-h-72 object-cover rounded-xl border border-slate-200"
                                />
                              </div>
                            )}
                          </div>
                        </details>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-base text-slate-600">No activities found in this category.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section bg-slate-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-6 text-slate-900">Get Involved</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-100">
                <h3 className="text-xl mb-3 text-slate-900">Athletes</h3>
                <p className="text-slate-600 mb-4">
                  Join training programs and compete in local and international events
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-slate-100">
                <h3 className="text-xl mb-3 text-slate-900">Coaches</h3>
                <p className="text-slate-600 mb-4">
                  Get certified and help develop the next generation of athletes
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-slate-100">
                <h3 className="text-xl mb-3 text-slate-900">Volunteers</h3>
                <p className="text-slate-600 mb-4">
                  Support our events and programs through volunteering
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ActivitiesPage;
