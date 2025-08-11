
"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, Printer, ExternalLink, User, Calendar, Clock, Users, DollarSign, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { getCourseById } from '@/lib/data';
import type { GolfCourse } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Locale } from '@/i18n-config';

// A simple SVG for WhatsApp to avoid adding a large library for one icon
const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.289.173-1.413z" />
    </svg>
);

function SuccessPageContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [course, setCourse] = useState<GolfCourse | null>(null);
    const [loading, setLoading] = useState(true);
    const [formattedDate, setFormattedDate] = useState<string | null>(null);

    const courseId = searchParams.get('courseId');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const players = searchParams.get('players');
    const price = searchParams.get('price');
    const comments = searchParams.get('comments');

    const lang = (pathname.split('/')[1] || 'en') as Locale;

    useEffect(() => {
        if (!courseId) {
            router.push(`/${lang}/courses`);
            return;
        }

        // Client-side only date formatting
        if (date) {
            setFormattedDate(format(new Date(date), "PPP"));
        }

        getCourseById(courseId).then(data => {
            setCourse(data || null);
            setLoading(false);
        });
    }, [courseId, router, lang, date]);
    
    const handlePrint = () => window.print();

    const getWhatsAppMessage = () => {
        const message = `Booking Confirmation:\n\nCourse: ${course?.name}\nDate: ${formattedDate}\nTime: ${time}\nPlayers: ${players}\nTotal: $${price}\n\nThank you for booking with TeeReserve!`;
        return `https://wa.me/?text=${encodeURIComponent(message)}`;
    };

    const getEmailMessage = () => {
        const subject = `Your Booking Confirmation for ${course?.name}`;
        const body = `Hello,\n\nHere are the details of your confirmed booking:\n\nCourse: ${course?.name}\nLocation: ${course?.location}\nDate: ${formattedDate}\nTime: ${time}\nPlayers: ${players}\nTotal Price: $${price}${comments ? `\n\nAdditional Comments: ${comments}` : ''}\n\nWe look forward to seeing you on the course!\n\nThe TeeReserve Team`;
        return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    return (
        <div className="container mx-auto max-w-3xl px-4 py-12">
            <Card className="border-green-500">
                <CardHeader className="text-center">
                    <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                    <CardTitle className="text-3xl font-bold font-headline text-primary">Booking Confirmed!</CardTitle>
                    <CardDescription>Your tee time is set. A confirmation has been sent to your email.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="border rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold text-lg">{loading ? <Skeleton className="h-6 w-48"/> : course?.name}</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div className="flex items-center text-muted-foreground"><Calendar className="h-4 w-4 mr-2" /> Date: <span className="font-medium text-foreground ml-1">{formattedDate ? formattedDate : <Skeleton className="h-4 w-20 inline-block"/>}</span></div>
                            <div className="flex items-center text-muted-foreground"><Clock className="h-4 w-4 mr-2" /> Time: <span className="font-medium text-foreground ml-1">{time}</span></div>
                            <div className="flex items-center text-muted-foreground"><Users className="h-4 w-4 mr-2" /> Players: <span className="font-medium text-foreground ml-1">{players}</span></div>
                            <div className="flex items-center text-muted-foreground"><DollarSign className="h-4 w-4 mr-2" /> Total: <span className="font-medium text-foreground ml-1">${price}</span></div>
                        </div>
                         {comments && (
                            <div className="pt-2 border-t mt-2">
                                <div className="flex items-start text-sm">
                                    <MessageSquare className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <span className="font-semibold">Additional Comments:</span>
                                        <p className="text-muted-foreground text-xs italic">{comments}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Button variant="outline" asChild><a href={getEmailMessage()}><Mail className="mr-2 h-4 w-4"/> Email Receipt</a></Button>
                        <Button variant="outline" asChild><a href={getWhatsAppMessage()} target="_blank" rel="noopener noreferrer"><WhatsAppIcon /> Send to WhatsApp</a></Button>
                        <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4"/> Print / PDF</Button>
                    </div>

                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-4 text-center">
                     <Button asChild>
                        <Link href={`/${lang}/profile`}>
                           <User className="mr-2 h-4 w-4" /> View All My Bookings
                        </Link>
                    </Button>
                     <Button variant="ghost" asChild>
                        <Link href={`/${lang}/courses`}>
                           Explore More Courses <ExternalLink className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
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

    