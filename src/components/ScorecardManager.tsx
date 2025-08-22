
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from 'firebase/auth';
import type { Scorecard, ScorecardInput } from '@/types';
import { addUserScorecard, getUserScorecards, deleteUserScorecard } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2, Calendar, Trophy } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePathname } from 'next/navigation';
import type { Locale } from '@/i18n-config';
import { dateLocales } from '@/lib/date-utils';


interface ScorecardManagerProps {
    user: User;
}

const formSchema = z.object({
    courseName: z.string().min(3, "Course name is required."),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
    score: z.coerce.number().min(1, "Score must be a positive number."),
    notes: z.string().optional(),
});

type ScorecardFormValues = z.infer<typeof formSchema>;

function ScorecardItem({ scorecard, onDelete, lang }: { scorecard: Scorecard, onDelete: (id: string) => Promise<void>, lang: Locale }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [formattedDate, setFormattedDate] = useState<string | null>(null);

    useEffect(() => {
        try {
            setFormattedDate(format(parseISO(scorecard.date), 'PPP', { locale: dateLocales[lang] }));
        } catch (e) {
            console.error("Invalid date for scorecard:", scorecard.id, scorecard.date);
            setFormattedDate("Invalid Date");
        }
    }, [scorecard.date, scorecard.id, lang]);

    const handleDelete = async () => {
        setIsDeleting(true);
        await onDelete(scorecard.id);
    };
    
    return (
         <Card>
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="font-bold text-lg">{scorecard.courseName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                       <Calendar className="h-4 w-4" /> {formattedDate !== null ? formattedDate : <Skeleton className="h-4 w-24 inline-block" />}
                    </p>
                    {scorecard.notes && <p className="text-xs italic text-muted-foreground mt-1">"{scorecard.notes}"</p>}
                </div>
                <div className="text-right flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-primary" />
                        <span className="text-3xl font-bold text-accent">{scorecard.score}</span>
                    </div>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your scorecard.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                                    Yes, delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    )
}

export function ScorecardManager({ user }: ScorecardManagerProps) {
    const [scorecards, setScorecards] = useState<Scorecard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();
    const pathname = usePathname();
    const lang = (pathname.split('/')[1] || 'en') as Locale;

    const form = useForm<ScorecardFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            courseName: "",
            date: undefined,
            score: undefined,
            notes: "",
        },
    });

    useEffect(() => {
      setIsClient(true);
      form.setValue('date', format(new Date(), 'yyyy-MM-dd'));
    }, [form]);
    
    const fetchScorecards = async () => {
        try {
            const fetchedScorecards = await getUserScorecards(user.uid);
            setScorecards(fetchedScorecards);
        } catch (error) {
            console.error("Failed to fetch scorecards:", error);
            toast({ title: "Error", description: "Could not load scorecards.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.uid) {
            fetchScorecards();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.uid]);

    const onSubmit = async (values: ScorecardFormValues) => {
        try {
            const input: ScorecardInput = {
                userId: user.uid,
                ...values
            };
            await addUserScorecard(input);
            toast({ title: "Scorecard Added!", description: "Your new score has been saved." });
            form.reset({
                 courseName: "",
                 date: format(new Date(), 'yyyy-MM-dd'),
                 score: undefined,
                 notes: "",
            });
            await fetchScorecards();
        } catch (error) {
             console.error("Failed to add scorecard:", error);
             toast({ title: "Error", description: "Could not save scorecard.", variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteUserScorecard(user.uid, id);
            toast({ title: "Scorecard Deleted", description: "The scorecard has been removed." });
            setScorecards(prev => prev.filter(sc => sc.id !== id));
        } catch (error) {
             console.error("Failed to delete scorecard:", error);
             toast({ title: "Error", description: "Could not delete scorecard.", variant: "destructive" });
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PlusCircle className="h-5 w-5" /> Add New Scorecard
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="courseName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Course Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Solmar Golf Links" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date Played</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} disabled={!isClient} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="score"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Final Score</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 85" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Any memorable shots or conditions?" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Scorecard
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2 space-y-4">
                 {isLoading ? (
                    [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
                ) : scorecards.length > 0 ? (
                    scorecards.map(sc => <ScorecardItem key={sc.id} scorecard={sc} onDelete={handleDelete} lang={lang} />)
                ) : (
                    <p className="text-center text-muted-foreground pt-16">You haven't added any scorecards yet.</p>
                )}
            </div>
        </div>
    );
}
