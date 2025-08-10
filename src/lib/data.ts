import type { GolfCourse, Review, TeeTime } from '@/types';

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

const courses: GolfCourse[] = [
  {
    id: 'solmar-golf-links',
    name: 'Solmar Golf Links',
    location: 'Cabo San Lucas',
    description: 'Carved into the dramatic landscape of Cabo San Lucas, Solmar Golf Links offers a unique seaside golfing experience. This Greg Norman Signature course features a "mini-Augusta" feel with dunes, desert, and ocean views.',
    rules: 'Standard golf attire required. Soft spikes only. Please respect pace of play.',
    basePrice: 250,
    latLng: [22.875, -109.9],
    imageUrls: [
      'https://placehold.co/800x600.png',
      'https://placehold.co/800x600.png',
      'https://placehold.co/800x600.png',
      'https://placehold.co/800x600.png',
      'https://placehold.co/800x600.png',
    ],
    reviews: generateReviews(),
    teeTimes: [],
  },
  {
    id: 'palmilla-golf-club',
    name: 'Palmilla Golf Club',
    location: 'San José del Cabo',
    description: 'Known as the "Grand Dame" of Los Cabos golf, this 27-hole Jack Nicklaus Signature course is a classic. With its stunning ocean views from every hole, arroyos, and canyons, Palmilla offers a challenging and beautiful round.',
    rules: 'Collared shirts and appropriate golf shorts/slacks required. Metal spikes are not permitted.',
    basePrice: 280,
    latLng: [23.01, -109.73],
    imageUrls: [
      'https://placehold.co/800x600.png',
      'https://placehold.co/800x600.png',
      'https://placehold.co/800x600.png',
      'https://placehold.co/800x600.png',
    ],
    reviews: generateReviews(),
    teeTimes: [],
  },
  {
    id: 'cabo-del-sol',
    name: 'Cabo del Sol (Desert & Ocean)',
    location: 'Cabo San Lucas',
    description: 'Home to the acclaimed Ocean Course by Jack Nicklaus and the Desert Course by Tom Weiskopf. Cabo del Sol provides two distinct, world-class golf experiences with dramatic routing over desert-like terrain and along the Sea of Cortez.',
    rules: 'Adherence to club dress code is strictly enforced. Caddies are mandatory on the Ocean Course.',
    basePrice: 350,
    latLng: [22.9, -109.8],
    imageUrls: [
      'https://placehold.co/800x600.png',
      'https://placehold.co/800x600.png',
      'https://placehold.co/800x600.png',
      'https://placehold.co/800x600.png',
      'https://placehold.co/800x600.png',
    ],
    reviews: generateReviews(),
    teeTimes: [],
  },
   {
    id: 'puerto-los-cabos',
    name: 'Puerto Los Cabos Golf Club',
    location: 'San José del Cabo',
    description: 'A unique composite design with 9 holes from Greg Norman and 9 from Jack Nicklaus. The course winds through the hills and coastline, offering a varied and strategic game for all skill levels.',
    rules: 'Standard golf attire. All players must have their own set of clubs.',
    basePrice: 260,
    latLng: [23.05, -109.68],
    imageUrls: ['https://placehold.co/800x600.png'],
    reviews: generateReviews(),
    teeTimes: [],
  },
  {
    id: 'vidanta-golf-los-cabos',
    name: 'Vidanta Golf Los Cabos',
    location: 'San José del Cabo',
    description: 'A beautiful 9-hole course perfect for a quicker round. It is situated in the heart of San José del Cabo, offering lush, narrow fairways and a relaxed atmosphere.',
    rules: 'Casual golf attire is acceptable. Pace of play is a priority.',
    basePrice: 150,
    latLng: [23.04, -109.7],
    imageUrls: ['https://placehold.co/800x600.png'],
    reviews: generateReviews(),
    teeTimes: [],
  },
  {
    id: 'cabo-real-golf-club',
    name: 'Cabo Real Golf Club',
    location: 'Cabo San Lucas',
    description: 'A Robert Trent Jones Jr. design that has hosted two PGA Senior Slams. The front nine is a scenic journey through foothills, while the back nine brings players down to the coastline.',
    rules: 'Proper golf attire required. All food and beverage must be purchased from the club.',
    basePrice: 230,
    latLng: [22.95, -109.78],
    imageUrls: ['https://placehold.co/800x600.png'],
    reviews: generateReviews(),
    teeTimes: [],
  },
  {
    id: 'club-campestre-san-jose',
    name: 'Club Campestre San José',
    location: 'San José del Cabo',
    description: 'A Nicklaus Design course known for its spectacular, panoramic views and undulating, dramatic greens. It is a local favorite for its challenge and impeccable conditions.',
    rules: 'Follows USGA rules of golf. Dress code enforced.',
    basePrice: 200,
    latLng: [23.08, -109.73],
    imageUrls: ['https://placehold.co/800x600.png'],
    reviews: generateReviews(),
    teeTimes: [],
  },
  {
    id: 'cabo-san-lucas-country-club',
    name: 'Cabo San Lucas Country Club',
    location: 'Cabo San Lucas',
    description: 'One of the first courses in the area, this Dye Design course is known for its views of the iconic Land\'s End arch. It offers wide fairways and a playable layout for golfers of all abilities.',
    rules: 'Soft spikes only. Each player must have their own bag and clubs.',
    basePrice: 180,
    latLng: [22.89, -109.9],
    imageUrls: ['https://placehold.co/800x600.png'],
    reviews: generateReviews(),
    teeTimes: [],
  },
  {
    id: 'el-cortes-golf-club',
    name: 'El Cortés Golf Club',
    location: 'La Paz',
    description: 'The only Gary Player Signature course in Mexico. It offers stunning views of the Sea of Cortez and La Paz bay from every hole, with challenging elevation changes and pristine conditions.',
    rules: 'Strict dress code. Reservations recommended.',
    basePrice: 220,
    latLng: [24.16, -110.32],
    imageUrls: ['https://placehold.co/800x600.png'],
    reviews: generateReviews(),
    teeTimes: [],
  },
  {
    id: 'paraiso-del-mar-golf',
    name: 'Paraíso del Mar Golf',
    location: 'La Paz',
    description: 'An Arthur Hills design set on a peninsula, offering a secluded and natural golfing experience. This links-style course features challenging winds and beautiful natural dunes.',
    rules: 'Respect for the natural environment is paramount. Standard golf rules apply.',
    basePrice: 190,
    latLng: [24.23, -110.33],
    imageUrls: ['https://placehold.co/800x600.png'],
    reviews: generateReviews(),
    teeTimes: [],
  },
  {
    id: 'tpc-danzante-bay',
    name: 'TPC Danzante Bay',
    location: 'Loreto',
    description: 'A Rees Jones masterpiece that takes players through valleys, arroyos, and up into the mountains, culminating in a world-famous cliffside 17th hole overlooking the Sea of Cortez.',
    rules: 'TPC network standards of etiquette and dress code apply.',
    basePrice: 300,
    latLng: [25.85, -111.33],
    imageUrls: ['https://placehold.co/800x600.png'],
    reviews: generateReviews(),
    teeTimes: [],
  },
  {
    id: 'costa-palmas-golf-club',
    name: 'Costa Palmas Golf Club',
    location: 'La Ribera, East Cape',
    description: 'A Robert Trent Jones Jr. design on the East Cape, offering a classic, core golf experience with generous landing areas and breathtaking views of the Sierra de la Laguna mountains.',
    rules: 'Private club experience, reservations are essential. Appropriate golf attire is required.',
    basePrice: 400,
    latLng: [23.67, -109.68],
    imageUrls: ['https://placehold.co/800x600.png'],
    reviews: generateReviews(),
    teeTimes: [],
  },
];

courses.forEach(course => {
  course.teeTimes = generateTeeTimes(course.basePrice);
});

export const getCourses = async ({ location, players, date }: { location?: string, players?: number, date?: string }): Promise<GolfCourse[]> => {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 200));

  let filteredCourses = courses;

  if (location && location !== 'all') {
    filteredCourses = filteredCourses.filter(course => course.location === location);
  }
  
  // Further filtering logic for players and date would be added here
  // For now, we return the location-filtered list

  return JSON.parse(JSON.stringify(filteredCourses));
};

export const getCourseById = async (id: string): Promise<GolfCourse | undefined> => {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 200));
  const course = courses.find(c => c.id === id);
  return course ? JSON.parse(JSON.stringify(course)) : undefined;
};

export const getCourseLocations = async (): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return [...new Set(courses.map(c => c.location))];
}
