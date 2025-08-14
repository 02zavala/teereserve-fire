
import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/ai/flows/send-contact-email';

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, recaptchaToken } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Optional: Add reCAPTCHA server-side verification here if needed
    // For now, we'll proceed directly to sending the email.

    const result = await sendContactEmail({ name, email, message });

    if (result.success) {
      return NextResponse.json({ message: 'Message sent successfully!' }, { status: 200 });
    } else {
      throw new Error(result.message);
    }

  } catch (error) {
    console.error('API Contact Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: `Failed to send message: ${errorMessage}` }, { status: 500 });
  }
}
