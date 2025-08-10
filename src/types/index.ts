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

// This represents the data stored in the main "courses" collection document
export interface GolfCourseInput {
  name: string;
  location: string;
  description: string;
  rules: string;
  basePrice: number;
  imageUrls: string[];
}

// This is the full course object, including related data that might be fetched separately
export interface GolfCourse extends GolfCourseInput {
  id: string;
  reviews: Review[];
  teeTimes: TeeTime[];
}
