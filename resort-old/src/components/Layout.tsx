"use client";

import Navbar from "./Navbar";
import { usePathname } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <div className="min-h-screen bg-white">
      {!isAdminRoute && <Navbar />}
      <main>{children}</main>
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Island Resort</h3>
              <p className="text-gray-300">
                Your perfect island getaway destination
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/about" className="text-gray-300 hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="/destinations"
                    className="text-gray-300 hover:text-white"
                  >
                    Destinations
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-300 hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-gray-300">
                <li>Email: info@islandresort.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: Paradise Island</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
            <p>
              &copy; {new Date().getFullYear()} Island Resort. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
