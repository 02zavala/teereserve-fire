

"use client"

import { useState, useEffect, useTransition } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Users, Sun, Moon, Zap, Loader2, Send, MessageSquare, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TeeTime } from "@/types"
import { cn } from "@/lib/utils"
import { getTeeTimesForCourse } from "@/lib/data"
import Link from "next/link"
import { Locale } from "@/i18n-config"
import { Skeleton } from "./ui/skeleton"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"

interface TeeTimePickerProps {
    courseId: string
    basePrice: number,
    lang: Locale,
}

export function TeeTimePicker({ courseId, basePrice, lang }: TeeTimePickerProps) {
    const [date, setDate] = useState<Date | undefined>();
    const [players, setPlayers] = useState<number | 'group'>(2)
    const [teeTimes, setTeeTimes] = useState<TeeTime[]>([]);
    const [isPending, startTransition] = useTransition();
    const [isClient, setIsClient] = useState(false);
    const [selectedTeeTime, setSelectedTeeTime] = useState<TeeTime | null>(null);
    const [comments, setComments] = useState("");

    useEffect(() => {
        setIsClient(true);
        if (!date) {
            setDate(new Date());
        }
    }, []);

    useEffect(() => {
        if (!date) return;
        setSelectedTeeTime(null); // Reset selection when date changes
        startTransition(async () => {
            const fetchedTeeTimes = await getTeeTimesForCourse(courseId, date, basePrice);
            setTeeTimes(fetchedTeeTimes);
        });
    }, [courseId, date, basePrice]);
    
    const availableTimes = teeTimes.filter(t => t.status === 'available');
    
    const totalPrice = selectedTeeTime ? selectedTeeTime.price * (players as number) : 0;
    
    const bookingUrl = selectedTeeTime
    ? `/${lang}/book/confirm?courseId=${courseId}&date=${format(date!, 'yyyy-MM-dd')}&time=${selectedTeeTime.time}&players=${players}&price=${totalPrice}&teeTimeId=${selectedTeeTime.id}&comments=${encodeURIComponent(comments)}`
    : '#';

    if (!isClient || !date) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl text-primary">Reservar Tee Time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-3xl text-primary">Reservar Tee Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center"><CalendarIcon className="mr-2 h-4 w-4" /> Date</label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                                disabled={players === 'group'}
                                >
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(d) => d && setDate(d)}
                                    initialFocus
                                    disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center"><Users className="mr-2 h-4 w-4" /> Players</label>
                         <Select onValueChange={(val) => setPlayers(val === 'group' ? 'group' : parseInt(val))} defaultValue={players.toString()}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select players" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 8 }, (_, i) => i + 1).map(p => <SelectItem key={p} value={p.toString()}>{p} Player{p > 1 ? 's' : ''}</SelectItem>)}
                                <SelectItem value="group">8+ Players (Group)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {players === 'group' ? (
                     <div className="text-center py-4 bg-primary/10 rounded-lg">
                        <p className="text-sm text-primary/90 mb-3">For groups of 8+ or tournaments, please contact us.</p>
                        <Button asChild>
                            <Link href={`/${lang}/contact`}>
                               <Send className="mr-2 h-4 w-4" /> Contact Us for Group Booking
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div>
                        {isPending ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : availableTimes.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                                {availableTimes.map(teeTime => {
                                    const isSelected = selectedTeeTime?.id === teeTime.id;
                                    return (
                                        <Button 
                                            key={teeTime.id} 
                                            variant={isSelected ? 'default' : (teeTime.status === 'available' ? 'outline' : 'secondary')} 
                                            className="flex flex-col h-auto"
                                            disabled={teeTime.status !== 'available'}
                                            onClick={() => setSelectedTeeTime(teeTime)}
                                        >
                                            <span className="font-semibold text-base">{teeTime.time}</span>
                                            <span className={cn("text-xs", isSelected ? "text-primary-foreground/80" : "text-muted-foreground")}>
                                                ${teeTime.price * (players as number)}
                                            </span>
                                        </Button>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No available tee times for this period. Please try another selection.
                            </div>
                        )}

                        {selectedTeeTime && (
                            <div className="mt-6 pt-6 border-t animate-in fade-in-50">
                                <div className="space-y-2">
                                    <Label htmlFor="comments" className="flex items-center">
                                        <MessageSquare className="mr-2 h-4 w-4"/>
                                        Additional Comments (Optional)
                                    </Label>
                                    <Textarea
                                        id="comments"
                                        placeholder="e.g., Club rental needed, person with a disability, etc."
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                    />
                                </div>
                                <Button asChild size="lg" className="w-full mt-4 font-bold text-base">
                                     <Link href={bookingUrl}>
                                        <CheckCircle className="mr-2 h-5 w-5" />
                                        Book for ${totalPrice}
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
