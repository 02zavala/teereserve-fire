
import * as React from 'react';
import { getCourses } from '@/lib/data';
import { CourseCard } from '@/components/CourseCard';
import { CourseSearchForm } from '@/components/CourseSearchForm';
import { getDictionary } from '@/lib/get-dictionary';
import { Locale } from '@/i18n-config';
import type { Metadata } from 'next';
import { SecondaryFooter } from '@/components/layout/SecondaryFooter';

interface CoursesPageProps {
    params: { lang: Locale };
    searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: paramsProp, searchParams: searchParamsProp }: CoursesPageProps): Promise<Metadata> {
    const params = await paramsProp;
    await searchParamsProp; // Await searchParams
    const dictionary = await getDictionary(params.lang);
    return {
        title: `${dictionary.coursesPage.title} - TeeReserve`,
        description: dictionary.coursesPage.description,
    };
}

export default async function CoursesPage({ params: paramsProp, searchParams: searchParamsProp }: CoursesPageProps) {
    const params = await paramsProp;
    const searchParams = await searchParamsProp;
    const dictionary = await getDictionary(params.lang);
    const location = typeof searchParams.location === 'string' ? searchParams.location : 'all';

    const courses = await getCourses({ location });

    return (
        <>
            <div className="bg-card">
                <div className="container mx-auto px-4 py-8">
                    <div className="mb-8">
                        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
                            {dictionary.coursesPage.title}
                        </h1>
                        <p className="mt-2 text-lg text-muted-foreground">
                            {dictionary.coursesPage.subtitle}
                        </p>
                    </div>
                    <CourseSearchForm dictionary={dictionary.courseSearch} />
                </div>
            </div>
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {courses.map((course) => (
                        <CourseCard key={course.id} course={course} dictionary={dictionary.courseCard} lang={params.lang} />
                    ))}
                </div>
                {courses.length === 0 && (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-semibold mb-2">{dictionary.coursesPage.noResultsTitle}</h2>
                        <p className="text-muted-foreground">{dictionary.coursesPage.noResultsSubtitle}</p>
                    </div>
                )}
            </div>
            <SecondaryFooter dictionary={dictionary.secondaryFooter} />
        </>
    );
}
