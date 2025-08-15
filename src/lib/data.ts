
import type { GolfCourse, Review, TeeTime, Booking, BookingInput, ReviewInput, UserProfile, Scorecard, ScorecardInput } from '@/types';
import { db, storage } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, setDoc, CollectionReference, writeBatch, serverTimestamp, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { format, startOfDay, subDays, isAfter } from 'date-fns';

interface CourseDataInput {
    name: string;
    location: string;
    description: string;
    rules?: string;
    basePrice: number;
    newImages: File[];
    existingImageUrls: string[];
}

// NOTE: The images for this initial set of courses are static assets.
// They are located in the `/public` folder and served directly.
// Any new courses added via the admin panel will have their images uploaded to Firebase Storage.
const initialCourses: Omit<GolfCourse, 'reviews'>[] = [
    {
      id: "solmar-golf-links",
      name: "Solmar Golf Links",
      location: "Cabo San Lucas",
      description: "Este campo inspirado en links compara con ninguno, con vistas impresionantes del Pacífico en cada hoyo. Diseñado por Greg Norman en 2020, abarca tres paisajes distintos: dunas de arena estilo links, bosques de cactus y proximidad al mar. Ofrece 18 hoyos con un sentimiento de la era dorada del golf, similar a Ballybunion en Irlanda. Incluye clubhouse estilo rancho con vistas dramáticas.",
      rules: "Standard golf etiquette and club rules apply.",
      basePrice: 150,
      imageUrls: [
        "/courses/solmar/solmar-1.jpg",
        "/courses/solmar/solmar-2.jpg",
        "/courses/solmar/solmar-3.jpg",
        "/courses/solmar/solmar-4.jpg",
        "/courses/solmar/solmar-5.jpg",
      ],
      latLng: { lat: 22.876, lng: -109.931 }
    },
    {
      id: "palmilla-golf-club",
      name: "Palmilla Golf Club",
      location: "San José del Cabo",
      description: "Conocido como la \"Gran Dama de Los Cabos\", este club ofrece 27 hoyos diseñados por Jack Nicklaus, con vistas al Mar de Cortés desde 12 hoyos. Incluye cursos Arroyo, Mountain y Ocean, con fairways ondulantes, bunkers esculpidos y lagos. Clubhouse inspirado en México, pro shop y staff profesional. Reconocido como uno de los top en Los Cabos por su elegancia y desafío.",
      rules: "Standard golf etiquette and club rules apply.",
      basePrice: 250,
      imageUrls: [
        "/courses/palmilla/palmilla-1.jpg",
        "/courses/palmilla/palmilla-2.jpg",
        "/courses/palmilla/palmilla-3.jpg",
        "/courses/palmilla/palmilla-4.jpg",
        "/courses/palmilla/palmilla-5.jpg",
      ],
      latLng: { lat: 23.013, lng: -109.736 }
    },
    {
        id: 'cabo-del-sol',
        name: 'Cabo del Sol (Desert & Ocean)',
        location: 'Cabo San Lucas',
        description: 'Dos cursos: Desert con cambios de elevación dramáticos, terreno desértico y vistas al Mar de Cortés; Ocean diseñado por Jack Nicklaus, donde el desierto se encuentra con el océano, con 7 hoyos junto a la costa. Incluye arroyos como cañones y bunkering dramático. Oasis de lujo con vistas panorámicas.',
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 200,
        imageUrls: [
            "/courses/cabo-del-sol/cds-1.jpg", 
            "/courses/cabo-del-sol/cds-2.jpg", 
            "/courses/cabo-del-sol/cds-3.jpg", 
            "/courses/cabo-del-sol/cds-4.jpg", 
            "/courses/cabo-del-sol/cds-5.jpg"
        ],
        latLng: { lat: 22.918, lng: -109.831 }
    },
    {
        id: 'puerto-los-cabos',
        name: 'Puerto Los Cabos Golf Club',
        location: 'San José del Cabo',
        description: 'Instalación de 27 hoyos con tres combinaciones de 18, diseñadas por Jack Nicklaus y Greg Norman. Fairways ondulantes, greens elevados y vistas al Mar de Cortés. Incluye comida/drink stations gratuitas cada pocos hoyos. Ubicado en una comunidad planificada de 2,000 acres.',
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 180,
        imageUrls: [
            "/courses/puerto-los-cabos/plc-1.jpg", 
            "/courses/puerto-los-cabos/plc-2.jpg",
            "/courses/puerto-los-cabos/plc-3.jpg",
            "/courses/puerto-los-cabos/plc-4.jpg",
            "/courses/puerto-los-cabos/plc-5.jpg"
        ],
        latLng: { lat: 23.064, lng: -109.682 }
    },
    {
        id: 'vidanta-golf-los-cabos',
        name: 'Vidanta Golf Los Cabos',
        location: 'San José del Cabo',
        description: 'Curso original de 9 hoyos en Los Cabos, con 3,000 yardas de verde bordeado por el Mar de Cortés y las montañas Sierra de La Laguna. Diseñado para juego suave en terreno parcialmente plano, con oportunidades para drives y putts creativos. Clubhouse elevado para vistas.',
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 220,
        imageUrls: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png'],
        latLng: { lat: 23.045, lng: -109.708 }
    },
    {
        id: 'cabo-real-golf-club',
        name: 'Cabo Real Golf Club',
        location: 'Cabo San Lucas',
        description: 'Diseñado por Robert Trent Jones Jr., estilo target con fairways multi-temáticos en 2,800 acres de resort con playa. Hoyos tallados en desierto y montañas, con vistas al Mar de Cortés. Anfitrión de torneos PGA.',
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 190,
        imageUrls: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png'],
        latLng: { lat: 22.955, lng: -109.789 }
    },
    {
        id: 'club-campestre-san-jose',
        name: 'Club Campestre San José',
        location: 'San José del Cabo',
        description: 'Diseñado por Jack Nicklaus, usa pasto Paspalum resistente al agua salada. Fairways verdes en colinas de Sierra de la Laguna, con vistas al Mar de Cortés. Terreno desértico rodante, greens elevados.',
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 100,
        imageUrls: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png'],
        latLng: { lat: 23.078, lng: -109.735 }
    },
    {
        id: 'cabo-san-lucas-country-club',
        name: 'Cabo San Lucas Country Club',
        location: 'Cabo San Lucas',
        description: "18 hoyos en terreno suavemente inclinado con vistas al Mar de Cortés y Land's End. Diseñado por Roy Dye, desafiante con vistas panorámicas desde casi todos los hoyos. Incluye restaurante y comunidad cerrada.",
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 120,
        imageUrls: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png'],
        latLng: { lat: 22.898, lng: -109.897 }
    },
    {
        id: 'diamante-golf',
        name: 'Diamante Golf (Dunes / Cardonal)',
        location: 'Cabo San Lucas',
        description: 'Dunes por Davis Love III, estilo links con vistas al Pacífico y arroyos nativos; Cardonal por Tiger Woods, con fairways anchos y greens slick. Vistas largas al océano y dunas.',
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 300,
        imageUrls: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png'],
        latLng: { lat: 22.951, lng: -110.021 }
    },
    {
        id: 'el-cortes-golf-club',
        name: 'El Cortés Golf Club',
        location: 'La Paz',
        description: 'Firma de Gary Player, 18 hoyos con vistas panorámicas al Mar de Cortés. Cambios de elevación dramáticos, desierto y mar, con practice range y halfway house escénica.',
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 80,
        imageUrls: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png'],
        latLng: { lat: 24.195, lng: -110.320 }
    },
    {
        id: 'paraiso-del-mar-golf',
        name: 'Paraíso del Mar Golf',
        location: 'La Paz',
        description: 'Diseñado por Arthur Hills, estilo links oceánico de 18 hoyos en 7,039 yardas. Paisaje de dunas reminiscentes de Escocia, con vistas al Golfo de California.',
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 90,
        imageUrls: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png'],
        latLng: { lat: 24.237, lng: -110.334 }
    },
    {
        id: 'tpc-danzante-bay',
        name: 'TPC Danzante Bay',
        location: 'Loreto',
        description: '18 hoyos multi-temáticos por Rees Jones, con valles, arroyos, dunas y colinas. Vistas panorámicas a Danzante Bay y Mar de Cortés, greens slick y vientos desafiantes.',
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 150,
        imageUrls: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png'],
        latLng: { lat: 25.828, lng: -111.306 }
    },
    {
        id: 'costa-palmas-golf-club',
        name: 'Costa Palmas Golf Club',
        location: 'La Ribera, East Cape',
        description: 'Diseñado por Robert Trent Jones II, links-like con fairways anchos, condiciones firmes y rápidas. Vistas de desierto y mar, terreno divertido para todos los niveles.',
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 250,
        imageUrls: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png'],
        latLng: { lat: 23.633, lng: -109.689 }
    },
  ];

