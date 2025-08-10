
"use client";

import Link from 'next/link'
import Image from 'next/image'
import type { GolfCourse } from '@/types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Star } from 'lucide-react'
import { StarRating } from './StarRating'
import { getDictionary } from '@/lib/get-dictionary'
import { usePathname } from 'next/navigation'
import type { Locale } from '@/i18n-config'

interface CourseCardProps {
  course: GolfCourse,
  dictionary: Awaited<ReturnType<typeof getDictionary>>['courseCard'],
  lang: Locale,
}

export function CourseCard({ course, dictionary, lang }: CourseCardProps) {
  const avgRating = course.reviews.length > 0
    ? course.reviews.reduce((acc, r) => acc + r.rating, 0) / course.reviews.length
    : 0;
    
  const courseUrl = `/${lang}/courses/${course.id}`;

  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
      <CardHeader className="p-0">
        <Link href={courseUrl} className="block">
          <div className="relative h-56 w-full">
            <Image
              src={course.imageUrls[0]}
              alt={`Image of ${course.name}`}
              data-ai-hint="golf course"
              fill
              className="object-cover"
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="mb-2 font-headline text-2xl text-primary">
          <Link href={courseUrl}>{course.name}</Link>
        </CardTitle>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <MapPin className="mr-1.5 h-4 w-4" />
          <span>{course.location}</span>
        </div>
        <div className="flex items-center gap-2">
            <StarRating rating={avgRating} />
            <span className="text-sm text-muted-foreground">({course.reviews.length} {dictionary.reviews})</span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between bg-card p-4">
        <div className="text-lg font-bold">
            {dictionary.from} <span className="text-accent">${course.basePrice}</span>
        </div>
        <Button asChild>
          <Link href={courseUrl}>{dictionary.bookNow}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
