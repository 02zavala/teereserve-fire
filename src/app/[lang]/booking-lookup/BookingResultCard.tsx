"use client";

import { useState, useEffect } from 'react';
import type { Booking } from '@/types';
import type { Locale } from '@/i18n-config';
import { format } from 'date-fns';
import { dateLocales } from '@/lib/date-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, DollarSign, ArrowLeft, User, MessageSquare } from 'lucide-react';

interface BookingResultCardProps {
  booking: Booking;
  dictionary: any;
  lang: Locale;
  onReset: () => void;
}

export function BookingResultCard({ booking, dictionary, lang, onReset }: BookingResultCardProps) {
    const [formattedDate, setFormattedDate] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (booking.date) {
            try {
                setFormattedDate(format(new Date(booking.date), "PPP", { locale: dateLocales[lang] }));
            } catch (e) {
                console.error("Invalid date format:", booking.date);
                setFormattedDate("Invalid Date");
            }
        }
    }, [booking.date, lang]);

    const getStatusVariant = (status: Booking['status']) => {
        switch (status) {
            case 'Confirmed': return 'default';
            case 'Completed': return 'secondary';
            case 'Cancelled': return 'destructive';
            case 'Pending':
            default: return 'outline';
        }
    }

  return (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="font-headline text-2xl text-primary">{dictionary.title}</CardTitle>
                    <CardDescription>{dictionary.subtitle} #{booking.id.substring(0, 7)}</CardDescription>
                </div>
                <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h3 className="font-semibold text-lg">{booking.courseName}</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2">
                    <div className="flex items-center text-muted-foreground">
                        <User className="h-4 w-4 mr-2" /> Name:
                        <span className="font-medium text-foreground ml-1">{booking.userName}</span>
                    </div>
                     <div className="flex items-center text-muted-foreground">
                        <Users className="h-4 w-4 mr-2" /> Players:
                        <span className="font-medium text-foreground ml-1">{booking.players}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" /> Date:
                        <span className="font-medium text-foreground ml-1">{isClient ? formattedDate : '...'}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" /> Time:
                        <span className="font-medium text-foreground ml-1">{booking.time}</span>
                    </div>
                </div>
            </div>
            {booking.comments && (
                <div className="flex items-start">
                    <MessageSquare className="h-4 w-4 mr-3 mt-1 text-muted-foreground" />
                    <div>
                        <span className="font-semibold text-sm">{dictionary.comments}</span>
                        <p className="text-muted-foreground text-sm italic">"{booking.comments}"</p>
                    </div>
                </div>
            )}
            <Separator />
            <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">{dictionary.total}</span>
                <span className="font-bold text-accent text-2xl">${booking.totalPrice.toFixed(2)}</span>
            </div>
             <Button onClick={onReset} variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {dictionary.backButton}
            </Button>
        </CardContent>
    </Card>
  );
}
