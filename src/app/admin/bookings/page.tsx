
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { getBookings } from "@/lib/data";
import type { Booking } from "@/types";
import { format } from "date-fns";

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

function FormattedDate({ dateString }: { dateString: string }) {
    const [formattedDate, setFormattedDate] = useState('');

    useEffect(() => {
        if (dateString) {
            setFormattedDate(format(new Date(dateString), 'PPP'));
        }
    }, [dateString]);

    return <>{formattedDate}</>;
}

export default function BookingsAdminPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);

    useEffect(() => {
        getBookings().then(setBookings);
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
                                <TableRow key={booking.id}>
                                    <TableCell className="font-medium">{booking.id.substring(0, 7)}...</TableCell>
                                    <TableCell>{booking.courseName}</TableCell>
                                    <TableCell>{booking.userName}</TableCell>
                                    <TableCell>
                                        <FormattedDate dateString={booking.date} />
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
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
