"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { lookupBookingAction } from '@/app/actions/lookup-booking';
import type { Booking } from '@/types';
import type { Locale } from '@/i18n-config';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BookingResultCard } from './BookingResultCard';

interface BookingLookupClientProps {
  dictionary: any;
  lang: Locale;
}

const formSchema = z.object({
  bookingId: z.string().min(5, 'Booking ID must be at least 5 characters.'),
  lastName: z.string().min(2, 'Last name is required.'),
});

type FormValues = z.infer<typeof formSchema>;

export function BookingLookupClient({ dictionary, lang }: BookingLookupClientProps) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bookingId: '',
      lastName: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);
    setBooking(null);
    const result = await lookupBookingAction(values);
    if (result.success) {
      setBooking(result.data as Booking);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div>
      {!booking ? (
        <Card>
          <CardHeader>
            <CardTitle>{dictionary.form.title}</CardTitle>
            <CardDescription>{dictionary.form.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="bookingId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dictionary.form.bookingIdLabel}</FormLabel>
                      <FormControl>
                        <Input placeholder={dictionary.form.bookingIdPlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dictionary.form.lastNameLabel}</FormLabel>
                      <FormControl>
                        <Input placeholder={dictionary.form.lastNamePlaceholder} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>{dictionary.error.title}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? dictionary.form.submitting : dictionary.form.submit}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <BookingResultCard booking={booking} dictionary={dictionary.result} lang={lang} onReset={() => setBooking(null)} />
      )}
    </div>
  );
}
