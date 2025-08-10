import { CourseForm } from "@/components/admin/CourseForm";
import { getCourseById } from "@/lib/data";
import { notFound } from "next/navigation";

interface EditCoursePageProps {
    params: {
        id: string;
    }
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
    const course = await getCourseById(params.id);

    if (!course) {
        notFound();
    }

    return (
        <div>
            <h1 className="text-3xl font-bold font-headline text-primary mb-6">Edit Course</h1>
            <CourseForm course={course} />
        </div>
    );
}
