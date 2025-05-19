
'use server';

/**
 * @fileOverview Converts C or COBOL code to Python code using either Gemini or a local model.
 *
 * - convertCode - A function that handles the code conversion process.
 * - ConvertCodeInput - The input type for the convertCode function.
 * - ConvertCodeOutput - The return type for the convertCodeFunction.
 */

import {ai} from '@/ai/genkit';
import {z, genkit} from 'genkit'; // genkit import is present
import {googleAI} from '@genkit-ai/googleai';

const ConvertCodeInputSchema = z.object({
  code: z.string().describe('The source code to convert.'),
  sourceLanguage: z.enum(['C', 'COBOL']).describe('The source language of the code.'),
  apiKey: z.string().optional().describe('Optional API key for Gemini. Defaults to the configured key if not provided.'),
  modelType: z.enum(['gemini', 'deepseek']).describe('The model to use for conversion.  "gemini" will use the cloud Gemini API.  "deepseek" will use a locally hosted DeepSeek model.')
});
export type ConvertCodeInput = z.infer<typeof ConvertCodeInputSchema>;

const ConvertCodeOutputSchema = z.object({
  pythonCode: z.string().describe('The converted Python code.'),
});
export type ConvertCodeOutput = z.infer<typeof ConvertCodeOutputSchema>;

export async function convertCode(input: ConvertCodeInput): Promise<ConvertCodeOutput> {
  return convertCodeFlow(input);
}

// This defined prompt object contains the template, schemas, and config
const convertCodePromptDefinition = ai.definePrompt({
  name: 'convertCodePromptDef', // Changed name slightly to avoid confusion with a potential function
  input: {
    schema: ConvertCodeInputSchema,
  },
  output: {
    schema: ConvertCodeOutputSchema,
  },
  prompt: `You are a code conversion expert. Convert the following {{{sourceLanguage}}} code to Python.

\`\`\`{{{code}}}\`\`\`

Ensure the output is valid Python code.
`, // Note: The backticks for the code block are escaped for JS template literal, Handlebars receives ```{{{code}}}```
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const convertCodeFlow = ai.defineFlow(
  {
    name: 'convertCodeFlow',
    inputSchema: ConvertCodeInputSchema,
    outputSchema: ConvertCodeOutputSchema,
  },
  async (input: ConvertCodeInput): Promise<ConvertCodeOutput> => {
    const {
      // code, // input.code will be used directly
      // sourceLanguage, // input.sourceLanguage will be used directly
      apiKey,
      modelType,
    } = input;

    let currentAi = ai; // Start with the global ai instance

    if (apiKey && modelType === 'gemini') {
      // Create a new Genkit instance with the custom API key for Gemini
      currentAi = genkit({plugins: [googleAI({apiKey})]});
    }

    // Determine the model to use
    let modelName = 'googleai/gemini-2.0-flash'; // Default to Gemini
    if (modelType === 'deepseek') {
      // IMPORTANT: Ensure a DeepSeek plugin is configured in src/ai/genkit.ts
      // or globally for this model name to be recognized.
      modelName = 'deepseek-coder:33b-instruct';
    }

    // Manually construct the prompt string by interpolating values.
    // This is because ai.generate() with a raw string doesn't do Handlebars.
    // The `convertCodePromptDefinition.prompt` is the Handlebars template string.
    // For safety and simplicity, directly interpolate.
    const finalPromptText = `You are a code conversion expert. Convert the following ${input.sourceLanguage} code to Python.\n\n\`\`\`\n${input.code}\n\`\`\`\n\nEnsure the output is valid Python code.`;

    const generateResponse = await currentAi.generate({
        prompt: finalPromptText,
        model: modelName,
        config: convertCodePromptDefinition.config, // Reuse safety settings and other configs
        output: { // Specify structured output requirements
            schema: ConvertCodeOutputSchema,
            format: "json" // Crucial for Gemini to return JSON matching the schema
        }
    });
    
    const outputData = generateResponse.output;

    if (!outputData) {
      throw new Error('Code conversion failed to produce output.');
    }
    
    return outputData; // Genkit 1.x: response.output for structured data
  }
);
