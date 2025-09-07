import { NextRequest, NextResponse } from 'next/server';
import { sendBookingConfirmation } from '@/lib/email';
import { z } from 'zod';

// Force Node.js runtime for email service compatibility
export const runtime = 'nodejs';

// Schema for validating the request body
const guestBookingConfirmationSchema = z.object({
  userEmail: z.string().email({ message: 'Invalid email format' }),
  bookingDetails: z.object({
    courseName: z.string().min(1, { message: 'Course name is required' }),
    date: z.string().min(1, { message: 'Date is required' }),
    time: z.string().min(1, { message: 'Time is required' }),
    players: z.number().min(1, { message: 'Players must be at least 1' }),
    totalPrice: z.string().min(1, { message: 'Total price is required' }),
    confirmationNumber: z.string().optional(),
    courseLocation: z.string().optional(),
    holes: z.number().optional(),
    userName: z.string().optional()
  })
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = guestBookingConfirmationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { userEmail, bookingDetails } = validation.data;

    // Send booking confirmation email
    try {
      await sendBookingConfirmation(userEmail, bookingDetails);
      
      return NextResponse.json(
        { message: 'Booking confirmation email sent successfully' },
        { status: 200 }
      );
    } catch (emailError) {
      console.error('Error sending booking confirmation email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send booking confirmation email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Guest Booking Confirmation Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { error: `Failed to send booking confirmation: ${errorMessage}` },
      { status: 500 }
    );
  }
}