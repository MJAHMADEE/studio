
"use client";

import *
as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from 'next/link'; // Import Link
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  UploadCloud,
  FileText,
  Languages,
  Settings2,
  KeyRound,
  Rocket,
  Loader2,
  Download,
  Lightbulb,
  FileCode,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  Network, 
  Projector, 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { processCode, type ActionState } from "./actions";
import { CodeBlock } from "@/components/code-block";
import MermaidDiagram from "@/components/mermaid-diagram";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";


const initialState: ActionState = {
  summary: undefined,
  pythonCode: undefined,
  codeStructure: undefined,
  diagramMermaidSyntax: undefined,
  error: null,
  fileName: undefined,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
        </>
      ) : (
        <>
          <Rocket className="mr-2 h-4 w-4" /> Convert Code
        </>
      )}
    </Button>
  );
}

export default function PolyglotShiftPage() {
  const [state, formAction] = useFormState(processCode, initialState);
  const { toast } = useToast();
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = React.useState(false);
  const [modelType, setModelType] = React.useState<"gemini" | "deepseek">("gemini");
  const [sourceLanguage, setSourceLanguage] = React.useState<"C" | "COBOL" | string>("");
  const [apiKeyInputType, setApiKeyInputType] = React.useState<"password" | "text">("password");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: state.error,
      });
    }
    if (state?.pythonCode && !state?.error) { 
      toast({
        title: "Processing Successful!",
        description: "Code has been converted and analyzed.",
      });
    }
  }, [state, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFileName(event.target.files[0].name);
      const fileExtension = event.target.files[0].name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'c' || fileExtension === 'h') {
        setSourceLanguage("C");
      } else if (['cob', 'cbl', 'cpy'].includes(fileExtension || '')) {
        setSourceLanguage("COBOL");
      } else {
        setSourceLanguage(""); 
      }
    } else {
      setFileName(null);
      setSourceLanguage("");
    }
  };

  const handleDownload = () => {
    if (state?.pythonCode && state?.fileName) {
      const blob = new Blob([state.pythonCode], { type: "text/python" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = state.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const toggleApiKeyVisibility = () => {
    setApiKeyInputType(prev => prev === "password" ? "text" : "password");
  };

  const hasResults = !state?.error && (state?.summary || state?.pythonCode || state?.codeStructure || state?.diagramMermaidSyntax);

  const diagramSyntaxes = React.useMemo(() => {
    if (state?.diagramMermaidSyntax) {
      return state.diagramMermaidSyntax
        .split("\n\n%%\n%% --- Next Diagram ---\n%%\n\n")
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }
    return [];
  }, [state?.diagramMermaidSyntax]);


  return (
    <TooltipProvider>
      <div className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            PolyglotShift
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Seamlessly convert C & COBOL to modern Python with AI-powered insights and visualizations.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            This application was developed by <Link href="https://www.linkedin.com/in/parisa-ghorbani-440573201/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Parisa Ghorbani</Link>.
          </p>
        </header>

        <Card className="w-full max-w-2xl shadow-2xl rounded-xl overflow-hidden">
          <form action={formAction}>
            <CardHeader className="bg-secondary/30 p-6">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Settings2 className="h-6 w-6 text-primary" />
                Conversion Setup
              </CardTitle>
              <CardDescription>
                Upload your source code file and configure the conversion settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="file-upload" className="flex items-center gap-2 text-base font-medium">
                  <UploadCloud className="h-5 w-5 text-primary" /> Source Code File
                </Label>
                <Input
                  id="file-upload"
                  name="file"
                  type="file"
                  required
                  className="truncate file:mr-2 file:py-2 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  accept=".c,.h,.cob,.cbl,.cpy"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                {fileName && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 pt-1">
                    <FileText className="h-4 w-4" /> Selected: {fileName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceLanguage" className="flex items-center gap-2 text-base font-medium">
                  <Languages className="h-5 w-5 text-primary" /> Source Language
                </Label>
                <Select name="sourceLanguage" required value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger id="sourceLanguage" className="w-full">
                    <SelectValue placeholder="Select language (e.g., C, COBOL)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="COBOL">COBOL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between space-x-2 p-3 bg-secondary/20 rounded-md">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="modelTypeSwitch" className="text-base font-medium">Conversion Engine</Label>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Gemini: Cloud-based, powerful. DeepSeek: Local, privacy-focused.</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <input type="hidden" name="modelType" value={modelType} />
                <div className="flex items-center space-x-2">
                  <span className={cn("text-sm font-medium", modelType === 'deepseek' ? 'text-primary' : 'text-muted-foreground')}>DeepSeek (Local)</span>
                  <Switch
                    id="modelTypeSwitch"
                    checked={modelType === "gemini"}
                    onCheckedChange={(checked) => setModelType(checked ? "gemini" : "deepseek")}
                    aria-label="Toggle conversion engine between DeepSeek (local) and Gemini (cloud)"
                  />
                  <span className={cn("text-sm font-medium", modelType === 'gemini' ? 'text-primary' : 'text-muted-foreground')}>Gemini (Cloud)</span>
                </div>
              </div>

              {modelType === "gemini" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="apiKey" className="flex items-center gap-2 text-base font-medium">
                      <KeyRound className="h-5 w-5 text-primary" /> Gemini API Key
                    </Label>
                    <Button variant="link" type="button" onClick={() => setShowApiKeyInput(!showApiKeyInput)} className="p-0 h-auto text-sm">
                      {showApiKeyInput ? "Hide custom key" : "Enter custom key"}
                    </Button>
                  </div>
                  {showApiKeyInput && (
                     <div className="relative flex items-center">
                        <Input
                          id="apiKey"
                          name="apiKey"
                          type={apiKeyInputType}
                          placeholder="Enter your Gemini API Key (optional)"
                          className="transition-all duration-300 ease-in-out pr-10"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-muted-foreground hover:text-foreground"
                            onClick={toggleApiKeyVisibility}
                            aria-label={apiKeyInputType === "password" ? "Show API key" : "Hide API key"}
                        >
                            {apiKeyInputType === "password" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>
                     </div>
                  )}
                  {!showApiKeyInput && <p className="text-xs text-muted-foreground">Using default API key. Click 'Enter custom key' to provide your own.</p>}
                </div>
              )}
            </CardContent>
            <CardFooter className="p-6 bg-secondary/30">
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>

        {hasResults && (
          <Card className="w-full max-w-2xl mt-8 md:mt-12 shadow-2xl rounded-xl overflow-hidden">
            <CardHeader className="bg-secondary/30 p-6">
              <CardTitle className="text-2xl">Conversion Results</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 rounded-none">
                  <TabsTrigger value="summary" className="py-3 text-base rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                    <Lightbulb className="mr-2 h-5 w-5" /> Summary
                  </TabsTrigger>
                  <TabsTrigger value="python-code" className="py-3 text-base rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                    <FileCode className="mr-2 h-5 w-5" /> Python
                  </TabsTrigger>
                  <TabsTrigger value="code-structure" className="py-3 text-base rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                    <Network className="mr-2 h-5 w-5" /> Structure
                  </TabsTrigger>
                  <TabsTrigger value="visualizations" className="py-3 text-base rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none">
                    <Projector className="mr-2 h-5 w-5" /> Diagrams
                  </TabsTrigger>
                </TabsList>
                <div className="p-6">
                  <TabsContent value="summary">
                    {state.summary ? (
                       <div className="markdown-content prose dark:prose-invert max-w-none">
                         <ReactMarkdown remarkPlugins={[remarkGfm]}>{state.summary}</ReactMarkdown>
                       </div>
                    ) : (
                      <p className="text-muted-foreground">Summary not available.</p>
                    )}
                  </TabsContent>
                  <TabsContent value="python-code">
                    {state.pythonCode ? (
                      <>
                        <CodeBlock code={state.pythonCode} language="python" />
                        <Button onClick={handleDownload} className="mt-4 w-full sm:w-auto" variant="outline">
                          <Download className="mr-2 h-4 w-4" /> Download Python File
                        </Button>
                      </>
                    ) : (
                      <p className="text-muted-foreground">Converted code not available.</p>
                    )}
                  </TabsContent>
                  <TabsContent value="code-structure">
                    {state.codeStructure ? (
                       <div className="markdown-content prose dark:prose-invert max-w-none">
                         <ReactMarkdown remarkPlugins={[remarkGfm]}>{state.codeStructure}</ReactMarkdown>
                       </div>
                    ) : (
                      <p className="text-muted-foreground">Code structure analysis not available.</p>
                    )}
                  </TabsContent>
                  <TabsContent value="visualizations">
                    {diagramSyntaxes.length > 0 ? (
                       diagramSyntaxes.map((syntax, index) => (
                         <div key={index} className="mb-6">
                           <h3 className="text-lg font-semibold mb-2 text-foreground">Diagram {index + 1}</h3>
                           <MermaidDiagram chart={syntax} idSuffix={`diagram-${index}`} />
                         </div>
                       ))
                    ) : (
                      <p className="text-muted-foreground">Diagrams not available.</p>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        )}
        
        {state?.error && (
            <Alert variant="destructive" className="w-full max-w-2xl mt-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
        )}
        <Toaster />
      </div>
    </TooltipProvider>
  );
}
