# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
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