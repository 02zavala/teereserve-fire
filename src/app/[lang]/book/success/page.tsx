
"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, Printer, Share2, Info, User, Calendar, Clock, Users, DollarSign, Flag, Send, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { getCourseById, getBookingById } from '@/lib/data';
import type { GolfCourse, Booking } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import type { Locale } from '@/i18n-config';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';
import { dateLocales } from '@/lib/date-utils';


const TAX_RATE = 0.16;

function SuccessPageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, loading: authLoading } = useAuth();
    
    const [course, setCourse] = useState<GolfCourse | null>(null);
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [totalPrice, setTotalPrice] = useState<string | null>(null);
    const [formattedDate, setFormattedDate] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [isSending, setIsSending] = useState(false);

    const bookingId = searchParams.get('bookingId');
    const courseId = searchParams.get('courseId');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const players = searchParams.get('players');
    const holes = searchParams.get('holes');
    const price = searchParams.get('price'); // This is now subtotal

    const lang = (pathname.split('/')[1] || 'en') as Locale;

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (date && isClient) {
            try {
                setFormattedDate(format(new Date(date), "PPP", { locale: dateLocales[lang] }));
            } catch (e) {
                console.error("Invalid date format:", date);
                setFormattedDate("Invalid Date");
            }
        }
    }, [date, lang, isClient]);

    useEffect(() => {
        const loadBookingData = async () => {
            if (bookingId) {
                // Load booking by ID
                try {
                    const bookingData = await getBookingById(bookingId);
                    if (bookingData) {
                        setBooking(bookingData);
                        setTotalPrice(bookingData.totalPrice.toString());
                        
                        // Load course data
                        const courseData = await getCourseById(bookingData.courseId);
                        setCourse(courseData || null);
                    }
                } catch (error) {
                    console.error('Error loading booking:', error);
                    router.push(`/${lang}/courses`);
                }
            } else if (courseId) {
                // Fallback to URL parameters
                if (price) {
                    const subtotalNum = parseFloat(price);
                    const total = subtotalNum * (1 + TAX_RATE);
                    setTotalPrice(total.toFixed(2));
                }

                try {
                    const courseData = await getCourseById(courseId);
                    setCourse(courseData || null);
                } catch (error) {
                    console.error('Error loading course:', error);
                }
            } else {
                router.push(`/${lang}/courses`);
                return;
            }
            
            setLoading(false);
        };

        loadBookingData();
    }, [bookingId, courseId, router, lang, price]);
    
    const handlePrint = () => window.print();

    const getShareMessage = () => {
        const confirmationText = booking?.confirmationNumber ? `\nConfirmation #: ${booking.confirmationNumber}` : '';
        const courseName = booking?.courseName || course?.name;
        const bookingDate = booking?.date ? format(new Date(booking.date), "PPP", { locale: dateLocales[lang] }) : formattedDate;
        const bookingTime = booking?.time || time;
        const bookingPlayers = booking?.players || players;
        const bookingHoles = booking?.holes || holes || '18';
        
        const message = `Booking Confirmation:${confirmationText}\n\nCourse: ${courseName}\nDate: ${bookingDate}\nTime: ${bookingTime}\nPlayers: ${bookingPlayers}\nHoles: ${bookingHoles}\nTotal: $${totalPrice}\n\nBooked via TeeReserve!`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        if (navigator.share) {
            navigator.share({
                title: 'Golf Booking Confirmation',
                text: message,
                url: window.location.href,
            }).catch(console.error);
        } else {
            window.open(whatsappUrl, '_blank');
        }
    };

    const getEmailMessage = () => {
        const courseName = booking?.courseName || course?.name;
        const confirmationText = booking?.confirmationNumber ? `\nConfirmation Number: ${booking.confirmationNumber}` : '';
        const bookingDate = booking?.date ? format(new Date(booking.date), "PPP", { locale: dateLocales[lang] }) : formattedDate;
        const bookingTime = booking?.time || time;
        const bookingPlayers = booking?.players || players;
        const bookingHoles = booking?.holes || holes || '18';
        
        const subject = `Your Booking Confirmation for ${courseName}`;
        const body = `Hello,\n\nHere are the details of your confirmed booking:${confirmationText}\n\nCourse: ${courseName}\nLocation: ${course?.location}\nDate: ${bookingDate}\nTime: ${bookingTime}\nPlayers: ${bookingPlayers}\nHoles: ${bookingHoles}\nTotal Price: $${totalPrice}\n\nWe look forward to seeing you on the course!\n\nThe TeeReserve Team`;
        return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    const handleSendToEmail = async () => {
        if (!recipientEmail) {
            toast({
                title: "Error",
                description: "Por favor ingresa un correo electrónico válido",
                variant: "destructive"
            });
            return;
        }

        setIsSending(true);
        try {
            const response = await fetch('/api/send-booking-receipt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipientEmail,
                    bookingDetails: {
                        confirmationNumber: booking?.confirmationNumber,
                        courseName: booking?.courseName || course?.name,
                        courseLocation: course?.location,
                        date: booking?.date ? format(new Date(booking.date), "PPP", { locale: dateLocales[lang] }) : formattedDate,
                        time: booking?.time || time,
                        players: booking?.players || players,
                        holes: booking?.holes || holes || '18',
                        totalPrice,
                        userName: booking?.userName || user?.displayName || 'Cliente'
                    }
                })
            });

            if (response.ok) {
                toast({
                    title: "¡Enviado!",
                    description: `Comprobante enviado exitosamente a ${recipientEmail}`,
                });
                setIsEmailDialogOpen(false);
                setRecipientEmail('');
            } else {
                throw new Error('Error al enviar el correo');
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo enviar el comprobante. Inténtalo de nuevo.",
                variant: "destructive"
            });
        } finally {
            setIsSending(false);
        }
    };

    if (loading || authLoading) {
         return (
            <div className="container mx-auto max-w-4xl px-4 py-12 space-y-8">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    return (
        <div className="bg-muted/40">
            <div className="container mx-auto max-w-4xl px-4 py-12">
                <div className="flex flex-col items-center text-center mb-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h1 className="text-3xl font-bold font-headline text-primary">Booking Confirmed!</h1>
                    <p className="text-muted-foreground max-w-2xl">Your tee time is set. You can find all the details below. A confirmation has also been sent to your email.</p>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-semibold">{booking?.userName || user?.displayName || 'N/A'}</p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-semibold">{booking?.userEmail || user?.email}</p>
                            </div>
                             <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="font-semibold">{booking?.userPhone || user?.phoneNumber || 'Not provided'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <Button variant="default" onClick={handlePrint} className="bg-green-700 hover:bg-green-800"><Printer className="mr-2 h-4 w-4"/> Print Receipt</Button>
                        <Button variant="outline" asChild><a href={getEmailMessage()}><Mail className="mr-2 h-4 w-4"/> Send by Email</a></Button>
                        <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline"><Send className="mr-2 h-4 w-4"/> Send to Another Email</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Enviar comprobante a otro correo</DialogTitle>
                                    <DialogDescription>
                                        Ingresa el correo electrónico donde quieres enviar el comprobante de reserva.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="email" className="text-right">
                                            Correo
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="ejemplo@correo.com"
                                            value={recipientEmail}
                                            onChange={(e) => setRecipientEmail(e.target.value)}
                                            className="col-span-3"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => setIsEmailDialogOpen(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button 
                                        type="button" 
                                        onClick={handleSendToEmail}
                                        disabled={isSending}
                                    >
                                        {isSending ? 'Enviando...' : 'Enviar'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button variant="outline" onClick={getShareMessage}><Share2 className="mr-2 h-4 w-4"/> Share</Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Details</CardTitle>
                            {booking?.confirmationNumber && (
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-primary" />
                                    <span className="text-sm text-muted-foreground">Confirmation #:</span>
                                    <span className="font-mono font-semibold text-primary">{booking.confirmationNumber}</span>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent>
                             <h3 className="font-semibold text-lg">{booking?.courseName || course?.name}</h3>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2">
                                <div className="flex items-center text-muted-foreground">
                                     <Calendar className="h-4 w-4 mr-2" /> Date: 
                                     <span className="font-medium text-foreground ml-1">
                                       {isClient && (booking?.date || formattedDate) ? 
                                         (booking?.date ? format(new Date(booking.date), "PPP", { locale: dateLocales[lang] }) : formattedDate) : 
                                         <Skeleton className="h-4 w-24 inline-block" />
                                       }
                                     </span>
                                 </div>
                                <div className="flex items-center text-muted-foreground"><Clock className="h-4 w-4 mr-2" /> Time: <span className="font-medium text-foreground ml-1">{booking?.time || time}</span></div>
                                <div className="flex items-center text-muted-foreground"><Users className="h-4 w-4 mr-2" /> Players: <span className="font-medium text-foreground ml-1">{booking?.players || players}</span></div>
                                <div className="flex items-center text-muted-foreground"><Flag className="h-4 w-4 mr-2" /> Holes: <span className="font-medium text-foreground ml-1">{booking?.holes || holes || '18'}</span></div>
                                <div className="flex items-center text-muted-foreground"><DollarSign className="h-4 w-4 mr-2" /> Total: <span className="font-medium text-foreground ml-1">${totalPrice}</span></div>
                            </div>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle>Confirmations Sent</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                           <div className="flex items-center text-green-600">
                                <CheckCircle className="h-5 w-5 mr-3" />
                                <p>Confirmation sent by email to <span className="font-semibold">{user?.email}</span></p>
                           </div>
                           <div className="flex items-center text-green-600">
                                <CheckCircle className="h-5 w-5 mr-3" />
                                <p>PDF receipt generated and sent</p>
                           </div>
                           <div className="flex items-center text-green-600">
                                <CheckCircle className="h-5 w-5 mr-3" />
                                <p>Confirmation sent by WhatsApp to your number</p>
                           </div>
                        </CardContent>
                    </Card>

                    <Card>
                         <CardHeader>
                            <CardTitle className="flex items-center"><Info className="h-5 w-5 mr-2 text-primary"/> Important Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                                <li>Arrive at the course 30 minutes before your tee time.</li>
                                <li>Present this receipt or your ID at the reception.</li>
                                <li>For changes or cancellations, contact the course directly.</li>
                                <li>Review the course policies on dress code and equipment.</li>
                                <li>In case of bad weather, the course will contact you to reschedule.</li>
                            </ul>
                        </CardContent>
                    </Card>
                    
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-center pt-4">
                         <Button asChild>
                            <Link href={`/${lang}/booking-lookup`}>
                            <User className="mr-2 h-4 w-4" /> View All My Bookings
                            </Link>
                        </Button>
                         <Button variant="ghost" asChild>
                            <Link href={`/${lang}/courses`}>
                            Explore More Courses
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Skeleton className="h-96 w-full max-w-3xl" /></div>}>
            <SuccessPageContent />
        </Suspense>
    );
}
