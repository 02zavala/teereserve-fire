import type { GolfCourse, Review, TeeTime, Booking, BookingInput, ReviewInput } from '@/types';
import { db, storage } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, setDoc, CollectionReference, writeBatch, serverTimestamp, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { format, startOfDay } from 'date-fns';

interface CourseDataInput {
    name: string;
    location: string;
    description: string;
    rules?: string;
    basePrice: number;
    newImages: File[];
    existingImageUrls: string[];
}

const uploadImages = async (courseName: string, files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(file => {
        // Sanitize file name
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const storageRef = ref(storage, `courses/${courseName.toLowerCase().replace(/\s+/g, '-')}/${Date.now()}-${cleanFileName}`);
        return uploadBytes(storageRef, file).then(snapshot => getDownloadURL(snapshot.ref));
    });
    return Promise.all(uploadPromises);
};

// *** Firestore Data Functions ***

export const getCourses = async ({ location }: { location?: string }): Promise<GolfCourse[]> => {
  const coursesCol = collection(db, 'courses');
  let coursesQuery = query(coursesCol);

  if (location && location !== 'all') {
    coursesQuery = query(coursesCol, where('location', '==', location));
  }

  const courseSnapshot = await getDocs(coursesQuery);
  
  const courseListPromises = courseSnapshot.docs.map(async (docSnapshot) => {
    const course = { id: docSnapshot.id, ...docSnapshot.data() } as GolfCourse;
    course.reviews = await getReviewsForCourse(course.id);
    return course;
  });

  return Promise.all(courseListPromises);
};

export const getCourseById = async (id: string): Promise<GolfCourse | undefined> => {
    if (!id) return undefined;
    const courseDocRef = doc(db, 'courses', id);
    const courseSnap = await getDoc(courseDocRef);

    if (courseSnap.exists()) {
        const courseData = { id: courseSnap.id, ...courseSnap.data() } as GolfCourse;
        courseData.reviews = await getReviewsForCourse(id);
        return courseData;
    } else {
        console.log("No such document!");
        return undefined;
    }
};

export const getCourseLocations = async (): Promise<string[]> => {
    const coursesCol = collection(db, 'courses');
    const courseSnapshot = await getDocs(coursesCol);
    const courseList = courseSnapshot.docs.map(doc => doc.data() as GolfCourse);
    return [...new Set(courseList.map(c => c.location))];
}

export const addCourse = async (courseData: CourseDataInput): Promise<string> => {
    const { newImages, ...restOfData } = courseData;
    const newImageUrls = await uploadImages(courseData.name, newImages);
    
    const coursesCol = collection(db, 'courses');
    const docRef = await addDoc(coursesCol, {
      name: restOfData.name,
      location: restOfData.location,
      description: restOfData.description,
      rules: restOfData.rules || "",
      basePrice: restOfData.basePrice,
      imageUrls: [...restOfData.existingImageUrls, ...newImageUrls],
    });
    return docRef.id;
}

export const updateCourse = async (courseId: string, courseData: CourseDataInput): Promise<void> => {
    const { newImages, existingImageUrls, ...restOfData } = courseData;
    const newImageUrls = await uploadImages(courseData.name, newImages);
    
    const allImageUrls = [...existingImageUrls, ...newImageUrls];

    const courseDocRef = doc(db, 'courses', courseId);
    await updateDoc(courseDocRef, {
        name: restOfData.name,
        location: restOfData.location,
        description: restOfData.description,
        rules: restOfData.rules || "",
        basePrice: restOfData.basePrice,
        imageUrls: allImageUrls
    });
}

// *** Tee Time Functions ***

const generateDefaultTeeTimes = (basePrice: number): Omit<TeeTime, 'id' | 'date'>[] => {
    const times: Omit<TeeTime, 'id' | 'date'>[] = [];
    for (let i = 7; i <= 17; i++) {
        for (let j = 0; j < 60; j += 15) { // e.g. every 15 minutes
            const hour = i.toString().padStart(2, '0');
            const minute = j.toString().padStart(2, '0');
            const priceMultiplier = (i < 9 || i > 15) ? 0.9 : 1.2; // Cheaper in early morning/late afternoon
            times.push({
                time: `${hour}:${minute}`,
                status: 'available',
                price: Math.round(basePrice * priceMultiplier),
            });
        }
    }
    return times;
};

