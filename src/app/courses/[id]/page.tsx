import { getCourseById } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { MapPin, ShieldCheck, Star } from 'lucide-react';
import { TeeTimePicker } from '@/components/TeeTimePicker';
import { ReviewSection } from '@/components/ReviewSection';
import { Recommendations } from '@/components/Recommendations';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface CourseDetailPageProps {
    params: {
        id: string;
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
        title: `${course.name} - TeeTime Concierge`,
        description: course.description.substring(0, 160),
    }
}


export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
    const course = await getCourseById(params.id);

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
                            <div>
                                <h3 className="font-headline text-2xl font-semibold text-primary mb-4 flex items-center"><ShieldCheck className="h-6 w-6 mr-2" /> Course Rules</h3>
                                <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-line">{course.rules}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24 space-y-8">
                             <TeeTimePicker course={course} />
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
                        <Recommendations courseId={course.id} />
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
