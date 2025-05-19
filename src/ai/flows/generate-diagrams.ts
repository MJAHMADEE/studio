
'use server';
/**
 * @fileOverview Generates Mermaid.js syntax for structural and flowchart diagrams from code.
 *
 * - generateDiagrams - A function that handles diagram generation.
 * - GenerateDiagramsInput - The input type for the generateDiagrams function.
 * - GenerateDiagramsOutput - The return type for the generateDiagrams function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDiagramsInputSchema = z.object({
  code: z.string().describe('The source code to analyze for diagram generation.'),
  language: z.enum(['C', 'COBOL']).describe('The programming language of the source code.'),
});
export type GenerateDiagramsInput = z.infer<typeof GenerateDiagramsInputSchema>;

const GenerateDiagramsOutputSchema = z.object({
  mermaidSyntax: z.string().describe('Mermaid.js syntax for structural and flowchart diagrams. Each diagram should be clearly separated, perhaps by a comment or heading within the syntax string if multiple diagrams are provided.'),
});
export type GenerateDiagramsOutput = z.infer<typeof GenerateDiagramsOutputSchema>;

export async function generateDiagrams(input: GenerateDiagramsInput): Promise<GenerateDiagramsOutput> {
  return generateDiagramsFlow(input);
}

const generateDiagramsPrompt = ai.definePrompt({
  name: 'generateDiagramsPrompt',
  input: {schema: GenerateDiagramsInputSchema},
  output: {schema: GenerateDiagramsOutputSchema},
  prompt: `You are an expert software architect specializing in code visualization.
Analyze the following {{{language}}} code and generate:
1. A structural diagram (e.g., function call graph, module dependencies if applicable) in Mermaid.js 'graph TD' or 'classDiagram' (if object-oriented features are present and relevant) syntax. Keep it high-level.
2. An initial, high-level flowchart of the main algorithm or primary function(s) in Mermaid.js 'flowchart TD' syntax.

Output ONLY the Mermaid.js syntax. If you provide multiple diagrams, separate them with "\n\n%%\n%% --- Next Diagram ---\n%%\n\n".
Ensure the syntax is valid and ready to be rendered. Prioritize clarity and a high-level overview. Avoid overly complex or detailed diagrams.

Source Code:
\`\`\`{{{language}}}
{{{code}}}
\`\`\`
`,
});

const generateDiagramsFlow = ai.defineFlow(
  {
    name: 'generateDiagramsFlow',
    inputSchema: GenerateDiagramsInputSchema,
    outputSchema: GenerateDiagramsOutputSchema,
  },
  async input => {
    const {output} = await generateDiagramsPrompt(input);
    if (!output) {
        throw new Error('Diagram generation failed to produce output.');
    }
    return { mermaidSyntax: output.mermaidSyntax };
  }
);
