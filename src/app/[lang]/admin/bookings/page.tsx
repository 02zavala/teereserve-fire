
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import { getBookings } from "@/lib/data";
import type { Booking } from "@/types";
import { format } from "date-fns";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n-config";
import { dateLocales } from "@/lib/date-utils";
import { Skeleton } from "@/components/ui/skeleton";


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

function BookingRow({ booking, lang }: { booking: Booking, lang: Locale }) {
    const [formattedDate, setFormattedDate] = useState<string | null>(null);

    useEffect(() => {
        if (booking.date) {
            try {
                const dateObj = typeof booking.date === 'string' ? new Date(booking.date) : booking.date;
                if (!isNaN(dateObj.getTime())) {
                    setFormattedDate(format(dateObj, 'PPP', { locale: dateLocales[lang] }));
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
            <TableCell className="font-medium">{booking.id.substring(0, 7)}...</TableCell>
            <TableCell>{booking.courseName}</TableCell>
            <TableCell>{booking.userName}</TableCell>
            <TableCell>
                {formattedDate !== null ? formattedDate : <Skeleton className="h-4 w-24" />}
            </TableCell>
            <TableCell>${booking.totalPrice.toFixed(2)}</TableCell>
            <TableCell>
                <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
            </TableCell>
            <TableCell>
                <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </TableCell>
        </TableRow>
    );
}

export default function BookingsAdminPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const lang = (pathname.split('/')[1] || 'en') as Locale;

    useEffect(() => {
        getBookings().then(fetchedBookings => {
            setBookings(fetchedBookings);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to fetch bookings", err);
            setLoading(false);
        });
    }, []);
    
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                 <h1 className="text-3xl font-bold font-headline text-primary">Manage Bookings</h1>
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Booking
                 </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    {loading ? (
                         <div className="flex justify-center items-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Booking ID</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bookings.map(booking => (
                                    <BookingRow key={booking.id} booking={booking} lang={lang} />
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
