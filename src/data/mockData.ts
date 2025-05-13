import { Activity, Athlete, BoardMember, GalleryItem, NewsPost } from '../types';

export const athletes: Athlete[] = [
  {
    id: '1',
    name: 'Bai Kamara',
    image: 'https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    sport: 'swimming',
    specialties: ['Freestyle', 'Butterfly'],
    records: [
      'National Record - 100m Freestyle (48.23s)',
      'National Record - 200m Freestyle (1:47.56)'
    ],
    achievements: [
      'National Champion 2024',
      'African Games Bronze Medal',
      '100m Freestyle Record Holder'
    ],
    bio: 'Bai is a rising star in Sierra Leone swimming with multiple national records in freestyle events.',
    personalBests: [
      {
        event: '100m Freestyle',
        time: '48.23',
        date: '2024-01-15',
        location: 'African Games, Egypt'
      },
      {
        event: '200m Freestyle',
        time: '1:47.56',
        date: '2023-12-10',
        location: 'National Championships, Freetown'
      }
    ],
    nationality: 'Sierra Leone',
    dateOfBirth: '1999-05-15',
    club: 'Freetown Swimming Club',
    coach: 'James Wilson',
    trainingBase: 'National Stadium Pool, Freetown'
  },
  {
    id: '3',
    name: 'Ibrahim Koroma',
    image: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    sport: 'diving',
    specialties: ['Platform Diving', '3m Springboard'],
    records: [
      'National Record - 10m Platform (405.60 points)',
      'National Record - 3m Springboard (389.45 points)'
    ],
    achievements: [
      'National Diving Champion',
      'African Diving Cup Silver Medal',
      'Platform Specialist'
    ],
    bio: 'Ibrahim is pioneering diving in Sierra Leone with his technical excellence and dedication to the sport.',
    nationality: 'Sierra Leone',
    dateOfBirth: '1998-11-30',
    club: 'Freetown Diving Club',
    coach: 'Michael Chen',
    trainingBase: 'National Aquatics Center, Freetown'
  },
];

export const boardMembers: BoardMember[] = [
  {
    id: '1',
    name: 'Dr. Mohamed Kamara',
    position: 'President',
    image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    bio: 'Dr. Kamara has led the federation for 5 years, focusing on athlete development and international recognition.'
  },
  {
    id: '2',
    name: 'Aminata Conteh',
    position: 'Vice President',
    image: 'https://images.pexels.com/photos/773371/pexels-photo-773371.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    bio: 'With a background in sports management, Aminata oversees program development and community outreach.'
  },
  {
    id: '3',
    name: 'James Kargbo',
    position: 'Secretary General',
    image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    bio: 'James coordinates federation activities and maintains relationships with international aquatics bodies.'
  },
  {
    id: '4',
    name: 'Sarah Williams',
    position: 'Treasurer',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    bio: 'Sarah manages the federation\'s finances and funding initiatives for athlete support programs.'
  }
];

export const activities: Activity[] = [
  {
    id: '1',
    title: 'National Swimming Championships',
    description: 'Annual competition featuring top swimmers from across the country competing in all Olympic events.',
    image: 'https://images.pexels.com/photos/1415810/pexels-photo-1415810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'competition',
    date: '2024-08-15'
  },
  {
    id: '3',
    title: 'High Performance Training Camp',
    description: 'Two-week intensive training camp for national team athletes featuring international coaches.',
    image: 'https://images.pexels.com/photos/260598/pexels-photo-260598.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'camp',
    date: '2024-06-10'
  },
  {
    id: '4',
    title: 'Coaches Certification Course',
    description: 'Program to train and certify swimming coaches according to international standards.',
    image: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'training',
    date: '2024-03-20'
  }
];

export const newsPosts: NewsPost[] = [
  {
    id: '1',
    title: 'Sierra Leone Qualifies Three Swimmers for African Championships',
    excerpt: 'National team athletes secure spots in continental competition.',
    content: 'Three Sierra Leone swimmers have qualified for the upcoming African Swimming Championships to be held in Egypt. Bai Kamara, Mariama Sesay, and Ibrahim Koroma achieved the qualification times during the recent national trials, marking a significant milestone for aquatics sports in the country.',
    image: 'https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    date: '2024-04-15',
    author: 'SLSDWA Media Team',
    category: 'Competition'
  },
  {
    id: '2',
    title: 'New Olympic-Standard Pool Project Announced',
    excerpt: 'Government commits to building first international standard swimming facility.',
    content: 'The Sierra Leone government has announced funding for the country\'s first Olympic-standard swimming pool to be built in Freetown. This facility will feature a 50-meter competition pool, diving platforms, and a water polo area. Construction is expected to begin later this year with completion targeted for 2026.',
    image: 'https://images.pexels.com/photos/260598/pexels-photo-260598.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    date: '2024-03-28',
    author: 'SLSDWA Media Team',
    category: 'Development'
  },

];

export const galleryItems: GalleryItem[] = [
  {
    id: '1',
    type: 'image',
    url: 'https://images.pexels.com/photos/73760/swimming-swimmer-female-race-73760.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'National Championships 2023',
    description: 'Highlights from the annual swimming competition in Freetown',
    date: '2023-08-20'
  },
  {
    id: '2',
    type: 'image',
    url: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Diving Exhibition',
    description: 'Platform diving demonstration at the new aquatics center',
    date: '2023-11-05'
  },
  {
    id: '3',
    type: 'image',
    url: 'https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Olympic Training Camp',
    description: 'Sierra Leone swimmers preparing for Olympic qualification',
    date: '2024-01-15'
  },
  {
    id: '4',
    type: 'image',
    url: 'https://images.pexels.com/photos/1415810/pexels-photo-1415810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Youth Swimming Gala',
    description: 'Annual competition for junior swimmers across the country',
    date: '2023-09-12'
  },
  {
    id: '5',
    type: 'image',
    url: 'https://images.pexels.com/photos/260598/pexels-photo-260598.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'New Aquatics Center Opening',
    description: 'Inauguration ceremony of the refurbished swimming facility',
    date: '2023-12-03'
  },
  {
    id: '6',
    type: 'image',
    url: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    title: 'Coaches Training Program',
    description: 'International coaching certification course for local trainers',
    date: '2024-02-20'
  }
];