"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { MapPin, Calendar as CalendarIcon, Users, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getCourseLocations } from "@/lib/data"
import { useEffect, useState } from "react"

const formSchema = z.object({
  location: z.string().min(1, "Location is required"),
  date: z.date({
    required_error: "A date is required.",
  }),
  players: z.string().min(1, "Number of players is required"),
  time: z.string().optional(),
})

export function CourseSearchForm() {
    const router = useRouter()
    const [locations, setLocations] = useState<string[]>([]);
    
    useEffect(() => {
        getCourseLocations().then(setLocations);
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            location: "all",
            date: new Date(),
            players: "2",
            time: "any",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        const params = new URLSearchParams({
            location: values.location,
            date: format(values.date, "yyyy-MM-dd"),
            players: values.players,
        });
        if (values.time) {
            params.set("time", values.time)
        }
        router.push(`/courses?${params.toString()}`)
    }

    return (
        <Card className="bg-card/80 backdrop-blur-sm border-border/60">
            <CardContent className="p-4 md:p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5 lg:gap-2">
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center text-xs text-muted-foreground"><MapPin className="mr-1 h-3 w-3" /> Location</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a location" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="all">All Locations</SelectItem>
                                            {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center text-xs text-muted-foreground"><CalendarIcon className="mr-1 h-3 w-3" /> Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                date < new Date(new Date().setHours(0,0,0,0))
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="players"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center text-xs text-muted-foreground"><Users className="mr-1 h-3 w-3" /> Players</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select players" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {[1, 2, 3, 4].map(p => <SelectItem key={p} value={p.toString()}>{p} Player{p > 1 ? 's' : ''}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center text-xs text-muted-foreground"><Clock className="mr-1 h-3 w-3" /> Time</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Any time" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="any">Any Time</SelectItem>
                                            <SelectItem value="morning">Morning (6am - 12pm)</SelectItem>
                                            <SelectItem value="afternoon">Afternoon (12pm - 5pm)</SelectItem>
                                            <SelectItem value="evening">Evening (5pm - 9pm)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="lg:self-end">
                            <Button type="submit" className="w-full text-base font-bold">Search</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
