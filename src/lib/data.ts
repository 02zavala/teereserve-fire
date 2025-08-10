import type { GolfCourse, Review, TeeTime, GolfCourseInput } from '@/types';
import { db } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where } from 'firebase/firestore';

const generateTeeTimes = (basePrice: number): TeeTime[] => {
  const times: TeeTime[] = [];
  for (let i = 7; i <= 17; i++) {
    for (let j = 0; j < 60; j += 10) {
      const hour = i.toString().padStart(2, '0');
      const minute = j.toString().padStart(2, '0');
      const isAvailable = Math.random() > 0.3;
      // Price variation based on time of day
      const priceMultiplier = (i < 9 || i > 15) ? 0.9 : 1.2;
      times.push({
        time: `${hour}:${minute}`,
        status: isAvailable ? 'available' : 'booked',
        price: Math.round(basePrice * priceMultiplier),
      });
    }
  }
  return times;
};

const generateReviews = (): Review[] => {
    const reviews: Review[] = [];
    const reviewCount = Math.floor(Math.random() * 15) + 5;
    const sampleTexts = [
        "An absolutely stunning course, challenging but fair. The views are breathtaking!",
        "Well-maintained greens and friendly staff. A must-play in the area.",
        "Played here on vacation. It was the highlight of our trip. Course is in immaculate condition.",
        "A bit pricey, but you get what you pay for. World-class experience.",
        "The layout is fantastic, with a great mix of holes. Can't wait to come back.",
        "Difficult course, especially with the wind. Bring your A-game. Service was top-notch.",
        "Beautiful scenery. The course condition was good, though some bunkers needed attention.",
    ];
    for(let i=0; i < reviewCount; i++) {
        reviews.push({
            id: `review-${i+1}`,
            user: { name: `Golfer${i+1}`, avatarUrl: `https://i.pravatar.cc/40?u=golfer${i+1}` },
            rating: Math.floor(Math.random() * 2) + 4, // Ratings between 4 and 5
            text: sampleTexts[Math.floor(Math.random() * sampleTexts.length)],
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
    }
    return reviews;
}

// *** Firestore Data Functions ***

export const getCourses = async ({ location }: { location?: string }): Promise<GolfCourse[]> => {
  const coursesCol = collection(db, 'courses');
  let coursesQuery = query(coursesCol);

  if (location && location !== 'all') {
    coursesQuery = query(coursesCol, where('location', '==', location));
  }

  const courseSnapshot = await getDocs(coursesQuery);
  const courseList = courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GolfCourse));

  // Still adding mock data for reviews and tee times for now
  return courseList.map(course => ({
      ...course,
      reviews: generateReviews(),
      teeTimes: generateTeeTimes(course.basePrice)
  }));
};

export const getCourseById = async (id: string): Promise<GolfCourse | undefined> => {
    if (!id) return undefined;
    const courseDocRef = doc(db, 'courses', id);
    const courseSnap = await getDoc(courseDocRef);

    if (courseSnap.exists()) {
        const courseData = { id: courseSnap.id, ...courseSnap.data() } as GolfCourse;
        // Still adding mock data for reviews and tee times for now
        courseData.reviews = generateReviews();
        courseData.teeTimes = generateTeeTimes(courseData.basePrice);
        return courseData;
    } else {
        console.log("No such document!");
        return undefined;
    }
};

export const getCourseLocations = async (): Promise<string[]> => {
    const courses = await getCourses({});
    return [...new Set(courses.map(c => c.location))];
}

export const addCourse = async (courseData: GolfCourseInput): Promise<string> => {
    const coursesCol = collection(db, 'courses');
    const docRef = await addDoc(coursesCol, {
        ...courseData,
        imageUrls: ['https://placehold.co/800x600.png'], // Add a default placeholder
    });
    return docRef.id;
}

export const updateCourse = async (courseId: string, courseData: Partial<GolfCourseInput>): Promise<void> => {
    const courseDocRef = doc(db, 'courses', courseId);
    await updateDoc(courseDocRef, courseData);
}
