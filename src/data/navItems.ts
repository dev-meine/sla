import { NavItem } from '../types';

export const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Federation',
    href: '/about',
    subItems: [
      {
        label: 'About Us',
        href: '/about',
        description: 'Our history, mission, and aquatic governance',
      },
      {
        label: 'Executive Board',
        href: '/board',
        description: 'Leadership and federation committee members',
      },
      {
        label: 'Contact Us',
        href: '/contact',
        description: 'Reach our Freetown office or SafeSport desk',
      },
    ],
  },
  {
    label: 'Aquatics',
    href: '/athletes',
    subItems: [
      {
        label: 'Athletes',
        href: '/athletes',
        description: 'National team swimmers, divers, and records',
      },
      {
        label: 'Activities',
        href: '/activities',
        description: 'Competitions, training camps, and events',
      },
      {
        label: 'Swimming Lessons',
        href: '/register',
        description: 'Enroll in structured learn-to-swim programs',
      },
    ],
  },
  {
    label: 'Media',
    href: '/news',
    subItems: [
      {
        label: 'News & Updates',
        href: '/news',
        description: 'Official press releases and meet coverage',
      },
      {
        label: 'Gallery',
        href: '/gallery',
        description: 'Photography and video highlights',
      },
    ],
  },
];

export const footerNavItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Athletes', href: '/athletes' },
  { label: 'Activities', href: '/activities' },
  { label: 'Executive Board', href: '/board' },
  { label: 'News', href: '/news' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Swimming Lessons', href: '/register' },
  { label: 'Contact Us', href: '/contact' },
];
