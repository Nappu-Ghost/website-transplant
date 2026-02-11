import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/shared';

const users = [
  { name: 'Avery Jordan', role: 'Guest', status: 'Active', email: 'avery@guest.com' },
  { name: 'Maya Ortiz', role: 'Guest', status: 'VIP', email: 'maya@guest.com' },
  { name: 'Dylan Shaw', role: 'Concierge', status: 'Active', email: 'dylan@azurelagoon.com' },
  { name: 'Elena Shore', role: 'Admin', status: 'Active', email: 'elena@azurelagoon.com' },
];

export default function AdminUsersPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Users"
        description="Manage guest profiles, concierge assignments, and admin access."
      />

      <Card className="border-border/70 bg-card/90">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-lg">Directory</CardTitle>
          <Button variant="outline">Invite user</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.email}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'VIP' ? 'secondary' : 'outline'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
