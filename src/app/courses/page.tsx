import { getCourses } from '@/lib/data'
import { CourseCard } from '@/components/CourseCard'
import { CourseSearchForm } from '@/components/CourseSearchForm'
import { Suspense } from 'react'

export const metadata = {
  title: 'Find a Course - TeeTime Concierge',
  description: 'Search and book golf courses in Los Cabos.',
}

interface CoursesPageProps {
  searchParams: {
    location?: string
    date?: string
    players?: string
    time?: string
  }
}

export default function CoursesPage({ searchParams }: CoursesPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-headline text-4xl font-bold text-primary mb-4">Find Your Next Round</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Use the filters below to find the perfect tee time for your group.
      </p>
      
      <div className="sticky top-16 z-30 bg-background/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-4 px-4 mb-8 border-b">
         <CourseSearchForm />
      </div>

      <Suspense fallback={<CoursesGridSkeleton />} key={JSON.stringify(searchParams)}>
        <CoursesGrid searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

async function CoursesGrid({ searchParams }: CoursesPageProps) {
  const courses = await getCourses({
    location: searchParams.location,
    date: searchParams.date,
    players: searchParams.players ? parseInt(searchParams.players) : undefined,
  })

  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold">No Courses Found</h2>
        <p className="text-muted-foreground mt-2">
          Try adjusting your search filters to find available courses.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}


function CoursesGridSkeleton() {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <div className="h-56 w-full rounded-xl bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-[250px] bg-muted rounded" />
              <div className="h-4 w-[200px] bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }
