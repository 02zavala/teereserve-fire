
import type { GolfCourse, Review, TeeTime, Booking, BookingInput, ReviewInput, UserProfile, Scorecard, ScorecardInput, AchievementId, TeamMember, AboutPageContent, Coupon, CouponInput } from '@/types';
import { db, storage } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, setDoc, CollectionReference, writeBatch, serverTimestamp, orderBy, limit, deleteDoc, runTransaction, increment } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { format, startOfDay, subDays, isAfter, parse, set, isToday, isBefore, addMinutes } from 'date-fns';

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
    if (!storage) {
        console.warn("Firebase Storage is not initialized. Skipping image upload.");
        return [];
    }
    const uploadPromises = files.map(file => {
        // Sanitize file name
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const storageRef = ref(storage, `courses/${courseName.toLowerCase().replace(/\s+/g, '-')}/${Date.now()}-${cleanFileName}`);
        return uploadBytes(storageRef, file).then(snapshot => getDownloadURL(snapshot.ref));
    });
    return Promise.all(uploadPromises);
};

export const uploadReviewImage = async (courseId: string, userId: string, file: File): Promise<string> => {
    if (!storage) {
        throw new Error("Firebase Storage is not initialized.");
    }
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const storageRef = ref(storage, `reviews/${courseId}/${userId}-${Date.now()}-${cleanFileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
};

export const uploadProfilePicture = async (userId: string, file: File): Promise<string> => {
    if (!storage) {
        throw new Error("Firebase Storage is not initialized.");
    }
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

  // Fetch courses from Firestore only if db is initialized
  if (db) {
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
           if (error.code === 'not-found' || (error.message && error.message.includes("NOT_FOUND"))) {
            console.warn(`
              *****************************************************************
              * Firestore Database Not Found.                                 *
              *                                                               *
              * This error usually means you haven't created a Firestore      *
              * database in your Firebase project yet. The app will continue  *
              * to run with local example data, but it will not be able to    *
              * save or load any new data.                                    *
              *                                                               *
              * PLEASE GO TO YOUR FIREBASE CONSOLE TO CREATE ONE:             *
              * https://console.firebase.google.com/project/_/firestore       *
              *****************************************************************
            `);
          } else if (error.code === 'permission-denied' || error.code === 'unauthenticated' || error.code === 'unavailable') {
            console.warn("Firestore access denied or unavailable. The app will run with local data only. Error:", error.message);
          } else {
            console.error("Error fetching courses from Firestore:", error);
          }
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
    
    // First, check Firestore for a dynamically added course if db is available
    if (db) {
        try {
            const courseDocRef = doc(db, 'courses', id);
            const courseSnap = await getDoc(courseDocRef);

            if (courseSnap.exists()) {
                const courseData = { id: courseSnap.id, ...courseSnap.data() } as GolfCourse;
                courseData.reviews = await getReviewsForCourse(id);
                return courseData;
            }
        } catch (error: any) {
            if (error.code !== 'not-found' && !(error.message && error.message.includes("NOT_FOUND"))) {
                console.error(`Firestore error fetching course ${id}. Falling back to static data.`, error);
            }
        }
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
    if (!db) throw new Error("Firestore is not initialized.");
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
    if (!db) throw new Error("Firestore is not initialized.");
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
    if (!db) throw new Error("Firestore is not initialized.");
    // Note: This will not delete subcollections like reviews or tee times automatically.
    // For a production app, a Cloud Function would be needed to handle cascading deletes.
    const courseDocRef = doc(db, 'courses', courseId);
    await deleteDoc(courseDocRef);
}

// *** Tee Time Functions ***

const generateDefaultTeeTimes = (basePrice: number): Omit<TeeTime, 'id' | 'date'>[] => {
    const times: Omit<TeeTime, 'id' | 'date'>[] = [];
    const openingTime = 7.5; // 07:30
    const lastTeeTime = 18.5; // 18:30
    const intervalMinutes = 12;

    let currentTime = openingTime;
    while (currentTime <= lastTeeTime) {
        const hour = Math.floor(currentTime);
        const minute = (currentTime - hour) * 60;
        
        const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        
        const priceMultiplier = (hour < 9 || hour >= 15) ? 0.9 : 1.2;
        
        times.push({
            time: formattedTime,
            status: 'available',
            price: Math.round(basePrice * priceMultiplier),
        });

        // Increment time by the interval
        const totalMinutes = currentTime * 60 + intervalMinutes;
        currentTime = totalMinutes / 60;
    }
    return times;
};


export const getTeeTimesForCourse = async (courseId: string, date: Date, basePrice: number): Promise<TeeTime[]> => {
    const now = new Date();
    const isRequestForToday = isToday(date);
    const dateString = format(startOfDay(date), 'yyyy-MM-dd');

    // Daily cutoff logic
    if (isRequestForToday) {
        const cutoffTime = set(now, { hours: 19, minutes: 0, seconds: 0, milliseconds: 0 });
        if (isAfter(now, cutoffTime)) {
            const allTimes = generateDefaultTeeTimes(basePrice);
            return allTimes.map(t => ({
                ...t,
                id: `${dateString}-${t.time}`,
                date: dateString,
                status: 'blocked'
            }));
        }
    }

    if (!db) {
        console.warn("Firestore not available. Generating local tee times.");
        let defaultTimes = generateDefaultTeeTimes(basePrice);

        // Filter for today's available times
        if (isRequestForToday) {
            const minLeadTime = addMinutes(now, 30);
            defaultTimes = defaultTimes.filter(t => {
                const teeDateTime = parse(t.time, 'HH:mm', date);
                return isAfter(teeDateTime, minLeadTime);
            });
        }

        return defaultTimes.map((t, i) => ({ ...t, id: `local-${i}`, date: dateString }));
    }

    const teeTimesCol = collection(db, 'courses', courseId, 'teeTimes');
    const q = query(teeTimesCol, where('date', '==', dateString));
    
    try {
        const snapshot = await getDocs(q);
        let teeTimesResult: TeeTime[];

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
            teeTimesResult = newTimesWithIds;
        } else {
            teeTimesResult = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as TeeTime));
        }

        // Filter for today's available times after fetching/creating
        if (isRequestForToday) {
            const minLeadTime = addMinutes(now, 30);
            teeTimesResult = teeTimesResult.filter(t => {
                const teeDateTime = parse(t.time, 'HH:mm', date);
                return isAfter(teeDateTime, minLeadTime);
            });
        }
        
        return teeTimesResult.sort((a,b) => a.time.localeCompare(b.time));

    } catch (error) {
        console.error("Error getting or creating tee times: ", error);
        return [];
    }
};

export const updateTeeTimesForCourse = async (courseId: string, date: Date, teeTimes: TeeTime[]): Promise<void> => {
    if (!db) throw new Error("Firestore is not initialized.");
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
const TAX_RATE = 0.16;

export async function createBooking(bookingData: BookingInput): Promise<string> {
    if (!db) throw new Error("Firestore is not initialized.");
    const bookingsCol = collection(db, 'bookings');
    const bookingDocRef = doc(bookingsCol);
    const userDocRef = doc(db, 'users', bookingData.userId);
    const teeTimeDocRef = doc(db, 'courses', bookingData.courseId, 'teeTimes', bookingData.teeTimeId);

    await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        const teeTimeDoc = await transaction.get(teeTimeDocRef);

        if (!userDoc.exists()) {
            throw new Error("User does not exist!");
        }
        if (!teeTimeDoc.exists()) {
            throw new Error("Tee time not found. It may have been booked by someone else.");
        }
        
        const teeTimeData = teeTimeDoc.data() as TeeTime;
        if (teeTimeData.status !== 'available') {
            throw new Error("This tee time is no longer available.");
        }

        const userProfile = userDoc.data() as UserProfile;
        
        // Server-side price validation
        const subtotal = teeTimeData.price * bookingData.players;
        const total = subtotal * (1 + TAX_RATE);
        
        // Use a tolerance for floating point comparisons
        if (Math.abs(total - bookingData.totalPrice) > 0.01) {
             throw new Error(`Price mismatch. Client total: ${bookingData.totalPrice}, Server total: ${total}.`);
        }
        
        // 1. Create a new booking document
        transaction.set(bookingDocRef, { ...bookingData, totalPrice: total, createdAt: new Date().toISOString() });
        
        // 2. Update the tee time status to 'booked'
        transaction.update(teeTimeDocRef, { status: 'booked' });

        // 3. Update user's gamification profile
        const newAchievements: AchievementId[] = [...userProfile.achievements];
        let achievementUnlocked = false;

        // Check for 'firstBooking' achievement
        if (!userProfile.achievements.includes('firstBooking')) {
            newAchievements.push('firstBooking');
            achievementUnlocked = true;
        }

        const gamificationUpdates: Partial<UserProfile> = {
            xp: increment(150), // 50 for booking + 100 for completing
        };

        if (achievementUnlocked) {
            gamificationUpdates.achievements = newAchievements;
        }
        
        transaction.update(userDocRef, gamificationUpdates);
    });
    
    return bookingDocRef.id;
}


export async function getBookings(): Promise<Booking[]> {
    if (!db) return [];
    const bookingsCol = collection(db, 'bookings');
    const snapshot = await getDocs(query(bookingsCol, orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
    if (!db) return [];
    const bookingsCol = collection(db, 'bookings');
    const q = query(bookingsCol, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
}

// *** Review Functions ***

export async function addReview(courseId: string, reviewData: ReviewInput): Promise<string> {
    if (!db) throw new Error("Firestore is not initialized.");
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
    if (!db) return [];
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
    if (!db) return [];
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
    if (!db) throw new Error("Firestore is not initialized.");
    const reviewDocRef = doc(db, 'courses', courseId, 'reviews', reviewId);
    await updateDoc(reviewDocRef, { approved: approved });
}

export async function checkIfUserHasPlayed(userId: string, courseId: string): Promise<boolean> {
    if (!userId || !db) return false;

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
    if (!db) return [];
    const usersCol = collection(db, 'users');
    const q = query(usersCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as UserProfile);
}

export async function updateUserRole(uid: string, role: UserProfile['role']): Promise<void> {
    if (!db) throw new Error("Firestore is not initialized.");
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { role });
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    if (!db) throw new Error("Firestore is not initialized.");
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, data);
}


// *** Scorecard Functions ***
export async function addUserScorecard(scorecardData: ScorecardInput): Promise<string> {
    if (!db) throw new Error("Firestore is not initialized.");
    const scorecardsCol = collection(db, 'users', scorecardData.userId, 'scorecards');
    const docRef = await addDoc(scorecardsCol, {
        ...scorecardData,
        createdAt: new Date().toISOString(),
    });
    return docRef.id;
}

export async function getUserScorecards(userId: string): Promise<Scorecard[]> {
    if (!db) return [];
    const scorecardsCol = collection(db, 'users', userId, 'scorecards');
    const q = query(scorecardsCol, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scorecard));
}

export async function deleteUserScorecard(userId: string, scorecardId: string): Promise<void> {
    if (!db) throw new Error("Firestore is not initialized.");
    const scorecardDocRef = doc(db, 'users', userId, 'scorecards', scorecardId);
    await deleteDoc(scorecardDocRef);
}

// *** Dashboard Functions ***
export async function getDashboardStats() {
    if (!db) {
        return {
            totalRevenue: 0,
            totalUsers: 0,
            totalBookings: 0,
            recentBookings: []
        };
    }
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
    
    const dailyRevenue: { [key: string]: number } = {};
    for (let i = 0; i < 7; i++) {
        const date = format(subDays(today, i), 'MMM d');
        dailyRevenue[date] = 0;
    }

    if (!db) return Object.entries(dailyRevenue).map(([date, revenue]) => ({ date, revenue }));
    
    const bookingsCol = collection(db, 'bookings');
    const q = query(
        bookingsCol, 
        where('status', '==', 'Completed'),
        where('createdAt', '>=' , sevenDaysAgo.toISOString())
    );
    
    const snapshot = await getDocs(q);

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

// *** Site Content Functions ***
export const uploadSiteImage = async (file: File, imageName: string): Promise<string> => {
    if (!storage) throw new Error("Firebase Storage is not initialized.");
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const storageRef = ref(storage, `site-content/${imageName}-${Date.now()}-${cleanFileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
};

export async function getAboutPageContent(): Promise<AboutPageContent> {
    const defaults: AboutPageContent = {
        heroImageUrl: 'https://placehold.co/1920x800.png',
        missionImageUrl: 'https://placehold.co/600x600.png',
    };
    if (!db) return defaults;
    
    try {
        const docRef = doc(db, 'siteContent', 'aboutPage');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as AboutPageContent;
        }
        return defaults;
    } catch (error) {
        console.error("Error fetching about page content:", error);
        return defaults;
    }
}

export async function updateAboutPageContent(content: AboutPageContent): Promise<void> {
    if (!db) throw new Error("Firestore is not initialized.");
    const docRef = doc(db, 'siteContent', 'aboutPage');
    await setDoc(docRef, content, { merge: true });
}

// *** Team Member Functions ***

export async function getTeamMembers(): Promise<TeamMember[]> {
    if (!db) return [];
    try {
        const teamMembersCol = collection(db, 'teamMembers');
        const q = query(teamMembersCol, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
    } catch (error) {
        console.error("Error fetching team members:", error);
        return [];
    }
}

export async function uploadTeamMemberAvatar(file: File, memberId?: string): Promise<string> {
    if (!storage) throw new Error("Firebase Storage is not initialized.");
    
    const fileName = memberId ? `${memberId}-${file.name}` : `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `team-avatars/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
}

export async function addOrUpdateTeamMember(memberData: Partial<TeamMember>): Promise<TeamMember> {
    if (!db) throw new Error("Firestore is not initialized.");
    const teamMembersCol = collection(db, 'teamMembers');
    
    if (memberData.id) {
        // Update existing member
        const memberDocRef = doc(db, 'teamMembers', memberData.id);
        await updateDoc(memberDocRef, memberData);
        const updatedDoc = await getDoc(memberDocRef);
        return { id: updatedDoc.id, ...updatedDoc.data() } as TeamMember;
    } else {
        // Add new member
        const docRef = await addDoc(teamMembersCol, memberData);
        const newDoc = await getDoc(docRef);
        return { id: newDoc.id, ...newDoc.data() } as TeamMember;
    }
}

export async function deleteTeamMember(memberId: string): Promise<void> {
    if (!db || !storage) throw new Error("Firebase is not initialized.");
    
    const memberDocRef = doc(db, 'teamMembers', memberId);
    const memberDoc = await getDoc(memberDocRef);
    
    if (memberDoc.exists()) {
        const memberData = memberDoc.data() as TeamMember;
        // Delete avatar from storage if it exists
        if (memberData.avatarUrl) {
            try {
                const avatarRef = ref(storage, memberData.avatarUrl);
                await deleteObject(avatarRef);
            } catch (error: any) {
                // If the file doesn't exist, we can ignore the error
                if (error.code !== 'storage/object-not-found') {
                    console.error("Error deleting team member avatar:", error);
                }
            }
        }
    }
    
    await deleteDoc(memberDocRef);
}

// *** Coupon Functions ***

export async function addCoupon(couponData: CouponInput): Promise<Coupon> {
    if (!db) throw new Error("Firestore is not initialized.");
    const couponRef = doc(db, 'coupons', couponData.code);
    const docSnap = await getDoc(couponRef);

    if (docSnap.exists()) {
        throw new Error(`Coupon code "${couponData.code}" already exists.`);
    }

    const newCoupon: Coupon = {
        ...couponData,
        createdAt: new Date().toISOString(),
    };

    await setDoc(couponRef, newCoupon);
    return newCoupon;
}

export async function getCoupons(): Promise<Coupon[]> {
    if (!db) return [];
    const couponsCol = collection(db, 'coupons');
    const q = query(couponsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Coupon);
}


export async function deleteCoupon(code: string): Promise<void> {
    if (!db) throw new Error("Firestore is not initialized.");
    const couponRef = doc(db, 'coupons', code);
    await deleteDoc(couponRef);
}

export async function validateCoupon(code: string): Promise<Coupon> {
    if (!db) throw new Error("Firestore is not initialized.");
    const couponRef = doc(db, 'coupons', code);
    const docSnap = await getDoc(couponRef);

    if (!docSnap.exists()) {
        throw new Error("Coupon code not found.");
    }

    const coupon = docSnap.data() as Coupon;

    if (coupon.expiresAt && isBefore(new Date(coupon.expiresAt), new Date())) {
        throw new Error("This coupon has expired.");
    }

    return coupon;
}
