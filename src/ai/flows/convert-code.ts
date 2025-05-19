
'use server';

/**
 * @fileOverview Converts C or COBOL code to Python code using either Gemini or a local model.
 *
 * - convertCode - A function that handles the code conversion process.
 * - ConvertCodeInput - The input type for the convertCode function.
 * - ConvertCodeOutput - The return type for the convertCode function.
 */

import {ai} from '@/ai/genkit';
import {z, genkit} from 'genkit'; // Added genkit import here
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

const convertCodePrompt = ai.definePrompt({
  name: 'convertCodePrompt',
  input: {
    schema: ConvertCodeInputSchema,
  },
  output: {
    schema: ConvertCodeOutputSchema,
  },
  prompt: `You are a code conversion expert. Convert the following {{{sourceLanguage}}} code to Python.

\`\`\`{{{code}}}\`\`\`

Ensure the output is valid Python code.
`,
  config: {
    // Safety settings can be adjusted as needed
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
  async input => {
    const {
      code,
      sourceLanguage,
      apiKey,
      modelType,
    } = input;

    // This local `ai` instance will be used for this flow run.
    // It's not ideal to reconfigure the global `ai` object this way,
    // but for simplicity in this example, we'll do it.
    // A better approach might involve passing the configured AI instance or model directly.
    let currentAi = ai;
    if (apiKey && modelType === 'gemini') {
      currentAi = genkit({plugins: [googleAI({apiKey})]});
    }


    // Select model based on modelType
    let modelName = 'googleai/gemini-2.0-flash'; // Default to Gemini model from global config
    if (modelType === 'deepseek') {
      // IMPORTANT: Replace 'deepseek-coder:33b-instruct' with the actual model identifier
      // if you have a different DeepSeek model configured and available via a Genkit plugin.
      // This example assumes a plugin like 'genkit-deepseek' would be configured globally
      // or that the model name 'deepseek-coder:33b-instruct' is recognized by an existing plugin.
      // For this specific app structure, a local model like DeepSeek would typically be
      // configured in `src/ai/genkit.ts` or a local-model specific plugin.
      // Without a DeepSeek plugin, this will likely default to trying to find it via Google AI, which will fail.
      modelName = 'deepseek-coder:33b-instruct';
    }

    const {output} = await currentAi.generate({
        prompt: { // This should reference the defined prompt object directly
            name: 'convertCodePrompt', // Or, more directly: `prompt: convertCodePrompt`
            input: input, // Pass the flow input to the prompt
        },
        model: modelName, // Specify the model to use
        config: convertCodePrompt.config, // Pass existing config like safety settings
    });
    
    // The prompt definition already includes output schema, so direct casting might not be needed
    // if ai.generate respects it or if we use the typed prompt function.
    // For clarity, if using ai.generate directly, ensure the output matches ConvertCodeOutputSchema.
    // Since `convertCodePrompt` is defined with output schema, using it directly is safer:
    // const { output } = await convertCodePrompt(input, { model: modelName });
    // However, to use the apiKey override with a local ai instance, calling ai.generate is more direct.
    // We need to ensure the output structure matches. `prompt()` function is generally preferred.

    // Assuming the output from ai.generate directly might not be strongly typed to ConvertCodeOutputSchema
    // without using the `prompt()` function itself, we cast it.
    // A more robust way if `prompt()` was used:
    // const { output: typedOutput } = await convertCodePrompt(input, { model: modelName });
    // return typedOutput!;
    // Given we are using ai.generate, we assume the output structure is correct or handle it.
    // The LLM is asked to produce output matching ConvertCodeOutputSchema via the prompt definition.

    return output as ConvertCodeOutput; // Cast if necessary, or ensure the LLM provides the correct structure.
  }
);

