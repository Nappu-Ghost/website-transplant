"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/shared';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth/useAuth';
import api from '@/lib/api';
import { roleService } from '@/lib/api-service';

type Role = 'ADMIN' | 'MANAGER' | 'CUSTOMER';
type Status = 'ACTIVE' | 'INACTIVE';

type UserRow = {
  id: number;
  name?: string | null;
  email: string;
  role: Role;
  customRole?: string | null;
  status: Status;
  createdAt?: string;
  updatedAt?: string;
};

type UserDraft = {
  name: string;
  email: string;
  roleValue: string;
  status: Status;
  password: string;
};

interface RoleConfig {
  id: string;
  label: string;
  isSystem: boolean;
  adminAccess: boolean;
}

function normalizeRole(value: any): Role {
  if (value === 'ADMIN' || value === 'MANAGER' || value === 'CUSTOMER') return value;
  return 'CUSTOMER';
}

function normalizeStatus(value: any): Status {
  if (value === 'ACTIVE' || value === 'INACTIVE') return value;
  return 'ACTIVE';
}

function prettyRole(role: Role) {
  if (role === 'ADMIN') return 'Admin';
  if (role === 'MANAGER') return 'Manager';
  return 'Customer';
}

function prettyStatus(status: Status) {
  return status === 'ACTIVE' ? 'Active' : 'Inactive';
}

function resolveRoleLabel(row: UserRow, allRoles: RoleConfig[]): string {
  if (row.customRole) {
    const found = allRoles.find((r) => r.id === row.customRole);
    return found ? found.label : row.customRole;
  }
  return prettyRole(row.role);
}

function toRolePayload(roleValue: string): { role?: Role; customRole: string | null } {
  if (roleValue === 'ADMIN' || roleValue === 'MANAGER' || roleValue === 'CUSTOMER') {
    return { role: roleValue, customRole: null };
  }
  return { customRole: roleValue };
}

const EMPTY_DRAFT: UserDraft = {
  name: '',
  email: '',
  roleValue: 'CUSTOMER',
  status: 'ACTIVE',
  password: '',
};

