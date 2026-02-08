export default function AdminLandingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Resort Admin</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Manage the resort experience from one place.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <a
          href="/admin/dashboard"
          className="rounded-lg border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
          <p className="mt-2 text-sm text-muted-foreground">Overview and key metrics.</p>
        </a>
        <a
          href="/admin/bookings"
          className="rounded-lg border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-foreground">Bookings</h2>
          <p className="mt-2 text-sm text-muted-foreground">Reservations and guest status.</p>
        </a>
        <a
          href="/admin/accommodations"
          className="rounded-lg border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-foreground">Accommodations</h2>
          <p className="mt-2 text-sm text-muted-foreground">Hotels, rooms, and availability.</p>
        </a>
        <a
          href="/admin/activities"
          className="rounded-lg border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-foreground">Activities</h2>
          <p className="mt-2 text-sm text-muted-foreground">Experiences and events.</p>
        </a>
        <a
          href="/admin/payments"
          className="rounded-lg border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-foreground">Payments</h2>
          <p className="mt-2 text-sm text-muted-foreground">Transactions and revenue.</p>
        </a>
        <a
          href="/admin/users"
          className="rounded-lg border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-foreground">Users</h2>
          <p className="mt-2 text-sm text-muted-foreground">Guests and staff access.</p>
        </a>
        <a
          href="/admin/settings"
          className="rounded-lg border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-foreground">Settings</h2>
          <p className="mt-2 text-sm text-muted-foreground">Policies and defaults.</p>
        </a>
      </div>
    </div>
  );
}