const uploadImages = async (courseName: string, files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(file => {
        // Sanitize file name
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const storageRef = ref(storage, `courses/${courseName.toLowerCase().replace(/\s+/g, '-')}/${Date.now()}-${cleanFileName}`);
        return uploadBytes(storageRef, file).then(snapshot => getDownloadURL(snapshot.ref));
    });
    return Promise.all(uploadPromises);
};

export const uploadReviewImage = async (courseId: string, userId: string, file: File): Promise<string> => {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const storageRef = ref(storage, `reviews/${courseId}/${userId}-${Date.now()}-${cleanFileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
};

export const uploadProfilePicture = async (userId: string, file: File): Promise<string> => {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const storageRef = ref(storage, `profile-pictures/${userId}/${Date.now()}-${cleanFileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
};


// *** Firestore Data Functions ***

export const getCourses = async ({ location }: { location?: string }): Promise<GolfCourse[]> => {
  const coursesMap = new Map<string, GolfCourse>();

  // Add initial static courses to the map
  initialCourses.forEach(course => {
      coursesMap.set(course.id, { ...course, reviews: [] });
  });

  // Fetch courses from Firestore
  try {
      const coursesCol = collection(db, 'courses');
      const firestoreSnapshot = await getDocs(coursesCol);
      firestoreSnapshot.forEach(doc => {
          const courseData = doc.data() as Omit<GolfCourse, 'id' | 'reviews'>;
          coursesMap.set(doc.id, {
              id: doc.id,
              ...courseData,
              reviews: [] // Reviews will be fetched on detail page
          });
      });
  } catch (error: any) {
      console.error("Error fetching courses from Firestore:", error.message);
      if (error.code === 'not-found' || error.code === 'unauthenticated' || error.code === 'unavailable') {
        console.warn("Firestore database not found or rules preventing access. The app will run with local data only.");
      }
  }
  
  let allCourses = Array.from(coursesMap.values());

  if (location && location !== 'all') {
    allCourses = allCourses.filter(course => course.location === location);
  }
  
  return allCourses;
};

export const getCourseById = async (id: string): Promise<GolfCourse | undefined> => {
    if (!id) return undefined;
    
    // First, check Firestore for a dynamically added course
    try {
        const courseDocRef = doc(db, 'courses', id);
        const courseSnap = await getDoc(courseDocRef);

        if (courseSnap.exists()) {
            const courseData = { id: courseSnap.id, ...courseSnap.data() } as GolfCourse;
            courseData.reviews = await getReviewsForCourse(id);
            return courseData;
        }
    } catch (error) {
        console.error(`Firestore error fetching course ${id}. Falling back to static data.`, error);
    }
    
    // If not in Firestore, find the course in our static data
    const courseFromStatic = initialCourses.find(c => c.id === id);

    if (courseFromStatic) {
        // Attach reviews
        const courseData = { ...courseFromStatic, reviews: await getReviewsForCourse(id) };
        return courseData;
    } 
    
    console.log("No such document!");
    return undefined;
};

export const getCourseLocations = async (): Promise<string[]> => {
    const courseList = await getCourses({});
    return [...new Set(courseList.map(c => c.location))];
}

export const addCourse = async (courseData: CourseDataInput): Promise<string> => {
    // This will add a new course to Firestore, it won't be in the initial static list
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
      // latLng would need to be added to the form
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

export const deleteCourse = async (courseId: string): Promise<void> => {
    // Note: This will not delete subcollections like reviews or tee times automatically.
    // For a production app, a Cloud Function would be needed to handle cascading deletes.
    const courseDocRef = doc(db, 'courses', courseId);
    await deleteDoc(courseDocRef);
}

// *** Tee Time Functions ***

const generateDefaultTeeTimes = (basePrice: number): Omit<TeeTime, 'id' | 'date'>[] => {
    const times: Omit<TeeTime, 'id' | 'date'>[] = [];
    for (let i = 7; i <= 17; i++) {
        for (let j = 0; j < 60; j += 15) { // e.g., every 15 minutes
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
    
    try {
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log(`No tee times found for ${dateString}, generating new ones.`);
            const defaultTimes = generateDefaultTeeTimes(basePrice);
            const batch = writeBatch(db);
            const newTimesWithIds: TeeTime[] = [];

            defaultTimes.forEach(timeData => {
                const timeDocRef = doc(teeTimesCol); 
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
                newTimesWithIds.push(newTeeTime);
            });
            
            await batch.commit();
            console.log(`Successfully created ${newTimesWithIds.length} tee times for ${dateString}.`);
            return newTimesWithIds.sort((a,b) => a.time.localeCompare(b.time));
        } else {
            return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TeeTime)).sort((a,b) => a.time.localeCompare(b.time));
        }
    } catch (error) {
        console.error("Error getting or creating tee times: ", error);
        return [];
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
    try {
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
    } catch (error) {
        console.error(`Error fetching reviews for course ${courseId}:`, error);
        return [];
    }
}

export async function getAllReviews(): Promise<Review[]> {
    const allReviews: Review[] = [];

    try {
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        // Add reviews from dynamically added courses
        for (const courseDoc of coursesSnapshot.docs) {
            const courseName = courseDoc.data().name;
            const reviews = await getReviewsForCourse(courseDoc.id, false);
            reviews.forEach(r => allReviews.push({ ...r, courseName }));
        }
    } catch (error) {
        console.error("Error fetching dynamic courses for reviews:", error);
    }

    // Add reviews from static courses, avoiding duplicates if they were somehow added to firestore
    for (const course of initialCourses) {
        const reviews = await getReviewsForCourse(course.id, false);
        reviews.forEach(r => {
            if (!allReviews.some(ar => ar.id === r.id)) {
                allReviews.push({ ...r, courseName: course.name });
            }
        });
    }

    // Sort all reviews globally by creation date
    allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return allReviews;
}


export async function updateReviewStatus(courseId: string, reviewId: string, approved: boolean): Promise<void> {
    const reviewDocRef = doc(db, 'courses', courseId, 'reviews', reviewId);
    await updateDoc(reviewDocRef, { approved: approved });
}

export async function checkIfUserHasPlayed(userId: string, courseId: string): Promise<boolean> {
    if (!userId) return false;

    const bookingsCol = collection(db, 'bookings');
    const q = query(
        bookingsCol, 
        where('userId', '==', userId), 
        where('courseId', '==', courseId),
        where('status', '==', 'Completed'),
        limit(1)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
}

// *** User Functions ***
export async function getUsers(): Promise<UserProfile[]> {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as UserProfile);
}

export async function updateUserRole(uid: string, role: UserProfile['role']): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { role });
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, data);
}


