
"use client"

import { useState, useEffect, useTransition } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Users, Sun, Moon, Zap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TeeTime } from "@/types"
import { cn } from "@/lib/utils"
import { getTeeTimesForCourse } from "@/lib/data"
import Link from "next/link"

interface TeeTimePickerProps {
    courseId: string
    basePrice: number
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export function TeeTimePicker({ courseId, basePrice }: TeeTimePickerProps) {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [players, setPlayers] = useState(2)
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning')
    const [teeTimes, setTeeTimes] = useState<TeeTime[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        // Set initial date on client to avoid hydration mismatch
        setDate(new Date());
    }, []);

    useEffect(() => {
        if (!date) return;
        startTransition(async () => {
            const fetchedTeeTimes = await getTeeTimesForCourse(courseId, date, basePrice);
            setTeeTimes(fetchedTeeTimes);
        });
    }, [courseId, date, basePrice]);

    const filterTeeTimes = (times: TeeTime[], selectedTimeOfDay: TimeOfDay): TeeTime[] => {
        return times.filter(t => {
            const hour = parseInt(t.time.split(':')[0], 10);
            if (selectedTimeOfDay === 'morning' && hour >= 6 && hour < 12) return true;
            if (selectedTimeOfDay === 'afternoon' && hour >= 12 && hour < 17) return true;
            if (selectedTimeOfDay === 'evening' && hour >= 17 && hour < 21) return true;
            return false;
        });
    }
    
    const availableTimes = filterTeeTimes(teeTimes, timeOfDay);

    if (!date) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-3xl text-primary">Book Your Round</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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
                <CardTitle className="font-headline text-3xl text-primary">Book Your Round</CardTitle>
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
                    <div className="mb-4 flex justify-around rounded-md bg-muted p-1">
                        {(['morning', 'afternoon', 'evening'] as TimeOfDay[]).map(tod => (
                             <Button
                             key={tod}
                             variant={timeOfDay === tod ? "default" : "ghost"}
                             className="flex-1 capitalize"
                             onClick={() => setTimeOfDay(tod)}
                             >
                                 {tod === 'morning' && <Sun className="mr-2 h-4 w-4"/>}
                                 {tod === 'afternoon' && <Zap className="mr-2 h-4 w-4"/>}
                                 {tod === 'evening' && <Moon className="mr-2 h-4 w-4"/>}
                                 {tod}
                             </Button>
                        ))}
                    </div>
                    {isPending ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : availableTimes.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                            {availableTimes.map(teeTime => {
                                const totalPrice = teeTime.price * players;
                                const bookingUrl = `/book/confirm?courseId=${courseId}&date=${format(date, 'yyyy-MM-dd')}&time=${teeTime.time}&players=${players}&price=${totalPrice}&teeTimeId=${teeTime.id}`;
                                return (
                                    <Button key={teeTime.id} variant={teeTime.status === 'available' ? 'outline' : 'secondary'} className="flex flex-col h-auto" asChild disabled={teeTime.status !== 'available'}>
                                        <Link href={bookingUrl}>
                                            <span className="font-semibold text-base">{teeTime.time}</span>
                                            <span className="text-xs text-muted-foreground">${totalPrice}</span>
                                        </Link>
                                    </Button>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No available tee times for this period. Please try another selection.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
