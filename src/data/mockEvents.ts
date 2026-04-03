export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  attendees: number;
  maxAttendees: number;
  isLive: boolean;
  organizer: string;
}

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Festival Électro Summer',
    description: 'Le plus grand festival de musique électronique.',
    date: '2024-07-15', time: '20:00', location: 'Brazzaville',
    image: 'https://images.unsplash.com/photo-1686327139120-04ff48b9f8aa?w=400&h=300&fit=crop&crop=entropy',
    price: 45000, currency: 'FCFA', category: 'Music', tags: ['Music'],
    attendees: 2500, maxAttendees: 5000, isLive: true, organizer: 'MusicEvents Pro',
  },
  {
    id: '2',
    title: 'Concert Jazz Live',
    description: 'Soirée jazz intimiste en streaming.',
    date: '2024-06-20', time: '18:30', location: 'Studio Live Brazzaville',
    image: 'https://images.unsplash.com/photo-1559537660-293b028544a7?w=400&h=300&fit=crop&crop=entropy',
    price: 15000, currency: 'FCFA', category: 'Concert', tags: ['Concert'],
    attendees: 180, maxAttendees: 500, isLive: true, organizer: 'Jazz Live',
  },
  {
    id: '3',
    title: 'Théâtre Live: Antigone',
    description: 'Pièce de théâtre en streaming direct.',
    date: '2024-06-25', time: '19:00', location: 'Théâtre National Live',
    image: 'https://images.unsplash.com/photo-1539964604210-db87088e0c2c?w=400&h=300&fit=crop&crop=entropy',
    price: 20000, currency: 'FCFA', category: 'Art', tags: ['Art'],
    attendees: 340, maxAttendees: 1000, isLive: true, organizer: 'Théâtre Live Co',
  },
  {
    id: '4',
    title: 'Concert Rock Live',
    description: 'Concert rock en streaming HD.',
    date: '2024-07-01', time: '21:00', location: 'Arena Live Pointe-Noire',
    image: 'https://images.unsplash.com/photo-1523976711023-e7c4ace8b79a?w=400&h=300&fit=crop&crop=entropy',
    price: 35000, currency: 'FCFA', category: 'Music', tags: ['Music'],
    attendees: 1200, maxAttendees: 3000, isLive: true, organizer: 'Rock Live Events',
  },
  {
    id: '5',
    title: 'Danse Traditionnelle Live',
    description: 'Spectacle de danse traditionnelle en direct.',
    date: '2024-07-05', time: '17:00', location: 'Centre Culturel Live',
    image: 'https://images.unsplash.com/photo-1529588330805-0e9b8ac4e1b3?w=400&h=300&fit=crop&crop=entropy',
    price: 12000, currency: 'FCFA', category: 'Art', tags: ['Art'],
    attendees: 85, maxAttendees: 300, isLive: true, organizer: 'Culture Live',
  },
  {
    id: '6',
    title: 'Concert Classique',
    description: 'Concert de musique classique en présentiel.',
    date: '2024-08-10', time: '19:30', location: 'Salle de Concert, Brazzaville',
    image: 'https://images.unsplash.com/photo-1465847734447-7e6c4553ddb4?w=400&h=300&fit=crop&crop=entropy',
    price: 30000, currency: 'FCFA', category: 'Concert', tags: ['Concert'],
    attendees: 120, maxAttendees: 200, isLive: false, organizer: 'Classique & Co',
  },
  {
    id: '7',
    title: "Exposition d'Art Moderne",
    description: "Découvrez les œuvres d'artistes contemporains locaux.",
    date: '2024-07-20', time: '14:00', location: 'Galerie Moderne, Pointe-Noire',
    image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=300&fit=crop&crop=entropy',
    price: 8000, currency: 'FCFA', category: 'Art', tags: ['Art'],
    attendees: 85, maxAttendees: 150, isLive: false, organizer: 'Galerie Moderne',
  },
  {
    id: '8',
    title: 'Festival de Musique Traditionnelle',
    description: 'Célébration de la musique traditionnelle congolaise.',
    date: '2024-06-15', time: '16:00', location: 'Place de la République, Brazzaville',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=entropy',
    price: 12000, currency: 'FCFA', category: 'Music', tags: ['Music'],
    attendees: 450, maxAttendees: 800, isLive: false, organizer: 'Culture Congo',
  },
];
