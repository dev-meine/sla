# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
- **2026-10-29**: Implemented production-grade **Admin Users & Roles Management** (`/admin/users`) and comprehensive backend/frontend RBAC security hardening:
  - **Staff Lifecycle & Role Management (`AdminUsers.tsx`, `manage-users` Edge Function, `src/types/rbac.ts`, `src/lib/adminUsersApi.ts`)**:
    - Provisioned and backfilled the 4 initial verified `super_admin` accounts (`willamstimothy016@outlook.com`, `williamstimothy016@gmail.com`, `techwox@outlook.com`, and `mistamed@gmail.com`) with full access across all 9 modules and `must_change_password = false`.
    - Built the `/admin/users` management console with 4 live KPI cards, instant search and role/status filters, native `<dialog closedby="any">` modals, and a collapsible **Security Audit Log** (`public.admin_audit_logs`).
    - Added 5 role presets (`super_admin`, `media_manager`, `technical_coordinator`, `safesport_officer`, and `custom`) paired with 9 granular per-user module checkboxes (`athletes`, `technical_staff`, `registrations`, `posts`, `activities`, `gallery`, `board`, `travel`, `reports`) that automatically promote manual combinations to `custom`.
    - Enabled direct password setup by Super Admins (`email_confirm: true`) with a rejection-sampled CSPRNG password generator (`window.crypto.getRandomValues()`), `10–72` UTF-8 byte complexity enforcement, copy/visibility controls, password reset, account suspend/reactivate, and permanent deletion.
    - Enforced mandatory first-sign-in password rotation (`must_change_password`) at both `ProtectedRoute.tsx` and Postgres RLS (`app_private.has_module` / `app_private.is_super_admin`), blocking all administrative reads/writes until rotated via `manage-users` (`complete_password_rotation`).
  - **Database, Storage & Auth Security Hardening (`supabase/migrations/20261029120000_admin_users_and_roles_rbac.sql`)**:
    - Replaced client-mutable `auth.users.raw_user_meta_data.role` checks with server-authoritative `public.profiles` RBAC and locked-down `SECURITY DEFINER` helpers in `app_private` (`search_path = ''`, `(select auth.uid())` initPlans).
    - Replaced over-permissive `TO authenticated USING (true)` write policies across all 19 CMS, roster, registration, Safe Sport, and travel tables—plus `storage.objects` (`images` bucket)—with module-scoped RLS policies and enforced a strict image MIME allowlist (`image/jpeg`, `image/png`, `image/gif`, `image/webp`) to block SVG/HTML stored XSS uploads.
    - Added atomic `BEFORE UPDATE OR DELETE` last-Super-Admin protection (`app_private.prevent_last_super_admin_removal`) and immediate session/refresh-token revocation (`app_private.revoke_user_sessions_on_suspend`) on account suspension or role/permission changes.
    - Enabled RLS on `public.profiles`, `public.admin_audit_logs`, and legacy `public.admin_users`, revoked anon/authenticated privileges on legacy `public.is_admin`/`public.is_super_admin` and `auth.is_admin`/`auth.is_super_admin`, and removed public PII exposure on `public.reschedule_requests`.
  - **Permission-Aware Admin Shell & Stored XSS Neutralization**:
    - Scoped `/admin/*` inside `<AdminAuthProviderOutlet />` (`AdminAuthContext.tsx`, `App.tsx`) and dynamically filtered navigation items, quick actions, global command-palette searches, and live notifications in `AdminLayout.tsx`, `AdminDashboard.tsx`, `AdminSearchModal.tsx`, and `AdminNotificationsDropdown.tsx` according to each user's assigned modules.
    - Fixed runtime column mismatches in `AdminSearchModal.tsx` (`athletes.sport`) and `AdminNotificationsDropdown.tsx` (`swimming_registrations.name`, `anonymous_reports.category`).
    - Replaced raw `dangerouslySetInnerHTML` in `NewsArticlePage.tsx` with `setSanitizedHtml` (`src/utils/sanitizeHtml.ts` using `Element.prototype.setHTML` + direct DOM node construction without string re-serialization) and hardened video `<iframe src>` URLs in `GalleryGrid.tsx` and `AdminGallery.tsx` with `isSafeHttpsUrl` and explicit `sandbox`/`referrerPolicy` attributes.

