"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import gsap from "gsap";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState("/profile.svg");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef(null);

  // Refs for GSAP animations
  const formRef = useRef(null);
  const titleRef = useRef(null);
  const errorRef = useRef(null);

  // Initial animations removed to prevent freezing issues
  useEffect(() => {
    // Set initial opacity to ensure elements are visible without animations
    if (titleRef.current) {
      (titleRef.current as HTMLElement).style.opacity = "1";
    }
    if (formRef.current) {
      (formRef.current as HTMLElement).style.opacity = "1";
    }
  }, []);

  // Simplified mode switch without animations to prevent freezing
  const handleModeSwitch = () => {
    setIsLogin(!isLogin);
  };

  // Error animation removed to prevent freezing issues
  useEffect(() => {
    if (error && errorRef.current) {
      (errorRef.current as HTMLElement).style.opacity = "1";
    }
  }, [error]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Loading button animation removed to prevent freezing issues
  // The loading state will be indicated by the spinner icon instead

  // Simplified cleanup for GSAP animations
  useEffect(() => {
    return () => {
      // Kill all GSAP animations to prevent memory leaks
      gsap.killTweensOf(titleRef.current);
      gsap.killTweensOf(formRef.current);
      gsap.killTweensOf(buttonRef.current);
      gsap.killTweensOf(errorRef.current);
    };
  }, []);

  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Basic validation
      if (!email || !password || (!isLogin && !name)) {
        throw new Error("Please fill in all fields");
      }

      if (!email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      if (isLogin) {
        // Login user
        await login(email, password);
      } else {
        // Register user
        await register(name, email, password, profileImage);
      }

      // Clear form data before navigation
      setEmail("");
      setPassword("");
      setName("");
      // Use push instead of replace to ensure proper navigation
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      // Ensure loading state is cleared in all cases
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20">
        <div className="flex flex-col items-center" ref={titleRef}>
          {!isLogin && (
            <>
              <div className="relative w-32 h-32 mb-4">
                <Image
                  src={profileImage}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover ring-2 ring-white/50"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="profile-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-white/20 rounded-full shadow-sm text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  Upload Picture
                  <input
                    id="profile-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </>
          )}
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {isLogin ? "Welcome Back" : "Join Us"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={handleModeSwitch}
              className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              {isLogin ? "Register here" : "Sign in here"}
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} ref={formRef}>
          {error && (
            <div
              className="rounded-xl bg-red-500/10 backdrop-blur-sm p-4 border border-red-500/20"
              ref={errorRef}
            >
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-400">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl shadow-sm space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="sr-only">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-white/20 placeholder-gray-400 text-white rounded-xl bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/20"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-white/20 placeholder-gray-400 text-white rounded-xl bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/20"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-white/20 placeholder-gray-400 text-white rounded-xl bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/20"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              ref={buttonRef}
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:scale-105 ${isLoading ? "cursor-not-allowed opacity-80" : ""}`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </div>
              ) : isLogin ? (
                "Sign in"
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
