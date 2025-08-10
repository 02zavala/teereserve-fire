
"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { getCourseById } from '@/lib/data';
import type { GolfCourse } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, Calendar, Clock, Users, DollarSign, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { createBooking } from '@/lib/data';
import { format } from 'date-fns';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Locale } from '@/i18n-config';

export default function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading: authLoading } = useAuth();

    const [course, setCourse] = useState<GolfCourse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [formattedDate, setFormattedDate] = useState('');

    const courseId = searchParams.get('courseId');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const players = searchParams.get('players');
    const price = searchParams.get('price');
    const teeTimeId = searchParams.get('teeTimeId');
    
    const lang = (pathname.split('/')[1] || 'en') as Locale;

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
            // Client-side date formatting to prevent hydration mismatch
            setFormattedDate(format(new Date(date), "PPP"));
        }

        getCourseById(courseId).then(fetchedCourse => {
            if (fetchedCourse) {
                setCourse(fetchedCourse);
            }
            setIsLoading(false);
        });

    }, [courseId, router, user, authLoading, searchParams, toast, date]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements || !user || !courseId || !date || !time || !players || !price || !teeTimeId || !course) {
            return;
        }

        setIsProcessing(true);

        const { error: submitError } = await elements.submit();
        if (submitError) {
            setErrorMessage(submitError.message || "An unexpected error occurred.");
            setIsProcessing(false);
            return;
        }

        const clientSecret = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
        );
        
        if (!clientSecret) {
            setIsProcessing(false);
            return;
        }

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
                return_url: `${window.location.origin}/profile`,
            },
            redirect: 'if_required',
        });

        if (error) {
            setErrorMessage(error.message || "An unexpected error occurred during payment.");
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Payment succeeded, now create the booking in the database
            try {
                await createBooking({
                    userId: user.uid,
                    userName: user.displayName || user.email || 'Unknown User',
                    courseId,
                    courseName: course.name,
                    date,
                    time,
                    players: parseInt(players),
                    totalPrice: parseFloat(price),
                    status: 'Confirmed',
                    teeTimeId,
                });

                toast({
                    title: "Booking Confirmed!",
                    description: "Your tee time has been successfully booked. Redirecting to your profile.",
                });
                router.push('/profile');
            } catch (bookingError) {
                 console.error("Failed to create booking after payment:", bookingError);
                 setErrorMessage("Your payment was successful, but we failed to save your booking. Please contact support.");
                 setIsProcessing(false);
            }
        } else {
            setIsProcessing(false);
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

    const paymentElementOptions = {
        layout: "tabs" as const,
        defaultCollapsed: false,
    };

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Course
            </Button>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h1 className="font-headline text-3xl font-bold text-primary mb-4">Confirm & Pay</h1>
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl">{course.name}</CardTitle>
                                <CardDescription>{course.location}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center">
                                        <User className="h-4 w-4 mr-3 text-muted-foreground" />
                                        <span>Booking for: <span className="font-semibold">{user?.displayName || user?.email}</span></span>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                                        <span>Date: <span className="font-semibold">{formattedDate || '...'}</span></span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                                        <span>Time: <span className="font-semibold">{time}</span></span>
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-3 text-muted-foreground" />
                                        <span>Players: <span className="font-semibold">{players}</span></span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t">
                                    <PaymentElement options={paymentElementOptions} />
                                </div>
                                <div className="flex items-center pt-2 border-t mt-4">
                                    <DollarSign className="h-5 w-5 mr-3 text-muted-foreground" />
                                    <span className="text-lg">Total Price: <span className="font-bold text-accent">${price}</span></span>
                                </div>
                                 {errorMessage && <div className="text-destructive text-sm font-medium">{errorMessage}</div>}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full text-lg font-bold" disabled={!stripe || isProcessing}>
                                    {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processing...</> : `Pay $${price} and Confirm`}
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
            </form>
        </div>
    );
}
