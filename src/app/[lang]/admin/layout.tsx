
import * as React from 'react';
import { Sidebar, SidebarProvider, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar";
import { Home, GanttChartSquare, BookMarked, Users, Settings, MessageSquareQuote, FileText, TicketPercent, Database } from "lucide-react";
import Link from "next/link";
import { UserNav } from "@/components/auth/UserNav";
import { Header } from "@/components/layout/Header";
import { type Locale } from "@/i18n-config";
import { AdminAuthGuard } from "@/components/auth/AdminAuthGuard";
import { getSharedDictionary } from "@/lib/dictionaries/shared";

export default async function AdminLayout({
  children,
  params: paramsProp,
}: {
  children: React.ReactNode,
  params: { lang: Locale }
}) {
  const params = await paramsProp;
  const lang = params.lang;
  const sharedDictionary = await getSharedDictionary(lang);
  return (
    <AdminAuthGuard>
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
                              <SidebarMenuButton asChild tooltip="Site Content">
                                  <Link href={`/${lang}/admin/content`}>
                                      <FileText />
                                      <span>Site Content</span>
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
                              <SidebarMenuButton asChild tooltip="Coupons">
                                  <Link href={`/${lang}/admin/coupons`}>
                                      <TicketPercent />
                                      <span>Coupons</span>
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
                          <SidebarMenuItem>
                              <SidebarMenuButton asChild tooltip="Backup">
                                  <Link href={`/${lang}/admin/backup`}>
                                      <Database />
                                      <span>Backup</span>
                                  </Link>
                              </SidebarMenuButton>
                          </SidebarMenuItem>
                      </SidebarMenu>
                  </SidebarContent>
              </Sidebar>
              <SidebarInset className="flex flex-col">
                  <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                      <div className="flex items-center gap-2 px-4">
                          <SidebarTrigger className="-ml-1" />
                          <Header lang={lang} dictionary={sharedDictionary} />
                      </div>
                  </header>
                  <main className="flex-1 overflow-y-auto p-4 md:p-6">
                      {children}
                  </main>
              </SidebarInset>
          </div>
      </SidebarProvider>
    </AdminAuthGuard>
  )
}
