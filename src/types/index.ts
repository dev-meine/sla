export type NavItem = {
  label: string;
  href: string;
  subItems?: NavItem[];
};

export interface Athlete {
  id: string;
  name: string;
  image: string;
  sport: 'swimming' | 'diving' | 'water-polo';
  specialties?: string[];
  records?: string[];
  achievements: string[];
  bio: string;
  personalBests?: {
    event: string;
    time: string;
    date: string;
    location: string;
  }[];
  nationality: string;
  dateOfBirth: string;
  club?: string;
  coach?: string;
  trainingBase?: string;
}

export interface BoardMember {
  id: string;
  name: string;
  position: string;
  image: string;
  bio: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'competition' | 'training' | 'development' | 'camp';
  date: string;
}

export interface NewsPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  category: string;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  description?: string;
  date: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}