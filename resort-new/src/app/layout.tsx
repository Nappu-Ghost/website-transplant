import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Use Inter font from Google Fonts
import './globals.css';
import { MotionProvider } from '@/components/providers/motion-provider';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Providers as AuthProviders } from '@/components/providers/auth-provider';

// Initialize Inter font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // Define CSS variable
});

export const metadata: Metadata = {
  title: 'Island Dental Connect',
  description: 'Advanced Dental Clinic Management System',
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
            <MotionProvider>{children}</MotionProvider>
          </AuthProviders>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
