
import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Added Toaster

const geistSans = GeistSans; // Use the imported object directly
const geistMono = GeistMono; // Use the imported object directly

export const metadata: Metadata = {
  title: 'PolyglotShift - AI Code Converter',
  description: 'Convert C or COBOL code to Python with AI-powered summarization and insights. Supports local DeepSeek and cloud Gemini models.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased flex flex-col min-h-screen bg-background`}>
        <main className="flex-grow">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
