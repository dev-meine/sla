import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Grid, Layers } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import AccordionGallery, { AccordionGalleryItem } from '../components/gallery/AccordionGallery';
import DriftWall, { DriftWallItem } from '../components/gallery/DriftWall';
import PressMiniSection, { PressDisplayItem } from '../components/gallery/PressMiniSection';
import MediaLightbox, { LightboxSlide } from '../components/gallery/MediaLightbox';
import {
  MEMORY_LANE_ARCHIVE,
  PRESS_ANNOUNCEMENTS_ARCHIVE
} from '../data/memoryLaneMedia';
import { supabase, cachedQuery } from '../lib/supabase';
import { Database } from '../types/supabase';
import { isSafeHttpsUrl } from '../utils/sanitizeHtml';

type GalleryItemRow = Database['public']['Tables']['gallery_items']['Row'];

const ACCORDION_PAGE_SIZE = 6;
const MEMORY_GRID_BATCH = 24;

// Curated featured highlights to ensure the 5-panel AccordionGallery always displays its full expanding effect
const FEATURED_ACCORDION_HIGHLIGHTS: AccordionGalleryItem[] = [
  {
    image: '/media/memory-lane/full/ml-201.webp',
    label: 'Team Sierra Leone Poolside',
    alt: 'Sierra Leone Aquatics team holding the national flag poolside',
    description: 'Sierra Leone Aquatics delegation celebrating with the national flag at international competition.'
  },
  {
    image: '/media/memory-lane/full/ml-227.webp',
    label: 'Commonwealth Games — Glasgow',
    alt: 'Sierra Leone swimmer holding the national flag on the Commonwealth Games pool deck',
    description: 'Representing Sierra Leone on the international stage at the Commonwealth Games.'
  },
  {
    image: '/media/memory-lane/full/ml-199.webp',
    label: 'National Team Delegation',
    alt: 'Sierra Leone Aquatics national team delegation in official tracksuits',
    description: 'Sierra Leone Aquatics athletes, coaches, and officials representing the federation.'
  },
  {
    image: '/media/memory-lane/full/ml-206.webp',
    label: 'Sierra Dolphins International',
    alt: 'Sierra Leone swimmer displaying the national flag at an international championship pool',
    description: 'Sierra Leone Dolphins carrying the green, white, and blue onto the championship deck.'
  }
];

