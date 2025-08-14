
'use server';
/**
 * @fileOverview A Genkit flow for sending a contact form email using Nodemailer.
 *
 * - sendContactEmail - A function that handles sending the email.
 * - SendContactEmailInput - The input type for the sendContactEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import nodemailer from 'nodemailer';

const SendContactEmailInputSchema = z.object({
  name: z.string().describe('The name of the person sending the message.'),
  email: z.string().email().describe('The email address of the sender.'),
  message: z.string().describe('The content of the message.'),
});
export type SendContactEmailInput = z.infer<typeof SendContactEmailInputSchema>;

// This flow doesn't need to return anything complex, just a success message.
const SendContactEmailOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SendContactEmailOutput = z.infer<typeof SendContactEmailOutputSchema>;


const sendContactEmailFlow = ai.defineFlow(
  {
    name: 'sendContactEmailFlow',
    inputSchema: SendContactEmailInputSchema,
    outputSchema: SendContactEmailOutputSchema,
  },
  async (input) => {
    const { name, email, message } = input;

    // IMPORTANT: You must configure these environment variables in your .env file
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: (process.env.SMTP_SECURE === 'true'), // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // For Gmail, this should be an "App Password"
      },
    });

    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`, // Sender address (your configured email)
      to: process.env.CONTACT_FORM_RECIPIENT, // List of receivers
      replyTo: email, // Set the sender's email as the reply-to address
      subject: `New Contact Form Message from ${name}`,
      text: message,
      html: `
        <h1>New Message from TeeReserve Contact Form</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      return { success: true, message: 'Email sent successfully.' };
    } catch (error) {
      console.error('Failed to send email:', error);
      // It's important to throw an error here so the frontend knows something went wrong.
      throw new Error('Failed to send email.');
    }
  }
);

export async function sendContactEmail(input: SendContactEmailInput): Promise<SendContactEmailOutput> {
  return sendContactEmailFlow(input);
}