- **2026-10-16**: Implemented interactive Global Search (Command Palette) and Notifications Flyout in Admin Layout:
  - **Global Command Palette (`AdminSearchModal.tsx`)**: Created an interactive modal command palette accessible via `⌘K` / `Ctrl+K` or clicking the top bar search bar (desktop) or search icon (mobile). Provides instant keyboard navigation (`↑`/`↓` and `Enter`), fast navigation shortcuts across all admin management modules, and real-time debounced Supabase database queries searching athletes, news posts, and aquatic events.
  - **Live Notifications Popover (`AdminNotificationsDropdown.tsx`)**: Connected the top bar notification bell into an interactive flyout popover dynamically aggregating actionable alerts from Supabase: pending student swimmer registrations awaiting tutor assignment, pending Safe Sport confidential reports, upcoming aquatic events, and news posts. Includes unread badge tracking, localStorage persistence, and a 1-click "Mark all read" action.

- **2026-10-16**: Standardized article card sizing and layout under "Latest News":
  - Replaced the previous asymmetrical layout on the homepage (`FeaturedNews.tsx`), which had an oversized 7-column lead article and smaller 5-column secondary articles with mismatched aspect ratios (`aspect-[16/9]` vs `aspect-[4/3]`), with a balanced, uniform 3-column responsive grid.
  - Standardized all news article cards across `FeaturedNews.tsx` and `NewsPage.tsx` with identical 16:9 widescreen image containers, consistent card heights (`flex flex-col h-full`), uniform typography (`line-clamp-2` titles, `line-clamp-3` excerpts), and aligned "Read Story" action links.

- **2026-10-16**: Cleaned up Admin Posts copy and upgraded featured header image area selection:
  - Removed page subtitle *"Create, edit, and publish official articles and news updates for Sierra Leone Aquatics."* from `AdminPosts.tsx`.
  - Removed form guidance copy *"Enter headline, category, featured image and story body."* from `AdminPosts.tsx`.
  - Upgraded `ImageCropUpload.tsx` and `AdminPosts.tsx` with interactive area selection for article featured header images: configured 16:9 widescreen header framing by default, added aspect ratio selector options (`16:9 (Header)`, `4:3 (Standard)`, `Free (Any Area)`), quick alignment presets (`Top`, `Center`, `Bottom`), and an active "Select Area / Adjust Framing" button on image previews so admins can choose and fine-tune exactly what region of any photo appears in article headers and cards.

