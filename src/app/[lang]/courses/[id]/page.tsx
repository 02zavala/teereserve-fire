
import { getCourseById } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { MapPin, ShieldCheck, Star, Sun, Wind, Droplets } from 'lucide-react';
import { TeeTimePicker } from '@/components/TeeTimePicker';
import { ReviewSection } from '@/components/ReviewSection';
import { Recommendations } from '@/components/Recommendations';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CourseMap } from '@/components/CourseMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/i18n-config';

interface CourseDetailPageProps {
    params: {
        id: string;
        lang: Locale;
    }
}

export async function generateMetadata({ params }: CourseDetailPageProps) {
    const course = await getCourseById(params.id);
    if (!course) {
        return {
            title: 'Course Not Found'
        }
    }
    return {
        title: `${course.name} - TeeReserve`,
        description: course.description.substring(0, 160),
    }
}

function WeatherPlaceholder() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary">Today's Forecast</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-around items-center text-center">
                <div className="flex flex-col items-center gap-1">
                    <Sun className="h-8 w-8 text-yellow-500" />
                    <span className="font-bold text-xl">78°F</span>
                    <span className="text-sm text-muted-foreground">Sunny</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <Wind className="h-8 w-8 text-gray-400" />
                    <span className="font-bold text-xl">12 mph</span>
                    <span className="text-sm text-muted-foreground">Wind</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <Droplets className="h-8 w-8 text-blue-400" />
                    <span className="font-bold text-xl">15%</span>
                    <span className="text-sm text-muted-foreground">Humidity</span>
                </div>
            </CardContent>
        </Card>
    )
}


export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
    const course = await getCourseById(params.id);
    const dictionary = await getDictionary(params.lang);


    if (!course) {
        notFound();
    }

    const avgRating = course.reviews.length > 0
    ? (course.reviews.reduce((acc, r) => acc + r.rating, 0) / course.reviews.length).toFixed(1)
    : 'No reviews';

    return (
        <div className="bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">{course.name}</h1>
                    <div className="mt-2 flex items-center space-x-4 text-muted-foreground">
                        <div className="flex items-center">
                            <MapPin className="h-5 w-5 mr-2" />
                            <span>{course.location}</span>
                        </div>
                        <div className="flex items-center">
                            <Star className="h-5 w-5 mr-2 text-primary" />
                            <span>{avgRating} ({course.reviews.length} reviews)</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (or Main) */}
                    <div className="lg:col-span-2">
                        {/* Image Carousel */}
                        <Carousel className="w-full mb-8 rounded-lg overflow-hidden">
                            <CarouselContent>
                                {course.imageUrls.map((url, index) => (
                                    <CarouselItem key={index}>
                                        <div className="relative aspect-video">
                                            <Image src={url} alt={`${course.name} view ${index + 1}`} data-ai-hint="golf course scene" fill className="object-cover" />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-4" />
                            <CarouselNext className="right-4" />
                        </Carousel>
                        
                        {/* Description & Rules */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="font-headline text-3xl font-semibold text-primary mb-4">About the Course</h2>
                                <p className="text-base text-foreground/80 leading-relaxed">{course.description}</p>
                            </div>
                             <div className="my-8">
                                <h2 className="font-headline text-3xl font-semibold text-primary mb-4">Weather</h2>
                                <WeatherPlaceholder />
                             </div>
                            
                            {/* Map Section */}
                            {course.latLng && (
                                <div className="my-8">
                                    <h2 className="font-headline text-3xl font-semibold text-primary mb-4">Location</h2>
                                    <div className="aspect-video w-full rounded-lg overflow-hidden">
                                        <CourseMap lat={course.latLng.lat} lng={course.latLng.lng} name={course.name} />
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="font-headline text-2xl font-semibold text-primary mb-4 flex items-center"><ShieldCheck className="h-6 w-6 mr-2" /> Course Rules</h3>
                                <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-line">{course.rules || 'Standard golf etiquette and club rules apply.'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24 space-y-8">
                             <TeeTimePicker courseId={course.id} basePrice={course.basePrice} lang={params.lang} />
                        </div>
                    </aside>
                </div>
                
                {/* Reviews Section */}
                <div className="my-12 border-t pt-12">
                    <ReviewSection course={course} />
                </div>

                 {/* Recommendations Section */}
                 <div className="my-12 border-t pt-12">
                    <div className="mb-12 text-center">
                        <h2 className="font-headline text-3xl font-bold text-primary md:text-4xl">You Might Also Like</h2>
                        <p className="mt-2 text-lg text-muted-foreground">Other courses you may enjoy</p>
                    </div>
                    <Suspense fallback={<RecommendationSkeleton />}>
                        <Recommendations courseId={course.id} dictionary={dictionary.courseCard} lang={params.lang} />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}

function RecommendationSkeleton() {
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
  )
}
