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
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'available' | 'booked' | 'blocked';
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
  // Tee times are now loaded on demand based on the selected date
  // teeTimes: TeeTime[]; 
}
