import React, { useMemo, useState } from 'react';
import { Newspaper, Megaphone, ChevronDown, ChevronUp } from 'lucide-react';
import type { PressAnnouncementArchiveItem } from '../../data/memoryLaneMedia';
import type { LightboxSlide } from './MediaLightbox';

export interface PressDisplayItem {
  id: string;
  title: string;
  source: string;
  kind: 'article' | 'announcement';
  thumb: string;
  image: string;
  description?: string | null;
}

interface PressMiniSectionProps {
  items: PressDisplayItem[];
  onOpenLightbox: (slides: LightboxSlide[], startIndex: number) => void;
}

const INITIAL_VISIBLE = 8;

const PressMiniSection: React.FC<PressMiniSectionProps> = ({ items, onOpenLightbox }) => {
  const [filter, setFilter] = useState<'all' | 'article' | 'announcement'>('all');
  const [expanded, setExpanded] = useState(false);

  const counts = useMemo(() => {
    const articles = items.filter((item) => item.kind === 'article').length;
    const announcements = items.filter((item) => item.kind === 'announcement').length;
    return { all: items.length, article: articles, announcement: announcements };
  }, [items]);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((item) => item.kind === filter);
  }, [items, filter]);

  const visibleItems = expanded ? filtered : filtered.slice(0, INITIAL_VISIBLE);

  const slides = useMemo<LightboxSlide[]>(
    () =>
      filtered.map((item) => ({
        image: item.image,
        title: item.title,
        badge: item.source,
        subtitle: item.description || null
      })),
    [filtered]
  );

  if (!items.length) return null;

  return (
    <section className="section bg-slate-50 border-t border-slate-200/80" aria-labelledby="press-mini-heading">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 id="press-mini-heading" className="text-2xl md:text-3xl font-bold text-slate-900 font-heading">
            Press Archive &amp; Social Highlights
          </h2>

          {/* Sub-filter pills */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setFilter('all');
                setExpanded(false);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter('article');
                setExpanded(false);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === 'article'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Newspaper size={13} aria-hidden="true" />
              News Articles ({counts.article})
            </button>
            <button
              type="button"
              onClick={() => {
                setFilter('announcement');
                setExpanded(false);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === 'announcement'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Megaphone size={13} aria-hidden="true" />
              Announcements ({counts.announcement})
            </button>
          </div>
        </div>

        {/* Compact Mini Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleItems.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpenLightbox(slides, idx)}
              className="group text-left bg-white rounded-xl border border-slate-200/90 overflow-hidden hover:border-primary-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 flex flex-col"
            >
              <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.thumb}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/80 text-white backdrop-blur-xs">
                  {item.source}
                </span>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <p className="text-xs font-semibold text-slate-900 line-clamp-2 group-hover:text-primary-700 transition-colors leading-snug">
                  {item.title}
                </p>
              </div>
            </button>
          ))}
        </div>

        {filtered.length > INITIAL_VISIBLE && (
          <div className="mt-8 text-center">
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((prev) => !prev)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-100 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp size={15} aria-hidden="true" />
                  <span>Show fewer clippings</span>
                </>
              ) : (
                <>
                  <ChevronDown size={15} aria-hidden="true" />
                  <span>View all {filtered.length} clippings &amp; announcements</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export type { PressAnnouncementArchiveItem };
export default PressMiniSection;
