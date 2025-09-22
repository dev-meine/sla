# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- Resolved `ReferenceError: ChevronDown is not defined` in `AthletesPage.tsx` by importing `ChevronDown` and `ChevronUp` from `lucide-react`.
- Reduced excessive spacing between Athletes and Activities sections on homepage
- Improved accessibility with better contrast ratios
- Enhanced mobile navigation usability
- Fixed syntax error in Footer component causing build failure