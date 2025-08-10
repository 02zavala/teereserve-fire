import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle } from "lucide-react";

export default function BookingsAdminPage() {
    // Dummy data for now
    const bookings = [
        { id: 'BK001', course: 'Solmar Golf Links', user: 'John Doe', date: '2024-08-20', total: 500, status: 'Confirmed' },
        { id: 'BK002', course: 'Palmilla Golf Club', user: 'Jane Smith', date: '2024-08-21', total: 560, status: 'Pending' },
        { id: 'BK003', course: 'Cabo del Sol', user: 'Peter Jones', date: '2024-08-22', total: 700, status: 'Completed' },
        { id: 'BK004', course: 'Puerto Los Cabos', user: 'Mary Johnson', date: '2024-08-23', total: 520, status: 'Cancelled' },
    ];
    
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
                                    <TableCell className="font-medium">{booking.id}</TableCell>
                                    <TableCell>{booking.course}</TableCell>
                                    <TableCell>{booking.user}</TableCell>
                                    <TableCell>{booking.date}</TableCell>
                                    <TableCell>${booking.total}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            booking.status === 'Confirmed' ? 'default' :
                                            booking.status === 'Cancelled' ? 'destructive' :
                                            'secondary'
                                        }>{booking.status}</Badge>
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