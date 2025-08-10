
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllReviews } from "@/lib/data";
import { assistReviewModeration } from "@/ai/flows/assist-review-moderation";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { ReviewActions } from "./ReviewActions";
import { StarRating } from "@/components/StarRating";
import { format } from "date-fns";
import { useEffect, useState } from "react";

function ReviewCard({ review }: { review: any }) {
    const [moderationResult, setModerationResult] = useState<{ isSpam: boolean; isToxic: boolean; reason: string; } | null>(null);
    const [formattedDate, setFormattedDate] = useState('');

    useEffect(() => {
        assistReviewModeration({ reviewText: review.text }).then(setModerationResult);
        if (review.createdAt) {
            setFormattedDate(format(new Date(review.createdAt), "PPP"));
        }
    }, [review.text, review.createdAt]);

    const isFlagged = moderationResult && (moderationResult.isSpam || moderationResult.isToxic);

    const getStatusVariant = (status: boolean | null) => {
        if (status === true) return 'default';
        if (status === false) return 'destructive';
        return 'secondary';
    }
    const getStatusText = (status: boolean | null) => {
        if (status === true) return 'Approved';
        if (status === false) return 'Rejected';
        return 'Pending';
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{review.courseName}</CardTitle>
                        <CardDescription>
                            Review by {review.userName} on {formattedDate}
                        </CardDescription>
                    </div>
                     <Badge variant={getStatusVariant(review.approved)}>{getStatusText(review.approved)}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <StarRating rating={review.rating} className="mb-2" />
                <p className="text-muted-foreground mb-4">{review.text}</p>

                {isFlagged && moderationResult && (
                     <div className="bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 rounded-lg p-3 mb-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 mt-0.5 text-yellow-500" />
                        <div>
                           <p className="font-bold">AI Flagged this Review</p>
                           <p>{moderationResult.reason}</p>
                        </div>
                    </div>
                )}
                
                {review.approved === null && (
                   <div className="flex justify-end gap-2">
                       <ReviewActions review={review} />
                   </div>
                )}
            </CardContent>
        </Card>
    )
}


export default function ReviewsAdminPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    
    useEffect(() => {
        getAllReviews().then(setReviews);
    }, []);

    const pendingReviews = reviews.filter(r => r.approved === null);
    const decidedReviews = reviews.filter(r => r.approved !== null);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                 <h1 className="text-3xl font-bold font-headline text-primary">Moderate Reviews</h1>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Pending Reviews ({pendingReviews.length})</h2>
                    <div className="space-y-4">
                        {pendingReviews.length > 0 ? (
                            pendingReviews.map(review => <ReviewCard key={review.id} review={review} />)
                        ) : (
                            <p className="text-muted-foreground">No pending reviews.</p>
                        )}
                    </div>
                </div>
                 <div>
                    <h2 className="text-2xl font-bold mb-4">Decided Reviews ({decidedReviews.length})</h2>
                    <div className="space-y-4">
                         {decidedReviews.length > 0 ? (
                            decidedReviews.map(review => <ReviewCard key={review.id} review={review} />)
                        ) : (
                             <p className="text-muted-foreground">No decided reviews yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
