
"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import { getCourseById, validateCoupon } from '@/lib/data';
import type { GolfCourse, Coupon } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, Calendar, Clock, Users, ArrowLeft, MessageSquare, Lock, TicketPercent, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { createBooking } from '@/lib/data';
import { format } from 'date-fns';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Locale } from '@/i18n-config';
import { Skeleton } from './ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from './ui/separator';
import { dateLocales } from '@/lib/date-utils';
import { Input } from './ui/input';
import { Label } from './ui/label';

const TAX_RATE = 0.16; // 16%

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
    const [formattedDate, setFormattedDate] = useState<string | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);
    
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [couponMessage, setCouponMessage] = useState<string | null>(null);
    const [isCouponPending, startCouponTransition] = useTransition();

    const [priceDetails, setPriceDetails] = useState({
        subtotal: 0,
        tax: 0,
        total: 0,
        discount: 0,
    });

    const courseId = searchParams.get('courseId');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const players = searchParams.get('players');
    const price = searchParams.get('price'); // This is the subtotal
    const teeTimeId = searchParams.get('teeTimeId');
    const comments = searchParams.get('comments');
    
    const lang = (pathname.split('/')[1] || 'en') as Locale;

    const baseSubtotal = useMemo(() => parseFloat(price || '0'), [price]);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        let discount = 0;
        if (appliedCoupon) {
            if (appliedCoupon.discountType === 'percentage') {
                discount = baseSubtotal * (appliedCoupon.discountValue / 100);
            } else {
                discount = appliedCoupon.discountValue;
            }
        }

        const newSubtotal = Math.max(0, baseSubtotal - discount);
        const taxNum = newSubtotal * TAX_RATE;
        const totalNum = newSubtotal + taxNum;

        setPriceDetails({
            subtotal: baseSubtotal,
            tax: taxNum,
            total: totalNum,
            discount
        });
    }, [baseSubtotal, appliedCoupon]);


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
            router.push(`/${lang}/login?redirect=/book/confirm?${searchParams.toString()}`);
            return;
        }

        if (date && isClient) {
            try {
                setFormattedDate(format(new Date(date), "PPP", { locale: dateLocales[lang] }));
            } catch (e) {
                console.error("Invalid date format:", date);
                setFormattedDate("Invalid Date");
            }
        }

        getCourseById(courseId).then(fetchedCourse => {
            if (fetchedCourse) {
                setCourse(fetchedCourse);
            }
            setIsLoading(false);
        });

    }, [courseId, router, user, authLoading, searchParams, toast, date, lang, price, isClient]);

    const handleApplyCoupon = () => {
        if (!couponCode) return;
        setCouponMessage(null);
        startCouponTransition(async () => {
            try {
                const result = await validateCoupon(couponCode);
                setAppliedCoupon(result);
                setCouponMessage('Coupon applied successfully!');
            } catch (error) {
                setAppliedCoupon(null);
                setCouponMessage(error instanceof Error ? error.message : 'Invalid coupon code.');
            }
        });
    };
    
    const handleRemoveCoupon = () => {
        setCouponCode('');
        setAppliedCoupon(null);
        setCouponMessage(null);
    };

    const handleProceedToPayment = () => {
        if (!stripe || !elements) {
            toast({ title: "Payment system not ready. Please wait a moment.", variant: "destructive" });
            return;
        }
        setIsPaymentModalOpen(true);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements || !user || !courseId || !date || !time || !players || !price || !teeTimeId || !course) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

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
            setErrorMessage("Payment session expired. Please refresh the page.");
            setIsProcessing(false);
            return;
        }

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            clientSecret,
            confirmParams: {
                return_url: `${window.location.origin}/${lang}/book/success`,
            },
            redirect: 'if_required',
        });

        if (error) {
            setErrorMessage(error.message || "An unexpected error occurred during payment.");
            setIsProcessing(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            try {
                await createBooking({
                    userId: user.uid,
                    userName: user.displayName || user.email || 'Unknown User',
                    courseId,
                    courseName: course.name,
                    date,
                    time,
                    players: parseInt(players),
                    totalPrice: priceDetails.total,
                    status: 'Confirmed',
                    teeTimeId,
                    comments: comments || undefined,
                    couponCode: appliedCoupon?.code,
                });
                
                const successUrl = new URL(`${window.location.origin}/${lang}/book/success`);
                searchParams.forEach((value, key) => successUrl.searchParams.append(key, value));
                router.push(successUrl.toString());

            } catch (bookingError) {
                 console.error("Failed to create booking after payment:", bookingError);
                 setErrorMessage("Your payment was successful, but we failed to save your booking. Please contact support immediately.");
                 setIsProcessing(false);
            }
        } else {
            setIsProcessing(false);
        }
    };

    if (isLoading || authLoading) {
        return (
            <div className="container mx-auto max-w-4xl px-4 py-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <Skeleton className="h-96 w-full" />
                     <Skeleton className="h-96 w-full" />
                 </div>
            </div>
        );
    }
    
    if (!course) {
        return <div className="text-center py-12">Course not found.</div>;
    }
    
    const paymentElementOptions = { layout: "tabs" as const };

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Course
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <Card className="sticky top-24">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl text-primary">Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-4">
                            <Image
                                src={course.imageUrls[0]}
                                alt={course.name}
                                fill
                                className="object-cover"
                                data-ai-hint="golf course"
                            />
                        </div>
                        <h3 className="text-xl font-bold">{course.name}</h3>
                        <p className="text-sm text-muted-foreground">{course.location}</p>
                        <Separator />
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center"><User className="h-4 w-4 mr-3 text-muted-foreground" /><span><span className="font-semibold">{players}</span> Player(s)</span></div>
                            <div className="flex items-center"><Calendar className="h-4 w-4 mr-3 text-muted-foreground" /><span>{formattedDate ? formattedDate : <Skeleton className="h-4 w-24 inline-block" />}</span></div>
                            <div className="flex items-center"><Clock className="h-4 w-4 mr-3 text-muted-foreground" /><span><span className="font-semibold">{time}</span> Tee Time</span></div>
                             {comments && (
                                <div className="flex items-start pt-2">
                                    <MessageSquare className="h-4 w-4 mr-3 mt-1 text-muted-foreground" />
                                    <div>
                                        <span className="font-semibold">Comments:</span>
                                        <p className="text-muted-foreground text-xs italic">{comments}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                         <Separator />
                         <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${priceDetails.subtotal.toFixed(2)}</span>
                            </div>
                             {appliedCoupon && (
                                <div className="flex justify-between text-green-600">
                                    <span className="flex items-center gap-1">
                                        <TicketPercent className="h-4 w-4"/> Coupon "{appliedCoupon.code}"
                                    </span>
                                    <span>-${priceDetails.discount.toFixed(2)}</span>
                                </div>
                             )}
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Taxes (16%)</span>
                                <span>${priceDetails.tax.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-card flex justify-between items-center p-6 border-t">
                        <span className="text-lg">Total Price:</span>
                        <span className="text-2xl font-bold text-accent">${priceDetails.total.toFixed(2)}</span>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                         <CardTitle className="font-headline text-2xl">Complete Your Booking</CardTitle>
                         <CardDescription>Confirm your details and proceed to our secure payment portal.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                            <h4 className="font-semibold text-primary">Booking For</h4>
                            <p className="text-sm">{user?.displayName || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>

                         <div>
                            <Label htmlFor="coupon-code">Coupon Code</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Input 
                                    id="coupon-code" 
                                    placeholder="Enter code" 
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    disabled={!!appliedCoupon}
                                />
                                {appliedCoupon ? (
                                    <Button variant="ghost" size="icon" onClick={handleRemoveCoupon}>
                                        <XCircle className="h-5 w-5 text-destructive" />
                                    </Button>
                                ) : (
                                    <Button onClick={handleApplyCoupon} disabled={isCouponPending}>
                                        {isCouponPending ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Apply'}
                                    </Button>
                                )}
                            </div>
                            {couponMessage && (
                                <p className={`mt-2 text-sm ${appliedCoupon ? 'text-green-600' : 'text-destructive'}`}>
                                    {couponMessage}
                                </p>
                            )}
                        </div>

                        <div className="text-xs text-muted-foreground">
                            By clicking the button below, you agree to our <Link href={`/${lang}/terms`} className="underline hover:text-primary">Terms of Service</Link> and the course's cancellation policy.
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleProceedToPayment} className="w-full text-lg font-bold h-12">
                            <Lock className="mr-2 h-5 w-5"/>
                            Proceed to Payment
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="font-headline text-2xl text-primary">Secure Payment</DialogTitle>
                        <DialogDescription>
                            Enter your payment details below. Your transaction is secure and encrypted.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                         <PaymentElement options={paymentElementOptions} />
                         {errorMessage && <div className="text-destructive text-sm font-medium">{errorMessage}</div>}
                         <Button type="submit" className="w-full text-lg font-bold" disabled={!stripe || isProcessing}>
                            {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processing...</> : `Pay $${priceDetails.total.toFixed(2)} and Confirm`}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
