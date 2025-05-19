'use server';

/**
 * @fileOverview Summarizes the purpose and components of a given code.
 *
 * - summarizeCode - A function that handles the code summarization process.
 * - SummarizeCodeInput - The input type for the summarizeCode function.
 * - SummarizeCodeOutput - The return type for the summarizeCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCodeInputSchema = z.object({
  code: z
    .string()
    .describe('The source code (C or COBOL) to be summarized.'),
  language: z.enum(['C', 'COBOL']).describe('The programming language of the source code.'),
});
export type SummarizeCodeInput = z.infer<typeof SummarizeCodeInputSchema>;

const SummarizeCodeOutputSchema = z.object({
  summary: z.string().describe('A detailed, hierarchical summary of the code.'),
});
export type SummarizeCodeOutput = z.infer<typeof SummarizeCodeOutputSchema>;

export async function summarizeCode(input: SummarizeCodeInput): Promise<SummarizeCodeOutput> {
  return summarizeCodeFlow(input);
}

const summarizeCodePrompt = ai.definePrompt({
  name: 'summarizeCodePrompt',
  input: {schema: SummarizeCodeInputSchema},
  output: {schema: SummarizeCodeOutputSchema},
  prompt: `You are an expert software engineer specializing in understanding code.

You will receive source code in either C or COBOL.

You will provide a detailed, hierarchical summary of the code's purpose and components.

Language: {{{language}}}
Source Code:
{{code}}`,
});

const summarizeCodeFlow = ai.defineFlow(
  {
    name: 'summarizeCodeFlow',
    inputSchema: SummarizeCodeInputSchema,
    outputSchema: SummarizeCodeOutputSchema,
  },
  async input => {
    const {output} = await summarizeCodePrompt(input);
    return output!;
  }
);
