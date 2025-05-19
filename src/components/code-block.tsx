
"use client";

import * as React from "react";
import { Check, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language, className, ...props }: CodeBlockProps) {
  const [hasCopied, setHasCopied] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    });
  };

  return (
    <div className={cn("relative group", className)} {...props}>
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={copyToClipboard}
        aria-label="Copy code"
      >
        {hasCopied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
      </Button>
      <ScrollArea className="h-full max-h-[400px] w-full rounded-md border bg-secondary/50 p-4">
        <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-all">
          <code>{code}</code>
        </pre>
      </ScrollArea>
    </div>
  );
}
