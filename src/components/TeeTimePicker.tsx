
"use client"

import { useState, useEffect, useTransition } from "react"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"
import { Calendar as CalendarIcon, Users, Sun, Moon, Zap, Loader2, Send, MessageSquare, CheckCircle, Info, Star, ShieldCheck, Tag } from "lucide-react"
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
import { Separator } from "./ui/separator"

interface TeeTimePickerProps {
    courseId: string
    basePrice: number,
    lang: Locale,
}

const TAX_RATE = 0.16; // 16%

const locales = {
    en: enUS,
    es: es,
}

export function TeeTimePicker({ courseId, basePrice, lang }: TeeTimePickerProps) {
    const [date, setDate] = useState<Date | undefined>();
    const [players, setPlayers] = useState<number>(2)
    const [teeTimes, setTeeTimes] = useState<TeeTime[]>([]);
    const [isPending, startTransition] = useTransition();
    const [isClient, setIsClient] = useState(false);
    const [selectedTeeTime, setSelectedTeeTime] = useState<TeeTime | null>(null);
    const [comments, setComments] = useState("");

    useEffect(() => {
        setIsClient(true);
        // Set date only on the client side to prevent hydration errors.
        if (!date) {
            setDate(new Date());
        }
    }, []);

    useEffect(() => {
        if (!date) return;
        setSelectedTeeTime(null); 
        startTransition(async () => {
            const fetchedTeeTimes = await getTeeTimesForCourse(courseId, date, basePrice);
            setTeeTimes(fetchedTeeTimes);
        });
    }, [courseId, date, basePrice]);
    
    const availableTimes = teeTimes.filter(t => t.status === 'available');
    
    const subtotal = selectedTeeTime ? selectedTeeTime.price * players : 0;
    const taxes = subtotal * TAX_RATE;
    const totalPrice = subtotal + taxes;

    const bookingUrl = selectedTeeTime && date
    ? `/${lang}/book/confirm?courseId=${courseId}&date=${format(date, 'yyyy-MM-dd')}&time=${selectedTeeTime.time}&players=${players}&price=${subtotal.toFixed(2)}&teeTimeId=${selectedTeeTime.id}&comments=${encodeURIComponent(comments)}`
    : '#';

    if (!isClient || !date) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-primary">Book a Tee Time</CardTitle>
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
                <CardTitle className="font-headline text-2xl text-primary">Book a Tee Time</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Date, Players, Times */}
                <div className="space-y-6">
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
                                    >
                                    {date ? format(date, "PPP", { locale: locales[lang] }) : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(d) => d && setDate(d)}
                                        initialFocus
                                        disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                                        locale={locales[lang]}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center"><Users className="mr-2 h-4 w-4" /> Players</label>
                            <Select onValueChange={(val) => setPlayers(parseInt(val))} defaultValue={players.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select players" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 8 }, (_, i) => i + 1).map(p => <SelectItem key={p} value={p.toString()}>{p} Player{p > 1 ? 's' : ''}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-medium mb-2 text-center text-muted-foreground">Select a Tee Time</h4>
                        {isPending ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : availableTimes.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-2">
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
                                        </Button>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No available tee times for this selection.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Booking Summary */}
                <div className={cn("space-y-4 border rounded-lg p-4 bg-card", !selectedTeeTime && "flex items-center justify-center text-center")}>
                   {selectedTeeTime ? (
                    <>
                        <div className="bg-primary/10 border border-primary/20 rounded-md p-3 text-center">
                            <p className="font-bold text-primary">{format(date, 'eeee', { locale: locales[lang] })}</p>
                            <p className="text-sm text-primary/90">{format(date, 'dd MMMM yyyy', { locale: locales[lang] })}</p>
                            <Separator className="my-2 bg-primary/20" />
                            <p className="font-bold text-primary">{selectedTeeTime.time}</p>
                            <p className="text-sm text-primary/90">{players} Players (18 Holes)</p>
                        </div>
                        
                        <div className="text-sm space-y-1">
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Taxes (16%)</span>
                                <span className="font-medium">${taxes.toFixed(2)}</span>
                            </div>
                        </div>

                        <Separator />
                        
                        <div>
                             <h5 className="font-semibold text-xs text-muted-foreground mb-2 flex items-center"><Info className="mr-1.5 h-3 w-3"/>RATE INCLUDES / NOTES</h5>
                             <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                                <li>18 Holes of Golf</li>
                                <li>Shared Golf Cart</li>
                                <li>Access to Practice Facilities</li>
                                <li>All Applicable Taxes</li>
                                <li>Free Cancellation (up to 24h before)</li>
                             </ul>
                        </div>
                        
                         <div className="space-y-2">
                            <Label htmlFor="comments" className="text-xs text-muted-foreground flex items-center">
                                <MessageSquare className="mr-1.5 h-3 w-3"/>
                                Additional Comments (Optional)
                            </Label>
                            <Textarea
                                id="comments"
                                placeholder="e.g., Club rental needed, person with a disability, etc."
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                className="text-xs min-h-[60px]"
                            />
                        </div>

                        <Button asChild size="lg" className="w-full font-bold text-base h-12">
                             <Link href={bookingUrl} className="flex justify-between items-center">
                                <span>Book Now</span>
                                <span className="bg-primary-foreground/20 px-3 py-1 rounded-md text-sm">${totalPrice.toFixed(2)}</span>
                            </Link>
                        </Button>
                        
                        <div className="flex justify-around items-center text-center text-xs text-muted-foreground pt-2">
                             <div className="flex flex-col items-center gap-1">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span>Instant Booking</span>
                            </div>
                             <div className="flex flex-col items-center gap-1">
                                <Star className="h-5 w-5 text-yellow-500" />
                                <span>Trusted Platform</span>
                            </div>
                             <div className="flex flex-col items-center gap-1">
                                <ShieldCheck className="h-5 w-5 text-blue-500" />
                                <span>Secure Payment</span>
                            </div>
                        </div>

                    </>
                   ) : (
                       <div className="text-muted-foreground p-8">
                         <p className="font-semibold">Your booking summary will appear here.</p>
                         <p className="text-sm">Please select an available tee time to continue.</p>
                       </div>
                   )}
                </div>
            </CardContent>
        </Card>
    )
}

    