// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview An AI agent to assist in moderating user reviews for spam and toxicity.
 *
 * - assistReviewModeration - A function that handles the review moderation process.
 * - AssistReviewModerationInput - The input type for the assistReviewModeration function.
 * - AssistReviewModerationOutput - The return type for the assistReviewModeration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssistReviewModerationInputSchema = z.object({
  reviewText: z.string().describe('The text content of the user review.'),
});
export type AssistReviewModerationInput = z.infer<typeof AssistReviewModerationInputSchema>;

const AssistReviewModerationOutputSchema = z.object({
  isSpam: z.boolean().describe('Whether the review is classified as spam.'),
  isToxic: z.boolean().describe('Whether the review contains toxic content.'),
  toxicityScore: z.number().describe('A score indicating the level of toxicity in the review (0-1).'),
});
export type AssistReviewModerationOutput = z.infer<typeof AssistReviewModerationOutputSchema>;

export async function assistReviewModeration(input: AssistReviewModerationInput): Promise<AssistReviewModerationOutput> {
  return assistReviewModerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assistReviewModerationPrompt',
  input: {schema: AssistReviewModerationInputSchema},
  output: {schema: AssistReviewModerationOutputSchema},
  prompt: `You are an AI assistant helping to moderate user reviews.

  Analyze the following review text and determine if it is spam or contains toxic content.
  Provide a toxicity score between 0 and 1, where 0 means not toxic and 1 means highly toxic.

  Review Text: {{{reviewText}}}

  Return a JSON object with the isSpam, isToxic, and toxicityScore fields.

  Ensure that the output is valid JSON and conforms to the schema.`,
});

const assistReviewModerationFlow = ai.defineFlow(
  {
    name: 'assistReviewModerationFlow',
    inputSchema: AssistReviewModerationInputSchema,
    outputSchema: AssistReviewModerationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
