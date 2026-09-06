# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
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