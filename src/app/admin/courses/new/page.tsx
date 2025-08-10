import { CourseForm } from "@/components/admin/CourseForm";

export default function NewCoursePage() {
    return (
        <div>
            <h1 className="text-3xl font-bold font-headline text-primary mb-6">Add a New Course</h1>
            <CourseForm />
        </div>
    );
}
