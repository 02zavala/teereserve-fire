
'use server';
/**
 * @fileOverview A Genkit flow for creating a Stripe Payment Intent.
 *
 * - createPaymentIntent - A function that creates a Stripe Payment Intent.
 * - CreatePaymentIntentInput - The input type for the createPaymentIntent function.
 * - CreatePaymentIntentOutput - The return type for the createPaymentIntent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

const CreatePaymentIntentInputSchema = z.object({
    amount: z.number().describe('The amount in the smallest currency unit (e.g., cents).'),
    currency: z.string().default('usd').describe('The currency of the payment.'),
});
export type CreatePaymentIntentInput = z.infer<typeof CreatePaymentIntentInputSchema>;

const CreatePaymentIntentOutputSchema = z.object({
    clientSecret: z.string().describe('The client secret for the Payment Intent.'),
});
export type CreatePaymentIntentOutput = z.infer<typeof CreatePaymentIntentOutputSchema>;

const createPaymentIntentFlow = ai.defineFlow(
    {
        name: 'createPaymentIntentFlow',
        inputSchema: CreatePaymentIntentInputSchema,
        outputSchema: CreatePaymentIntentOutputSchema,
    },
    async (input) => {
        try {
            // Ensure default values from the schema are applied
            const validatedInput = CreatePaymentIntentInputSchema.parse(input);

            const paymentIntent = await stripe.paymentIntents.create({
                amount: validatedInput.amount,
                currency: validatedInput.currency,
                automatic_payment_methods: { enabled: true },
            });

            if (!paymentIntent.client_secret) {
                throw new Error('Failed to create Payment Intent: client_secret is null.');
            }

            return { clientSecret: paymentIntent.client_secret };
        } catch (error) {
            console.error('Stripe Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred with Stripe.';
            throw new Error(`Failed to create payment intent: ${errorMessage}`);
        }
    }
);

export async function createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentOutput> {
    return createPaymentIntentFlow(input);
}
