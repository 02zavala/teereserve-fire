
import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/ai/flows/send-contact-email';
import { z } from 'zod';

// Schema for validating the request body
const contactSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email format' }),
  message: z.string().min(1, { message: 'Message is required' }),
  recaptchaToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.flatten() }, { status: 400 });
    }
    
    const { name, email, message } = validation.data;

    // Optional: Add reCAPTCHA server-side verification here
    // For now, we'll proceed directly to sending the email.

    const result = await sendContactEmail({ name, email, message });

    if (result.success) {
      return NextResponse.json({ message: 'Message sent successfully!' }, { status: 200 });
    } else {
      // The flow should throw an error, but as a fallback:
      throw new Error(result.message || 'The email flow reported a failure.');
    }

  } catch (error) {
    console.error('API Contact Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to send message: ${errorMessage}` }, { status: 500 });
  }
}
