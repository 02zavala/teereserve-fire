"use client"

import { useState } from "react"
import { format, addDays } from "date-fns"
import { Calendar as CalendarIcon, Users, Clock, Sun, Moon, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GolfCourse, TeeTime } from "@/types"
import { cn } from "@/lib/utils"

interface TeeTimePickerProps {
    course: GolfCourse
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export function TeeTimePicker({ course }: TeeTimePickerProps) {
    const [date, setDate] = useState<Date>(new Date())
    const [players, setPlayers] = useState(2)
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning')

    const filterTeeTimes = (times: TeeTime[], selectedTimeOfDay: TimeOfDay): TeeTime[] => {
        return times.filter(t => {
            const hour = parseInt(t.time.split(':')[0], 10);
            if (selectedTimeOfDay === 'morning' && hour >= 6 && hour < 12) return true;
            if (selectedTimeOfDay === 'afternoon' && hour >= 12 && hour < 17) return true;
            if (selectedTimeOfDay === 'evening' && hour >= 17 && hour < 21) return true;
            return false;
        }).filter(t => t.status === 'available');
    }
    
    const availableTimes = filterTeeTimes(course.teeTimes, timeOfDay);

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
                                {[1, 2, 3, 4].map(p => <SelectItem key={p} value={p.toString()}>{p} Player{p > 1 ? 's' : ''}</SelectItem>)}
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
                    {availableTimes.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                            {availableTimes.map(teeTime => (
                                <Button key={teeTime.time} variant="outline" className="flex flex-col h-auto">
                                    <span className="font-semibold text-base">{teeTime.time}</span>
                                    <span className="text-xs text-muted-foreground">${teeTime.price * players}</span>
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No available tee times for this period. Please try another selection.
                        </div>
                    )}
                </div>

                 <Button className="w-full text-lg font-bold py-6" size="lg">
                    Proceed to Book
                </Button>
            </CardContent>
        </Card>
    )
}
