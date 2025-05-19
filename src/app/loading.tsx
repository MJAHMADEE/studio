
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
      <h1 className="text-2xl font-semibold mb-2">Loading PolyglotShift</h1>
      <p className="text-muted-foreground">Please wait while we prepare the application...</p>
    </div>
  );
}
