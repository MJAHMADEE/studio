
"use client";

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MermaidDiagramProps {
  chart: string;
  idSuffix?: string; // To ensure unique IDs if multiple diagrams are on the page
}

// Initialize Mermaid only once
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false, // We will render manually
    theme: 'neutral', // or 'default', 'dark', 'forest', 'neutral'
    securityLevel: 'loose', // To allow more complex diagrams, adjust as needed
    flowchart: {
        htmlLabels: true, // Enable HTML labels for better styling if needed
    },
    // You can add more theme variables here if needed for deeper customization
    // themeVariables: {
    //   primaryColor: '#29B6F6', // Example: Accent color
    //   lineColor: '#A0AEC0',    // Example: Muted border color
    //   textColor: '#2D3748',    // Example: Foreground color
    // }
  });
}


const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, idSuffix = "" }) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const diagramId = `mermaid-diagram-${Math.random().toString(36).substring(7)}${idSuffix}`;

  useEffect(() => {
    if (chart && mermaidRef.current) {
      setIsLoading(true);
      setError(null);
      try {
        // Validate syntax before rendering (basic check)
        if (!chart.trim().startsWith('graph') && !chart.trim().startsWith('flowchart') && !chart.trim().startsWith('sequenceDiagram') && !chart.trim().startsWith('classDiagram') && !chart.trim().startsWith('stateDiagram') && !chart.trim().startsWith('gantt') && !chart.trim().startsWith('pie') && !chart.trim().startsWith('erDiagram') && !chart.trim().startsWith('journey') && !chart.trim().startsWith('mindmap') && !chart.trim().startsWith('timeline')) {
          throw new Error("Invalid or unrecognized Mermaid diagram type. Ensure the diagram starts with a valid type (e.g., 'graph TD', 'flowchart LR').");
        }

        mermaid.render(diagramId, chart)
          .then(({ svg, bindFunctions }) => {
            if (mermaidRef.current) {
              mermaidRef.current.innerHTML = svg;
              if (bindFunctions) {
                bindFunctions(mermaidRef.current);
              }
            }
            setIsLoading(false);
          })
          .catch((err) => {
            console.error("Mermaid rendering error:", err);
            setError(`Failed to render diagram: ${err.message || 'Unknown error'}. Please check the Mermaid syntax.`);
            setIsLoading(false);
          });
      } catch (e: any) {
          console.error("Mermaid pre-rendering error:", e);
          setError(`Diagram error: ${e.message || 'Syntax validation failed.'}`);
          setIsLoading(false);
      }
    } else if (!chart) {
        setError("No diagram data provided.");
        setIsLoading(false);
    }
  }, [chart, diagramId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-4 min-h-[200px] border rounded-md bg-secondary/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Generating diagram...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/10">
        <CardContent className="p-4">
          <div className="flex items-center text-destructive">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p className="font-medium">Diagram Error</p>
          </div>
          <p className="text-sm text-destructive/80 mt-1">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">The AI might have generated invalid Mermaid syntax. You can try regenerating or manually inspecting the syntax.</p>
        </CardContent>
      </Card>
    );
  }

  return <div ref={mermaidRef} className="mermaid-container w-full overflow-auto p-2 bg-card rounded-md shadow"></div>;
};

export default MermaidDiagram;
