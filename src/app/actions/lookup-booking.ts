"use server";

import { z } from 'zod';
import { getBookingByIdAndLastName } from '@/lib/data';

const formSchema = z.object({
  bookingId: z.string().min(5),
  lastName: z.string().min(2),
});

export async function lookupBookingAction(data: { bookingId: string; lastName: string }) {
  try {
    const validatedData = formSchema.parse(data);
    const booking = await getBookingByIdAndLastName(validatedData.bookingId, validatedData.lastName);
    return { success: true, data: booking };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input data.' };
    }
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}
