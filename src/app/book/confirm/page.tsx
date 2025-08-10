
"use client"

import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Suspense, useEffect, useState } from 'react';
import { getCourseById } from '@/lib/data';
import type { GolfCourse } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, Calendar, Clock, Users, DollarSign, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { createBooking } from '@/lib/data';
import { format } from 'date-fns';

function ConfirmationPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();

    const [course, setCourse] = useState<GolfCourse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBooking, setIsBooking] = useState(false);
    const [formattedDate, setFormattedDate] = useState('');

    const courseId = searchParams.get('courseId');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const players = searchParams.get('players');
    const price = searchParams.get('price');
    const teeTimeId = searchParams.get('teeTimeId');

    useEffect(() => {
        if (!courseId) {
            router.push('/');
            return;
        }
        if (!authLoading && !user) {
            toast({
                title: "Authentication Required",
                description: "You need to be logged in to book a tee time.",
                variant: "destructive"
            });
            router.push(`/login?redirect=/book/confirm?${searchParams.toString()}`);
            return;
        }

        if (date) {
            setFormattedDate(format(new Date(date), "PPP"));
        }

        getCourseById(courseId).then(fetchedCourse => {
            if (fetchedCourse) {
                setCourse(fetchedCourse);
            }
            setIsLoading(false);
        });

    }, [courseId, router, user, authLoading, searchParams, toast, date]);

    const handleConfirmBooking = async () => {
        if (!user || !courseId || !date || !time || !players || !price || !teeTimeId || !course) return;
        setIsBooking(true);
        try {
            // TODO: Integrate payment processing here.
            // For now, we simulate a successful payment and confirm the booking instantly.

            await createBooking({
                userId: user.uid,
                userName: user.displayName || user.email || 'Unknown User',
                courseId,
                courseName: course.name,
                date,
                time,
                players: parseInt(players),
                totalPrice: parseFloat(price),
                status: 'Confirmed', // Booking is confirmed instantly
                teeTimeId,
            });

            toast({
                title: "Booking Confirmed!",
                description: "Your tee time has been successfully booked. You can view it in your profile.",
            });
            router.push('/profile');

        } catch (error) {
            console.error("Failed to create booking:", error);
            toast({
                title: "Booking Failed",
                description: "Could not complete the booking. The tee time may no longer be available.",
                variant: "destructive",
            });
            setIsBooking(false);
        }
    };

    if (isLoading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!course) {
        return <div className="text-center">Course not found.</div>;
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Course
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h1 className="font-headline text-3xl font-bold text-primary mb-4">Confirm Your Booking</h1>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">{course.name}</CardTitle>
                            <CardDescription>{course.location}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                             <div className="flex items-center">
                                <User className="h-4 w-4 mr-3 text-muted-foreground" />
                                <span>Booking for: <span className="font-semibold">{user?.displayName || user?.email}</span></span>
                            </div>
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                                <span>Date: <span className="font-semibold">{formattedDate}</span></span>
                            </div>
                             <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                                <span>Time: <span className="font-semibold">{time}</span></span>
                            </div>
                             <div className="flex items-center">
                                <Users className="h-4 w-4 mr-3 text-muted-foreground" />
                                <span>Players: <span className="font-semibold">{players}</span></span>
                            </div>
                            <div className="flex items-center pt-2 border-t mt-4">
                                <DollarSign className="h-5 w-5 mr-3 text-muted-foreground" />
                                <span className="text-lg">Total Price: <span className="font-bold text-accent">${price}</span></span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full text-lg font-bold" onClick={handleConfirmBooking} disabled={isBooking}>
                                {isBooking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processing...</> : 'Confirm & Book Instantly'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
                <div className="hidden md:block">
                     <Image
                        src={course.imageUrls[0]}
                        alt={course.name}
                        width={800}
                        height={600}
                        className="rounded-lg object-cover aspect-video"
                        data-ai-hint="golf course"
                        />
                </div>
            </div>
        </div>
    );
}

export default function ConfirmationPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <ConfirmationPageContent />
        </Suspense>
    )
}
