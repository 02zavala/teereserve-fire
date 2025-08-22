
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, CreditCard, Activity, Loader2 } from "lucide-react";
import { getDashboardStats, getRevenueLast7Days } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/types";
import { format } from "date-fns";
import Link from "next/link";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n-config";
import { dateLocales } from "@/lib/date-utils";


interface DashboardStats {
    totalRevenue: number;
    totalUsers: number;
    totalBookings: number;
    recentBookings: Booking[];
}

function getStatusVariant(status: Booking['status']) {
    switch (status) {
        case 'Confirmed': return 'default';
        case 'Completed': return 'secondary';
        case 'Cancelled': return 'destructive';
        case 'Pending':
        default:
            return 'outline';
    }
}

function RecentBookingRow({ booking, lang }: { booking: Booking, lang: Locale }) {
    const [formattedDate, setFormattedDate] = useState<string | null>(null);

    useEffect(() => {
        // This effect runs only on the client, ensuring `date-fns` has access to the correct locale.
        if (booking.date) {
            try {
                const dateObj = new Date(booking.date);
                if (!isNaN(dateObj.getTime())) {
                     setFormattedDate(format(dateObj, "PPP", { locale: dateLocales[lang] }));
                } else {
                    setFormattedDate("Invalid Date");
                }
            } catch (e) {
                console.error("Invalid date format for booking:", booking.id, booking.date);
                setFormattedDate("Invalid Date");
            }
        } else {
            setFormattedDate("No Date");
        }
    }, [booking.date, booking.id, lang]);

    return (
        <TableRow>
            <TableCell>
                <div className="font-medium">{booking.userName}</div>
            </TableCell>
            <TableCell>{booking.courseName}</TableCell>
            <TableCell className="hidden md:table-cell">
                {formattedDate ? formattedDate : <Skeleton className="h-4 w-24" />}
            </TableCell>
            <TableCell className="text-right">${booking.totalPrice.toFixed(2)}</TableCell>
            <TableCell className="text-right">
                <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
            </TableCell>
        </TableRow>
    );
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [revenueData, setRevenueData] = useState<{ date: string; revenue: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const lang = (pathname.split('/')[1] || 'en') as Locale;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsData, revenueChartData] = await Promise.all([
                    getDashboardStats(),
                    getRevenueLast7Days(),
                ]);
                setStats(statsData);
                setRevenueData(revenueChartData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }
    
    if (!stats) {
        return (
             <div className="flex justify-center items-center h-full">
                <p className="text-muted-foreground">Could not load dashboard data.</p>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-3xl font-bold font-headline text-primary mb-6">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Based on completed bookings
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Users
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            Total registered users
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{stats.totalBookings}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all statuses
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Occupancy Rate
                        </CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">73.5%</div>
                        <p className="text-xs text-muted-foreground">
                           Calculation placeholder
                        </p>
                    </CardContent>
                </Card>
            </div>
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                        <CardDescription>Your revenue for the last 7 days.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <RevenueChart data={revenueData} />
                    </CardContent>
                </Card>
                 <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Bookings</CardTitle>
                        <CardDescription>The last 5 bookings made on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead className="hidden md:table-cell">Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.recentBookings.map((booking) => (
                                    <RecentBookingRow key={booking.id} booking={booking} lang={lang} />
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
