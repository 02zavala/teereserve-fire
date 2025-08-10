
import type { GolfCourse, Review, TeeTime, Booking, BookingInput, ReviewInput, UserProfile } from '@/types';
import { db, storage } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, setDoc, CollectionReference, writeBatch, serverTimestamp, orderBy, limit } from 'firebase/firestore';
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

const initialCourses: Omit<GolfCourse, 'reviews'>[] = [
    {
      id: "solmar-golf-links",
      name: "Solmar Golf Links",
      location: "Cabo San Lucas",
      description: "Este campo inspirado en links compara con ninguno, con vistas impresionantes del Pacífico en cada hoyo. Diseñado por Greg Norman en 2020, abarca tres paisajes distintos: dunas de arena estilo links, bosques de cactus y proximidad al mar. Ofrece 18 hoyos con un sentimiento de la era dorada del golf, similar a Ballybunion en Irlanda. Incluye clubhouse estilo rancho con vistas dramáticas.",
      rules: "Standard golf etiquette and club rules apply.",
      basePrice: 150,
      imageUrls: [
        "https://placehold.co/800x600.png",
        "https://placehold.co/800x600.png",
        "https://placehold.co/800x600.png",
        "https://placehold.co/800x600.png",
        "https://placehold.co/800x600.png",
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
        "https://placehold.co/800x600.png",
        "https://placehold.co/800x600.png",
        "https://placehold.co/800x600.png",
        "https://placehold.co/800x600.png",
        "https://placehold.co/800x600.png",
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
        imageUrls: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png'],
        latLng: { lat: 22.918, lng: -109.831 }
    },
    {
        id: 'puerto-los-cabos',
        name: 'Puerto Los Cabos Golf Club',
        location: 'San José del Cabo',
        description: 'Instalación de 27 hoyos con tres combinaciones de 18, diseñadas por Jack Nicklaus y Greg Norman. Fairways ondulantes, greens elevados y vistas al Mar de Cortés. Incluye comida/drink stations gratuitas cada pocos hoyos. Ubicado en una comunidad planificada de 2,000 acres.',
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 180,
        imageUrls: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png'],
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

// *** Firestore Data Functions ***

export const getCourses = async ({ location }: { location?: string }): Promise<GolfCourse[]> => {
  let courses = initialCourses.map(c => ({...c, reviews: [] as Review[]}));

  if (location && location !== 'all') {
    courses = courses.filter(course => course.location === location);
  }
  
  // This function now primarily returns the static course data for list views.
  // The full details with reviews are fetched in getCourseById.
  // This improves performance and avoids unnecessary Firestore reads on the home/courses pages.
  return courses;
};

export const getCourseById = async (id: string): Promise<GolfCourse | undefined> => {
    if (!id) return undefined;
    
    // Find the course in our static data
    const course = initialCourses.find(c => c.id === id);

    if (course) {
        // Attach reviews
        const courseData = { ...course, reviews: await getReviewsForCourse(id) };
        return courseData;
    } else {
        // Fallback to Firestore for dynamically added courses
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
    }
};

export const getCourseLocations = async (): Promise<string[]> => {
    const courseList = initialCourses;
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

    // Add reviews from static courses
    for (const course of initialCourses) {
        const reviews = await getReviewsForCourse(course.id, false);
        reviews.forEach(r => allReviews.push({ ...r, courseName: course.name }));
    }

    // Add reviews from dynamically added courses
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
