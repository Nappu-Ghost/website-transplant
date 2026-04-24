"use client";

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/lib/api-service';
import { DEFAULT_NAVBAR_VISIBILITY, NAVBAR_ITEMS, type NavbarVisibility } from '@/lib/navbar-items';

type AuditLogEntry = {
  id: number;
  actorUserId?: number | null;
  actorName: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  description: string;
  createdAt: string;
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [draft, setDraft] = useState<NavbarVisibility>(DEFAULT_NAVBAR_VISIBILITY);
  const [q, setQ] = useState('');
  const [actor, setActor] = useState('');
  const [action, setAction] = useState<string>('all');
  const [entityType, setEntityType] = useState<string>('all');

  const navbarQuery = useQuery<NavbarVisibility>({
    queryKey: ['admin', 'settings', 'navbar'],
    queryFn: () => adminService.getNavbarSettings(),
  });

  const auditQuery = useQuery<AuditLogEntry[]>({
    queryKey: ['admin', 'settings', 'audit-logs', q, actor, action, entityType],
    queryFn: () =>
      adminService.getAuditLogs({
        q: q || undefined,
        actor: actor || undefined,
        action: action === 'all' ? undefined : action,
        entityType: entityType === 'all' ? undefined : entityType,
        limit: 300,
      }),
  });

  const saveNavbarMutation = useMutation({
    mutationFn: (payload: NavbarVisibility) => adminService.updateNavbarSettings(payload),
    onSuccess: (updated) => {
      setDraft(updated);
      qc.invalidateQueries({ queryKey: ['admin', 'settings', 'navbar'] });
      qc.invalidateQueries({ queryKey: ['public', 'navbar'] });
      qc.invalidateQueries({ queryKey: ['admin', 'settings', 'audit-logs'] });
      toast({ title: 'Navbar settings saved' });
    },
    onError: (err: any) => {
      toast({ title: 'Failed to save navbar settings', description: err?.message, variant: 'destructive' });
    },
  });

  const isDirty = useMemo(() => {
    const source = navbarQuery.data ?? DEFAULT_NAVBAR_VISIBILITY;
    return NAVBAR_ITEMS.some((item) => Boolean(draft[item.key]) !== Boolean(source[item.key]));
  }, [draft, navbarQuery.data]);

  const actionOptions = ['all', 'create', 'update', 'delete'];
  const entityOptions = ['all', 'user', 'hotel', 'room', 'activity', 'role', 'navbar'];

  const hydrateDraftFromSource = (source: NavbarVisibility | undefined) => {
    const merged = { ...DEFAULT_NAVBAR_VISIBILITY, ...(source ?? {}) };
    setDraft(merged);
  };

  useEffect(() => {
    if (navbarQuery.data) {
      hydrateDraftFromSource(navbarQuery.data);
    }
  }, [navbarQuery.data]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Manage public navbar visibility and review system activity logs."
      />

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-lg">Navbar visibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Toggle which pages appear in the public site navigation.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            {NAVBAR_ITEMS.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-md border border-border/60 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.href}</p>
                </div>
                <Switch
                  checked={Boolean(draft[item.key])}
                  onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, [item.key]: checked }))}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!isDirty || saveNavbarMutation.isPending || navbarQuery.isLoading}
              onClick={() => saveNavbarMutation.mutate(draft)}
            >
              {saveNavbarMutation.isPending ? 'Saving…' : 'Save navbar settings'}
            </Button>
            <Button
              variant="outline"
              disabled={saveNavbarMutation.isPending || navbarQuery.isLoading}
              onClick={() => hydrateDraftFromSource(navbarQuery.data as NavbarVisibility | undefined)}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-lg">Event logs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="log-search">Contains text</Label>
              <Input
                id="log-search"
                placeholder="created hotel"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="log-actor">Actor</Label>
              <Input
                id="log-actor"
                placeholder="username or email"
                value={actor}
                onChange={(e) => setActor(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Action</Label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt === 'all' ? 'All actions' : opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Entity</Label>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger>
                  <SelectValue placeholder="All entities" />
                </SelectTrigger>
                <SelectContent>
                  {entityOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt === 'all' ? 'All entities' : opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-border/60">
            <div className="grid grid-cols-[140px_110px_110px_1fr] gap-3 border-b border-border/60 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Timestamp</span>
              <span>Actor</span>
              <span>Action</span>
              <span>Details</span>
            </div>

            <div className="max-h-[460px] overflow-y-auto">
              {auditQuery.isLoading && (
                <p className="px-4 py-6 text-sm text-muted-foreground">Loading event logs…</p>
              )}

              {!auditQuery.isLoading && (auditQuery.data ?? []).length === 0 && (
                <p className="px-4 py-6 text-sm text-muted-foreground">No matching events found.</p>
              )}

              {(auditQuery.data ?? []).map((log) => (
                <div
                  key={log.id}
                  className="grid grid-cols-[140px_110px_110px_1fr] gap-3 border-b border-border/40 px-4 py-3 text-sm last:border-b-0"
                >
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                  <span className="truncate text-foreground">{log.actorName}</span>
                  <span>
                    <Badge variant="outline" className="text-[11px] capitalize">{log.action}</Badge>
                  </span>
                  <span className="text-muted-foreground">{log.description}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
