import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-code.ts';
import '@/ai/flows/convert-code.ts';
import '@/ai/flows/analyze-code-structure.ts';
import '@/ai/flows/generate-diagrams.ts';
