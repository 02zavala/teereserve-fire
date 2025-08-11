import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCourses } from "@/lib/data";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { DeleteCourseButton } from "./DeleteCourseButton";


export default async function CoursesAdminPage() {
    const courses = await getCourses({});
    
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                 <h1 className="text-3xl font-bold font-headline text-primary">Manage Courses</h1>
                 <Button asChild>
                    <Link href="/admin/courses/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Course
                    </Link>
                 </Button>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">
                                    <span className="sr-only">Image</span>
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead className="hidden md:table-cell">Base Price</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.map(course => (
                                <TableRow key={course.id}>
                                    <TableCell className="hidden sm:table-cell">
                                        <Image
                                            alt={course.name}
                                            className="aspect-square rounded-md object-cover"
                                            height="64"
                                            src={course.imageUrls[0]}
                                            width="64"
                                            data-ai-hint="golf course"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{course.name}</TableCell>
                                    <TableCell>{course.location}</TableCell>
                                    <TableCell className="hidden md:table-cell">${course.basePrice}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                   <Link href={`/admin/courses/edit/${course.id}`}>Edit</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DeleteCourseButton courseId={course.id} courseName={course.name} />
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
