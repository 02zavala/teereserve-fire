import type { GolfCourse, Review, TeeTime, Booking, BookingInput, ReviewInput, UserProfile, Scorecard, ScorecardInput, AchievementId, TeamMember, AboutPageContent, Coupon, CouponInput, ReviewLike, ReviewComment, ReviewBadge, UserReviewStats } from '@/types';
import { db, storage } from './firebase';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, setDoc, CollectionReference, writeBatch, serverTimestamp, orderBy, limit, deleteDoc, runTransaction, increment, QueryConstraint } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { format, startOfDay, subDays, isAfter, parse, set, isToday, isBefore, addMinutes } from 'date-fns';
import { sendBookingConfirmationEmail } from '@/ai/flows/send-booking-confirmation-email';
import { sendReviewInvitationEmail } from '@/ai/flows/send-review-invitation-email';
import { Locale } from '@/i18n-config';


interface CourseDataInput {
    name: string;
    location: string;
    description: string;
    rules?: string;
    basePrice: number;
    newImages: File[];
    existingImageUrls: string[];
    teeTimeInterval: number;
    operatingHours: {
        openingTime: string;
        closingTime: string;
    };
    availableHoles: number[];
    totalYards?: number;
    par: number;
    holeDetails?: {
        holes9?: { yards?: number; par?: number };
        holes18?: { yards?: number; par?: number };
        holes27?: { yards?: number; par?: number };
    };
    hidden?: boolean;
}

