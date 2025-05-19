
'use server';
/**
 * @fileOverview Analyzes code to identify functions, procedures, and control flow.
 *
 * - analyzeCodeStructure - A function that handles the code structure analysis.
 * - AnalyzeCodeStructureInput - The input type for the analyzeCodeStructure function.
 * - AnalyzeCodeStructureOutput - The return type for the analyzeCodeStructure function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCodeStructureInputSchema = z.object({
  code: z.string().describe('The source code to analyze.'),
  language: z.enum(['C', 'COBOL']).describe('The programming language of the source code.'),
});
export type AnalyzeCodeStructureInput = z.infer<typeof AnalyzeCodeStructureInputSchema>;

const AnalyzeCodeStructureOutputSchema = z.object({
  structureAnalysis: z.string().describe('A textual description of functions, procedures, and control flow.'),
});
export type AnalyzeCodeStructureOutput = z.infer<typeof AnalyzeCodeStructureOutputSchema>;

export async function analyzeCodeStructure(input: AnalyzeCodeStructureInput): Promise<AnalyzeCodeStructureOutput> {
  return analyzeCodeStructureFlow(input);
}

const analyzeCodeStructurePrompt = ai.definePrompt({
  name: 'analyzeCodeStructurePrompt',
  input: {schema: AnalyzeCodeStructureInputSchema},
  output: {schema: AnalyzeCodeStructureOutputSchema},
  prompt: `You are an expert software engineer. Analyze the following {{{language}}} code.
Identify and list:
1. Main functions and procedures, with a brief description of their purpose.
2. Key control flow structures (loops, conditionals) and their roles within the functions.

Present this information in a clear, human-readable markdown format.

Source Code:
\`\`\`{{{language}}}
{{{code}}}
\`\`\`
`,
});

const analyzeCodeStructureFlow = ai.defineFlow(
  {
    name: 'analyzeCodeStructureFlow',
    inputSchema: AnalyzeCodeStructureInputSchema,
    outputSchema: AnalyzeCodeStructureOutputSchema,
  },
  async input => {
    const {output} = await analyzeCodeStructurePrompt(input);
    if (!output) {
        throw new Error('Code structure analysis failed to produce output.');
    }
    return { structureAnalysis: output.structureAnalysis };
  }
);
