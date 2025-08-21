
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useMemo, useCallback } from "react";
import { getUserBookings } from "@/lib/data";
import type { Booking, UserProfile } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileEditor } from "@/components/ProfileEditor";
import { ScorecardManager } from "@/components/ScorecardManager";
import { useRouter, usePathname } from "next/navigation";
import type { Locale } from "@/i18n-config";
import { dateLocales } from "@/lib/date-utils";
import { GamificationSection } from "@/components/GamificationSection";

interface FormattedBooking extends Omit<Booking, 'createdAt' | 'date'> {
    id: string;
    createdAt?: string; 
    date: string | Date;
}

function BookingRow({ booking, lang }: { booking: FormattedBooking, lang: Locale }) {
    const formattedDate = useMemo(() => {
        if (booking.date && booking.time) {
            try {
                const dateObj = typeof booking.date === 'string' ? new Date(booking.date) : booking.date;
                if (!isNaN(dateObj.getTime())) {
                    return `${format(dateObj, 'PPP', { locale: dateLocales[lang] })} at ${booking.time}`;
                }
            } catch (e) {
                console.error("Invalid date format for booking:", booking.id, booking.date);
                return "Invalid Date";
            }
        }
        return "Invalid Date";
    }, [booking.date, booking.time, booking.id, lang]);


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
        <Card>
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="font-bold text-lg">{booking.courseName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formattedDate}
                    </p>
                </div>
                 <div className="text-right">
                    <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
                    <Button variant="link" size="sm" className="mt-1">View Details</Button>
                 </div>
            </CardContent>
        </Card>
    );
}


export default function ProfilePage() {
    const { user, userProfile, loading, refreshUserProfile } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const lang = (pathname.split('/')[1] || 'en') as Locale;


    const [bookings, setBookings] = useState<FormattedBooking[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [memberSince, setMemberSince] = useState<string | null>(null);

    // Effect for redirecting if not logged in
    useEffect(() => {
        if (!loading && !user) {
            router.push(`/${lang}/login`);
        }
    }, [user, loading, router, lang]);

    // Effect for fetching user-specific data
    useEffect(() => {
        if (user) {
            setLoadingBookings(true);
            if (user.metadata.creationTime) {
                try {
                     setMemberSince(format(new Date(user.metadata.creationTime), 'PPP', { locale: dateLocales[lang] }));
                } catch (e) {
                    console.error("Failed to format member since date");
                    setMemberSince(null);
                }
            }

            getUserBookings(user.uid)
                .then(userBookings => {
                    setBookings(userBookings);
                })
                .catch(err => {
                    console.error("Failed to fetch bookings", err);
                })
                .finally(() => {
                    setLoadingBookings(false);
                });
        }
    }, [user, lang]);
    
    const onProfileUpdate = useCallback(() => {
        refreshUserProfile();
    }, [refreshUserProfile]);

    if (loading || !user || !userProfile) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }
    
    const getInitials = () => {
        if (userProfile.displayName) {
            return userProfile.displayName.substring(0, 2).toUpperCase();
        }
        if (user.email) {
            return user.email.substring(0, 2).toUpperCase();
        }
        return 'U';
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <div className="flex flex-col items-center md:flex-row md:items-start gap-8 mb-12">
                <Avatar className="h-32 w-32 border-4 border-primary">
                    <AvatarImage src={userProfile.photoURL || `https://i.pravatar.cc/128?u=${user.uid}`} alt={userProfile.displayName || 'User'} />
                    <AvatarFallback className="text-4xl">{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left flex-1">
                    <h1 className="font-headline text-4xl font-bold text-primary">{userProfile.displayName || user.email || 'TeeReserve User'}</h1>
                    <p className="text-muted-foreground mt-1">{user.email}</p>
                     {userProfile.handicap !== undefined && (
                        <p className="font-semibold text-accent mt-2">Handicap: {userProfile.handicap}</p>
                    )}
                    {memberSince ? (
                       <p className="text-muted-foreground text-sm mt-2">Member since {memberSince}</p>
                    ) : (
                       <Skeleton className="h-4 w-48 mt-2" />
                    )}
                    <ProfileEditor user={user} userProfile={userProfile} onProfileUpdate={onProfileUpdate}>
                        <Button variant="outline" size="sm" className="mt-4">
                            Edit Profile
                        </Button>
                    </ProfileEditor>
                </div>
            </div>

            <Separator />
            
            <div id="gamification" className="mt-12">
                <GamificationSection userProfile={userProfile} />
            </div>

            <div id="bookings" className="mt-12">
                 <h2 className="font-headline text-3xl font-bold text-primary mb-6">My Bookings</h2>
                 <div className="space-y-4">
                    {loadingBookings ? (
                         [...Array(3)].map((_, i) => (
                           <Card key={i}>
                               <CardContent className="p-4 flex items-center justify-between">
                                   <div className="space-y-2">
                                       <Skeleton className="h-5 w-48" />
                                       <Skeleton className="h-4 w-56" />
                                   </div>
                                    <div className="text-right space-y-2">
                                       <Skeleton className="h-6 w-20" />
                                    </div>
                               </CardContent>
                           </Card>
                        ))
                    ) : bookings.length > 0 ? (
                        bookings.map(booking => (
                           <BookingRow key={booking.id} booking={booking} lang={lang} />
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground">You have no upcoming bookings.</p>
                    )}
                 </div>
            </div>

             <Separator className="my-12" />

            <div id="scorecards" className="mt-12">
                 <h2 className="font-headline text-3xl font-bold text-primary mb-6">My Scorecards</h2>
                 <ScorecardManager user={user} />
            </div>
        </div>
    )
}
