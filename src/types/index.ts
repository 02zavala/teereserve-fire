
export interface ReviewUserInput {
  name: string;
  avatarUrl?: string;
}

export interface ReviewInput {
  userId: string;
  userName: string;
  userAvatar?: string | null;
  rating: number; // 1-5
  text: string;
  imageUrl?: string;
}

export interface Review extends ReviewInput {
  id: string;
  courseId: string;
  courseName?: string; // Added for admin panel
  user: ReviewUserInput;
  createdAt: string; // ISO String
  approved: boolean | null; // true: approved, false: rejected, null: pending
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
  latLng?: {
    lat: number;
    lng: number;
  };
}

// This is the full course object, including related data that might be fetched separately
export interface GolfCourse extends GolfCourseInput {
  id:string;
  reviews: Review[];
}

export interface BookingInput {
    userId: string;
    userName: string;
    courseId: string;
    courseName: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    players: number;
    totalPrice: number;
    status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
    teeTimeId: string;
}

export interface Booking extends BookingInput {
    id: string;
    createdAt: string; // ISO String
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: 'SuperAdmin' | 'Admin' | 'Customer' | 'Affiliate';
    createdAt: string;
    assignedCourses?: string[];
}
