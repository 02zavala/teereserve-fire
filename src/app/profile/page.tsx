import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Edit } from "lucide-react";

export default function ProfilePage() {
    const user = {
        name: "John Doe",
        email: "john.doe@example.com",
        handicap: "12",
        memberSince: "2023-05-15"
    }
    const bookings = [
        { id: '1', course: 'Solmar Golf Links', date: '2024-08-15', status: 'Confirmed' },
        { id: '2', course: 'Palmilla Golf Club', date: '2024-07-22', status: 'Completed' },
    ]

    return (
        <div className="container mx-auto max-w-4xl px-4 py-12">
            <div className="flex flex-col items-center md:flex-row md:items-start gap-8 mb-12">
                <Avatar className="h-32 w-32 border-4 border-primary">
                    <AvatarImage src={`https://i.pravatar.cc/128?u=${user.name}`} alt={user.name} />
                    <AvatarFallback className="text-4xl">{user.name.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left flex-1">
                    <h1 className="font-headline text-4xl font-bold text-primary">{user.name}</h1>
                    <p className="text-muted-foreground mt-1">{user.email}</p>
                    <p className="text-muted-foreground">Handicap: {user.handicap}</p>
                    <p className="text-muted-foreground text-sm mt-2">Member since {new Date(user.memberSince).toLocaleDateString()}</p>
                    <Button variant="outline" size="sm" className="mt-4">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                    </Button>
                </div>
            </div>

            <Separator />

            <div id="bookings" className="mt-12">
                 <h2 className="font-headline text-3xl font-bold text-primary mb-6">My Bookings</h2>
                 <div className="space-y-4">
                    {bookings.map(booking => (
                        <Card key={booking.id}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-lg">{booking.course}</p>
                                    <p className="text-sm text-muted-foreground">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                 <div className="text-right">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${booking.status === 'Confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{booking.status}</span>
                                    <Button variant="link" size="sm" className="mt-1">View Details</Button>
                                 </div>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            </div>
        </div>
    )
}
