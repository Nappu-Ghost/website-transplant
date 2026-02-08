"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, UserRole } from "@/types/user";
import AddUserModal from "@/components/admin/AddUserModal";
import EditUserModal from "@/components/admin/EditUserModal";
import DeleteConfirmationModal from "@/components/admin/DeleteConfirmationModal";

// Role badge component
const RoleBadge = ({ role }: { role: UserRole }) => {
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-500 bg-opacity-10 text-white border border-purple-500/30";
      case "USER":
        return "bg-green-500 bg-opacity-10 text-white border border-green-500/30";
      case "PREMIUM":
        return "bg-blue-500 bg-opacity-10 text-white border border-blue-500/30";
      case "OFFLINE":
        return "bg-gray-500 bg-opacity-10 text-white border border-gray-500/30";
      default:
        return "bg-gray-500 bg-opacity-10 text-white border border-gray-500/30";
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "Admin";
      case "USER":
        return "User";
      case "PREMIUM":
        return "Premium";
      case "OFFLINE":
        return "Offline";
      default:
        return role;
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(role)}`}
    >
      {getRoleDisplayName(role)}
    </span>
  );
};

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch users from API
  const fetchUsers = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${user.id}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch users");
      }

      const data = await response.json();

      // Convert string dates to Date objects
      const formattedUsers = data.users.map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      }));

      setUsers(formattedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  // Handle edit user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };

  // Handle delete user
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete user
  const confirmDeleteUser = async () => {
    if (!selectedUser || !user) return;
    
    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.id}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete user");
      }

      // Refresh users list
      fetchUsers();
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };


  // Filter users based on search term and selected role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === "ALL" || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Add New User
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-500 bg-opacity-20 text-red-500 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {/* Filters */}
      <div
        className="rounded-xl overflow-hidden transition-all duration-300 p-6"
        style={{
          background: "var(--glass-background)",
          borderColor: "var(--glass-border)",
          boxShadow: "var(--glass-shadow)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Search Users
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name or email"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-400 mb-1"
            >
              Filter by Role
            </label>
            <select
              id="role"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(e.target.value as UserRole | "ALL")
              }
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
              <option value="PREMIUM">Premium</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div
        className="rounded-xl overflow-hidden transition-all duration-300"
        style={{
          background: "var(--glass-background)",
          borderColor: "var(--glass-border)",
          boxShadow: "var(--glass-shadow)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 border-opacity-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-700 border-opacity-50 hover:bg-gray-800 hover:bg-opacity-30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-bold mr-3">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                      {user.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-blue-400 hover:text-blue-300 mr-3"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    No users found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserAdded={() => fetchUsers()}
      />

      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        onUserUpdated={() => fetchUsers()}
        user={selectedUser}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteUser}
        user={selectedUser}
        isLoading={isDeleting}
      />
    </div>
  );
}
