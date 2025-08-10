import Image from 'next/image'
import { CourseSearchForm } from '@/components/CourseSearchForm'
import { getCourses } from '@/lib/data'
import { CourseCard } from '@/components/CourseCard'
import { Recommendations } from '@/components/Recommendations'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { getDictionary } from '@/lib/get-dictionary'
import { Locale } from '@/i18n-config'
import { Footer } from '@/components/layout/Footer'

export default async function Home({ params: { lang } }: { params: { lang: Locale }}) {
  const dictionary = await getDictionary(lang)
  const courses = await getCourses({})

  return (
    <>
      <section className="relative h-[50vh] min-h-[400px] w-full">
        <Image
          src="https://placehold.co/1920x1080.png"
          alt="Lush green golf course"
          data-ai-hint="golf course landscape"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-6xl lg:text-7xl">
            TeeReserve
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/90 md:text-xl">
            {dictionary.home.heroSubtitle}
          </p>
        </div>
        <div className="absolute bottom-0 left-1/2 z-20 w-full max-w-6xl -translate-x-1/2 translate-y-1/2 px-4">
          <CourseSearchForm dictionary={dictionary.courseSearch} />
        </div>
      </section>

      <section className="mt-[120px] bg-background py-16 md:mt-[80px] lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-headline text-3xl font-bold text-primary md:text-4xl">{dictionary.home.featuredCoursesTitle}</h2>
            <p className="mt-2 text-lg text-muted-foreground">{dictionary.home.featuredCoursesSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 3).map((course) => (
              <CourseCard key={course.id} course={course} dictionary={dictionary.courseCard} />
            ))}
          </div>
        </div>
      </section>
      
      <section className="bg-card py-16 lg:py-24">
         <div className="container mx-auto px-4">
           <div className="mb-12 text-center">
             <h2 className="font-headline text-3xl font-bold text-primary md:text-4xl">{dictionary.home.recommendationsTitle}</h2>
             <p className="mt-2 text-lg text-muted-foreground">{dictionary.home.recommendationsSubtitle}</p>
           </div>
           <Suspense fallback={<RecommendationSkeleton />}>
             <Recommendations dictionary={dictionary.courseCard} />
           </Suspense>
         </div>
       </section>
       <Footer dictionary={dictionary} />
    </>
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
