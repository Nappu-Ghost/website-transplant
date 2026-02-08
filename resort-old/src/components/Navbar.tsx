"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import gsap from "gsap";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const isLoggedIn = !!user;
  const pathname = usePathname();

  // Refs for GSAP animations
  const indicatorRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
  };

  // Handle mobile menu animations
  useEffect(() => {
    if (mobileMenuRef.current) {
      if (isMenuOpen) {
        gsap.to(mobileMenuRef.current, {
          height: "auto",
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        gsap.to(mobileMenuRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        });
      }
    }
  }, [isMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Handle active indicator animation
  useEffect(() => {
    if (!indicatorRef.current) return;

    // Get all navigation links
    const navLinks = document.querySelectorAll(
      ".hidden.sm\\:ml-6.sm\\:flex.sm\\:space-x-8 > a",
    );
    let activeLink: Element | null = null;

    // Find the active link based on current pathname
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === "/" && pathname === "/") {
        activeLink = link;
      } else if (href !== "/" && pathname.startsWith(href as string)) {
        activeLink = link;
      }
    });

    if (activeLink) {
      // Get the position and dimensions of the active link
      const linkRect = (activeLink as HTMLElement).getBoundingClientRect();

      // Animate the indicator to the active link position
      gsap.to(indicatorRef.current, {
        width: linkRect.width + 16, // Add some padding
        left: (activeLink as HTMLElement).offsetLeft - 8, // Adjust for padding
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      });
    } else {
      // Hide the indicator if no active link
      gsap.to(indicatorRef.current, {
        opacity: 0,
        duration: 0.3,
      });
    }
  }, [pathname]);

  return (
    <nav
      className="bg-white/10 backdrop-blur-sm shadow-lg fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 mt-4 rounded-2xl border border-white/10"
      style={{ width: "min(95%, 1280px)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Island Resort
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8 relative">
            {/* Active indicator background */}
            <div
              ref={indicatorRef}
              className="absolute h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 transition-all duration-300"
              style={{
                width: "0",
                left: "0",
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0,
                zIndex: -1,
              }}
            />

            <Link
              href="/"
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${pathname === "/" ? "text-blue-600" : "text-white-500 hover:text-blue-600"}`}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${pathname === "/about" ? "text-blue-600" : "text-white-500 hover:text-blue-600"}`}
            >
              About
            </Link>
            <Link
              href="/accommodations"
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${pathname === "/accommodations" ? "text-blue-600" : "text-white-500 hover:text-blue-600"}`}
            >
              Accommodations
            </Link>

            <Link
              href="/activities"
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${pathname === "/activities" ? "text-blue-600" : "text-white-500 hover:text-blue-600"}`}
            >
              Activities
            </Link>
            <Link
              href="/contact"
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${pathname === "/contact" ? "text-blue-600" : "text-white-500 hover:text-blue-600"}`}
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center">
            <div className="hidden sm:block">
              <div className="relative inline-flex items-center justify-center group">
                <div className="absolute inset-0 duration-500 opacity-50 transition-all bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-lg filter group-hover:opacity-75"></div>
                <Link
                  href="/booking"
                  className="group relative inline-flex items-center justify-center text-base rounded-full bg-white/10 backdrop-blur-sm px-6 py-2.5 font-semibold text-white transition-all duration-300 hover:bg-white/20 hover:scale-105 border border-white/20"
                >
                  Book Now
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 10 10"
                    height="10"
                    width="10"
                    fill="none"
                    className="mt-0.5 ml-2 -mr-1 stroke-white stroke-2 transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <path
                      d="M0 5h7"
                      className="transition opacity-0 group-hover:opacity-100"
                    ></path>
                    <path
                      d="M1 1l4 4-4 4"
                      className="transition group-hover:translate-x-[3px]"
                    ></path>
                  </svg>
                </Link>
              </div>
            </div>

            {/* Profile Button - Desktop Only */}
            <div className="relative ml-3 hidden sm:block">
              {isLoggedIn ? (
                <button
                  onClick={toggleProfileMenu}
                  className="group relative inline-flex items-center justify-center text-base rounded-full bg-white/10 backdrop-blur-sm px-6 py-2.5 font-semibold text-white transition-all duration-300 hover:bg-white/20 hover:scale-105 border border-white/20"
                >
                  <Image
                    src={user?.profileImage || "/profile.svg"}
                    alt="Profile"
                    width={24}
                    height={24}
                    className="mr-2 rounded-full"
                  />
                  {user?.name}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="group relative inline-flex items-center justify-center text-base rounded-full bg-white/10 backdrop-blur-sm px-6 py-2.5 font-semibold text-white transition-all duration-300 hover:bg-white/20 hover:scale-105 border border-white/20"
                >
                  Login
                </Link>
              )}

              {/* Desktop Profile Dropdown */}
              {isProfileOpen && isLoggedIn && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white/90 backdrop-blur-sm ring-1 ring-black ring-opacity-5 transform transition-all duration-300 origin-top-right">
                  <Link
                    href="/my-bookings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Bookings
                  </Link>
                  {user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="sm:hidden ml-4 inline-flex items-center justify-center p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          className={`sm:hidden border-t border-white/10 rounded-b-2xl overflow-hidden`}
          style={{ height: 0, opacity: 0 }}
        >
          <div className="space-y-1 py-2">
            {/* Navigation Links */}
            <Link
              href="/"
              className={`block px-4 py-3 text-base font-medium ${pathname === "/" ? "text-blue-600 bg-white/10" : "text-white hover:text-blue-600 hover:bg-white/10"} rounded-lg mx-2 transition-all duration-300`}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`block px-4 py-3 text-base font-medium ${pathname === "/about" ? "text-blue-600 bg-white/10" : "text-white hover:text-blue-600 hover:bg-white/10"} rounded-lg mx-2 transition-all duration-300`}
            >
              About
            </Link>
            <Link
              href="/accommodations"
              className={`block px-4 py-3 text-base font-medium ${pathname === "/accommodations" ? "text-blue-600 bg-white/10" : "text-white hover:text-blue-600 hover:bg-white/10"} rounded-lg mx-2 transition-all duration-300`}
            >
              Accommodations
            </Link>
            <Link
              href="/map"
              className={`block px-4 py-3 text-base font-medium ${pathname === "/map" ? "text-blue-600 bg-white/10" : "text-white hover:text-blue-600 hover:bg-white/10"} rounded-lg mx-2 transition-all duration-300`}
            >
              Map
            </Link>
            <Link
              href="/activities"
              className={`block px-4 py-3 text-base font-medium ${pathname === "/activities" ? "text-blue-600 bg-white/10" : "text-white hover:text-blue-600 hover:bg-white/10"} rounded-lg mx-2 transition-all duration-300`}
            >
              Activities
            </Link>
            <Link
              href="/contact"
              className={`block px-4 py-3 text-base font-medium ${pathname === "/contact" ? "text-blue-600 bg-white/10" : "text-white hover:text-blue-600 hover:bg-white/10"} rounded-lg mx-2 transition-all duration-300`}
            >
              Contact
            </Link>
            <div className="border-t border-white/10 pt-4 mt-4 space-y-4 px-3 pb-2">
              <div className="relative group mx-2">
                <div className="absolute inset-0 duration-500 opacity-50 transition-all bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-lg filter group-hover:opacity-75"></div>
                <Link
                  href="/booking"
                  className="group relative flex items-center justify-center text-base rounded-full bg-white/10 backdrop-blur-sm px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-white/20 hover:scale-105 border border-white/20 w-full"
                >
                  Book Now
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 10 10"
                    height="10"
                    width="10"
                    fill="none"
                    className="mt-0.5 ml-2 -mr-1 stroke-white stroke-2 transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <path
                      d="M0 5h7"
                      className="transition opacity-0 group-hover:opacity-100"
                    ></path>
                    <path
                      d="M1 1l4 4-4 4"
                      className="transition group-hover:translate-x-[3px]"
                    ></path>
                  </svg>
                </Link>
              </div>
              {!isLoggedIn && (
                <div className="relative group mx-2">
                  <div className="absolute inset-0 duration-500 opacity-50 transition-all bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-lg filter group-hover:opacity-75"></div>
                  <Link
                    href="/login"
                    className="group relative flex items-center justify-center text-base rounded-full bg-white/10 backdrop-blur-sm px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-white/20 hover:scale-105 border border-white/20 w-full"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
            {isLoggedIn && (
              <div className="border-t border-white/10 pt-3 mt-2">
                <div className="flex items-center px-4 py-2 mx-2 bg-white/5 rounded-lg">
                  <Image
                    src={user?.profileImage || "/profile.svg"}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="mr-3 rounded-full border border-white/20"
                  />
                  <span className="text-white font-medium text-lg">
                    {user?.name}
                  </span>
                </div>
                <Link
                  href="/my-bookings"
                  className="block px-4 py-3 text-base font-medium text-white hover:text-blue-600 hover:bg-white/10 rounded-lg mx-2 mt-2 transition-all duration-300"
                >
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    My Bookings
                  </div>
                </Link>
                {user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="block px-4 py-3 text-base font-medium text-blue-400 hover:text-blue-300 hover:bg-white/10 rounded-lg mx-2 mt-2 transition-all duration-300"
                  >
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Admin Dashboard
                    </div>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-base font-medium text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg mx-2 mt-2 mb-2 transition-all duration-300"
                >
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