- **2026-10-16**: Modern SaaS redesign of the complete Admin Portal matching the public website's design system and color palette:
  - **Color Tokens & Elevation Utilities (`src/index.css`)**: Removed destructive `.admin-portal * { box-shadow: none !important; }` reset. Added modern SaaS utility tokens (`.admin-card`, `.admin-card-hover`, `.admin-input`, `.admin-select`) based strictly on the official website brand colors (`primary-600 #005FB3`, `primary-700 #004C90`, `secondary-700 #997000`, `accent-700 #006A26`, `slate-50`, `border-slate-200/80`).
  - **Shared SaaS Admin UI Components**:
    - `src/components/admin/AdminBadge.tsx`: WCAG AA compliant badge tokens (`success`, `warning`, `info`, `danger`, `neutral`) with indicator dots.
    - `src/components/admin/AdminPageHeader.tsx`: Unified header with title, subtitle, breadcrumb path, and action slots.
    - `src/components/admin/AdminEmptyState.tsx`: Reusable empty state with brand icon container, title, copy, and call-to-action button.
  - **Layout Shell Overhaul (`src/components/admin/AdminLayout.tsx`)**: Fixed left desktop sidebar with collapsible rail mode (260px to 72px), categorized navigation groups (`Overview`, `Athletic Roster`, `Content & Media`, `Operations`), official SLA logo badge, live operations indicator, mobile drawer with backdrop blur, sticky top bar with breadcrumbs, global search shortcut (`⌘K`), notification badge, and administrator user avatar.
  - **Dashboard Modernization (`src/pages/AdminDashboard.tsx`)**: 4 KPI metric cards with brand icon pills and trend badges, multi-segment platform resource distribution bar, split recent activity feeds for competitions and press releases, operations shortcuts grid, and skeleton loading states.
  - **Modal Elevation (`src/components/ui/Modal.tsx`)**: Refined with backdrop blur, rounded-2xl container, alert icon pill, and clear primary/secondary action hierarchy.
  - **Comprehensive Admin Page Restyling**:
    - `src/pages/admin/AdminPosts.tsx`: Restyled news table with search filter, `AdminPageHeader`, `AdminBadge`, and unified form card.
    - `src/pages/admin/AdminAthletes.tsx`: Restyled athlete roster with sport discipline filter tabs, search filter, `AdminBadge`, and registration form.
    - `src/pages/admin/AdminActivities.tsx`: Restyled events table with search filter, status badges (`Upcoming` / `Past`), date chips, and scheduling form.
    - `src/pages/admin/AdminBoard.tsx`: Restyled board directory with executive avatars, role badges, email links, and appointment form.
    - `src/pages/admin/AdminTechnicalStaff.tsx`: Restyled technical staff table with staff avatars, role badges, credentials, and registration form.
    - `src/pages/admin/AdminGallery.tsx`: Restyled 16:9 media grid with type filters (`all`, `image`, `video`), `AdminBadge`, search bar, and upload form.
    - `src/pages/admin/AdminRegistrations.tsx`: Restyled swimming registration table with mini KPI chips, search filter, status pills, inline tutor assignment dropdown, and inline status updates.
    - `src/pages/admin/AdminReports.tsx`: Restyled confidential safe sport report feed with status pills (`Pending`, `Resolved`, `Dismissed`), search, and delete modals.
    - `src/pages/admin/AdminTravel.tsx`: Modern segmented tabs (`Travel Records`, `Ferry Timetables`, `Hotels & Lodging`), travel records search, status badges, unified modal delete confirmations, live iframe container, and hotel accommodation finder.
    - `src/pages/AdminLogin.tsx`: Modern sign-in experience with ambient gradient backdrop, official SLA logo pill, elevated card with clean input states, and troubleshooting tips.

- **2026-10-16**: Comprehensive website performance optimization across bundling, asset delivery, database payload, and caching:
  - **Route Code-Splitting & Lazy Loading**: Converted all 22 application routes in `App.tsx` from static imports to dynamic `React.lazy()` imports with `<Suspense>` and a resilient retry handler (`lazyRetry`) to prevent chunk load errors on unstable mobile connections. Drops initial public bundle size from ~682 kB to ~30 kB (~95% reduction in initial JavaScript parsing overhead).
  - **Vite Bundler Optimization & Long-Term Vendor Caching**: Configured Rollup `manualChunks` in `vite.config.ts` separating vendor libraries into distinct long-term cached bundles (`vendor-react`, `vendor-motion`, `vendor-supabase`, `vendor-icons`), isolating heavyweight admin libraries (`react-image-crop`, `axios`, admin dashboards) entirely from public visitors.
  - **Core Web Vitals & Image Optimization**: Set `fetchPriority="high"`, `loading="eager"`, and `decoding="async"` on primary hero images in `HeroSection.tsx` and `PageHeader.tsx` to accelerate Largest Contentful Paint (LCP). Added native `loading="lazy"` and `decoding="async"` across below-the-fold image cards in `FeaturedNews.tsx`, `FeaturedAthletes.tsx`, `ActivitiesHighlight.tsx`, `GalleryGrid.tsx`, `NewsPage.tsx`, `AthletesPage.tsx`, `BoardPage.tsx`, and `ActivitiesPage.tsx`.
  - **Supabase Query Projection & Network Transfer Reduction**: Pruned `select('*')` to preview column subsets (`id, title, author, category, excerpt, image_url, created_at`) in `FeaturedNews.tsx` and `NewsPage.tsx`, eliminating redundant transmission of multi-kilobyte markdown article bodies in list views.
  - **Client-Side Caching for Instant Navigation**: Expanded in-memory 5-minute caching via `cachedQuery` across all public data-driven pages (`FeaturedNews`, `NewsPage`, `BoardPage`, `ActivitiesPage`, `AthletesPage`), delivering 0ms instant transitions when toggling between tabs.
  - **Automatic Admin Cache Invalidation**: Integrated `invalidateCache` triggers in `AdminPosts.tsx`, `AdminAthletes.tsx`, `AdminActivities.tsx`, and `AdminBoard.tsx` so admin updates immediately flush stale client caches and reflect live.
  - **Font Delivery & Scroll Performance**: Pruned unused Google Font weights (300, 500) in `index.html` to retain only essential weights (400, 600, 700), saving multiple font downloads. Guarded navbar scroll listener in `Header.tsx` with a boolean state threshold check to eliminate redundant React state re-evaluations during active scrolling.
