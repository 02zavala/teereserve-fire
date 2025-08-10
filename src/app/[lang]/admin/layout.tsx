import { Sidebar, SidebarProvider, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar";
import { Home, GanttChartSquare, BookMarked, Users, Settings, MessageSquareQuote } from "lucide-react";
import Link from "next/link";
import { UserNav } from "@/components/auth/UserNav";
import { Header } from "@/components/layout/Header";
import { type Locale } from "@/i18n-config";

export default function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode,
  params: { lang: Locale }
}) {
  const lang = params.lang;
  return (
    <SidebarProvider>
        <div className="flex h-screen w-full">
            <Sidebar>
                <SidebarContent>
                    <SidebarHeader>
                        <h2 className="text-xl font-headline text-primary">Admin Panel</h2>
                    </SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="Dashboard">
                                <Link href={`/${lang}/admin/dashboard`}>
                                    <Home />
                                    <span>Dashboard</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="Courses">
                                <Link href={`/${lang}/admin/courses`}>
                                    <GanttChartSquare />
                                    <span>Courses</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="Bookings">
                                <Link href={`/${lang}/admin/bookings`}>
                                    <BookMarked />
                                    <span>Bookings</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="Reviews">
                                <Link href={`/${lang}/admin/reviews`}>
                                    <MessageSquareQuote />
                                    <span>Reviews</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="Users">
                                <Link href={`/${lang}/admin/users`}>
                                    <Users />
                                    <span>Users</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
            </Sidebar>
            <SidebarInset className="flex flex-col">
                 <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                    <SidebarTrigger className="md:hidden" />
                    <div className="flex-1 text-center md:text-left">
                         <h1 className="text-lg font-semibold">TeeReserve Admin</h1>
                    </div>
                    <UserNav />
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </SidebarInset>
        </div>
    </SidebarProvider>
  )
}
