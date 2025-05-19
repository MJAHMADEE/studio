
'use server';
/**
 * @fileOverview Generates Markdown flowchart templates from code.
 *
 * - generateDiagrams - A function that handles flowchart Markdown generation.
 * - GenerateDiagramsInput - The input type for the generateDiagrams function.
 * - GenerateDiagramsOutput - The return type for the generateDiagrams function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDiagramsInputSchema = z.object({
  code: z.string().describe('The source code to analyze for flowchart generation.'),
  language: z.enum(['C', 'COBOL']).describe('The programming language of the source code.'),
});
export type GenerateDiagramsInput = z.infer<typeof GenerateDiagramsInputSchema>;

const GenerateDiagramsOutputSchema = z.object({
  flowchartMarkdown: z.string().describe('Markdown representation of the code_s flowchart template.'),
});
export type GenerateDiagramsOutput = z.infer<typeof GenerateDiagramsOutputSchema>;

export async function generateDiagrams(input: GenerateDiagramsInput): Promise<GenerateDiagramsOutput> {
  return generateDiagramsFlow(input);
}

const generateDiagramsPrompt = ai.definePrompt({
  name: 'generateFlowchartMarkdownPrompt',
  input: {schema: GenerateDiagramsInputSchema},
  output: {schema: GenerateDiagramsOutputSchema},
  prompt: `You are an expert software engineer. Analyze the following {{{language}}} code.
Your task is to generate a high-level flowchart template representing the main logic and control flow of the primary function(s) or the overall program.
The output MUST be in Markdown format.

Use the following Markdown conventions:
- Use headings (e.g., \`## Flowchart for function_name\` or \`### Step X: Description\`) for clarity.
- Use ordered or unordered lists for sequential steps.
- Represent decision points (e.g., if/else conditions) clearly. You can use sub-lists or descriptive text.
- Indicate loops and their conditions.
- Use simple text-based arrows like \`->\` or \`==>\` or descriptive phrases (e.g., "then proceeds to", "if true, then") to show the flow between steps.
- You can use inline \`code\` for variable names or code snippets within the flowchart description.
- If there are distinct major flows, you can separate them using horizontal rules (\`---\`).

The goal is a human-readable Markdown document that clearly outlines the algorithmic flow, suitable for understanding and documentation. Do NOT output Mermaid.js syntax or any other diagramming language. Only Markdown.

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
        throw new Error('Flowchart Markdown generation failed to produce output.');
    }
    return { flowchartMarkdown: output.flowchartMarkdown };
  }
);

