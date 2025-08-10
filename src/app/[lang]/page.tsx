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
import { HeroSection } from '@/components/home/HeroSection'
import { HowItWorks } from '@/components/home/HowItWorks'
import { Testimonials } from '@/components/home/Testimonials'

export default async function Home({ params: { lang } }: { params: { lang: Locale }}) {
  const dictionary = await getDictionary(lang)
  const courses = await getCourses({})

  return (
    <>
      <HeroSection dictionary={dictionary.heroSection} lang={lang} />

      <div className="relative bg-background z-10">
          <div className="absolute left-1/2 z-20 w-full max-w-6xl -translate-x-1/2 -translate-y-1/2 px-4">
            <CourseSearchForm dictionary={dictionary.courseSearch} />
          </div>
          <div className="h-24"></div>
      </div>
      
      <HowItWorks dictionary={dictionary.howItWorks} lang={lang} />

      <section className="bg-background py-16 lg:py-24">
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

      <Testimonials dictionary={dictionary.testimonials} />
      
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