export default function AdminUsersPage() {
  const { toast } = useToast();
  const { user: me } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<UserRow | null>(null);

  const [createDraft, setCreateDraft] = useState<UserDraft>(EMPTY_DRAFT);
  const [editDraft, setEditDraft] = useState<UserDraft>(EMPTY_DRAFT);

  const canManageUsers = useMemo(() => {
    const r = me?.role;
    return r === 'ADMIN' || r === 'MANAGER';
  }, [me?.role]);

  const canDeleteUsers = useMemo(() => me?.role === 'ADMIN', [me?.role]);

  const allRolesQuery = useQuery<RoleConfig[]>({
    queryKey: ['admin', 'roles'],
    queryFn: () => roleService.list(),
    enabled: canManageUsers,
  });

  const allRoles = allRolesQuery.data ?? [];
  const customRoles = useMemo(() => allRoles.filter((r) => !r.isSystem), [allRoles]);

  const fetchUsers = useCallback(async () => {
    if (!canManageUsers) return;
    setIsLoading(true);
    try {
      const data = await api.getUsers();
      const rows = Array.isArray(data)
        ? data.map((u: any) => ({
            id: Number(u.id),
            name: u.name ?? '',
            email: String(u.email ?? ''),
            role: normalizeRole(u.role),
            customRole: u.customRole ?? null,
            status: normalizeStatus(u.status),
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
          }))
        : [];
      setUsers(rows);
    } catch (e: any) {
      toast({
        title: 'Could not load users',
        description: e?.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [canManageUsers, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openEdit = (u: UserRow) => {
    setSelected(u);
    setEditDraft({
      name: u.name ?? '',
      email: u.email,
      roleValue: u.customRole || u.role,
      status: u.status,
      password: '',
    });
    setEditOpen(true);
  };

  const handleInvite = async () => {
    setIsLoading(true);
    try {
      const rolePayload = toRolePayload(createDraft.roleValue);
      const payload: any = {
        name: createDraft.name?.trim() || undefined,
        email: createDraft.email?.trim().toLowerCase(),
        status: createDraft.status,
        password: createDraft.password,
        customRole: rolePayload.customRole,
      };
      if (rolePayload.role) payload.role = rolePayload.role;

      await api.createUser(payload);
      setInviteOpen(false);
      setCreateDraft(EMPTY_DRAFT);
      toast({ title: 'User created', description: 'The user can now log in with their credentials.' });
      await fetchUsers();
    } catch (e: any) {
      toast({
        title: 'Could not create user',
        description: e?.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    setIsLoading(true);
    try {
      const rolePayload = toRolePayload(editDraft.roleValue);
      const payload: any = {
        name: editDraft.name?.trim() || null,
        email: editDraft.email?.trim().toLowerCase(),
        status: editDraft.status,
        customRole: rolePayload.customRole,
      };
      if (rolePayload.role) payload.role = rolePayload.role;
      if (editDraft.password?.trim()) {
        payload.password = editDraft.password;
      }

      await api.updateUser(String(selected.id), payload);
      setEditOpen(false);
      setSelected(null);
      setEditDraft(EMPTY_DRAFT);
      toast({ title: 'User updated', description: 'Changes have been saved.' });
      await fetchUsers();
    } catch (e: any) {
      toast({
        title: 'Could not update user',
        description: e?.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (u: UserRow) => {
    if (!canDeleteUsers) return;
    if (me?.id && u.id === me.id) {
      toast({ title: 'Action blocked', description: 'You cannot delete your own account.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await api.deleteUser(String(u.id));
      toast({ title: 'User deleted', description: 'The account was removed.' });
      await fetchUsers();
    } catch (e: any) {
      toast({ title: 'Could not delete user', description: e?.message || 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Users" description="Manage accounts, roles, and access." />

      <Card className="border-border/70 bg-card/90">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-lg">Directory</CardTitle>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={!canManageUsers || isLoading}>
                Create user
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create user</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-name">Name</Label>
                  <Input
                    id="create-name"
                    value={createDraft.name}
                    onChange={(e) => setCreateDraft((c) => ({ ...c, name: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-email">Email</Label>
                  <Input
                    id="create-email"
                    value={createDraft.email}
                    onChange={(e) => setCreateDraft((c) => ({ ...c, email: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-password">Password</Label>
                  <Input
                    id="create-password"
                    type="password"
                    value={createDraft.password}
                    onChange={(e) => setCreateDraft((c) => ({ ...c, password: e.target.value }))}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Role</Label>
                    <Select
                      value={createDraft.roleValue}
                      onValueChange={(v) => setCreateDraft((c) => ({ ...c, roleValue: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CUSTOMER">Customer</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        {customRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select
                      value={createDraft.status}
                      onValueChange={(v) => setCreateDraft((c) => ({ ...c, status: normalizeStatus(v) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteOpen(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={isLoading || !createDraft.email.trim() || !createDraft.password.trim()}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[140px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name || '—'}</TableCell>
                  <TableCell>{resolveRoleLabel(u, allRoles)}</TableCell>
                  <TableCell>
                    <Badge variant={u.status === 'ACTIVE' ? 'outline' : 'secondary'}>{prettyStatus(u.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(u)} disabled={!canManageUsers || isLoading}>
                        Edit
                      </Button>
                      {canDeleteUsers ? (
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(u)} disabled={isLoading}>
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    {canManageUsers ? 'No users found.' : 'You do not have permission to view users.'}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editDraft.name}
                onChange={(e) => setEditDraft((c) => ({ ...c, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                value={editDraft.email}
                onChange={(e) => setEditDraft((c) => ({ ...c, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">Set new password</Label>
              <Input
                id="edit-password"
                type="password"
                value={editDraft.password}
                onChange={(e) => setEditDraft((c) => ({ ...c, password: e.target.value }))}
                placeholder="Leave blank to keep current"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select value={editDraft.roleValue} onValueChange={(v) => setEditDraft((c) => ({ ...c, roleValue: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    {customRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={editDraft.status} onValueChange={(v) => setEditDraft((c) => ({ ...c, status: normalizeStatus(v) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !selected}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