- **2026-09-06**: Removed the "Delegation Ferry Bookings" table and creation form from the Ferry Schedules section in `AdminTravel.tsx`, leaving the clean, full-height live Sea Coach Express schedule timetable as the sole focused element on the tab.
- **2026-09-06**: Redesigned the Hotel & Accommodation Finder section in `AdminTravel.tsx`. Replaced the raw unstyled "Location" and "Price Range" inputs with a modern card component featuring integrated MapPin and DollarSign input icons, clear labels, a prominent "Find Hotels" button with loading feedback, quick preset destination chips ("Aberdeen, Freetown", "Lumley Beach", etc.), an informative empty-state hero card, and upgraded hotel result cards with star ratings, price badges, and direct booking links. Added curated Sierra Leone delegation accommodation fallback data.
- **2026-09-06**: Removed the "Add Ferry Booking" action button from the header in `AdminTravel.tsx` to simplify the interface and focus the Ferry Schedules section strictly on live timetable viewing.
- **2026-09-06**: Cleaned up the Ferry Schedules section in `AdminTravel.tsx`. Removed redundant explanatory header text banners and integrated sleek, modern action buttons ("Reload Schedule" and "Open in New Tab") with refined hover, active scale, and loading spinner states directly into the live schedule iframe header. Also upgraded the "Add Ferry Booking" and "Add Travel Record" action buttons with standardized rounded-lg styling and active press feedback.
- **2026-09-06**: Restored and accelerated the live Sea Coach Express schedule iframe view in the Admin Travel Ferry Schedules section (`AdminTravel.tsx`) based on user preference. Enhanced loading performance by adding DNS preconnect and prefetch headers in `index.html`, eliminating full-database re-fetching on tab switches, implementing a persistent/pre-warmed container that pre-loads the iframe in the background for zero-latency instant tab display, adding a branded loading skeleton, providing a "Reload Schedule" trigger button, and keeping delegation ferry bookings management directly accessible below the schedule.
- **2026-09-06**: Removed border shadows (`shadow`, `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`) across the entire admin portal (`AdminLayout`, `AdminDashboard`, `AdminLogin`, `AdminPosts`, `AdminActivities`, `AdminGallery`, `AdminBoard`, `AdminTechnicalStaff`, `AdminAthletes`, `AdminReports`, `AdminRegistrations`, `AdminTravel`, and `Modal`). Replaced shadows with crisp borders (`border border-slate-200`) and introduced a global `.admin-portal` box-shadow reset in `index.css` for a flat, modern aesthetic.
- **2026-09-06**: Reduced the oversized gap between "Our Athletes" and "Core Activities" on the homepage by tightening `FeaturedAthletes` bottom padding to `pb-8 md:pb-10` and `ActivitiesHighlight` top padding to `pt-6 md:pt-8`, reducing vertical dead space by over 180px on desktop while maintaining a smooth section transition.
- **2026-09-06**: Equalized package selection card heights on the swimming registration form (`SwimmingRegistration.tsx`) and homepage (`SwimmingPackages.tsx`). Added `flex flex-col h-full` and flex distribution so the Beginner, Intermediate, and Advanced cards stretch to uniform height with bottom-aligned pricing regardless of description text length.
- **2026-09-06**: Reduced excessive top and bottom padding on internal page header banners (`PageHeader`) from `py-32 md:py-40` down to `py-14 md:py-20`, tightened heading spacing, and scaled down `.section` vertical padding from `py-20 md:py-32` to `py-12 md:py-20` across the website to eliminate large empty voids.
- **2026-09-06**: Fixed the "Admin Login" header button touching the bottom edge of the navbar across pages. Scaled button padding to `px-5 py-2.5`, added flex centering on its wrapper, synchronized scroll detection with route changes, and established a consistent frosted backdrop with bottom border across all internal pages.
- **2026-09-06**: Removed the "Spread the Word" section from `NewsArticlePage` for a cleaner article layout, and removed the "Navigation" and "Contact" heading titles from `Footer` for an ultra-minimalist footer appearance.
- **2026-09-06**: Modernized the "Spread the Word" section on `NewsArticlePage` into an editorial card with dark slate gradient styling, dedicated 1-click sharing buttons for WhatsApp, X (Twitter), and Facebook, and interactive "Link Copied!" visual feedback.
- **2026-09-06**: Balanced vertical spacing on `NewsArticlePage` (`pt-10 md:pt-14`), providing a comfortable ~30px breathing room below the fixed header while keeping the article title immediately visible above the fold.
- **2026-09-06**: Redesigned `NewsArticlePage` layout to remove excessive top whitespace. Replaced the redundant, oversized 400px `PageHeader` with an editorial layout that places the back navigation, category badge, and article title directly above the fold without requiring the user to scroll.
- **2026-09-05**: Updated publication dates in Supabase `news_posts` for Commonwealth Games coverage: set "Sierra Leone Young Swimmer Shines on Commonwealth Debut, Wins 50m Freestyle Hit" to August 6, 2026, and "Minister of Sports, NSA Boss and NOC President Address Team Sierra Leone" to July 25, 2026.
- **2026-09-05**: Replaced missing/default favicon with the official Sierra Leone Aquatics logo (`/SLA.png`, `/favicon.png`, and `/favicon.ico`) and added `apple-touch-icon` support in `index.html`.
- **2026-09-04**: Fixed news article content formatting and text bunching in `NewsArticlePage`. Added robust line ending normalization (\r\n/CRLF support), automatic detection of single vs. double newline paragraph breaks, and comprehensive editorial typography styles in `index.css` (`.article-content`) with generous 1.75rem paragraph margins, 1.85 line-height, and full styling for headings, quotes, and lists.
- **2026-04-22**: Updated office address to "66 Kroo Town Road Facing Berwick Street, Freetown, Sierra Leone" across ContactPage, Footer, and ContactSection.
- **2026-04-22**: Updated hero section description to include the official identity of Sierra Leone Aquatics as the national governing body for all aquatic sports in Sierra Leone.
- **2026-04-21**: Complete "Minimalist Solid" redesign pass across all public-facing pages and homepage components. Removed all gradient backgrounds, blur orbs, heavy shadows, and generic icons. Flattened cards to rounded-2xl with slate borders. Unified color palette to slate/primary. Updated HeroSection (removed Watch Video), ActivitiesPage, AthletesPage, BoardPage, AboutPage, ContactPage, NewsPage, RegistrationPage, and all homepage sections (FeaturedAthletes, FeaturedNews, ActivitiesHighlight, SwimmingPackages, ContactSection).
- **2026-04-21**: Added `vercel.json` with SPA rewrite rule to fix 404 errors on page refresh when hosted on Vercel.
- **2026-04-21**: Fixed "Save Athlete" doing nothing in Admin Athletes. The image upload was not wired to Supabase Storage, causing silent failures. Added proper `uploadImage`/`deleteImage` functions and a visible validation error summary so admins can see what fields are missing.
- **2026-04-21**: Added image cropping support to Admin Posts. Admins can now visually crop featured article images to a 16:9 ratio before upload, ensuring consistent hero image presentation across the news section.
- **2026-04-21**: Fixed an issue where clicking "Read Story" on individual news articles navigated to a blank page. Created the missing `NewsArticlePage` component and registered the `/news/:id` route in `App.tsx`. Updated `NewsPage.tsx` to ensure all "Read More" links connect properly to the individual articles.

