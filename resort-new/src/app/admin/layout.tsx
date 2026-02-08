"use client";

import React, { useState } from 'react';
import type { FC } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  Home,
  Calendar,
  Users,
  LineChart,
  Settings,
  LogOut,
  BriefcaseMedical,
  Building,
  ChevronDown,
  ArrowLeftFromLine,
  Stethoscope,
  UserCog,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/auth/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [rosterOpen, setRosterOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  // Define role-based access permissions
  const canViewAppointments = user?.role === 'ADMINISTRATIVE_OFFICER' || user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canViewDoctors = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canViewRoster = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canViewReports = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canViewClinics = user?.role === 'MANAGER';
  const canViewServices = user?.role === 'MANAGER';
  const canViewUsers = user?.role === 'MANAGER';
  const canViewSurgeryRooms = user?.role === 'ADMINISTRATIVE_OFFICER' || user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const showRosterMenu = canViewRoster || canViewSurgeryRooms;

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return pathname === path;
    }
    return (
      pathname === path ||
      (path !== '/admin/dashboard' &&
        pathname.startsWith(path) &&
        path.split('/').length <= pathname.split('/').length)
    );
  };

  React.useEffect(() => {
    setRosterOpen(pathname.startsWith('/admin/roster'));
    setReportsOpen(pathname.startsWith('/admin/reports'));
  }, [pathname]);

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user?.name?.[0] || user?.email?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-sm">
                <span className="font-semibold text-sidebar-foreground">
                  {user?.name || user?.email}
                </span>
                <span className="text-xs text-sidebar-foreground/70 capitalize">
                  {user?.role?.toLowerCase()}
                </span>
              </div>
            </div>
            <ThemeToggleButton />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/admin/dashboard', true)} tooltip="Dashboard">
                <Link href="/admin/dashboard">
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {canViewAppointments && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/admin/appointments')} tooltip="Appointments">
                  <Link href="/admin/appointments">
                    <Calendar />
                    <span>Appointments</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            {canViewDoctors && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/admin/doctors')} tooltip="Doctor Management">
                  <Link href="/admin/doctors">
                    <Stethoscope />
                    <span>Doctors</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            {showRosterMenu && (
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setRosterOpen(!rosterOpen)} 
                  isActive={isActive('/admin/roster')} 
                  tooltip="Doctor Roster"
                >
                  <Users />
                  <span>Doctor Roster</span>
                  <ChevronDown className={cn('ml-auto h-4 w-4 transform transition-transform', rosterOpen ? 'rotate-180' : '')} />
                </SidebarMenuButton>
                {rosterOpen && (
                  <SidebarMenuSub>
                    {canViewRoster && (
                      <>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={isActive('/admin/roster/view')}>
                            <Link href="/admin/roster/view">View Schedules</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild isActive={isActive('/admin/roster/manage')}>
                            <Link href="/admin/roster/manage">Manage Shifts</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </>
                    )}
                    {canViewSurgeryRooms && (
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={isActive('/admin/roster/surgery-rooms')}>
                          <Link href="/admin/roster/surgery-rooms">Surgery Rooms</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    )}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            )}

            {canViewReports && (
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setReportsOpen(!reportsOpen)} isActive={isActive('/admin/reports')} tooltip="Reports">
                  <LineChart />
                  <span>Reports</span>
                  <ChevronDown className={cn('ml-auto h-4 w-4 transform transition-transform', reportsOpen ? 'rotate-180' : '')} />
                </SidebarMenuButton>
                {reportsOpen && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActive('/admin/reports/appointments')}>
                        <Link href="/admin/reports/appointments">Appointment Report</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActive('/admin/reports/revenue')}>
                        <Link href="/admin/reports/revenue">Revenue Report</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={isActive('/admin/reports/popularity')}>
                        <Link href="/admin/reports/popularity">Popularity Report</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            )}

            {canViewClinics && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/admin/clinics')} tooltip="Clinic Management">
                  <Link href="/admin/clinics">
                    <Building />
                    <span>Clinics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            {canViewServices && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/admin/services')} tooltip="Service Management">
                  <Link href="/admin/services">
                    <BriefcaseMedical />
                    <span>Services</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

            {canViewUsers && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/admin/users')} tooltip="User Management">
                  <Link href="/admin/users">
                    <UserCog />
                    <span>Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Back to Website">
                <Link href="/">
                  <ArrowLeftFromLine />
                  <span>Back to Website</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive('/admin/settings')} tooltip="Settings">
                <Link href="/admin/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout} tooltip="Logout">
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:justify-end">
          <SidebarTrigger className="md:hidden" />
          <p className="font-semibold text-primary hidden md:block flex-grow text-center">Island Dental Connect - Dashboard</p>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;

