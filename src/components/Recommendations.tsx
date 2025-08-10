
"use client";

import { useEffect, useState } from 'react';
import { recommendGolfCourses } from '@/ai/flows/recommend-golf-courses';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { MapPin } from 'lucide-react';
import { getDictionary } from '@/lib/get-dictionary';
import { Locale } from '@/i18n-config';
import { Skeleton } from './ui/skeleton';

interface RecommendationsProps {
  courseId?: string;
  userId?: string;
  dictionary: Awaited<ReturnType<typeof getDictionary>>['courseCard'];
  lang: Locale;
}

interface Recommendation {
    courseId: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    tags: string[];
}

export function Recommendations({ courseId, userId, dictionary, lang }: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        const recommendationInput = {
          userId: userId || 'anonymous-user-123',
          courseId: courseId,
          location: 'Los Cabos',
        };
        const result = await recommendGolfCourses(recommendationInput);
        setRecommendations(result.recommendations || []);
      } catch (err) {
        console.error("Failed to get AI recommendations:", err);
        setError("Could not load recommendations at this time.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [courseId, userId]);
  

  if (loading) {
     return (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[225px] w-full rounded-xl" />
            <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
        ))}
        </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-muted-foreground">
        {error}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No special recommendations available right now.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {recommendations.slice(0, 3).map((rec) => {
        const courseUrl = `/${lang}/courses/${rec.courseId}`;
        return (
          <Card key={rec.courseId} className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
            <CardHeader className="p-0">
              <Link href={courseUrl} className="block">
                <div className="relative h-56 w-full">
                  <Image
                    src={rec.imageUrl}
                    alt={`Image of ${rec.name}`}
                    data-ai-hint="golf course aerial"
                    fill
                    className="object-cover"
                  />
                  {rec.tags && rec.tags.length > 0 && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive" className="bg-accent text-accent-foreground">{rec.tags[0]}</Badge>
                    </div>
                  )}
                </div>
              </Link>
            </CardHeader>
            <CardContent className="flex-grow p-4">
              <CardTitle className="mb-2 font-headline text-2xl text-primary">
                <Link href={courseUrl}>{rec.name}</Link>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{rec.description}</p>
            </CardContent>
            <CardFooter className="flex items-center justify-between bg-card p-4">
              <div className="text-lg font-bold">
                {dictionary.from} <span className="text-accent">${rec.price}</span>
              </div>
              <Button asChild>
                <Link href={courseUrl}>{dictionary.viewTimes}</Link>
              </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  );
}
