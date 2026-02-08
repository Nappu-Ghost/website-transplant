"use client";

import type React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Inline SVG for a Tooth icon
const ToothIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M6.29 18.86c.35.75 1.07 1.26 1.9 1.26 1.08 0 1.95-.87 1.95-1.95s-.87-1.95-1.95-1.95c-.82 0-1.55.51-1.9 1.26Z" />
        <path d="M17.71 18.86c-.35.75-1.07 1.26-1.9 1.26-1.08 0-1.95-.87-1.95-1.95s.87-1.95 1.95-1.95c.82 0 1.55.51 1.9 1.26Z" />
        <path d="M18.81 15.51c-2.36 1.7-4.02 3.93-4.8 6.69-.18.6-.7.9-1.01.9s-.83-.3-1.01-.9c-.78-2.76-2.44-4.98-4.8-6.69-1.56-1.13-2.19-3.17-1.79-5.15C6 8.19 8.37 6 11 6h2c2.63 0 5 2.19 5.6 4.35.4 1.99-.23 4.03-1.79 5.16Z" />
    </svg>
);


export function AppFooter() {
  return (
    <motion.footer
      className="bg-muted py-8 text-muted-foreground"
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       transition={{ duration: 0.5, delay: 0.8 }}
    >
      <div className="container mx-auto px-4 text-center">
        <div className="mb-4 flex justify-center items-center gap-2">
          <ToothIcon className="h-6 w-6 text-primary" />
           <span className="text-lg font-semibold text-primary">Island Dental Connect</span>
        </div>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Island Dental Connect. All rights
          reserved.
        </p>
         <div className="mt-4 space-x-4 text-sm">
           <Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
           <span>|</span>
           <Link href="/terms-of-service" className="hover:text-primary">Terms of Service</Link>
           <span>|</span>
            <Link href="/admin/dashboard" className="hover:text-primary">Admin Portal</Link> {/* Updated link */}
         </div>
      </div>
    </motion.footer>
  );
}
