
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { getDictionary } from '@/lib/get-dictionary';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ContactFormProps {
    dictionary: Awaited<ReturnType<typeof getDictionary>>['contactPage']['form'];
}

export function ContactForm({ dictionary }: ContactFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const formSchema = z.object({
        name: z.string().min(2, dictionary.errors.name),
        email: z.string().email(dictionary.errors.email),
        message: z.string().min(10, dictionary.errors.message),
    });
    
    type FormData = z.infer<typeof formSchema>;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            message: "",
        }
    });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        setSubmitStatus('idle');
        try {
            // Here you would typically send the data to an API endpoint
            // e.g., await fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) });
            console.log('Form data:', data);
            
            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 1500));

            setSubmitStatus('success');
            form.reset();
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="border">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary">{dictionary.title}</CardTitle>
                <CardDescription>{dictionary.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{dictionary.nameLabel}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={dictionary.namePlaceholder} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{dictionary.emailLabel}</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder={dictionary.emailPlaceholder} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{dictionary.messageLabel}</FormLabel>
                                    <FormControl>
                                        <Textarea rows={5} placeholder={dictionary.messagePlaceholder} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? dictionary.submitting : dictionary.submit}
                        </Button>
                        {submitStatus === 'success' && (
                            <p className="text-sm font-medium text-green-600">{dictionary.successMessage}</p>
                        )}
                        {submitStatus === 'error' && (
                            <p className="text-sm font-medium text-destructive">{dictionary.errorMessage}</p>
                        )}
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
