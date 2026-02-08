"use client";

import { useState, useEffect } from "react";
import { UserRole, User } from "@/types/user";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  user: User | null;
}

export default function EditUserModal({ isOpen, onClose, onUserUpdated, user }: EditUserModalProps) {
  const { user: currentUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("USER");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState("/profile.svg");

  // Populate form with user data when user prop changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPassword(""); // Don't populate password for security reasons
      setRole(user.role);
      setProfileImage(user.profileImage || "/profile.svg");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentUser) return;
    
    setError(null);
    setIsLoading(true);

    try {
      const userData = {
        name,
        email,
        role,
        profileImage,
        // Only include password if it was changed
        ...(password ? { password } : {}),
      };

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentUser.id}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update user");
      }

      // Notify parent and close modal
      onUserUpdated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className="relative w-full max-w-md p-6 rounded-2xl shadow-2xl border border-white/20 bg-black/40 backdrop-blur-md"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-6">Edit User</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-500 bg-opacity-20 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 mb-4">
              <Image
                src={profileImage}
                alt="Profile"
                fill
                className="rounded-full object-cover ring-2 ring-white/50"
              />
            </div>
            <label
              htmlFor="profile-upload-edit"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-white/20 rounded-full shadow-sm text-sm font-medium text-white bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              Change Picture
              <input
                id="profile-upload-edit"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setProfileImage(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
              Password (leave blank to keep current)
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-400 mb-1">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
              <option value="PREMIUM">Premium</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}