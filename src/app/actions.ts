
"use server";

import { convertCode, type ConvertCodeInput } from "@/ai/flows/convert-code";
import { summarizeCode, type SummarizeCodeInput } from "@/ai/flows/summarize-code";
import { analyzeCodeStructure, type AnalyzeCodeStructureInput } from "@/ai/flows/analyze-code-structure";
import { generateDiagrams, type GenerateDiagramsInput } from "@/ai/flows/generate-diagrams";
import { z } from "zod";

const FormSchema = z.object({
  code: z.string().min(1, "Code content cannot be empty."),
  sourceLanguage: z.enum(["C", "COBOL"], {
    errorMap: () => ({ message: "Please select a source language." }),
  }),
  modelType: z.enum(["gemini", "deepseek"]),
  apiKey: z.string().optional(),
});

export interface ActionState {
  summary?: string;
  pythonCode?: string;
  codeStructure?: string;
  flowchartMarkdown?: string; // Changed from diagramMermaidSyntax
  error?: string | null;
  fileName?: string;
}

const DEFAULT_GEMINI_API_KEY = "AIzaSyAPKwuQaTvNVQ-PeBINDBSpZZ5b_xSEQo4"; // Please replace with your actual default key or manage via environment variables

export async function processCode(
  prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  try {
    const file = formData.get("file") as File | null;
    const sourceLanguage = formData.get("sourceLanguage") as "C" | "COBOL" | null;
    const modelType = formData.get("modelType") as "gemini" | "deepseek" | null;
    const customApiKey = formData.get("apiKey") as string | null;

    if (!file) {
      return { error: "No file uploaded." };
    }
    if (!sourceLanguage) {
        return { error: "Source language not selected." };
    }
    if (!modelType) {
        return { error: "Model type not selected." };
    }

    const code = await file.text();
    if (!code) {
      return { error: "File is empty or could not be read." };
    }

    const validatedFields = FormSchema.safeParse({
      code,
      sourceLanguage,
      modelType,
      apiKey: customApiKey || undefined,
    });

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors.map((e) => e.message).join(", "),
      };
    }

    const {
      code: validatedCode,
      sourceLanguage: validatedSourceLanguage,
      modelType: validatedModelType,
      apiKey: validatedApiKey,
    } = validatedFields.data;

    // Prepare inputs for all AI flows
    const summarizeInput: SummarizeCodeInput = { code: validatedCode, language: validatedSourceLanguage };
    const convertInput: ConvertCodeInput = {
      code: validatedCode,
      sourceLanguage: validatedSourceLanguage,
      modelType: validatedModelType,
      apiKey: validatedModelType === "gemini" ? (validatedApiKey || DEFAULT_GEMINI_API_KEY) : undefined,
    };
    const analyzeStructureInput: AnalyzeCodeStructureInput = { code: validatedCode, language: validatedSourceLanguage };
    const generateDiagramsInput: GenerateDiagramsInput = { code: validatedCode, language: validatedSourceLanguage };

    // Execute AI flows in parallel where possible
    const [summaryResult, conversionResult, structureAnalysisResult, diagramGenerationResult] = await Promise.all([
      summarizeCode(summarizeInput),
      convertCode(convertInput),
      analyzeCodeStructure(analyzeStructureInput),
      generateDiagrams(generateDiagramsInput),
    ]);

    const originalFileName = file.name.split('.')[0];
    const newFileName = `${originalFileName}_converted.py`;

    return {
      summary: summaryResult.summary,
      pythonCode: conversionResult.pythonCode,
      codeStructure: structureAnalysisResult.structureAnalysis,
      flowchartMarkdown: diagramGenerationResult.flowchartMarkdown, // Changed from diagramMermaidSyntax
      fileName: newFileName,
      error: null,
    };
  } catch (e: any) {
    console.error("Error processing code:", e);
    const errorMessage = e.message || "An unknown error occurred during processing.";
    // Check for specific Genkit/Gemini errors if needed, e.g. API key issues
    if (e.cause?.message?.includes('API key not valid')) {
        return { error: `Gemini API Key Error: ${e.cause.message}. Please check your API key.`};
    }
    return { error: errorMessage };
  }
}

