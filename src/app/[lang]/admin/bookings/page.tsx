
"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
import { getBookings } from "@/lib/data";
import type { Booking } from "@/types";
import { format } from "date-fns";
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

interface FormattedBooking extends Omit<Booking, 'date'> {
    date: string | Date;
}

function BookingRow({ booking }: { booking: FormattedBooking }) {
    const formattedDate = useMemo(() => {
        if (booking.date) {
            try {
                const dateObj = typeof booking.date === 'string' ? new Date(booking.date) : booking.date;
                if (!isNaN(dateObj.getTime())) {
                    return format(dateObj, 'PPP');
                }
                throw new Error("Invalid date value");
            } catch (e) {
                console.error("Invalid date format for booking:", booking.id, booking.date);
                return "Invalid Date";
            }
        }
        return null;
    }, [booking.date, booking.id]);

    return (
        <TableRow>
            <TableCell className="font-medium">{booking.id.substring(0, 7)}...</TableCell>
            <TableCell>{booking.courseName}</TableCell>
            <TableCell>{booking.userName}</TableCell>
            <TableCell>
                {formattedDate ? formattedDate : <Skeleton className="h-4 w-24" />}
            </TableCell>
            <TableCell>${booking.totalPrice}</TableCell>
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
    const [bookings, setBookings] = useState<FormattedBooking[]>([]);
    const [loading, setLoading] = useState(true);

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
                                    <BookingRow key={booking.id} booking={booking} />
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
