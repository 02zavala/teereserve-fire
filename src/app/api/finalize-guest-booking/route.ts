import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import Stripe from 'stripe';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
  } catch (error) {
    // During build time, Firebase initialization might fail
    console.warn('Firebase initialization failed during build:', error);
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

interface FinalizeBookingRequest {
  draftId: string;
  paymentIntentId: string;
  userIdToLink?: string;
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

    const body: FinalizeBookingRequest = await request.json();
    const { draftId, paymentIntentId, userIdToLink } = body;

    if (!draftId || !paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = getFirestore();
    
    // Get draft booking
    const draftDoc = await db.collection('guestBookingDrafts').doc(draftId).get();
    if (!draftDoc.exists) {
      return NextResponse.json(
        { error: 'Draft booking not found' },
        { status: 404 }
      );
    }

    const draftData = draftDoc.data()!;
    
    // Verify ownership
    if (draftData.createdByUid !== decodedToken.uid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Verify PaymentIntent status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Create confirmed booking
    const bookingRef = db.collection('bookings').doc();
    const bookingId = bookingRef.id;

    const bookingData = {
      courseId: draftData.courseId,
      date: draftData.date,
      teeTime: draftData.teeTime,
      players: draftData.players,
      amount: draftData.amount,
      currency: draftData.currency,
      paymentIntentId,
      status: 'confirmed',
      isGuest: !userIdToLink,
      userId: userIdToLink || null,
      guest: draftData.guest,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await bookingRef.set(bookingData);

    // Delete the draft
    await draftDoc.ref.delete();

    // Get the language from the draft data for redirect
    const lang = draftData.lang || 'es';
    const redirectUrl = `/${lang}/book/success?booking_id=${bookingId}&payment_intent=${paymentIntentId}`;

    return NextResponse.json({
      ok: true,
      bookingId,
      redirectUrl,
      message: 'Booking confirmed successfully'
    });
  } catch (error) {
    console.error('Error finalizing guest booking:', error);
    return NextResponse.json(
      { error: 'Failed to finalize booking' },
      { status: 500 }
    );
  }
}