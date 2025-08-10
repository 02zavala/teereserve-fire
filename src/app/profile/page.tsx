
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Edit, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getUserBookings } from "@/lib/data";
import type { Booking } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface FormattedBooking extends Omit<Booking, 'createdAt'> {
    id: string;
    createdAt?: string; // Make createdAt optional as it's not always present in the same way
    formattedDate: string;
}

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const [bookings, setBookings] = useState<FormattedBooking[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [memberSince, setMemberSince] = useState('');

    useEffect(() => {
        if (user) {
            if (user.metadata.creationTime) {
                // Client-side date formatting
                setMemberSince(format(new Date(user.metadata.creationTime), 'PPP'));
            }

            getUserBookings(user.uid)
                .then(userBookings => {
                    // Client-side date formatting
                    const formatted = userBookings.map(b => ({
                        ...b,
                        formattedDate: `${format(new Date(b.date), 'PPP')} at ${b.time}`
                    }));
                    setBookings(formatted);
                    setLoadingBookings(false);
                })
                .catch(err => {
                    console.error("Failed to fetch bookings", err);
                    setLoadingBookings(false);
                });
        } else if (!authLoading) {
            setLoadingBookings(false);
        }
    }, [user, authLoading]);

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    if (!user) {
        return (
             <div className="container mx-auto max-w-4xl px-4 py-12 text-center">
                <h1 className="text-2xl font-bold">Please log in to view your profile.</h1>
            </div>
        )
    }

    const getStatusVariant = (status: Booking['status']) => {
        switch (status) {
            case 'Confirmed': return 'default';
            case 'Completed': return 'secondary';
            case 'Cancelled': return 'destructive';
            case 'Pending':
            default:
                return 'outline';
        }
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <div className="flex flex-col items-center md:flex-row md:items-start gap-8 mb-12">
                <Avatar className="h-32 w-32 border-4 border-primary">
                    <AvatarImage src={user.photoURL || `https://i.pravatar.cc/128?u=${user.uid}`} alt={user.displayName || 'User'} />
                    <AvatarFallback className="text-4xl">{user.displayName ? user.displayName.substring(0,2).toUpperCase() : user.email?.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left flex-1">
                    <h1 className="font-headline text-4xl font-bold text-primary">{user.displayName || 'TeeReserve User'}</h1>
                    <p className="text-muted-foreground mt-1">{user.email}</p>
                    {memberSince && <p className="text-muted-foreground text-sm mt-2">Member since {memberSince}</p>}
                    <Button variant="outline" size="sm" className="mt-4">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                    </Button>
                </div>
            </div>

            <Separator />

            <div id="bookings" className="mt-12">
                 <h2 className="font-headline text-3xl font-bold text-primary mb-6">My Bookings</h2>
                 <div className="space-y-4">
                    {loadingBookings ? (
                        <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    ) : bookings.length > 0 ? (
                        bookings.map(booking => (
                            <Card key={booking.id}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-lg">{booking.courseName}</p>
                                        <p className="text-sm text-muted-foreground">{booking.formattedDate}</p>
                                    </div>
                                     <div className="text-right">
                                        <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                                        <Button variant="link" size="sm" className="mt-1">View Details</Button>
                                     </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground">You have no upcoming bookings.</p>
                    )}
                 </div>
            </div>
        </div>
    )
}
