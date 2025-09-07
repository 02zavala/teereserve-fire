
export const revalidate = 300;

import * as React from 'react';
import { CourseSearchForm } from '@/components/CourseSearchForm'
import { getCourses } from '@/lib/data'
import { CourseCard } from '@/components/CourseCard'
import { LazyRecommendations, LazyFeaturedReviews } from '@/components/LazyComponents'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { getDictionary } from '@/lib/get-dictionary'
import { Locale } from '@/i18n-config'
import { HowItWorks } from '@/components/home/HowItWorks'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'
import { HeroSection } from '@/components/home/HeroSection'
import { ImagePreloader } from '@/components/ui/smart-preloader'
import LinkComponent from '@/components/LinkComponent'
import { OptimizedImage } from '@/components/ui/optimized-image'

export default async function Home({ params: paramsProp }: { params: Promise<{ lang: Locale }> }) {
  const params = await paramsProp;
  const lang = params.lang;
  const dictionary = await getDictionary(lang)
  const courses = await getCourses({})
  
  // Precargar imágenes críticas de los cursos destacados
  const criticalImages = courses.slice(0, 3).map(course => course.imageUrl).filter(Boolean)

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

      <WhyChooseUs dictionary={dictionary.whyChooseUs} />

      <section className="bg-background py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-headline text-3xl font-bold text-primary md:text-4xl">{dictionary.home.featuredCoursesTitle}</h2>
            <p className="mt-2 text-lg text-muted-foreground">{dictionary.home.featuredCoursesSubtitle}</p>
          </div>
          {/* Precargar imágenes críticas */}
          <ImagePreloader images={criticalImages} />
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 3).map((course, index) => (
              <div key={course.id} className="group">
                <LinkComponent 
                  href={`/${lang}/courses/${course.id}`}
                  className="block"
                >
                  <CourseCard course={course} dictionary={dictionary.courseCard} lang={lang} asLink />
                </LinkComponent>
              </div>
            ))}
          </div>
        </div>
      </section>


      
      <section className="bg-background py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-headline text-3xl font-bold text-primary md:text-4xl">{dictionary.home.featuredReviewsTitle}</h2>
            <p className="mt-2 text-lg text-muted-foreground">{dictionary.home.featuredReviewsSubtitle}</p>
          </div>
          <Suspense fallback={<ReviewsSkeleton />}>
            <LazyFeaturedReviews dictionary={dictionary} lang={lang} />
          </Suspense>
        </div>
      </section>
      
      <section className="bg-card py-16 lg:py-24">
         <div className="container mx-auto px-4">
           <div className="mb-12 text-center">
             <h2 className="font-headline text-3xl font-bold text-primary md:text-4xl">{dictionary.home.recommendationsTitle}</h2>
             <p className="mt-2 text-lg text-muted-foreground">{dictionary.home.recommendationsSubtitle}</p>
           </div>
           <Suspense fallback={<RecommendationSkeleton />}>
             <LazyRecommendations dictionary={dictionary.courseCard} lang={lang} />
           </Suspense>
         </div>
       </section>
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

function ReviewsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
      ))}
    </div>
  )
}