// *** Scorecard Functions ***
export async function addUserScorecard(scorecardData: ScorecardInput): Promise<string> {
    const scorecardsCol = collection(db, 'users', scorecardData.userId, 'scorecards');
    const docRef = await addDoc(scorecardsCol, {
        ...scorecardData,
        createdAt: new Date().toISOString(),
    });
    return docRef.id;
}

export async function getUserScorecards(userId: string): Promise<Scorecard[]> {
    const scorecardsCol = collection(db, 'users', userId, 'scorecards');
    const q = query(scorecardsCol, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scorecard));
}

export async function deleteUserScorecard(userId: string, scorecardId: string): Promise<void> {
    const scorecardDocRef = doc(db, 'users', userId, 'scorecards', scorecardId);
    await deleteDoc(scorecardDocRef);
}

// *** Dashboard Functions ***
export async function getDashboardStats() {
    // Get total revenue from completed bookings
    const bookingsCol = collection(db, 'bookings');
    const revenueQuery = query(bookingsCol, where('status', '==', 'Completed'));
    const revenueSnapshot = await getDocs(revenueQuery);
    const totalRevenue = revenueSnapshot.docs.reduce((sum, doc) => sum + doc.data().totalPrice, 0);

    // Get total users
    const usersCol = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCol);
    const totalUsers = usersSnapshot.size;

    // Get total bookings
    const bookingsSnapshot = await getDocs(bookingsCol);
    const totalBookings = bookingsSnapshot.size;
    
    // Get recent bookings
    const recentBookingsQuery = query(bookingsCol, orderBy('createdAt', 'desc'), limit(5));
    const recentBookingsSnapshot = await getDocs(recentBookingsQuery);
    const recentBookings = recentBookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));

    return {
        totalRevenue,
        totalUsers,
        totalBookings,
        recentBookings
    };
}

export async function getRevenueLast7Days(): Promise<{ date: string; revenue: number }[]> {
    const today = startOfDay(new Date());
    const sevenDaysAgo = subDays(today, 7);
    
    const bookingsCol = collection(db, 'bookings');
    const q = query(
        bookingsCol, 
        where('status', '==', 'Completed'),
        where('createdAt', '>=' , sevenDaysAgo.toISOString())
    );
    
    const snapshot = await getDocs(q);
    
    const dailyRevenue: { [key: string]: number } = {};

    // Initialize the last 7 days with 0 revenue
    for (let i = 0; i < 7; i++) {
        const date = format(subDays(today, i), 'MMM d');
        dailyRevenue[date] = 0;
    }

    snapshot.docs.forEach(doc => {
        const booking = doc.data() as Booking;
        const bookingDate = new Date(booking.createdAt);
        if (isAfter(bookingDate, sevenDaysAgo)) {
            const dateStr = format(bookingDate, 'MMM d');
            if (dailyRevenue.hasOwnProperty(dateStr)) {
                dailyRevenue[dateStr] += booking.totalPrice;
            }
        }
    });

    return Object.entries(dailyRevenue)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

    