// NOTE: The images for this initial set of courses are static assets.
// They are located in the `/public` folder and served directly.
// Any new courses added via the admin panel will have their images uploaded to Firebase Storage.
export const initialCourses: Omit<GolfCourse, 'reviews'>[] = [
    {
      id: "solmar-golf-links",
      name: "Solmar Golf Links",
      location: "Cabo San Lucas",
      description: "Este campo inspirado en links compara con ninguno, con vistas impresionantes del Pacífico en cada hoyo. Diseñado por Greg Norman en 2020, abarca tres paisajes distintos: dunas de arena estilo links, bosques de cactus y proximidad al mar. Ofrece 18 hoyos con un sentimiento de la era dorada del golf, similar a Ballybunion en Irlanda. Incluye clubhouse estilo rancho con vistas dramáticas.",
      rules: "Standard golf etiquette and club rules apply.",
      basePrice: 150,
      teeTimeInterval: 10,
      operatingHours: {
        openingTime: "07:00",
        closingTime: "18:00"
      },
      availableHoles: [18],
      totalYards: 7040,
      par: 72,
      holeDetails: {
        holes18: { yards: 7040, par: 72 }
      },
      imageUrls: [
        "/images/fallback.svg"
      ],
      latLng: { lat: 22.876, lng: -109.931 },
      isFeatured: true,
    },
    {
      id: "palmilla-golf-club",
      name: "Palmilla Golf Club",
      location: "San José del Cabo",
      description: "Conocido como la \"Gran Dama de Los Cabos\", este club ofrece 27 hoyos diseñados por Jack Nicklaus, con vistas al Mar de Cortés desde 12 hoyos. Incluye cursos Arroyo, Mountain y Ocean, con fairways ondulantes, bunkers esculpidos y lagos. Clubhouse inspirado en México, pro shop y staff profesional. Reconocido como uno de los top en Los Cabos por su elegancia y desafío.",
      rules: "Standard golf etiquette and club rules apply.",
      basePrice: 250,
      teeTimeInterval: 10,
      operatingHours: {
        openingTime: "06:30",
        closingTime: "18:30"
      },
      availableHoles: [9, 18, 27],
      totalYards: 10500,
      par: 108,
      holeDetails: {
        holes9: { yards: 3500, par: 36 },
        holes18: { yards: 7000, par: 72 },
        holes27: { yards: 10500, par: 108 }
      },
      imageUrls: [
        "/images/fallback.svg"
      ],
      latLng: { lat: 23.013, lng: -109.736 },
      isFeatured: true,
    },
    {
        id: 'cabo-del-sol',
        name: 'Cabo del Sol (Desert & Ocean)',
        location: 'Cabo San Lucas',
        description: 'Dos cursos: Desert con cambios de elevación dramáticos, terreno desértico y vistas al Mar de Cortés; Ocean diseñado por Jack Nicklaus, donde el desierto se encuentra con el océano, con 7 hoyos junto a la costa. Incluye arroyos como cañones y bunkering dramático. Oasis de lujo con vistas panorámicas.',
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 200,
        teeTimeInterval: 10,
        operatingHours: {
          openingTime: "07:30",
          closingTime: "17:30"
        },
        availableHoles: [18],
        totalYards: 6945,
        par: 72,
        holeDetails: {
          holes18: { yards: 6945, par: 72 }
        },
        imageUrls: [
            "/images/fallback.svg"
        ],
        latLng: { lat: 22.918, lng: -109.831 },
        isFeatured: true,
    },
    {
        id: 'puerto-los-cabos',
        name: 'Puerto Los Cabos Golf Club',
        location: 'San José del Cabo',
        description: 'Instalación de 27 hoyos con tres combinaciones de 18, diseñadas por Jack Nicklaus y Greg Norman. Fairways ondulantes, greens elevados y vistas al Mar de Cortés. Incluye comida/drink stations gratuitas cada pocos hoyos. Ubicado en una comunidad planificada de 2,000 acres.',
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 180,
        teeTimeInterval: 10,
        operatingHours: {
          openingTime: "06:00",
          closingTime: "19:00"
        },
        availableHoles: [9, 18, 27],
        totalYards: 10200,
        par: 108,
        holeDetails: {
          holes9: { yards: 3400, par: 36 },
          holes18: { yards: 6800, par: 72 },
          holes27: { yards: 10200, par: 108 }
        },
        imageUrls: [
            "/images/fallback.svg"
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
        teeTimeInterval: 10,
        operatingHours: {
          openingTime: "08:00",
          closingTime: "17:00"
        },
        availableHoles: [9],
        totalYards: 3000,
        par: 36,
        holeDetails: {
          holes9: { yards: 3000, par: 36 }
        },
        imageUrls: ['/images/fallback.svg'],
        latLng: { lat: 23.045, lng: -109.708 }
    },
    {
        id: 'cabo-real-golf-club',
        name: 'Cabo Real Golf Club',
        location: 'Cabo San Lucas',
        description: 'Diseñado por Robert Trent Jones Jr., estilo target con fairways multi-temáticos en 2,800 acres de resort con playa. Hoyos tallados en desierto y montañas, con vistas al Mar de Cortés. Anfitrión de torneos PGA.',
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 190,
        teeTimeInterval: 10,
        operatingHours: {
          openingTime: "07:00",
          closingTime: "18:00"
        },
        availableHoles: [18],
        par: 72,
        imageUrls: ['/images/fallback.svg'],
        latLng: { lat: 22.955, lng: -109.789 }
    },
    {
        id: 'club-campestre-san-jose',
        name: 'Club Campestre San José',
        location: 'San José del Cabo',
        description: 'Diseñado por Jack Nicklaus, usa pasto Paspalum resistente al agua salada. Fairways verdes en colinas de Sierra de la Laguna, con vistas al Mar de Cortés. Terreno desértico rodante, greens elevados.',
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 100,
        teeTimeInterval: 10,
        operatingHours: {
          openingTime: "07:30",
          closingTime: "17:30"
        },
        availableHoles: [18],
        par: 72,
        imageUrls: ['/images/fallback.svg'],
        latLng: { lat: 23.078, lng: -109.735 }
    },
    {
        id: 'cabo-san-lucas-country-club',
        name: 'Cabo San Lucas Country Club',
        location: 'Cabo San Lucas',
        description: "18 hoyos en terreno suavemente inclinado con vistas al Mar de Cortés y Land's End. Diseñado por Roy Dye, desafiante con vistas panorámicas desde casi todos los hoyos. Incluye restaurante y comunidad cerrada.",
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 120,
        teeTimeInterval: 10,
        operatingHours: {
          openingTime: "06:30",
          closingTime: "18:30"
        },
        availableHoles: [18],
        par: 72,
        imageUrls: ['/images/fallback.svg'],
        latLng: { lat: 22.898, lng: -109.897 }
    },
    {
        id: 'diamante-golf',
        name: 'Diamante Golf (Dunes / Cardonal)',
        location: 'Cabo San Lucas',
        description: 'Dunes por Davis Love III, estilo links con vistas al Pacífico y arroyos nativos; Cardonal por Tiger Woods, con fairways anchos y greens slick. Vistas largas al océano y dunas.',
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 300,
        teeTimeInterval: 10,
        operatingHours: {
          openingTime: "06:00",
          closingTime: "19:00"
        },
        availableHoles: [18],
        par: 72,
        imageUrls: ['/images/fallback.svg'],
        latLng: { lat: 22.951, lng: -110.021 }
    },
    {
        id: 'el-cortes-golf-club',
        name: 'El Cortés Golf Club',
        location: 'La Paz',
        description: 'Firma de Gary Player, 18 hoyos con vistas panorámicas al Mar de Cortés. Cambios de elevación dramáticos, desierto y mar, con practice range y halfway house escénica.',
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 80,
        teeTimeInterval: 10,
        operatingHours: {
          openingTime: "07:00",
          closingTime: "18:00"
        },
        availableHoles: [18],
        par: 72,
        imageUrls: ['/images/fallback.svg'],
        latLng: { lat: 24.195, lng: -110.320 }
    },
    {
        id: 'paraiso-del-mar-golf',
        name: 'Paraíso del Mar Golf',
        location: 'La Paz',
        description: 'Diseñado por Arthur Hills, estilo links oceánico de 18 hoyos en 7,039 yardas. Paisaje de dunas reminiscentes de Escocia, con vistas al Golfo de California.',
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 90,
        teeTimeInterval: 10,
        operatingHours: {
          openingTime: "07:00",
          closingTime: "18:00"
        },
        availableHoles: [18],
        par: 72,
        imageUrls: ['/images/fallback.svg'],
        latLng: { lat: 24.237, lng: -110.334 }
    },
    {
        id: 'tpc-danzante-bay',
        name: 'TPC Danzante Bay',
        location: 'Loreto',
        description: '18 hoyos multi-temáticos por Rees Jones, con valles, arroyos, dunas y colinas. Vistas panorámicas a Danzante Bay y Mar de Cortés, greens slick y vientos desafiantes.',
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 150,
        teeTimeInterval: 10,
        operatingHours: {
          openingTime: "06:30",
          closingTime: "18:30"
        },
        availableHoles: [18],
        par: 72,
        imageUrls: ['/images/fallback.svg'],
        latLng: { lat: 25.828, lng: -111.306 }
    },
    {
        id: 'costa-palmas-golf-club',
        name: 'Costa Palmas Golf Club',
        location: 'La Ribera, East Cape',
        description: 'Diseñado por Robert Trent Jones II, links-like con fairways anchos, condiciones firmes y rápidas. Vistas de desierto y mar, terreno divertido para todos los niveles.',
        rules: 'Standard golf etiquette and club rules apply.',
        basePrice: 250,
        teeTimeInterval: 10,
        operatingHours: {
          openingTime: "06:00",
          closingTime: "19:00"
        },
        availableHoles: [18],
        par: 72,
        imageUrls: ['/images/fallback.svg'],
        latLng: { lat: 23.633, lng: -109.689 }
    },
  ];

const uploadImages = async (courseName: string, files: File[]): Promise<string[]> => {
    if (!storage) {
        console.warn("Firebase Storage is not initialized. Skipping image upload.");
        return [];
    }
    const storageInstance = storage; // Create a non-null reference
    const uploadPromises = files.map(file => {
        // Sanitize file name
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const storageRef = ref(storageInstance, `courses/${courseName.toLowerCase().replace(/\s+/g, '-')}/${Date.now()}-${cleanFileName}`);
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

// Helper function to serialize Firestore timestamps
const serializeTimestamps = (data: any): any => {
  if (data && typeof data === 'object') {
    if (data.toDate && typeof data.toDate === 'function') {
      // This is a Firestore Timestamp
      return data.toDate().toISOString();
    }
    if (Array.isArray(data)) {
      return data.map(serializeTimestamps);
    }
    const serialized: any = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeTimestamps(value);
    }
    return serialized;
  }
  return data;
};

export const getCourses = async ({ location, includeHidden = false, isFeatured }: { location?: string; includeHidden?: boolean; isFeatured?: boolean }): Promise<GolfCourse[]> => {
  const coursesMap = new Map<string, Omit<GolfCourse, 'reviews'>>();

  // Add initial static courses to the map
  initialCourses.forEach(course => {
      coursesMap.set(course.id, course);
  });

  // Fetch courses from Firestore only if db is initialized
  if (db) {
      try {
          const coursesCol = collection(db, 'courses');
          const constraints: QueryConstraint[] = [];
          if (isFeatured) {
              constraints.push(where("isFeatured", "==", true));
          }
          const firestoreQuery = query(coursesCol, ...constraints);
          const firestoreSnapshot = await getDocs(firestoreQuery);
          
          firestoreSnapshot.forEach(doc => {
              const rawCourseData = doc.data();
              const serializedCourseData = serializeTimestamps(rawCourseData) as Omit<GolfCourse, 'id' | 'reviews'>;
              coursesMap.set(doc.id, {
                  id: doc.id,
                  ...serializedCourseData
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
  
  let coursesWithoutReviews = Array.from(coursesMap.values());

  if (isFeatured) {
      coursesWithoutReviews = coursesWithoutReviews.filter(course => course.isFeatured);
  }

  // Filtrar cursos ocultos si no se incluyen explícitamente
  if (!includeHidden) {
    coursesWithoutReviews = coursesWithoutReviews.filter(course => !course.hidden);
  }

  if (location && location !== 'all') {
    coursesWithoutReviews = coursesWithoutReviews.filter(course => course.location === location);
  }
  
  // Load reviews for each course
  const allCourses: GolfCourse[] = await Promise.all(
    coursesWithoutReviews.map(async (course) => {
      const reviews = await getReviewsForCourse(course.id);
      return { ...course, reviews };
    })
  );
  
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
                const rawCourseData = { id: courseSnap.id, ...courseSnap.data() };
                const serializedCourseData = serializeTimestamps(rawCourseData) as GolfCourse;
                serializedCourseData.reviews = await getReviewsForCourse(id);
                return serializedCourseData;
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

// Helper function to remove undefined values from objects
const removeUndefinedValues = (obj: any): any => {
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
        if (obj[key] !== undefined) {
            if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                const nestedCleaned = removeUndefinedValues(obj[key]);
                if (Object.keys(nestedCleaned).length > 0) {
                    cleaned[key] = nestedCleaned;
                }
            } else {
                cleaned[key] = obj[key];
            }
        }
    });
    return cleaned;
};

export const addCourse = async (courseData: CourseDataInput): Promise<string> => {
    if (!db) throw new Error("Firestore is not initialized.");
    // This will add a new course to Firestore, it won't be in the initial static list
    const { newImages, ...restOfData } = courseData;
    const newImageUrls = await uploadImages(courseData.name, newImages);
    
    const courseDocData = removeUndefinedValues({
      name: restOfData.name,
      location: restOfData.location,
      description: restOfData.description,
      rules: restOfData.rules || "",
      basePrice: restOfData.basePrice,
      imageUrls: [...restOfData.existingImageUrls, ...newImageUrls],
      teeTimeInterval: restOfData.teeTimeInterval,
      operatingHours: restOfData.operatingHours,
      availableHoles: restOfData.availableHoles,
      totalYards: restOfData.totalYards,
      par: restOfData.par,
      holeDetails: restOfData.holeDetails,
      hidden: restOfData.hidden || false,
      // latLng would need to be added to the form
    });
    
    const coursesCol = collection(db, 'courses');
    const docRef = await addDoc(coursesCol, courseDocData);
    return docRef.id;
}

export const updateCourse = async (courseId: string, courseData: CourseDataInput): Promise<void> => {
    if (!db) throw new Error("Firestore is not initialized.");
    const { newImages, existingImageUrls, ...restOfData } = courseData;
    const newImageUrls = await uploadImages(courseData.name, newImages);
    
    const allImageUrls = [...existingImageUrls, ...newImageUrls];

    const courseDocRef = doc(db, 'courses', courseId);
    
    // Check if document exists, if not create it
    const courseSnap = await getDoc(courseDocRef);
    const courseUpdateData = removeUndefinedValues({
        name: restOfData.name,
        location: restOfData.location,
        description: restOfData.description,
        rules: restOfData.rules || "",
        basePrice: restOfData.basePrice,
        imageUrls: allImageUrls,
        teeTimeInterval: restOfData.teeTimeInterval,
        operatingHours: restOfData.operatingHours,
        availableHoles: restOfData.availableHoles,
        totalYards: restOfData.totalYards,
        par: restOfData.par,
        holeDetails: restOfData.holeDetails,
        hidden: restOfData.hidden
    });
    
    if (courseSnap.exists()) {
        await updateDoc(courseDocRef, {
            ...courseUpdateData,
            updatedAt: serverTimestamp()
        });
    } else {
        // If document doesn't exist, create it with setDoc
        // Find the static course data to get additional fields like latLng
        const staticCourse = initialCourses.find(c => c.id === courseId);
        const cleanedSetDocData = removeUndefinedValues({
            id: courseId,
            ...courseUpdateData,
            latLng: staticCourse?.latLng || { lat: 0, lng: 0 },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        await setDoc(courseDocRef, cleanedSetDocData);
    }
}

export const deleteCourse = async (courseId: string): Promise<void> => {
    if (!db) throw new Error("Firestore is not initialized.");
    // Note: This will not delete subcollections like reviews or tee times automatically.
    // For a production app, a Cloud Function would be needed to handle cascading deletes.
    const courseDocRef = doc(db, 'courses', courseId);
    await deleteDoc(courseDocRef);
}

export const updateCourseVisibility = async (courseId: string, hidden: boolean): Promise<void> => {
    if (!db) throw new Error("Firestore is not initialized.");
    const courseDocRef = doc(db, 'courses', courseId);
    await updateDoc(courseDocRef, {
        hidden,
        updatedAt: serverTimestamp()
    });
}

export const updateCourseFeaturedStatus = async (courseId: string, isFeatured: boolean): Promise<void> => {
    if (!db) throw new Error("Firestore is not initialized.");
    const courseDocRef = doc(db, 'courses', courseId);
    await updateDoc(courseDocRef, {
        isFeatured,
        updatedAt: serverTimestamp()
    });
};

// *** Tee Time Functions ***

const generateDefaultTeeTimes = (basePrice: number, course?: GolfCourse, date?: Date): Omit<TeeTime, 'id' | 'date'>[] => {
    const times: Omit<TeeTime, 'id' | 'date'>[] = [];
    
    // Get interval from course configuration or default to 10 minutes for exact timing
    const intervalMinutes = course?.teeTimeInterval || 10;
    
    // Get operating hours from course configuration or use defaults
    const openingTime = course?.operatingHours?.openingTime ? 
        parseTimeToDecimal(course.operatingHours.openingTime) : 7.0; // 07:00
    const lastTeeTime = course?.operatingHours?.closingTime ? 
        parseTimeToDecimal(course.operatingHours.closingTime) : 18.0; // 18:00
    
    // Check if this is today's date for auto-blocking past times
    const now = new Date();
    const isToday = date ? date.toDateString() === now.toDateString() : false;
    const nowTimeDecimal = isToday ? now.getHours() + (now.getMinutes() / 60) : 0;

    // Start with exact minutes based on interval
    let currentTimeMinutes = Math.floor(openingTime * 60);
    const lastTeeTimeMinutes = Math.floor(lastTeeTime * 60);
    
    // Ensure we start on exact interval boundaries
    const remainder = currentTimeMinutes % intervalMinutes;
    if (remainder !== 0) {
        currentTimeMinutes += (intervalMinutes - remainder);
    }
    
    while (currentTimeMinutes <= lastTeeTimeMinutes) {
        const hour = Math.floor(currentTimeMinutes / 60);
        const minute = currentTimeMinutes % 60;
        
        const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const currentTimeDecimal = hour + (minute / 60);
        
        const priceMultiplier = (hour < 9 || hour >= 15) ? 0.9 : 1.2;
        
        // Auto-block past times if it's today
        const status = isToday && currentTimeDecimal <= nowTimeDecimal ? 'blocked' : 'available';
        
        times.push({
            time: formattedTime,
            status,
            price: Math.round(basePrice * priceMultiplier),
            maxPlayers: 4, // Máximo estándar de 4 jugadores por tee time
            bookedPlayers: 0, // Inicialmente sin jugadores reservados
            availableSpots: 4, // Todos los espacios disponibles inicialmente
            bookingIds: [] // Sin reservas inicialmente
        });

        // Increment by exact interval minutes
        currentTimeMinutes += intervalMinutes;
    }
    return times;
};

// Helper function to parse time string to decimal
const parseTimeToDecimal = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours + (minutes / 60);
};


export const getTeeTimesForCourse = async (courseId: string, date: Date, basePrice: number): Promise<TeeTime[]> => {
    const now = new Date();
    const isRequestForToday = isToday(date);
    const dateString = format(startOfDay(date), 'yyyy-MM-dd');
    
    // Get course information for interval and operating hours
    const course = await getCourseById(courseId);

    // Daily cutoff logic
    if (isRequestForToday) {
        const cutoffTime = set(now, { hours: 19, minutes: 0, seconds: 0, milliseconds: 0 });
        if (isAfter(now, cutoffTime)) {
            const allTimes = generateDefaultTeeTimes(basePrice, course, date);
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
        let defaultTimes = generateDefaultTeeTimes(basePrice, course, date);

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
            const defaultTimes = generateDefaultTeeTimes(basePrice, course, date);
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
                    status: newTeeTime.status,
                    maxPlayers: newTeeTime.maxPlayers,
                    bookedPlayers: newTeeTime.bookedPlayers,
                    availableSpots: newTeeTime.availableSpots,
                    bookingIds: newTeeTime.bookingIds
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

// Function to generate confirmation number TRG- + random characters (max 10 total)
function generateConfirmationNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'TRG-';
    // Generate 6 random characters to make total 10 (TRG- = 4 chars + 6 random = 10)
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function createBooking(bookingData: BookingInput, lang: Locale): Promise<string> {
    if (!db) throw new Error("Firestore is not initialized.");
    const dbInstance = db; // Create a non-null reference
    const bookingsCol = collection(dbInstance, 'bookings');
    const bookingDocRef = doc(bookingsCol);
    const teeTimeDocRef = doc(dbInstance, 'courses', bookingData.courseId, 'teeTimes', bookingData.teeTimeId);

    let userProfile: UserProfile | undefined = undefined;
    const confirmationNumber = generateConfirmationNumber();
    const isGuestBooking = bookingData.userId === 'guest';

    const bookingId = await runTransaction(dbInstance, async (transaction) => {
        const teeTimeDoc = await transaction.get(teeTimeDocRef);

        if (!teeTimeDoc.exists()) throw new Error("Tee time not found. It may have been booked by someone else.");
        
        const teeTimeData = teeTimeDoc.data() as TeeTime;
        
        // Check if tee time has enough available spots
        const currentAvailableSpots = teeTimeData.availableSpots ?? (teeTimeData.maxPlayers ?? 4);
        const requestedPlayers = bookingData.players;
        
        if (teeTimeData.status === 'blocked') {
            throw new Error("This tee time is blocked and not available for booking.");
        }
        
        if (teeTimeData.status === 'booked' && currentAvailableSpots === 0) {
            throw new Error("This tee time is fully booked.");
        }
        
        if (requestedPlayers > currentAvailableSpots) {
            throw new Error(`Only ${currentAvailableSpots} spots available for this tee time.`);
        }

        // Only get user profile for registered users
        if (!isGuestBooking) {
            const userDocRef = doc(dbInstance, 'users', bookingData.userId);
            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists()) throw new Error("User does not exist!");
            userProfile = userDoc.data() as UserProfile;
        }
        
        let finalPrice = bookingData.totalPrice;
        
        if (bookingData.couponCode) {
            const couponRef = doc(dbInstance, 'coupons', bookingData.couponCode);
            const couponSnap = await transaction.get(couponRef);
            if (!couponSnap.exists()) throw new Error("Coupon is not valid.");
            
            const coupon = couponSnap.data() as Coupon;
            if (coupon.expiresAt && isBefore(new Date(coupon.expiresAt), new Date())) {
                throw new Error("This coupon has expired.");
            }
            // Add other validation logic here (usage limits, etc.)

            transaction.update(couponRef, { timesUsed: increment(1) });
        }
        
        transaction.set(bookingDocRef, { 
            ...bookingData, 
            confirmationNumber,
            totalPrice: finalPrice, 
            createdAt: new Date().toISOString() 
        });
        
        // Update tee time with partial booking logic
        const newBookedPlayers = (teeTimeData.bookedPlayers ?? 0) + requestedPlayers;
        const newAvailableSpots = (teeTimeData.maxPlayers ?? 4) - newBookedPlayers;
        const newBookingIds = [...(teeTimeData.bookingIds ?? []), bookingDocRef.id];
        
        let newStatus: 'available' | 'partial' | 'booked' = 'available';
        if (newAvailableSpots === 0) {
            newStatus = 'booked'; // Completamente reservado
        } else if (newBookedPlayers > 0) {
            newStatus = 'partial'; // Parcialmente reservado
        }
        
        transaction.update(teeTimeDocRef, { 
            status: newStatus,
            bookedPlayers: newBookedPlayers,
            availableSpots: newAvailableSpots,
            bookingIds: newBookingIds
        });

        // Only update user profile for registered users
        if (!isGuestBooking && userProfile) {
            const newAchievements: AchievementId[] = [...userProfile.achievements];
            if (!userProfile.achievements.includes('firstBooking')) newAchievements.push('firstBooking');
            
            const userDocRef = doc(dbInstance, 'users', bookingData.userId);
            transaction.update(userDocRef, {
                xp: increment(150),
                achievements: newAchievements,
            });
        }
        
        return bookingDocRef.id;
    });

    // Send confirmation email after transaction is successful
    const emailToUse = (userProfile as UserProfile | undefined)?.email || bookingData.userEmail;
    if (bookingId && emailToUse) {
        try {
            
            const response = await fetch('/api/guest-booking-confirmation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userEmail: emailToUse,
                    bookingDetails: {
                        confirmationNumber: confirmationNumber,
                        userName: bookingData.userName,
                        courseName: bookingData.courseName,
                        date: bookingData.date,
                        time: bookingData.time,
                        players: bookingData.players,
                        totalPrice: bookingData.totalPrice.toString(),
                        discountCode: bookingData.couponCode,
                        discountAmount: 0, // Por ahora 0, se calculará en el backend
                        // Include pricing_snapshot if available
                        ...(bookingData as any).pricing_snapshot && { pricing_snapshot: (bookingData as any).pricing_snapshot }
                    }
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Email API responded with status: ${response.status}. ${errorData.error || ''}`);
            }
        } catch (emailError) {
            console.error(`Booking ${bookingId} created, but confirmation email failed:`, emailError);
            // Don't throw error to user, as booking was successful. Log for monitoring.
        }
    }

    // Send WhatsApp notification if phone number is available
    const phoneToUse = bookingData.userPhone;
    if (bookingId && phoneToUse) {
        try {
            const response = await fetch('/api/send-whatsapp-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: phoneToUse,
                    bookingDetails: {
                        courseName: bookingData.courseName,
                        courseLocation: bookingData.courseLocation,
                        date: bookingData.date,
                        time: bookingData.time,
                        players: bookingData.players,
                        holes: bookingData.holes,
                        totalPrice: bookingData.totalPrice,
                        userName: bookingData.userName
                    }
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('WhatsApp notification URL generated:', result.whatsappUrl);
            }
        } catch (whatsappError) {
            console.error(`Booking ${bookingId} created, but WhatsApp notification failed:`, whatsappError);
            // Don't throw error to user, as booking was successful. Log for monitoring.
        }
    }
    
    return bookingId;
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

export async function getBookingById(bookingId: string): Promise<Booking | null> {
    if (!db) throw new Error("Database service is not available.");

    try {
        const bookingDocRef = doc(db, 'bookings', bookingId.trim());
        const docSnap = await getDoc(bookingDocRef);

        if (!docSnap.exists()) {
            return null;
        }

        return { id: docSnap.id, ...docSnap.data() } as Booking;
    } catch (error) {
        console.error('Error fetching booking:', error);
        return null;
    }
}

export async function getGuestBookingDraft(draftId: string): Promise<any | null> {
    if (!db) throw new Error("Database service is not available.");

    try {
        const draftDocRef = doc(db, 'guestBookingDrafts', draftId.trim());
        const docSnap = await getDoc(draftDocRef);

        if (!docSnap.exists()) {
            return null;
        }

        return { id: docSnap.id, ...docSnap.data() };
    } catch (error) {
        console.error('Error fetching guest booking draft:', error);
        return null;
    }
}

export async function getBookingByIdAndLastName(bookingId: string, email: string): Promise<Booking> {
    console.log('🔍 Iniciando búsqueda de reserva:', { bookingId, email });
    
    if (!db) throw new Error("Database service is not available.");
    const dbInstance = db; // Create a non-null reference

    let booking: Booking | null = null;
    const trimmedBookingId = bookingId.trim();
    console.log('📋 ID de reserva procesado:', trimmedBookingId);

    // First, try to find by document ID (for existing bookings)
    if (trimmedBookingId.length >= 10) {
        console.log('🔎 Buscando por ID de documento...');
        try {
            const bookingDocRef = doc(dbInstance, 'bookings', trimmedBookingId);
            const docSnap = await getDoc(bookingDocRef);
            
            if (docSnap.exists()) {
                booking = { id: docSnap.id, ...docSnap.data() } as Booking;
                console.log('✅ Reserva encontrada por ID de documento:', { id: booking.id, userId: booking.userId, isGuest: booking.isGuest });
            } else {
                console.log('❌ No se encontró reserva por ID de documento');
            }
        } catch (error) {
            // If document ID lookup fails, continue to confirmation number search
            console.log('⚠️ Error en búsqueda por ID de documento:', error);
        }
    }

    // If not found by document ID, try to find by confirmation number
    if (!booking) {
        console.log('🔎 Buscando por número de confirmación...');
        const bookingsCol = collection(dbInstance, 'bookings');
        const q = query(bookingsCol, where('confirmationNumber', '==', trimmedBookingId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            booking = { id: doc.id, ...doc.data() } as Booking;
            console.log('✅ Reserva encontrada por número de confirmación:', { id: booking.id, userId: booking.userId, isGuest: booking.isGuest });
        } else {
            console.log('❌ No se encontró reserva por número de confirmación');
        }
    }

    if (!booking) {
        console.log('❌ Reserva no encontrada');
        throw new Error("Booking not found. Please check your Booking ID or Confirmation Number.");
    }

    console.log('📊 Datos de la reserva encontrada:', {
        id: booking.id,
        userId: booking.userId,
        isGuest: booking.isGuest,
        hasGuestObject: !!booking.guest,
        userEmail: booking.userEmail,
        guestEmail: booking.guest?.email
    });

    // Verify email based on booking type
    let bookingEmail: string;
    
    if (booking.isGuest && booking.guest?.email) {
        // For guest bookings with guest object, use the email stored in the guest object
        bookingEmail = booking.guest.email;
        console.log('✅ Usando email del objeto guest:', bookingEmail);
    } else if (booking.userId === 'guest') {
        // For legacy guest bookings with userId='guest' but no guest object
        // We need to find the email in the booking data itself
        console.log('🔍 Reserva legacy con userId="guest"');
        if (booking.userEmail) {
            bookingEmail = booking.userEmail;
            console.log('✅ Usando userEmail para reserva legacy:', bookingEmail);
        } else {
            console.log('❌ Reserva legacy sin userEmail disponible');
            throw new Error("Guest booking found but no email information available. Please contact support.");
        }
    } else if (booking.userId && booking.userId !== 'guest') {
        // For registered user bookings, get email from user profile
        console.log('🔍 Buscando perfil de usuario registrado:', booking.userId);
        const userDocRef = doc(dbInstance, 'users', booking.userId);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            console.log('❌ Perfil de usuario no encontrado para userId:', booking.userId);
            throw new Error("User profile not found for this booking.");
        }
        
        const userProfile = userDoc.data() as UserProfile;
        if (!userProfile.email) {
            console.log('❌ Usuario registrado sin email disponible');
            throw new Error("User profile found but no email available. Please contact support.");
        }
        bookingEmail = userProfile.email;
        console.log('✅ Email obtenido del perfil de usuario:', bookingEmail);
    } else {
        console.log('❌ Datos de reserva inválidos - información de usuario faltante');
        throw new Error("Invalid booking data: missing user information.");
    }
    
    // Check if the email matches the booking record, case-insensitively
    console.log('🔍 Verificando coincidencia de emails:', {
        emailIngresado: email.trim().toLowerCase(),
        emailReserva: bookingEmail.toLowerCase(),
        coincide: bookingEmail.toLowerCase() === email.trim().toLowerCase()
    });
    
    if (bookingEmail.toLowerCase() !== email.trim().toLowerCase()) {
        console.log('❌ Los emails no coinciden');
        throw new Error("Email does not match the booking record.");
    }

    console.log('✅ Búsqueda de reserva exitosa');
    return booking;
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
            const serializedData = serializeTimestamps(data);
            return {
                id: doc.id,
                user: {
                    name: serializedData.userName,
                    avatarUrl: serializedData.userAvatar
                },
                ...serializedData,
                // Ensure rating is always a valid number
                rating: typeof serializedData.rating === 'number' && !isNaN(serializedData.rating) ? serializedData.rating : 0,
                likesCount: serializedData.likesCount || 0,
                commentsCount: serializedData.commentsCount || 0
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
    const dbInstance = db; // Create a non-null reference
    const userDocRef = doc(dbInstance, 'users', uid);
    await updateDoc(userDocRef, { role });
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    if (!db) throw new Error("Firestore is not initialized.");
    const dbInstance = db; // Create a non-null reference
    const userDocRef = doc(dbInstance, 'users', uid);
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
            recentBookings: [],
            holeStats: { holes9: 0, holes18: 0, holes27: 0 },
            revenueByHoles: { holes9: 0, holes18: 0, holes27: 0 }
        };
    }
    
    try {
        const bookingsCol = collection(db, 'bookings');
        const usersCol = collection(db, 'users');
        
        // Execute queries with reduced limits for better performance
        const [revenueSnapshot, usersSnapshot, bookingsSnapshot, recentBookingsSnapshot] = await Promise.race([
            Promise.all([
                // Get completed bookings for revenue calculation (reduced limit)
                getDocs(query(bookingsCol, where('status', '==', 'Completed'), limit(200))),
                // Get users count (reduced limit)
                getDocs(query(usersCol, limit(200))),
                // Get total bookings count (reduced limit)
                getDocs(query(bookingsCol, limit(200))),
                // Get recent bookings
                getDocs(query(bookingsCol, orderBy('createdAt', 'desc'), limit(5)))
            ]),
            // Add timeout promise
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Dashboard stats query timeout')), 8000)
            )
        ]) as any;
        
        // Calculate revenue and hole statistics from completed bookings
        let totalRevenue = 0;
        const holeStats = { holes9: 0, holes18: 0, holes27: 0 };
        const revenueByHoles = { holes9: 0, holes18: 0, holes27: 0 };
        
        revenueSnapshot.docs.forEach(doc => {
            const booking = doc.data();
            const revenue = booking.totalPrice || 0;
            const holes = booking.holes || 18;
            
            totalRevenue += revenue;
            
            if (holes === 9) {
                holeStats.holes9++;
                revenueByHoles.holes9 += revenue;
            } else if (holes === 27) {
                holeStats.holes27++;
                revenueByHoles.holes27 += revenue;
            } else {
                holeStats.holes18++;
                revenueByHoles.holes18 += revenue;
            }
        });
        
        const recentBookings = recentBookingsSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        } as Booking));
        
        return {
            totalRevenue,
            totalUsers: usersSnapshot.size,
            totalBookings: bookingsSnapshot.size,
            recentBookings,
            holeStats,
            revenueByHoles
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            totalRevenue: 0,
            totalUsers: 0,
            totalBookings: 0,
            recentBookings: [],
            holeStats: { holes9: 0, holes18: 0, holes27: 0 },
            revenueByHoles: { holes9: 0, holes18: 0, holes27: 0 }
        };
    }
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
    
    try {
        const bookingsCol = collection(db, 'bookings');
        const q = query(
            bookingsCol, 
            where('status', '==', 'Completed'),
            where('createdAt', '>=' , sevenDaysAgo.toISOString()),
            limit(100) // Add limit for better performance
        );
        
        const snapshot = await Promise.race([
            getDocs(q),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Revenue query timeout')), 5000)
            )
        ]) as any;

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
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        // Return default data on error
    }

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

// Hero Images Management
export interface HeroImagesContent {
    image1Url: string;
    image2Url: string;
    image3Url: string;
    image4Url: string;
}

export async function getHeroImagesContent(): Promise<HeroImagesContent> {
    const defaults: HeroImagesContent = {
        image1Url: '/hero-1.jpg',
        image2Url: '/hero-2.jpg',
        image3Url: '/hero-3.jpg',
        image4Url: '/hero-4.jpg',
    };
    if (!db) return defaults;
    
    try {
        const docRef = doc(db, 'siteContent', 'heroImages');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as HeroImagesContent;
        }
        return defaults;
    } catch (error) {
        console.error("Error fetching hero images content:", error);
        return defaults;
    }
}

export async function updateHeroImagesContent(content: HeroImagesContent): Promise<void> {
    if (!db) throw new Error("Database is not initialized.");
    const docRef = doc(db, 'siteContent', 'heroImages');
    await setDoc(docRef, content, { merge: true });
}

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
        timesUsed: 0,
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

// =================================================================
// REVIEW SOCIAL FEATURES
// =================================================================

export async function likeReview(courseId: string, reviewId: string, userId: string, userName: string): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    const reviewRef = doc(db, 'courses', courseId, 'reviews', reviewId);
    const likesRef = collection(reviewRef, 'likes');
    const likeRef = doc(likesRef, userId);
    
    await runTransaction(db, async (transaction) => {
        const likeDoc = await transaction.get(likeRef);
        
        if (likeDoc.exists()) {
            // Unlike: remove like and decrement count
            transaction.delete(likeRef);
            transaction.update(reviewRef, {
                likesCount: increment(-1)
            });
        } else {
            // Like: add like and increment count
            const likeData: ReviewLike = {
                userId,
                userName,
                createdAt: new Date().toISOString()
            };
            transaction.set(likeRef, likeData);
            transaction.update(reviewRef, {
                likesCount: increment(1)
            });
        }
    });
}

export async function addReviewComment(courseId: string, reviewId: string, userId: string, userName: string, userAvatar: string | null, text: string): Promise<ReviewComment> {
    if (!db) throw new Error('Database not initialized');
    
    const reviewRef = doc(db, 'courses', courseId, 'reviews', reviewId);
    const commentsRef = collection(reviewRef, 'comments');
    
    const commentData: Omit<ReviewComment, 'id'> = {
        userId,
        userName,
        userAvatar,
        text,
        createdAt: new Date().toISOString()
    };
    
    const commentDocRef = await addDoc(commentsRef, commentData);
    
    // Update comments count
    await updateDoc(reviewRef, {
        commentsCount: increment(1)
    });
    
    return {
        id: commentDocRef.id,
        ...commentData
    };
}

export async function getReviewLikes(courseId: string, reviewId: string): Promise<ReviewLike[]> {
    if (!db) throw new Error('Database not initialized');
    
    const likesRef = collection(db, 'courses', courseId, 'reviews', reviewId, 'likes');
    const likesSnapshot = await getDocs(likesRef);
    
    return likesSnapshot.docs.map(doc => doc.data() as ReviewLike);
}

export async function getReviewComments(courseId: string, reviewId: string): Promise<ReviewComment[]> {
    if (!db) throw new Error('Database not initialized');
    
    const commentsRef = collection(db, 'courses', courseId, 'reviews', reviewId, 'comments');
    const commentsQuery = query(commentsRef, orderBy('createdAt', 'asc'));
    const commentsSnapshot = await getDocs(commentsQuery);
    
    return commentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as ReviewComment));
}

export async function checkUserLikedReview(courseId: string, reviewId: string, userId: string): Promise<boolean> {
    if (!db) throw new Error('Database not initialized');
    
    const likeRef = doc(db, 'courses', courseId, 'reviews', reviewId, 'likes', userId);
    const likeDoc = await getDoc(likeRef);
    
    return likeDoc.exists();
}

export async function getFilteredReviews(filter: { courseId?: string; experienceType?: string; rating?: number; isVerifiedBooking?: boolean; sortBy: string }): Promise<Review[]> {
    if (!db) throw new Error('Database not initialized');
    
    let reviewsQuery;
    
    if (filter.courseId) {
        // Get reviews for specific course
        const reviewsRef = collection(db, 'courses', filter.courseId, 'reviews');
        reviewsQuery = query(reviewsRef, where('approved', '==', true));
    } else {
        // Get all reviews from all courses
        const allReviews: Review[] = [];
        const coursesSnapshot = await getDocs(collection(db, 'courses'));
        
        for (const courseDoc of coursesSnapshot.docs) {
            const reviewsRef = collection(db, 'courses', courseDoc.id, 'reviews');
            let courseReviewsQuery = query(reviewsRef, where('approved', '==', true));
            
            const reviewsSnapshot = await getDocs(courseReviewsQuery);
            const courseReviews = reviewsSnapshot.docs.map(doc => {
                const data = doc.data();
                const serializedData = serializeTimestamps(data);
                return {
                    id: doc.id,
                    courseId: courseDoc.id,
                    ...serializedData,
                    // Ensure rating is always a valid number
                    rating: typeof serializedData.rating === 'number' && !isNaN(serializedData.rating) ? serializedData.rating : 0,
                    likesCount: serializedData.likesCount || 0,
                    commentsCount: serializedData.commentsCount || 0
                } as Review;
            });
            
            allReviews.push(...courseReviews);
        }
        
        return allReviews.filter(review => {
            if (filter.experienceType && review.experienceType !== filter.experienceType) return false;
            if (filter.rating && review.rating < filter.rating) return false;
            if (filter.isVerifiedBooking !== undefined && review.isVerifiedBooking !== filter.isVerifiedBooking) return false;
            return true;
        }).sort((a, b) => {
            switch (filter.sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'highest_rated':
                    return b.rating - a.rating;
                case 'most_liked':
                    return (b.likesCount || 0) - (a.likesCount || 0);
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });
    }
    
    const reviewsSnapshot = await getDocs(reviewsQuery);
    return reviewsSnapshot.docs.map(doc => {
        const data = doc.data();
        const serializedData = serializeTimestamps(data);
        return {
            id: doc.id,
            courseId: filter.courseId!,
            ...serializedData,
            // Ensure rating is always a valid number
            rating: typeof serializedData.rating === 'number' && !isNaN(serializedData.rating) ? serializedData.rating : 0,
            likesCount: serializedData.likesCount || 0,
            commentsCount: serializedData.commentsCount || 0
        } as Review;
    });
 }

// =================================================================
// GAMIFICATION SYSTEM
// =================================================================

const REVIEW_BADGES: ReviewBadge[] = [
    {
        id: 'explorer',
        name: 'Explorador',
        description: 'Ha reseñado 3+ campos diferentes',
        icon: '🏌️',
        requirement: 3,
        type: 'explorer'
    },
    {
        id: 'expert',
        name: 'Experto',
        description: 'Ha publicado 10+ reseñas',
        icon: '⭐',
        requirement: 10,
        type: 'expert'
    },
    {
        id: 'top_reviewer',
        name: 'Top Reviewer',
        description: 'Reseñas con 50+ likes en total',
        icon: '👑',
        requirement: 50,
        type: 'top_reviewer'
    },
    {
        id: 'verified_player',
        name: 'Jugador Verificado',
        description: 'Ha completado 5+ reservas verificadas',
        icon: '✅',
        requirement: 5,
        type: 'verified_player'
    }
];

export async function getUserReviews(userId: string): Promise<Review[]> {
    if (!db) throw new Error('Database not initialized');
    
    const allReviews: Review[] = [];
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    
    for (const courseDoc of coursesSnapshot.docs) {
        const reviewsRef = collection(db, 'courses', courseDoc.id, 'reviews');
        const userReviewsQuery = query(reviewsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
        const reviewsSnapshot = await getDocs(userReviewsQuery);
        
        if (!reviewsSnapshot.empty) {
            reviewsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                const serializedData = serializeTimestamps(data);
                const review = { 
                    id: doc.id, 
                    courseId: courseDoc.id, 
                    courseName: courseDoc.data().name || 'Unknown Course',
                    ...serializedData,
                    // Ensure rating is always a valid number
                    rating: typeof serializedData.rating === 'number' && !isNaN(serializedData.rating) ? serializedData.rating : 0,
                    likesCount: serializedData.likesCount || 0,
                    commentsCount: serializedData.commentsCount || 0
                } as Review;
                allReviews.push(review);
            });
        }
    }
    
    // Sort all reviews by creation date (newest first)
    allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return allReviews;
}

export async function getUserReviewStats(userId: string): Promise<UserReviewStats> {
    if (!db) throw new Error('Database not initialized');
    
    // Get all user reviews across all courses
    const allReviews: Review[] = [];
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    const coursesReviewed: string[] = [];
    let totalLikes = 0;
    
    for (const courseDoc of coursesSnapshot.docs) {
        const reviewsRef = collection(db, 'courses', courseDoc.id, 'reviews');
        const userReviewsQuery = query(reviewsRef, where('userId', '==', userId));
        const reviewsSnapshot = await getDocs(userReviewsQuery);
        
        if (!reviewsSnapshot.empty) {
            coursesReviewed.push(courseDoc.id);
            
            reviewsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                const serializedData = serializeTimestamps(data);
                const review = { 
                    id: doc.id, 
                    courseId: courseDoc.id, 
                    ...serializedData,
                    // Ensure rating is always a valid number
                    rating: typeof serializedData.rating === 'number' && !isNaN(serializedData.rating) ? serializedData.rating : 0,
                    likesCount: serializedData.likesCount || 0,
                    commentsCount: serializedData.commentsCount || 0
                } as Review;
                allReviews.push(review);
                totalLikes += review.likesCount || 0;
            });
        }
    }
    
    // Calculate earned badges
    const earnedBadges: ReviewBadge[] = [];
    
    // Explorer badge: 3+ different courses
    if (coursesReviewed.length >= 3) {
        earnedBadges.push(REVIEW_BADGES.find(b => b.type === 'explorer')!);
    }
    
    // Expert badge: 10+ reviews
    if (allReviews.length >= 10) {
        earnedBadges.push(REVIEW_BADGES.find(b => b.type === 'expert')!);
    }
    
    // Top Reviewer badge: 50+ total likes
    if (totalLikes >= 50) {
        earnedBadges.push(REVIEW_BADGES.find(b => b.type === 'top_reviewer')!);
    }
    
    // Verified Player badge: Check completed bookings
    const userBookings = await getUserBookings(userId);
    const completedBookings = userBookings.filter(booking => 
        booking.status === 'confirmed' && new Date(booking.date) < new Date()
    );
    
    if (completedBookings.length >= 5) {
        earnedBadges.push(REVIEW_BADGES.find(b => b.type === 'verified_player')!);
    }
    
    return {
        totalReviews: allReviews.length,
        totalLikes,
        coursesReviewed,
        badges: earnedBadges,
        isTopReviewer: totalLikes >= 50
    };
}

export async function getTopReviewers(limit: number = 10): Promise<(UserReviewStats & { userId: string; userName: string; userAvatar?: string })[]> {
    if (!db) throw new Error('Database not initialized');
    
    // Get all users who have written reviews
    const userReviewsMap = new Map<string, { reviews: Review[]; userName: string; userAvatar?: string }>();
    
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    
    for (const courseDoc of coursesSnapshot.docs) {
        const reviewsRef = collection(db, 'courses', courseDoc.id, 'reviews');
        const reviewsQuery = query(reviewsRef, where('approved', '==', true));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        
        reviewsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const serializedData = serializeTimestamps(data);
            const review = { 
                id: doc.id, 
                courseId: courseDoc.id, 
                ...serializedData,
                // Ensure rating is always a valid number
                rating: typeof serializedData.rating === 'number' && !isNaN(serializedData.rating) ? serializedData.rating : 0,
                likesCount: serializedData.likesCount || 0,
                commentsCount: serializedData.commentsCount || 0
            } as Review;
            
            if (!userReviewsMap.has(review.userId)) {
                userReviewsMap.set(review.userId, {
                    reviews: [],
                    userName: review.user?.name || 'Usuario',
                    userAvatar: review.user?.avatarUrl
                });
            }
            
            userReviewsMap.get(review.userId)!.reviews.push(review);
        });
    }
    
    // Calculate stats for each user and sort by total likes
    const topReviewers = Array.from(userReviewsMap.entries()).map(([userId, data]) => {
        const totalLikes = data.reviews.reduce((sum, review) => sum + (review.likesCount || 0), 0);
        const coursesReviewed = [...new Set(data.reviews.map(r => r.courseId))];
        
        // Calculate badges
        const earnedBadges: ReviewBadge[] = [];
        
        if (coursesReviewed.length >= 3) {
            earnedBadges.push(REVIEW_BADGES.find(b => b.type === 'explorer')!);
        }
        
        if (data.reviews.length >= 10) {
            earnedBadges.push(REVIEW_BADGES.find(b => b.type === 'expert')!);
        }
        
        if (totalLikes >= 50) {
            earnedBadges.push(REVIEW_BADGES.find(b => b.type === 'top_reviewer')!);
        }
        
        return {
            userId,
            userName: data.userName,
            userAvatar: data.userAvatar,
            totalReviews: data.reviews.length,
            totalLikes,
            coursesReviewed,
            badges: earnedBadges,
            isTopReviewer: totalLikes >= 50
        };
    }).sort((a, b) => b.totalLikes - a.totalLikes).slice(0, limit);
    
    // Add monthly rank
    return topReviewers.map((reviewer, index) => ({
        ...reviewer,
        monthlyRank: index + 1
    }));
}

export async function updateUserBadges(userId: string): Promise<ReviewBadge[]> {
    if (!db) throw new Error('Database not initialized');
    
    const stats = await getUserReviewStats(userId);
    
    // Store user badges in Firestore
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
        reviewStats: stats,
        badges: stats.badges,
        lastBadgeUpdate: new Date().toISOString()
    });
    
    return stats.badges;
}

export function getAllBadges(): ReviewBadge[] {
    return REVIEW_BADGES;
}

// =================================================================
// REVIEW NOTIFICATIONS SYSTEM
// =================================================================

export async function sendReviewInvitationForCompletedBooking(
    bookingId: string,
    locale: 'en' | 'es' = 'en'
): Promise<boolean> {
    if (!db) throw new Error('Database not initialized');
    
    try {
        // Get booking details
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingRef);
        
        if (!bookingSnap.exists()) {
            console.error(`Booking ${bookingId} not found`);
            return false;
        }
        
        const booking = bookingSnap.data() as Booking;
        
        // Check if booking is completed (date has passed)
        const bookingDate = new Date(booking.date);
        const now = new Date();
        
        if (bookingDate > now) {
            console.log(`Booking ${bookingId} is not yet completed`);
            return false;
        }
        
        // Check if review invitation already sent
        if (booking.reviewInvitationSent) {
            console.log(`Review invitation already sent for booking ${bookingId}`);
            return false;
        }
        
        // Get user details
        const userRef = doc(db, 'users', booking.userId);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            console.error(`User ${booking.userId} not found`);
            return false;
        }
        
        const user = userSnap.data() as UserProfile;
        
        // Send review invitation email
        const emailResult = await sendReviewInvitationEmail({
            bookingId: booking.id || bookingId,
            userName: booking.userName || user.displayName || 'Golfista',
            userEmail: user.email || '',
            courseName: booking.courseName,
            courseId: booking.courseId,
            date: booking.date,
            locale
        });
        
        if (emailResult.success) {
            // Mark review invitation as sent
            await updateDoc(bookingRef, {
                reviewInvitationSent: true,
                reviewInvitationSentAt: new Date().toISOString()
            });
            
            console.log(`Review invitation sent successfully for booking ${bookingId}`);
            return true;
        } else {
            console.error(`Failed to send review invitation for booking ${bookingId}:`, emailResult.message);
            return false;
        }
    } catch (error) {
        console.error(`Error sending review invitation for booking ${bookingId}:`, error);
        return false;
    }
}

export async function processCompletedBookingsForReviewInvitations(): Promise<void> {
    if (!db) throw new Error('Database not initialized');
    
    try {
        // Get all bookings that are completed but haven't received review invitations
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const bookingsRef = collection(db, 'bookings');
        const completedBookingsQuery = query(
            bookingsRef,
            where('status', '==', 'confirmed'),
            where('reviewInvitationSent', '!=', true),
            where('date', '<=', yesterday.toISOString().split('T')[0])
        );
        
        const bookingsSnapshot = await getDocs(completedBookingsQuery);
        
        console.log(`Found ${bookingsSnapshot.docs.length} completed bookings to process for review invitations`);
        
        // Process each booking
        for (const bookingDoc of bookingsSnapshot.docs) {
            const booking = { id: bookingDoc.id, ...bookingDoc.data() } as Booking & { id: string };
            
            // Send review invitation with a delay to avoid rate limiting
            await sendReviewInvitationForCompletedBooking(booking.id, 'es'); // Default to Spanish
            
            // Add a small delay between emails
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('Completed processing review invitations');
    } catch (error) {
        console.error('Error processing completed bookings for review invitations:', error);
    }
}

// Function to manually trigger review invitation for a specific booking
export async function triggerReviewInvitation(
    bookingId: string,
    locale: 'en' | 'es' = 'es'
): Promise<{ success: boolean; message: string }> {
    try {
        const success = await sendReviewInvitationForCompletedBooking(bookingId, locale);
        
        if (success) {
            return {
                success: true,
                message: 'Review invitation sent successfully'
            };
        } else {
            return {
                success: false,
                message: 'Failed to send review invitation'
            };
        }
    } catch (error) {
        return {
            success: false,
            message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
