import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import Stripe from 'stripe';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

interface GuestBookingRequest {
  courseId: string;
  date: string;
  teeTime: string;
  players: number;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Verify user is anonymous
    if (!decodedToken.firebase.sign_in_provider || decodedToken.firebase.sign_in_provider !== 'anonymous') {
      return NextResponse.json(
        { error: 'This endpoint is for anonymous users only' },
        { status: 403 }
      );
    }

    const body: GuestBookingRequest = await request.json();
    const { courseId, date, teeTime, players, guest } = body;

    // Validate required fields
    if (!courseId || !date || !teeTime || !players || !guest?.firstName || !guest?.lastName || !guest?.email || !guest?.phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = getFirestore();
    
    // Get course data to calculate price
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const courseData = courseDoc.data();
    const basePrice = courseData?.basePrice || 0;
    const amount = Math.round(basePrice * players * 100); // Convert to cents

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid pricing' },
        { status: 400 }
      );
    }

    // Create draft booking
    const draftRef = db.collection('guestBookingDrafts').doc();
    const draftId = draftRef.id;

    await draftRef.set({
      courseId,
      date,
      teeTime,
      players,
      amount: amount / 100, // Store in dollars
      currency: 'usd',
      guest,
      status: 'requires_payment',
      createdByUid: decodedToken.uid,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    });

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        draftId,
        courseId,
        type: 'guest_booking',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      draftId,
    });
  } catch (error) {
    console.error('Error creating guest booking intent:', error);
    return NextResponse.json(
      { error: 'Failed to create booking intent' },
      { status: 500 }
    );
  }
}