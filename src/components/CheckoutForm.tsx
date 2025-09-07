
"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useMemo, useTransition } from 'react';
import { useStableNavigation, useValidatedNavigation } from '@/hooks/useStableNavigation';
import { useFetchWithAbort } from '@/hooks/useFetchWithAbort';
import Link from 'next/link';
import { getCourseById, validateCoupon, getGuestBookingDraft } from '@/lib/data';
import type { GolfCourse, Coupon } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, Calendar, Clock, Users, ArrowLeft, MessageSquare, Lock, TicketPercent, XCircle } from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { normalizeImageUrl } from '@/lib/normalize';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler, commonValidators } from '@/hooks/useErrorHandler';
import { ValidationError } from '@/lib/error-handling';
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
import { SavedPaymentMethods } from './SavedPaymentMethods';
import { usePaymentMethods, SavedPaymentMethod } from '@/hooks/usePaymentMethods';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PayPalButton from '@/components/PayPalButton';
import PaymentMethodSelector, { PaymentMethod } from '@/components/PaymentMethodSelector';
import PaymentTermsCheckbox from '@/components/PaymentTermsCheckbox';
import { useCardValidation } from '@/hooks/useCardValidation';


const TAX_RATE = 0.16; // 16%

export default function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading: authLoading } = useAuth();
    const { go } = useStableNavigation();
    const { fetchWithAbort } = useFetchWithAbort();

    const [course, setCourse] = useState<GolfCourse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [formattedDate, setFormattedDate] = useState<string | null>(null);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [isClient, setIsClient] = useState(false);
    
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [couponMessage, setCouponMessage] = useState<string | null>(null);
    const [isCouponPending, startCouponTransition] = useTransition();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<SavedPaymentMethod | null>(null);
    const [paymentMode, setPaymentMode] = useState<'new' | 'saved'>('new');
    const [savePaymentMethod, setSavePaymentMethod] = useState(false);
    const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentMethod>('stripe');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const { paymentMethods, processPaymentWithSavedMethod } = usePaymentMethods();
    const { validateCard, isValidating } = useCardValidation();
    
    // Guest user form fields
    const [guestInfo, setGuestInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });

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
    const holes = searchParams.get('holes');
    const price = searchParams.get('price'); // This is the subtotal
    const teeTimeId = searchParams.get('teeTimeId');
    const comments = searchParams.get('comments');
    
    // Guest booking parameters
    const clientSecret = searchParams.get('client_secret');
    const draftId = searchParams.get('draft_id');
    
    const lang = (pathname.split('/')[1] || 'en') as Locale;

    const baseSubtotal = useMemo(() => parseFloat(price || '0'), [price]);

    useEffect(() => {
        setIsClient(true);
        // Pre-populate form with user data if available
        if (user) {
            const nameParts = user.displayName?.split(' ') || [];
            setGuestInfo({
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                email: user.email || '',
                phone: ''
            });
        }
    }, [user]);

    // Load guest data from draft when draftId is present
    useEffect(() => {
        const loadGuestDraft = async () => {
            if (draftId && !user) {
                try {
                    const draft = await getGuestBookingDraft(draftId);
                    if (draft && draft.guest) {
                        setGuestInfo({
                            firstName: draft.guest.firstName || '',
                            lastName: draft.guest.lastName || '',
                            email: draft.guest.email || '',
                            phone: draft.guest.phone || ''
                        });
                    }
                } catch (error) {
                    console.error('Error loading guest draft:', error);
                }
            }
        };

        loadGuestDraft();
    }, [draftId, user]);

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
            go('/');
            return;
        }
        // Allow anonymous users (guests) to proceed with checkout
        // The guest booking flow handles authentication separately
        if (!authLoading && !user) {
            // Don't redirect to login - allow guest checkout to proceed
            console.log('Guest user accessing checkout - this is allowed');
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

    }, [courseId, user, authLoading, date, lang, isClient, go]);

    const { handleAsyncError } = useErrorHandler();
    
    const handleApplyCoupon = () => {
        if (!couponCode) {
            setCouponMessage('Please enter a coupon code.');
            return;
        }
        
        if (!commonValidators.isValidCouponCode(couponCode)) {
            setCouponMessage('Invalid coupon code format.');
            return;
        }
        
        setCouponMessage(null);
        startCouponTransition(async () => {
            const result = await handleAsyncError(async () => {
                const coupon = await validateCoupon(couponCode);
                setAppliedCoupon(coupon);
                setCouponMessage('Coupon applied successfully!');
                return coupon;
            }, {
                defaultMessage: 'Failed to apply coupon. Please check the code and try again.',
                onError: (error) => {
                    setAppliedCoupon(null);
                    setCouponMessage(error instanceof Error ? error.message : 'Invalid coupon code.');
                }
            });
        });
    };
    
    const handleRemoveCoupon = () => {
        setCouponCode('');
        setAppliedCoupon(null);
        setCouponMessage(null);
    };

    const handleProceedToPayment = () => {
        if (!termsAccepted) {
            toast({
                title: "Términos requeridos",
                description: "Debes aceptar los términos y condiciones para continuar.",
                variant: "destructive"
            });
            return;
        }
        if (!stripe || !elements) {
            toast({ title: "Payment system not ready. Please wait a moment.", variant: "destructive" });
            return;
        }
        // Set default payment mode based on available saved methods
        setPaymentMode(paymentMethods.length > 0 ? 'saved' : 'new');
        setSelectedPaymentMethod(null);
        setErrorMessage(null);
        setShowPaymentForm(true);
    };

    const handlePayPalSuccess = async (details: any) => {
        setIsProcessing(true);
        setErrorMessage(null);

        try {
            const bookingId = await createBooking({
                userId: user?.uid || 'guest',
                userName: user ? (user.displayName || user.email || 'User') : `${guestInfo.firstName} ${guestInfo.lastName}`,
                userEmail: user?.email || guestInfo.email,
                userPhone: guestInfo.phone || '',
                courseId,
                courseName: course.name,
                date,
                time,
                players: parseInt(players),
                holes: holes ? parseInt(holes) : 18,
                totalPrice: priceDetails.total,
                status: 'Confirmed',
                teeTimeId,
                comments: comments || '',
                couponCode: appliedCoupon?.code || '',
                paymentMethod: 'paypal',
                paymentId: details.id
            }, lang);
            
            const successUrl = new URL(`${window.location.origin}/${lang}/book/success`);
                    searchParams.forEach((value, key) => successUrl.searchParams.append(key, value));
                    successUrl.searchParams.append('bookingId', bookingId);
                    go(successUrl.toString());
        } catch (error) {
            console.error('Error creating booking after PayPal payment:', error);
            setErrorMessage('Error al procesar la reserva. Por favor contacta soporte.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePayPalError = (error: any) => {
        console.error('PayPal payment error:', error);
        setErrorMessage('Error en el pago con PayPal. Por favor inténtalo de nuevo.');
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        if (!termsAccepted) {
            toast({
                title: "Términos requeridos",
                description: "Debes aceptar los términos y condiciones para continuar.",
                variant: "destructive"
            });
            return;
        }

        if (!courseId || !date || !time || !players || !price || !teeTimeId || !course) {
            setErrorMessage('Missing required booking information. Please refresh and try again.');
            return;
        }

        // Validate booking information for all users
        if (!guestInfo.firstName.trim() || !guestInfo.lastName.trim() || !guestInfo.email.trim() || !guestInfo.phone.trim()) {
            setErrorMessage('Please fill in all booking information fields.');
            return;
        }
        
        if (!commonValidators.isValidEmail(guestInfo.email)) {
            setErrorMessage('Please enter a valid email address.');
            return;
        }

        setIsProcessing(true);
        setErrorMessage(null);

        const result = await handleAsyncError(async () => {
            if (paymentMode === 'saved' && selectedPaymentMethod) {
                // Process payment with saved method
                const result = await processPaymentWithSavedMethod(
                    selectedPaymentMethod.id,
                    priceDetails.total,
                    {
                        userId: user?.uid || 'guest',
                        userName: user ? (user.displayName || user.email || 'User') : `${guestInfo.firstName} ${guestInfo.lastName}`,
                        userEmail: user?.email || guestInfo.email,
                        userPhone: guestInfo.phone || '',
                        courseId,
                        courseName: course.name,
                        date,
                        time,
                        players: parseInt(players),
                        holes: holes ? parseInt(holes) : 18,
                        totalPrice: priceDetails.total,
                        status: 'Confirmed',
                        teeTimeId,
                        comments: comments || '',
                        couponCode: appliedCoupon?.code || '',
                    },
                    lang
                );

                if (result.success) {
                    const successUrl = new URL(`${window.location.origin}/${lang}/book/success`);
                    searchParams.forEach((value, key) => successUrl.searchParams.append(key, value));
                    go(successUrl.toString());
                } else {
                    setErrorMessage(result.error || "Payment failed. Please try again.");
                }
            } else {
                // Process payment with new method (existing Stripe flow)
                if (!stripe || !elements) {
                    setErrorMessage("Payment system not ready. Please try again.");
                    setIsProcessing(false);
                    return;
                }

                const { error: submitError } = await elements.submit();
                if (submitError) {
                    setErrorMessage(submitError.message || "An unexpected error occurred.");
                    setIsProcessing(false);
                    return;
                }
                
                // Create a new payment intent for this transaction
                try {
                    const response = await fetchWithAbort('/api/create-payment-intent', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            amount: Math.round(priceDetails.total * 100), // Convert to cents
                            currency: 'usd',
                            setup_future_usage: savePaymentMethod ? 'off_session' : undefined,
                        }),
                    });
                    
                    if (!response.ok) {
                        throw new Error('Failed to create payment intent');
                    }
                    
                    const { clientSecret } = await response.json();
                    
                    if (!clientSecret) {
                        setErrorMessage("Failed to initialize payment. Please try again.");
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
                } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                    // Save payment method if requested with $1 validation charge
                    if (savePaymentMethod && paymentIntent.payment_method) {
                        try {
                            // First validate the card with $1 charge
                            const validationResult = await validateCard(paymentIntent.payment_method as string);
                            
                            if (validationResult.success && validationResult.validated) {
                                // Save the payment method after successful validation
                                await fetch('/api/payment-methods', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        paymentMethodId: paymentIntent.payment_method,
                                    }),
                                });
                                
                                toast({
                                    title: "Tarjeta guardada exitosamente",
                                    description: "Tu tarjeta ha sido validada y guardada para futuros pagos.",
                                });
                            } else {
                                console.warn('Card validation failed, not saving payment method:', validationResult.error);
                                toast({
                                    title: "Advertencia",
                                    description: "El pago fue exitoso pero no se pudo validar la tarjeta para guardarla.",
                                    variant: "destructive"
                                });
                            }
                        } catch (saveError) {
                            console.error('Error validating/saving payment method:', saveError);
                            toast({
                                title: "Advertencia",
                                description: "El pago fue exitoso pero no se pudo guardar la tarjeta.",
                                variant: "destructive"
                            });
                        }
                    }

                    const bookingId = await createBooking({
                        userId: user?.uid || 'guest',
                        userName: user ? (user.displayName || user.email || 'User') : `${guestInfo.firstName} ${guestInfo.lastName}`,
                        userEmail: user?.email || guestInfo.email,
                        userPhone: guestInfo.phone || '',
                        courseId,
                        courseName: course.name,
                        date,
                        time,
                        players: parseInt(players),
                        holes: holes ? parseInt(holes) : 18,
                        totalPrice: priceDetails.total,
                        status: 'Confirmed',
                        teeTimeId,
                        comments: comments || '',
                        couponCode: appliedCoupon?.code || '',
                    }, lang);
                    
                    const successUrl = new URL(`${window.location.origin}/${lang}/book/success`);
                    searchParams.forEach((value, key) => successUrl.searchParams.append(key, value));
                    successUrl.searchParams.append('bookingId', bookingId);
                    go(successUrl.toString());
                }
                } catch (paymentError) {
                    console.error('Error creating or confirming payment:', paymentError);
                    setErrorMessage('Payment failed. Please try again.');
                    setIsProcessing(false);
                }
            }
        }, {
            defaultMessage: 'Payment processing failed. Please try again.',
            onError: (error) => {
                console.error('Payment processing error:', {
                    error,
                    userId: user?.uid,
                    courseId,
                    paymentMode,
                    timestamp: new Date().toISOString()
                });
                setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred.');
            }
        });
        
        setIsProcessing(false);
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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl text-primary">Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-4">
                            <SafeImage
                                src={normalizeImageUrl(course.imageUrls?.[0]) ?? '/images/fallback.svg'}
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
                            <div className="flex items-center"><Calendar className="h-4 w-4 mr-3 text-muted-foreground" /><span>{isClient && formattedDate ? formattedDate : <Skeleton className="h-4 w-24 inline-block" />}</span></div>
                            <div className="flex items-center"><Clock className="h-4 w-4 mr-3 text-muted-foreground" /><span><span className="font-semibold">{time}</span> Tee Time</span></div>
                            {holes && <div className="flex items-center"><Users className="h-4 w-4 mr-3 text-muted-foreground" /><span><span className="font-semibold">{holes}</span> Holes</span></div>}
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

                <Card className="lg:col-span-1">
                    <CardHeader>
                         <CardTitle className="font-headline text-xl">Complete Your Booking</CardTitle>
                         <CardDescription>Confirm your details and proceed to our secure payment portal.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-4">
                            <h4 className="font-semibold text-primary">{user ? 'Booking Information' : 'Guest Information'}</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="guest-firstName">First Name *</Label>
                                    <Input
                                        id="guest-firstName"
                                        placeholder={user?.displayName?.split(' ')[0] || "Enter first name"}
                                        value={guestInfo.firstName}
                                        onChange={(e) => setGuestInfo(prev => ({ ...prev, firstName: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="guest-lastName">Last Name *</Label>
                                    <Input
                                        id="guest-lastName"
                                        placeholder={user?.displayName?.split(' ').slice(1).join(' ') || "Enter last name"}
                                        value={guestInfo.lastName}
                                        onChange={(e) => setGuestInfo(prev => ({ ...prev, lastName: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="guest-email">Email *</Label>
                                <Input
                                    id="guest-email"
                                    type="email"
                                    placeholder={user?.email || "Enter email address"}
                                    value={guestInfo.email}
                                    onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="guest-phone">Phone Number *</Label>
                                <Input
                                    id="guest-phone"
                                    type="tel"
                                    placeholder="Enter phone number"
                                    value={guestInfo.phone}
                                    onChange={(e) => setGuestInfo(prev => ({ ...prev, phone: e.target.value }))}
                                    required
                                />
                            </div>
                            {user && (
                                <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
                                    💡 You can modify your information for this booking. Your account details will remain unchanged.
                                </div>
                            )}
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

                        {/* Payment Terms Checkbox */}
                        <PaymentTermsCheckbox
                            checked={termsAccepted}
                            onCheckedChange={setTermsAccepted}
                            lang={lang}
                            disabled={isProcessing}
                        />
                    </CardContent>
                    <CardFooter>
                        <Button 
                            onClick={handleProceedToPayment} 
                            className="w-full text-lg font-bold h-12"
                            disabled={!termsAccepted || isProcessing}
                        >
                            <Lock className="mr-2 h-5 w-5"/>
                            Proceed to Payment
                        </Button>
                    </CardFooter>
                </Card>


            </div>

            {showPaymentForm && (
                <Card className="lg:col-span-2 mt-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="font-headline text-xl text-primary">Pago Seguro</CardTitle>
                                <CardDescription>
                                    Elige tu método de pago preferido. Tu transacción está protegida y encriptada.
                                </CardDescription>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setShowPaymentForm(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                ← Volver al resumen
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Payment Method Selector */}
                        <PaymentMethodSelector
                            selectedMethod={selectedPaymentType}
                            onMethodChange={setSelectedPaymentType}
                            disabled={isProcessing}
                        />

                        {/* Error Message */}
                        {errorMessage && (
                            <div className="text-destructive text-sm font-medium p-3 bg-destructive/10 rounded-md border border-destructive/20">
                                {errorMessage}
                            </div>
                        )}

                        {/* Stripe Payment */}
                        {selectedPaymentType === 'stripe' && (
                            <div className="space-y-4">
                                <Tabs value={paymentMode} onValueChange={(value) => {
                                    setPaymentMode(value as 'new' | 'saved');
                                    setSelectedPaymentMethod(null);
                                    setErrorMessage(null);
                                }} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        {paymentMethods.length > 0 && (
                                            <TabsTrigger value="saved">Métodos Guardados</TabsTrigger>
                                        )}
                                        <TabsTrigger value="new">
                                            {paymentMethods.length > 0 ? 'Nuevo Método' : 'Detalles de Pago'}
                                        </TabsTrigger>
                                    </TabsList>
                                    
                                    {paymentMethods.length > 0 && (
                                        <TabsContent value="saved" className="space-y-4">
                                            <SavedPaymentMethods
                                                onSelectPaymentMethod={setSelectedPaymentMethod}
                                                selectedPaymentMethodId={selectedPaymentMethod?.id}
                                                showAddButton={false}
                                            />
                                            
                                            <Button 
                                                onClick={handleSubmit} 
                                                className="w-full text-lg font-bold h-12" 
                                                disabled={!selectedPaymentMethod || isProcessing}
                                            >
                                                {isProcessing ? (
                                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Procesando...</>
                                                ) : (
                                                    `Pagar $${priceDetails.total.toFixed(2)} y Confirmar`
                                                )}
                                            </Button>
                                        </TabsContent>
                                    )}
                                    
                                    <TabsContent value="new" className="space-y-4">
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <PaymentElement options={paymentElementOptions} />
                                            
                                            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-md">
                                                <input 
                                                    type="checkbox" 
                                                    id="savePaymentMethod" 
                                                    checked={savePaymentMethod}
                                                    onChange={(e) => setSavePaymentMethod(e.target.checked)}
                                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                                />
                                                <Label htmlFor="savePaymentMethod" className="text-sm font-medium">
                                                    Guardar este método de pago para futuras reservas
                                                    <span className="block text-xs text-muted-foreground mt-1">
                                                        Se realizará un cargo de validación de $1.00 USD
                                                    </span>
                                                </Label>
                                            </div>
                                            
                                            <Button 
                                                type="submit" 
                                                className="w-full text-lg font-bold h-12" 
                                                disabled={!stripe || isProcessing || isValidating}
                                            >
                                                {(isProcessing || isValidating) ? (
                                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> 
                                                    {isValidating ? 'Validando tarjeta...' : 'Procesando...'}</>
                                                ) : (
                                                    `Pagar $${priceDetails.total.toFixed(2)} y Confirmar`
                                                )}
                                            </Button>
                                        </form>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        )}

                        {/* PayPal Payment */}
                        {selectedPaymentType === 'paypal' && (
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-800">Pago con PayPal</span>
                                    </div>
                                    <p className="text-sm text-blue-700">
                                        Serás redirigido a PayPal para completar tu pago de forma segura.
                                    </p>
                                </div>
                                
                                <PayPalButton
                                    amount={priceDetails.total}
                                    currency="USD"
                                    onSuccess={handlePayPalSuccess}
                                    onError={handlePayPalError}
                                    disabled={isProcessing}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
