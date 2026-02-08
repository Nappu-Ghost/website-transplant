"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
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
          <span className="text-lg font-semibold text-primary">Azure Lagoon Resort</span>
        </div>
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Azure Lagoon Resort. All rights
          reserved.
        </p>
         <div className="mt-4 space-x-4 text-sm">
           <Link href="/privacy-policy" className="hover:text-primary">Privacy Policy</Link>
           <span>|</span>
           <Link href="/terms-of-service" className="hover:text-primary">Terms of Service</Link>
           <span>|</span>
            <Link href="/admin" className="hover:text-primary">Admin Portal</Link>
         </div>
      </div>
    </motion.footer>
  );
}