export const getTeeTimesForCourse = async (courseId: string, date: Date, basePrice: number): Promise<TeeTime[]> => {
    const dateString = format(startOfDay(date), 'yyyy-MM-dd');
    const teeTimesCol = collection(db, 'courses', courseId, 'teeTimes');
    const q = query(teeTimesCol, where('date', '==', dateString));
    
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        // No tee times for this date, so let's generate and save them
        const defaultTimes = generateDefaultTeeTimes(basePrice);
        const batch = writeBatch(db);
        const newTimes: TeeTime[] = [];

        defaultTimes.forEach(timeData => {
            const timeDocRef = doc(teeTimesCol); // Auto-generate ID
            const newTeeTime: TeeTime = {
                ...timeData,
                id: timeDocRef.id,
                date: dateString,
            };
             batch.set(timeDocRef, {
                date: newTeeTime.date,
                time: newTeeTime.time,
                price: newTeeTime.price,
                status: newTeeTime.status
            });
            newTimes.push(newTeeTime);
        });
        await batch.commit();
        return newTimes.sort((a,b) => a.time.localeCompare(b.time));
    } else {
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TeeTime)).sort((a,b) => a.time.localeCompare(b.time));
    }
};

export const updateTeeTimesForCourse = async (courseId: string, date: Date, teeTimes: TeeTime[]): Promise<void> => {
    const teeTimesCol = collection(db, 'courses', courseId, 'teeTimes');
    
    const batch = writeBatch(db);
    teeTimes.forEach(tt => {
        const docRef = doc(teeTimesCol, tt.id);
        batch.update(docRef, {
            price: tt.price,
            status: tt.status,
        });
    });

    await batch.commit();
};


// *** Booking Functions ***

export async function createBooking(bookingData: BookingInput): Promise<string> {
    const batch = writeBatch(db);

    // 1. Create a new booking document
    const bookingsCol = collection(db, 'bookings');
    const bookingDocRef = doc(bookingsCol);
    batch.set(bookingDocRef, { ...bookingData, createdAt: new Date().toISOString() });
    
    // 2. Update the tee time status to 'booked'
    const teeTimeDocRef = doc(db, 'courses', bookingData.courseId, 'teeTimes', bookingData.teeTimeId);
    batch.update(teeTimeDocRef, { status: 'booked' });

    await batch.commit();
    return bookingDocRef.id;
}

export async function getBookings(): Promise<Booking[]> {
    const bookingsCol = collection(db, 'bookings');
    const snapshot = await getDocs(query(bookingsCol, orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
    const bookingsCol = collection(db, 'bookings');
    const q = query(bookingsCol, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
}

// *** Review Functions ***

export async function addReview(courseId: string, reviewData: ReviewInput): Promise<string> {
    const reviewsCol = collection(db, 'courses', courseId, 'reviews');
    const docRef = await addDoc(reviewsCol, {
        ...reviewData,
        approved: null, // Pending moderation
        createdAt: new Date().toISOString(),
        courseId,
    });
    return docRef.id;
}

export async function getReviewsForCourse(courseId: string, onlyApproved = true): Promise<Review[]> {
    const reviewsCol = collection(db, 'courses', courseId, 'reviews');
    let q = query(reviewsCol, orderBy('createdAt', 'desc'));

    if (onlyApproved) {
        q = query(reviewsCol, where('approved', '==', true), orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            user: {
                name: data.userName,
                avatarUrl: data.userAvatar
            },
            ...data
        } as Review
    });
}

export async function getAllReviews(): Promise<Review[]> {
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    const allReviews: Review[] = [];

    for (const courseDoc of coursesSnapshot.docs) {
        const courseName = courseDoc.data().name;
        const reviewsCol = collection(db, 'courses', courseDoc.id, 'reviews');
        const reviewsSnapshot = await getDocs(query(reviewsCol, orderBy('createdAt', 'desc')));
        
        reviewsSnapshot.forEach(reviewDoc => {
            const data = reviewDoc.data();
            allReviews.push({
                id: reviewDoc.id,
                courseName,
                ...data,
                 user: { // Ensure user object exists for type consistency
                    name: data.userName,
                    avatarUrl: data.userAvatar
                },
            } as Review);
        });
    }

    // Sort all reviews globally by creation date
    allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return allReviews;
}

export async function updateReviewStatus(courseId: string, reviewId: string, approved: boolean): Promise<void> {
    const reviewDocRef = doc(db, 'courses', courseId, 'reviews', reviewId);
    await updateDoc(reviewDocRef, { approved });
}