### Changed
- **2026-04-21**: Added solid Role-Based Access Control (RBAC) to the Admin Dashboard. Updated `ProtectedRoute.tsx` and `AdminLogin.tsx` to strictly verify that `session.user.user_metadata.role === 'admin'` before granting access to `/admin` routes.
- **2026-04-20**: Applied the "Tactile Grain & Minimalist Solid" design system strictly to all internal pages (`About`, `Activities`, `Athletes`, `Board`, `Contact`, `Registration`, `Gallery`). Removed legacy floating gradient orbs, blurred backgrounds, and complex section-gradient utilities. Redesigned `PageHeader` from a heavy blue block to a clean, dark cinematic image overlay (`bg-slate-950/80`) to maximize text contrast and editorial feel.
- **2026-04-20**: Adopted a premium "Tactile Grain / Noise" aesthetic across the application. Removed all decorative gradient background orbs (`bg-primary-*` blurs) from components (`HeroSection`, `FeaturedAthletes`, `FeaturedNews`, `ActivitiesHighlight`, `SwimmingPackages`, `Footer`) to eliminate visual noise. Added a global fixed SVG grain overlay in `Layout.tsx` and `index.css` to add physical, high-end texture while maintaining solid, minimalist background colors.
- **2026-04-20**: Redesigned the homepage to adopt a vibrant, kinetic, and modern aesthetic. Removed grayscale filters and introduced dynamic Framer Motion animations across `HeroSection`, `FeaturedAthletes`, `FeaturedNews`, `ActivitiesHighlight`, `SwimmingPackages`, `Header`, and `Footer`. Enhanced components with rich primary blue colors, glassmorphic overlays, and spring-loaded interactive elements.
- **2026-04-20**: Redesigned the homepage and layout components to adopt a clean, minimalistic editorial style. Removed legacy glassmorphism (heavy gradients, backdrop-blurs, glowing shadows) and complex SVG animations across `HeroSection`, `FeaturedAthletes`, `FeaturedNews`, `ActivitiesHighlight`, `SwimmingPackages`, `Header`, and `Footer`. Adopted sharp grid layouts, clear typography, and a simplified color palette matching Awwwards/Godly aesthetics.


