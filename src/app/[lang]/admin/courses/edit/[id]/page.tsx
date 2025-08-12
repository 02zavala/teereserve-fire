
import { CourseForm } from "@/components/admin/CourseForm";
import { TeeTimeManager } from "@/components/admin/TeeTimeManager";
import { getCourseById } from "@/lib/data";
import { notFound } from "next/navigation";
import type { Locale } from "@/i18n-config";

interface EditCoursePageProps {
    params: {
        id: string;
        lang: Locale;
    }
}

export default async function EditCoursePage({ params: paramsProp }: EditCoursePageProps) {
    const params = await paramsProp;
    const course = await getCourseById(params.id);

    if (!course) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline text-primary mb-2">Edit Course</h1>
                <p className="text-muted-foreground">Manage course details, images, and pricing.</p>
            </div>
            <CourseForm course={course} />

            <div className="border-t pt-8">
                 <h2 className="text-2xl font-bold font-headline text-primary mb-2">Manage Availability</h2>
                 <p className="text-muted-foreground mb-6">Select a date to view and edit tee times, prices, and status.</p>
                 <TeeTimeManager course={course} />
            </div>

        </div>
    );
}
