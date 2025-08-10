export interface Review {
  id: string;
  user: {
    name: string;
    avatarUrl?: string;
  };
  rating: number; // 1-5
  text: string;
  imageUrl?: string;
  createdAt: string;
}

export interface TeeTime {
  time: string; // e.g., "07:00"
  status: 'available' | 'held' | 'booked';
  price: number;
}

export interface GolfCourse {
  id: string;
  name: string;
  location: string;
  description: string;
  rules: string;
  basePrice: number;
  imageUrls: string[];
  reviews: Review[]; // This will be fetched separately later
  teeTimes: TeeTime[]; // This will be fetched separately later
}
