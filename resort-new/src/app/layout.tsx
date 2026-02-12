import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Use Inter font from Google Fonts
import './globals.css';
import { MotionProvider } from '@/components/providers/motion-provider';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Providers as AuthProviders } from '@/components/providers/auth-provider';
import { QueryProvider } from '@/components/providers/query-provider';

// Initialize Inter font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // Define CSS variable
});

export const metadata: Metadata = {
  title: 'Azure Lagoon Resort',
  description: 'Luxury resort stays, activities, and island transfers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Apply the font variable to the html tag
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body
        className="antialiased font-sans" // Use font-sans which will now use Inter via CSS variable
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProviders>
            <QueryProvider>
              <MotionProvider>{children}</MotionProvider>
            </QueryProvider>
          </AuthProviders>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
