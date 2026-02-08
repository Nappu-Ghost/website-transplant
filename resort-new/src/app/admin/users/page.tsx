"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, UserCog, Loader2, Trash2, Edit } from 'lucide-react'; // Added Edit
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth'; // For auth state
import { auth as authUtils } from '@/lib/auth'; // For getToken
import { useRouter } from 'next/navigation';


interface User {
  id: string; // Assuming ID is string from backend/api.ts after toCamelCase
  name: string | null;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const addFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).optional().or(z.literal('')),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }), // Min 8 for new users
  role: z.string().nonempty({ message: "Please select a role." }),
  status: z.string().optional(), // Status can default or be set
});

const editFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).optional().or(z.literal('')),
  email: z.string().email({ message: "Please enter a valid email address." }), // Keep email, but it's disabled
  role: z.string().nonempty({ message: "Please select a role." }),
  status: z.string().nonempty({ message: "Status is required." }), // Make status editable
  // Password is omitted for typical edits, handle separately if needed
});

type AddUserFormData = z.infer<typeof addFormSchema>;
type EditUserFormData = z.infer<typeof editFormSchema>;

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { toast } = useToast();
  const { user: authUser, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const addForm = useForm<AddUserFormData>({
    resolver: zodResolver(addFormSchema),
    defaultValues: { name: "", email: "", password: "", role: "CUSTOMER", status: "ACTIVE" }
  });

  const editForm = useForm<EditUserFormData>({
    resolver: zodResolver(editFormSchema),
    defaultValues: { name: "", email: "", role: "CUSTOMER", status: "ACTIVE" }
  });

  const getAuthHeaders = useCallback((contentType: string = 'application/json') => {
    const token = authUtils.getToken();
    if (!token) {
      toast({ title: "Authentication Error", description: "Session token not found.", variant: "destructive" });
      router.push('/login?redirect=/admin/users');
      return null;
    }
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': contentType };
  }, [toast, router]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const headers = getAuthHeaders();
    if (!headers) { setIsLoading(false); return; }

    try {
      const response = await fetch('/api/users', { headers: { 'Authorization': headers.Authorization } }); // Only auth header for GET
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `Failed to fetch users: ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(Array.isArray(data) ? data.map(u => ({ ...u, id: String(u.id) })) : []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, toast]); // Removed router from here as getAuthHeaders handles it

  useEffect(() => {
    if (!isAuthLoading && authUser) {
      fetchUsers();
    } else if (!isAuthLoading && !authUser) {
      router.push('/login?redirect=/admin/users');
    }
  }, [authUser, isAuthLoading, fetchUsers, router]);

  const handleAddUser = async (values: AddUserFormData) => {
    setIsSubmitting(true);
    const headers = getAuthHeaders();
    if (!headers) { setIsSubmitting(false); return; }

    try {
      const response = await fetch('/api/users', { // Calling Next.js API route
        method: 'POST',
        headers: headers,
        body: JSON.stringify(values) // Send form values as is, lib/api.ts will toSnakeCase
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || "Failed to create user");
      }
      const newUser = await response.json();
      setUsers(prev => [newUser, ...prev]);
      setIsAddModalOpen(false);
      addForm.reset();
      toast({ title: "Success", description: "User created successfully" });
    } catch (error: any) {
      toast({ title: "Error Creating User", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditDialog = (user: User) => {
    setEditingUser(user);
    editForm.reset({
      name: user.name || '',
      email: user.email, // Email is typically not editable or handled with verification
      role: user.role,
      status: user.status,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (values: EditUserFormData) => {
    if (!editingUser) return;
    setIsSubmitting(true);
    const headers = getAuthHeaders();
    if (!headers) { setIsSubmitting(false); return; }

    // Construct payload with only fields that can be updated by admin via this form
    const payload: Partial<EditUserFormData> = {
      name: values.name,
      role: values.role,
      status: values.status,
      // Email is not sent as it's disabled in the form
      // Password is not sent as it's omitted from editFormSchema
    };

    try {
      // Call Next.js API route for updating user
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT', // Or PATCH if backend supports partial updates for these fields
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || "Failed to update user");
      }
      const updatedUser = await response.json();
      setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
      setIsEditModalOpen(false);
      toast({ title: "Success", description: "User updated successfully" });
    } catch (error: any) {
      toast({ title: "Error Updating User", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      // Call Next.js API route for PATCHING status
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH', // Use PATCH for partial updates like status
        headers: headers,
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || "Failed to update status");
      }
      const updatedUser = await response.json();
      setUsers(users.map(user => user.id === userId ? updatedUser : user));
      toast({ title: "Success", description: `User status updated to ${newStatus}` });
    } catch (error: any) {
      toast({ title: "Error Updating Status", description: error.message, variant: "destructive" });
    }
  };

  const handleOpenDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteAlertOpen(true);
  };

  const handleDeleteUserConfirm = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    const headers = getAuthHeaders();
    if (!headers) { setIsDeleting(false); setDeleteAlertOpen(false); return; }

    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': headers.Authorization } // Only auth header for DELETE
      });
      if (!response.ok) {
        if (response.status === 204) { // Successfully deleted
          // Continue to success handling
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.detail || "Failed to delete user");
        }
      }
      setUsers(users.filter(user => user.id !== userToDelete.id));
      toast({ title: "Success", description: "User deleted successfully" });
    } catch (error: any) {
      toast({ title: "Error Deleting User", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setDeleteAlertOpen(false);
      setUserToDelete(null);
    }
  };

  if (isAuthLoading) {
    return <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></main>;
  }
  if (!authUser) {
    return <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center"><p>Redirecting to login...</p></main>;
  }

  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
                <UserCog className="h-5 w-5" /> User Management
              </CardTitle>
              <CardDescription>Manage user accounts, roles, and status.</CardDescription>
            </div>
            <Button onClick={() => { addForm.reset(); setIsAddModalOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && users.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" /><p className="mt-2">Loading users...</p></TableCell></TableRow>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell><Badge variant={user.role === 'ADMIN' ? 'destructive' : 'outline'}>{user.role}</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(user.id, user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}>
                          <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>{user.status}</Badge>
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(user)}><Edit className="h-4 w-4 mr-1" />Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleOpenDeleteDialog(user)}><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground h-24">No users found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddModalOpen} onOpenChange={(open) => { if (!open) addForm.reset(); setIsAddModalOpen(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add New User</DialogTitle><DialogDescription>Create a new user account.</DialogDescription></DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddUser)} className="space-y-4 py-2">
              <FormField control={addForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={addForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email *</FormLabel><FormControl><Input placeholder="email@example.com" type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={addForm.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password *</FormLabel><FormControl><Input placeholder="Min. 8 characters" type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={addForm.control} name="role" render={({ field }) => (<FormItem><FormLabel>Role *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl><SelectContent><SelectItem value="CUSTOMER">Customer</SelectItem><SelectItem value="DOCTOR">Doctor</SelectItem><SelectItem value="ADMINISTRATIVE_OFFICER">Administrative Officer</SelectItem><SelectItem value="MANAGER">Manager</SelectItem><SelectItem value="ADMIN">Admin</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={addForm.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value || "ACTIVE"}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="INACTIVE">Inactive</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <DialogFooter><Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create User</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={(open) => { if (!open) editForm.reset(); setIsEditModalOpen(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit User</DialogTitle><DialogDescription>Update user information. Email cannot be changed here.</DialogDescription></DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateUser)} className="space-y-4 py-2">
              <FormField control={editForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={editForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email (Cannot Change)</FormLabel><FormControl><Input type="email" disabled {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={editForm.control} name="role" render={({ field }) => (<FormItem><FormLabel>Role *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl><SelectContent><SelectItem value="CUSTOMER">Customer</SelectItem><SelectItem value="DOCTOR">Doctor</SelectItem><SelectItem value="ADMINISTRATIVE_OFFICER">Administrative Officer</SelectItem><SelectItem value="MANAGER">Manager</SelectItem><SelectItem value="ADMIN">Admin</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={editForm.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="INACTIVE">Inactive</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              <DialogFooter><Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Update User</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action will permanently delete the user <span className="font-semibold">{userToDelete?.name || userToDelete?.email}</span>. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteUserConfirm} disabled={isDeleting}>{isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Delete User</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
};