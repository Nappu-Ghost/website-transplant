"use client";

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Shield, ShieldCheck, Trash2, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { roleService } from '@/lib/api-service';
import { ADMIN_PAGES } from '@/lib/admin-pages';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoleConfig {
  id: string;
  label: string;
  isSystem: boolean;
  adminAccess: boolean;
  allPages: boolean;
  pages: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isAdminRole = (id: string) => id === 'ADMIN';

// ─── Sub-components ───────────────────────────────────────────────────────────

function PageCheckboxes({
  selected,
  onChange,
  disabled,
}: {
  selected: string[];
  onChange: (pages: string[]) => void;
  disabled?: boolean;
}) {
  const toggle = (slug: string) => {
    onChange(
      selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug],
    );
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {ADMIN_PAGES.map((page) => (
        <label
          key={page.slug}
          className={`flex cursor-pointer items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm transition hover:bg-muted/50 ${
            disabled ? 'cursor-not-allowed opacity-40' : ''
          }`}
        >
          <Checkbox
            checked={selected.includes(page.slug)}
            onCheckedChange={() => !disabled && toggle(page.slug)}
            disabled={disabled}
          />
          {page.label}
        </label>
      ))}
    </div>
  );
}

function RoleCard({
  role,
  onEdit,
  onDelete,
}: {
  role: RoleConfig;
  onEdit: (role: RoleConfig) => void;
  onDelete: (role: RoleConfig) => void;
}) {
  const locked = isAdminRole(role.id);

  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {role.adminAccess ? (
              <ShieldCheck className="h-4 w-4 text-primary" />
            ) : (
              <Shield className="h-4 w-4 text-muted-foreground" />
            )}
            <CardTitle className="text-base">{role.label}</CardTitle>
            {role.isSystem && (
              <Badge variant="outline" className="text-xs">
                Built-in
              </Badge>
            )}
          </div>
          {!locked && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => onEdit(role)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              {!role.isSystem && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={() => onDelete(role)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="text-foreground font-medium">Admin access:</span>
          <Badge
            variant={role.adminAccess ? 'default' : 'secondary'}
            className="text-xs"
          >
            {role.adminAccess ? 'Yes' : 'No'}
          </Badge>
          {role.adminAccess && role.allPages && (
            <Badge variant="outline" className="text-xs">
              All pages
            </Badge>
          )}
        </div>
        {role.adminAccess && !role.allPages && (
          <div>
            <span className="text-foreground font-medium">Pages: </span>
            {role.pages.length === 0 ? (
              <span className="italic">None assigned</span>
            ) : (
              role.pages
                .map((slug) => ADMIN_PAGES.find((p) => p.slug === slug)?.label ?? slug)
                .join(', ')
            )}
          </div>
        )}
        {locked && (
          <p className="text-xs italic">The Admin role always has full access and cannot be modified.</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminRolesPage() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const rolesQuery = useQuery<RoleConfig[]>({
    queryKey: ['admin', 'roles'],
    queryFn: () => roleService.list(),
  });

  // ── Add modal state ──────────────────────────────────────────────────────────
  const [addOpen, setAddOpen] = useState(false);
  const [addDraft, setAddDraft] = useState({
    label: '',
    adminAccess: false,
    pages: [] as string[],
  });

  // ── Edit modal state ─────────────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RoleConfig | null>(null);
  const [editDraft, setEditDraft] = useState({
    label: '',
    adminAccess: false,
    pages: [] as string[],
  });

  // ── Delete modal state ───────────────────────────────────────────────────────
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<RoleConfig | null>(null);

  // ── Mutations ────────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: { label: string; adminAccess: boolean; pages: string[] }) =>
      roleService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'roles'] });
      setAddOpen(false);
      setAddDraft({ label: '', adminAccess: false, pages: [] });
      toast({ title: 'Role created' });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to create role', description: err?.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; label: string; adminAccess: boolean; pages: string[] }) =>
      roleService.update(data.id, { label: data.label, adminAccess: data.adminAccess, pages: data.pages }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'roles'] });
      // Refresh my permissions cache since a role may have changed
      qc.invalidateQueries({ queryKey: ['admin', 'my-permissions'] });
      setEditOpen(false);
      setEditTarget(null);
      toast({ title: 'Role updated' });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to update role', description: err?.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roleService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'roles'] });
      setDeleteOpen(false);
      setDeleteTarget(null);
      toast({ title: 'Role deleted' });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to delete role', description: err?.message, variant: 'destructive' });
    },
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const openEdit = (role: RoleConfig) => {
    setEditTarget(role);
    setEditDraft({ label: role.label, adminAccess: role.adminAccess, pages: [...role.pages] });
    setEditOpen(true);
  };

  const openDelete = (role: RoleConfig) => {
    setDeleteTarget(role);
    setDeleteOpen(true);
  };

  const roles = rolesQuery.data ?? [];

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Role Management</h1>
          <p className="mt-1 text-base text-muted-foreground">
            Define roles, toggle admin dashboard access, and set per-page permissions.
          </p>
        </div>
        <Button size="sm" className="shrink-0" onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add role
        </Button>
      </div>

      {rolesQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading roles…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <RoleCard key={role.id} role={role} onEdit={openEdit} onDelete={openDelete} />
          ))}
        </div>
      )}

      {/* ── Add Role Modal ─────────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add new role</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-2">
            <div className="space-y-2">
              <Label htmlFor="add-label">Role name</Label>
              <Input
                id="add-label"
                placeholder="e.g. Event Organizer"
                value={addDraft.label}
                onChange={(e) => setAddDraft((d) => ({ ...d, label: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border border-border/60 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Admin dashboard access</p>
                <p className="text-xs text-muted-foreground">Allow this role to log in to the admin area.</p>
              </div>
              <Switch
                checked={addDraft.adminAccess}
                onCheckedChange={(v) =>
                  setAddDraft((d) => ({ ...d, adminAccess: v, pages: v ? d.pages : [] }))
                }
              />
            </div>

            {addDraft.adminAccess && (
              <div className="space-y-2">
                <Label>Pages this role can access</Label>
                <PageCheckboxes
                  selected={addDraft.pages}
                  onChange={(pages) => setAddDraft((d) => ({ ...d, pages }))}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setAddOpen(false); setAddDraft({ label: '', adminAccess: false, pages: [] }); }}
            >
              Cancel
            </Button>
            <Button
              disabled={!addDraft.label.trim() || createMutation.isPending}
              onClick={() =>
                createMutation.mutate({
                  label: addDraft.label.trim(),
                  adminAccess: addDraft.adminAccess,
                  pages: addDraft.pages,
                })
              }
            >
              {createMutation.isPending ? 'Creating…' : 'Create role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Role Modal ────────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit role{editTarget ? `: ${editTarget.label}` : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-label">Role name</Label>
              <Input
                id="edit-label"
                value={editDraft.label}
                onChange={(e) => setEditDraft((d) => ({ ...d, label: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border border-border/60 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Admin dashboard access</p>
                <p className="text-xs text-muted-foreground">Allow this role to log in to the admin area.</p>
              </div>
              <Switch
                checked={editDraft.adminAccess}
                onCheckedChange={(v) =>
                  setEditDraft((d) => ({ ...d, adminAccess: v, pages: v ? d.pages : [] }))
                }
              />
            </div>

            {editDraft.adminAccess && (
              <div className="space-y-2">
                <Label>Pages this role can access</Label>
                <PageCheckboxes
                  selected={editDraft.pages}
                  onChange={(pages) => setEditDraft((d) => ({ ...d, pages }))}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setEditOpen(false); setEditTarget(null); }}
            >
              Cancel
            </Button>
            <Button
              disabled={!editDraft.label.trim() || updateMutation.isPending || !editTarget}
              onClick={() => {
                if (!editTarget) return;
                updateMutation.mutate({
                  id: editTarget.id,
                  label: editDraft.label.trim(),
                  adminAccess: editDraft.adminAccess,
                  pages: editDraft.pages,
                });
              }}
            >
              {updateMutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Modal ───────────────────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Delete role</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-sm text-muted-foreground">
            Are you sure you want to delete the <span className="font-semibold text-foreground">{deleteTarget?.label}</span> role?
            Users currently assigned to this role will retain their base system role.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setDeleteOpen(false); setDeleteTarget(null); }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending || !deleteTarget}
              onClick={() => {
                if (!deleteTarget) return;
                deleteMutation.mutate(deleteTarget.id);
              }}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