### Added
- Modern UI animations and transitions using Framer Motion
- Gradient overlays and decorative elements for visual depth
- "Watch Video" call-to-action in hero section
- Community counter showing athlete participation
- Featured image with glass morphism effect in hero section
- Scroll indicator with animated chevron in Hero section
- Interactive contact cards with hover effects and external links
- Modern floating animations and enhanced background elements
- Advanced section styling with gradient backgrounds and motion effects
- Smooth scrolling implementation with performance optimizations
- Liquid glass style for swimming lessons cards with modern hover effects
- Mission and Vision section on About page with modern card design and hover effects

### Changed
- Added `width` and `height` attributes to image tag in `PageHeader.tsx` to prevent layout shifts.
- Modernized Header component with improved navigation and mobile menu
- Redesigned Footer with contemporary layout and interactive elements
- Completely revamped Hero section with parallax effect and modern typography
- Enhanced ContactSection with animated cards and gradient backgrounds
- Updated FeaturedNews component with card-based design and hover effects
- Improved color scheme with blue gradients and modern accent colors
- Enhanced typography with variable font weights and improved readability
- Refined button styles with hover effects and micro-interactions
- Improved responsive design for better mobile experience
- Updated general section styling with consistent padding and overflow handling
- Replaced generic div and p elements with semantic HTML elements for better accessibility and SEO
- Enhanced section elements with modern gradients, animations, and improved spacing
- Updated CSS utilities with new animation keyframes and gradient classes
- Improved scrolling performance across all pages
- Updated swimming competition images in About page and Hero section with higher quality version
- Modified team image in Hero section to display in square format for better visual consistency

### Fixed

- Ensured "Register Now" button on swimming lesson cards in `SwimmingPackages.tsx` is responsive and consistently aligned.
- Applied liquid glass effect to athlete cards in `FeaturedAthletes.tsx`. across all price cards.
- Reduced excessive spacing between Athletes and Activities sections on homepage
- Improved accessibility with better contrast ratios
- Enhanced mobile navigation usability
- Fixed syntax error in Footer component causing build failure
- Fixed Mission and Vision cards height inconsistency on About page to ensure equal heights
- Reduced spacing between "Our Story" and "Mission & Vision" sections on About page