const GalleryPage: React.FC = () => {
  const [dbItems, setDbItems] = useState<GalleryItemRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accordionPage, setAccordionPage] = useState(0);
  const [memoryViewMode, setMemoryViewMode] = useState<'wall' | 'grid'>('wall');
  const [memoryGridLimit, setMemoryGridLimit] = useState(MEMORY_GRID_BATCH);
  const [wallColumns, setWallColumns] = useState(7);

  const [lightboxSlides, setLightboxSlides] = useState<LightboxSlide[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        const { data, error } = await cachedQuery<GalleryItemRow[]>(
          'gallery-items',
          () =>
            supabase
              .from('gallery_items')
              .select('*')
              .order('date', { ascending: false })
        );

        if (error) throw error;
        setDbItems(data || []);
      } catch (error) {
        console.error('Error fetching gallery items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGalleryItems();
  }, []);

  // Responsive column count for full-width DriftWall across mobile/tablet/desktop/ultrawide
  useEffect(() => {
    const updateCols = () => {
      if (window.innerWidth < 640) {
        setWallColumns(3);
      } else if (window.innerWidth < 1024) {
        setWallColumns(5);
      } else if (window.innerWidth < 1440) {
        setWallColumns(7);
      } else {
        setWallColumns(8);
      }
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  const openLightbox = useCallback((slides: LightboxSlide[], startIndex: number) => {
    setLightboxSlides(slides);
    setLightboxIndex(startIndex);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  // Main gallery: recent Supabase photos (`section === 'main'`), topped up to 5 panels so AccordionGallery shows its full effect
  const mainImages = useMemo<AccordionGalleryItem[]>(() => {
    const dbMain: AccordionGalleryItem[] = dbItems
      .filter((item) => (!item.section || item.section === 'main') && item.type === 'image')
      .map((item) => ({
        image: item.url,
        label: item.title,
        alt: item.title,
        description: item.description,
        date: item.date
      }));

    if (dbMain.length >= 5) return dbMain;

    const needed = 5 - dbMain.length;
    return [...dbMain, ...FEATURED_ACCORDION_HIGHLIGHTS.slice(0, needed)];
  }, [dbItems]);

  const mainVideos = useMemo(
    () =>
      dbItems.filter(
        (item) => (!item.section || item.section === 'main') && item.type === 'video'
      ),
    [dbItems]
  );

  const totalAccordionPages = Math.max(1, Math.ceil(mainImages.length / ACCORDION_PAGE_SIZE));
  const pagedMainImages = useMemo(() => {
    const start = accordionPage * ACCORDION_PAGE_SIZE;
    return mainImages.slice(start, start + ACCORDION_PAGE_SIZE);
  }, [mainImages, accordionPage]);

  const mainSlides = useMemo<LightboxSlide[]>(
    () =>
      mainImages.map((item) => ({
        image: item.image,
        title: item.label,
        badge: item.date ? new Date(item.date).toLocaleDateString() : 'Gallery Highlight',
        subtitle: item.description || null
      })),
    [mainImages]
  );

  // Memory Lane: merge any admin-uploaded Supabase `memory_lane` photos + deduplicated archive
  const memoryLaneItems = useMemo<DriftWallItem[]>(() => {
    const uploaded: DriftWallItem[] = dbItems
      .filter((item) => item.section === 'memory_lane' && item.type === 'image')
      .map((item) => ({
        id: item.id,
        image: item.url,
        fullImage: item.url,
        title: item.title
      }));

    const archive: DriftWallItem[] = MEMORY_LANE_ARCHIVE.map((item) => ({
      id: item.id,
      image: item.thumb,
      fullImage: item.image,
      title: item.title
    }));

    return [...uploaded, ...archive];
  }, [dbItems]);

  const memorySlides = useMemo<LightboxSlide[]>(
    () =>
      memoryLaneItems.map((item, idx) => ({
        image: item.fullImage || item.image,
        title: item.title || `Sierra Leone Aquatics Memory #${idx + 1}`,
        badge: 'Memory Lane'
      })),
    [memoryLaneItems]
  );

  // Press & Announcements mini section: merge Supabase `press` uploads + curated archive
  const pressItems = useMemo<PressDisplayItem[]>(() => {
    const uploaded: PressDisplayItem[] = dbItems
      .filter((item) => item.section === 'press' && item.type === 'image')
      .map((item) => ({
        id: item.id,
        title: item.title,
        source: 'Official Update',
        kind: 'announcement',
        thumb: item.url,
        image: item.url,
        description: item.description
      }));

    const archive: PressDisplayItem[] = PRESS_ANNOUNCEMENTS_ARCHIVE.map((item) => ({
      id: item.id,
      title: item.title,
      source: item.source,
      kind: item.kind,
      thumb: item.thumb,
      image: item.image
    }));

    return [...uploaded, ...archive];
  }, [dbItems]);

  return (
    <>
      <PageHeader
        title="Gallery"
        description="View photos from our competitions, training camps, and special events."
        image="https://i.ibb.co/P8sw9wj/20240430-165617-min.jpg"
      />

      {/* Section 1: Main Gallery (Full-Width AccordionGallery) */}
      <section className="py-4 md:py-6 px-3 sm:px-4 md:px-6 bg-white" aria-label="Main Gallery">
        <div className="w-full">
          {totalAccordionPages > 1 && (
            <div className="flex items-center justify-end gap-2 mb-5">
              <button
                type="button"
                onClick={() => setAccordionPage((p) => Math.max(0, p - 1))}
                disabled={accordionPage === 0}
                aria-label="Previous gallery set"
                className="p-2 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-semibold text-slate-600 tabular-nums px-1">
                {accordionPage + 1} / {totalAccordionPages}
              </span>
              <button
                type="button"
                onClick={() => setAccordionPage((p) => Math.min(totalAccordionPages - 1, p + 1))}
                disabled={accordionPage >= totalAccordionPages - 1}
                aria-label="Next gallery set"
                className="p-2 rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="h-[460px] rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
            </div>
          ) : (
            <AccordionGallery
              key={`ag-page-${accordionPage}-${pagedMainImages.length}`}
              items={pagedMainImages}
              defaultIndex={Math.min(2, pagedMainImages.length - 1)}
              expandRatio={0.52}
              trigger="hover"
              accentColor="#ffffff"
              overlayColor="#060010"
              textColor="#ffffff"
              grayscale
              showLabels
              duration={0.6}
              ease="power3.out"
              parallax={0.5}
              tilt={8}
              stagger={0.06}
              height={460}
              gap={10}
              radius={16}
              orientation="horizontal"
              onItemClick={(_item, localIdx) => {
                openLightbox(mainSlides, accordionPage * ACCORDION_PAGE_SIZE + localIdx);
              }}
            />
          )}

          {/* Optional Embedded Videos Strip */}
          {mainVideos.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 font-heading mb-4">
                Featured Videos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {mainVideos.map((video) => (
                  <div
                    key={video.id}
                    className="rounded-2xl border border-slate-200 overflow-hidden bg-white"
                  >
                    {isSafeHttpsUrl(video.url) ? (
                      <iframe
                        src={video.url}
                        title={video.title}
                        className="w-full aspect-video"
                        sandbox="allow-scripts allow-same-origin allow-presentation"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full aspect-video bg-slate-900 text-slate-400 text-xs flex items-center justify-center p-4">
                        Video preview unavailable
                      </div>
                    )}
                    <div className="p-4">
                      <p className="font-semibold text-slate-900 text-sm">{video.title}</p>
                      {video.description && (
                        <p className="text-xs text-slate-600 mt-1">{video.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section 2: Memory Lane (Full-Width / Full-Height DriftWall) */}
      <section
        className="pt-8 pb-0 md:pt-10 md:pb-0 bg-[#060010] text-white relative overflow-hidden"
        aria-labelledby="memory-lane-heading"
      >
        <div className="px-4 sm:px-6 lg:px-8 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2
              id="memory-lane-heading"
              className="text-2xl md:text-4xl font-bold text-white font-heading"
            >
              Memory Lane
            </h2>

            {/* Toggle between DriftWall showcase and Browsable Grid */}
            <div className="inline-flex items-center p-1 rounded-full bg-white/10 border border-white/15 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setMemoryViewMode('wall')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  memoryViewMode === 'wall'
                    ? 'bg-white text-slate-950'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                <Layers size={13} aria-hidden="true" />
                Drift Wall
              </button>
              <button
                type="button"
                onClick={() => setMemoryViewMode('grid')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  memoryViewMode === 'grid'
                    ? 'bg-white text-slate-950'
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                <Grid size={13} aria-hidden="true" />
                Browse All
              </button>
            </div>
          </div>
        </div>

        {memoryViewMode === 'wall' ? (
          <div className="w-full h-[78vh] min-h-[640px] max-h-[860px] bg-[#060010]">
            <DriftWall
              items={memoryLaneItems}
              columns={wallColumns}
              tileWidth={wallColumns <= 3 ? 150 : 210}
              tileHeight={wallColumns <= 3 ? 102 : 140}
              gap={18}
              tilt={16}
              turn={-14}
              perspective={1200}
              depth={120}
              speed={42}
              direction="up"
              variance={0.45}
              parallax={0.6}
              lift={64}
              fade={0.22}
              dim={0.68}
              overlayColor="#060010"
              radius={14}
              roll={0}
              pauseOnHover={false}
              paused={lightboxIndex !== null}
              grayscale={false}
              onItemClick={(_item, globalIdx) => openLightbox(memorySlides, globalIdx)}
            />
          </div>
        ) : (
          <div className="container-custom pb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {memoryLaneItems.slice(0, memoryGridLimit).map((item, idx) => (
                <button
                  key={item.id || `ml-${idx}`}
                  type="button"
                  onClick={() => openLightbox(memorySlides, idx)}
                  className="group aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-white/10 hover:border-primary-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                >
                  <img
                    src={item.image}
                    alt={item.title || `Memory ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>

            {memoryGridLimit < memoryLaneItems.length && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setMemoryGridLimit((prev) => prev + MEMORY_GRID_BATCH)}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200 transition-colors"
                >
                  Load more memories ({memoryLaneItems.length - memoryGridLimit} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Section 3: Press Archive & Social Highlights Mini Section */}
      <PressMiniSection items={pressItems} onOpenLightbox={openLightbox} />

      {/* Shared Native Lightbox Modal */}
      <MediaLightbox
        slides={lightboxSlides}
        activeIndex={lightboxIndex}
        onClose={closeLightbox}
        onChangeIndex={setLightboxIndex}
      />
    </>
  );
};

export default GalleryPage;
