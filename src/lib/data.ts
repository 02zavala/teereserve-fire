import type { GolfCourse, Review, TeeTime } from '@/types';
import { db, storage } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, setDoc, CollectionReference } from 'firebase/firestore';
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
  const courseList = courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GolfCourse));

  // Still adding mock data for reviews for now
  return courseList.map(course => ({
      ...course,
      reviews: generateReviews(),
      // teeTimes are now fetched separately
  }));
};

export const getCourseById = async (id: string): Promise<GolfCourse | undefined> => {
    if (!id) return undefined;
    const courseDocRef = doc(db, 'courses', id);
    const courseSnap = await getDoc(courseDocRef);

    if (courseSnap.exists()) {
        const courseData = { id: courseSnap.id, ...courseSnap.data() } as GolfCourse;
        // Still adding mock data for reviews for now
        courseData.reviews = generateReviews();
        // teeTimes are now fetched separately
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
      imageUrls: newImageUrls,
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

const generateDefaultTeeTimes = (basePrice: number): Omit<TeeTime, 'id'>[] => {
    const times: Omit<TeeTime, 'id'>[] = [];
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
    const teeTimesCol = collection(db, 'courses', courseId, 'teeTimes') as CollectionReference<TeeTime>;
    const q = query(teeTimesCol, where('date', '==', dateString));
    
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
        // No tee times for this date, so let's generate and save them
        const defaultTimes = generateDefaultTeeTimes(basePrice);
        const batch = [];
        const newTimes: TeeTime[] = [];

        for (const timeData of defaultTimes) {
            const timeDocRef = doc(teeTimesCol);
            const newTeeTime = {
                ...timeData,
                id: timeDocRef.id,
                date: dateString,
            };
            batch.push(setDoc(timeDocRef, newTeeTime));
            newTimes.push(newTeeTime);
        }
        await Promise.all(batch);
        return newTimes.sort((a,b) => a.time.localeCompare(b.time));
    } else {
        return snapshot.docs.map(doc => doc.data() as TeeTime).sort((a,b) => a.time.localeCompare(b.time));
    }
};

export const updateTeeTimesForCourse = async (courseId: string, date: Date, teeTimes: TeeTime[]): Promise<void> => {
    const dateString = format(startOfDay(date), 'yyyy-MM-dd');
    const teeTimesCol = collection(db, 'courses', courseId, 'teeTimes');
    
    const batch = teeTimes.map(tt => {
        const docRef = doc(teeTimesCol, tt.id);
        return updateDoc(docRef, {
            price: tt.price,
            status: tt.status,
        });
    });

    await Promise.all(batch);
};
