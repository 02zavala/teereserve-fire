
"use client";

import { useState } from 'react';
import type { GolfCourse, Review } from '@/types';
import { StarRating } from './StarRating';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Loader2, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { addReview } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface ReviewSectionProps {
    course: GolfCourse;
}

export function ReviewSection({ course }: ReviewSectionProps) {
    const [reviews, setReviews] = useState<Review[]>(course.reviews);
    
    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length)
        : 0;

    const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => r.rating === star).length;
        return { star, count, percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0 };
    });

    const handleReviewSubmitted = (newReview: Review) => {
        // We don't add it to the list immediately, because it needs moderation.
        // Instead, we could show a thank you message.
    }

    return (
        <div>
            <h2 className="font-headline text-3xl font-semibold text-primary mb-8">Reviews & Ratings</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="flex flex-col items-center justify-center space-y-2 bg-card p-6 rounded-lg">
                    <p className="text-5xl font-bold text-accent">{avgRating.toFixed(1)}</p>
                    <StarRating rating={avgRating} />
                    <p className="text-sm text-muted-foreground">{reviews.length} reviews</p>
                </div>
                <div className="md:col-span-2 space-y-2 bg-card p-6 rounded-lg">
                    {ratingDistribution.map(item => (
                        <div key={item.star} className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground w-12">{item.star} star</span>
                            <Progress value={item.percentage} className="w-full h-2" />
                            <span className="text-sm text-muted-foreground w-8 text-right">{item.count}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {reviews.length > 0 ? reviews.slice(0, 3).map(review => (
                        <Card key={review.id}>
                            <CardContent className="p-6">
                                <div className="flex items-start space-x-4">
                                    <Avatar>
                                        <AvatarImage src={review.user.avatarUrl} alt={review.user.name} />
                                        <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold">{review.user.name}</p>
                                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(review.createdAt))} ago</p>
                                        </div>
                                        <StarRating rating={review.rating} className="my-1" starClassName='h-4 w-4' />
                                        <p className="text-sm text-foreground/80">{review.text}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )) : (
                        <p className="text-muted-foreground text-center py-8">Be the first to review this course!</p>
                    )}
                </div>
                <div className="sticky top-24">
                   <AddReviewForm courseId={course.id} onReviewSubmitted={handleReviewSubmitted} />
                </div>
            </div>
        </div>
    );
}

interface AddReviewFormProps {
    courseId: string;
    onReviewSubmitted: (review: Review) => void;
}

function AddReviewForm({ courseId, onReviewSubmitted }: AddReviewFormProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({ title: "Please log in to leave a review.", variant: "destructive" });
            return;
        }
        if (rating === 0 || reviewText.trim() === "") {
             toast({ title: "Please provide a rating and a review.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            await addReview(courseId, {
                userId: user.uid,
                userName: user.displayName || "Anonymous",
                userAvatar: user.photoURL,
                rating,
                text: reviewText,
            });

            toast({
                title: "Review Submitted!",
                description: "Thank you! Your review is pending moderation."
            });
            setRating(0);
            setReviewText("");
            // Maybe refresh the page or show a thank you message instead of the form
        } catch (error) {
            console.error("Failed to submit review:", error);
            toast({ title: "Submission Failed", description: "Could not submit your review. Please try again.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-primary">Write a Review</CardTitle>
                    <CardDescription>You must be logged in to leave a review.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push('/login')} className="w-full">Log In</Button>
                </CardContent>
             </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary">Write a Review</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div>
                         <Label>Your Rating</Label>
                         <div className="flex items-center gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star 
                                    key={star}
                                    className={`h-8 w-8 cursor-pointer transition-colors ${ (hoverRating || rating) >= star ? 'text-primary fill-primary' : 'text-muted-foreground'}`}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                />
                            ))}
                         </div>
                    </div>
                    <div>
                        <Label htmlFor="review-text">Your Review</Label>
                        <Textarea id="review-text" placeholder="What did you think of the course?" value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Submitting...</> : 'Submit Review'}
                    </Button>
                </CardContent>
            </form>
        </Card>
    )
}
