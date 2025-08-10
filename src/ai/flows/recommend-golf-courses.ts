// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview An AI agent to suggest personalized golf courses and packages.
 *
 * - recommendGolfCourses - A function that handles the recommendation process.
 * - RecommendGolfCoursesInput - The input type for the recommendGolfCourses function.
 * - RecommendGolfCoursesOutput - The return type for the recommendGolfCourses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendGolfCoursesInputSchema = z.object({
  userId: z.string().describe('The ID of the user for whom to generate recommendations.  If not available, can be an empty string.'),
  courseId: z.string().optional().describe('The ID of the current golf course being viewed, if any.'),
  date: z.string().optional().describe('The date for which the user is planning to play golf.'),
  numPlayers: z.number().optional().describe('The number of players in the user group.'),
  location: z.string().optional().describe('The general location where the user is looking to play golf.'),
});
export type RecommendGolfCoursesInput = z.infer<typeof RecommendGolfCoursesInputSchema>;

const GolfCourseRecommendationSchema = z.object({
  courseId: z.string().describe('The ID of the recommended golf course.'),
  name: z.string().describe('The name of the recommended golf course.'),
  description: z.string().describe('A short, personalized description of why this course is recommended for the user.'),
  price: z.number().describe('The price to play at this golf course.'),
  imageUrl: z.string().describe('URL of an image of the golf course.'),
  reason: z.string().describe('The reasons this course is recommended to the user, based on their past preferences or current context.'),
  tags: z.array(z.string()).describe('Descriptive tags such as \'best value today\' or \'recommended for your style of play\'.'),
});

const RecommendGolfCoursesOutputSchema = z.object({
  recommendations: z.array(GolfCourseRecommendationSchema).describe('A list of recommended golf courses and packages.'),
});
export type RecommendGolfCoursesOutput = z.infer<typeof RecommendGolfCoursesOutputSchema>;

export async function recommendGolfCourses(input: RecommendGolfCoursesInput): Promise<RecommendGolfCoursesOutput> {
  return recommendGolfCoursesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendGolfCoursesPrompt',
  input: {schema: RecommendGolfCoursesInputSchema},
  output: {schema: RecommendGolfCoursesOutputSchema},
  prompt: `You are an expert golf concierge specializing in recommending golf courses and packages to users.

  Based on the user's history, preferences, and current conditions, provide personalized recommendations for golf courses and packages.

  Consider the following information:
  - User ID: {{{userId}}}
  - Current Course ID (if any): {{{courseId}}}
  - Date: {{{date}}}
  - Number of Players: {{{numPlayers}}}
  - Location: {{{location}}}

  Recommend courses that match their playing style, budget, and desired experience.

  Format your recommendations in JSON format.
  Include a personalized description of why each course is recommended for the user.
  Include the price, image URL and descriptive tags as well.
  The tags are used to highlight reasons or special offers such as "best value today" or "recommended for your style of play".
  `,
});

const recommendGolfCoursesFlow = ai.defineFlow(
  {
    name: 'recommendGolfCoursesFlow',
    inputSchema: RecommendGolfCoursesInputSchema,
    outputSchema: RecommendGolfCoursesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
