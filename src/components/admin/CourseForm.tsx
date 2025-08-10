"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { GolfCourse } from "@/types";

const formSchema = z.object({
  name: z.string().min(3, "Course name must be at least 3 characters."),
  location: z.string().min(3, "Location is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  rules: z.string().optional(),
  basePrice: z.coerce.number().min(0, "Base price must be a positive number."),
});

type CourseFormValues = z.infer<typeof formSchema>;

interface CourseFormProps {
  course?: GolfCourse;
}

export function CourseForm({ course }: CourseFormProps) {
  const { toast } = useToast();
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: course?.name || "",
      location: course?.location || "",
      description: course?.description || "",
      rules: course?.rules || "",
      basePrice: course?.basePrice || 0,
    },
  });

  function onSubmit(values: CourseFormValues) {
    // Here we'll connect to firebase to save the data
    console.log(values);
    toast({
      title: course ? "Course Updated" : "Course Created",
      description: `The course "${values.name}" has been saved successfully.`,
    });
  }

  return (
    <Card>
        <CardContent className="pt-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Course Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Solmar Golf Links" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., Cabo San Lucas" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                   
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Describe the course, its features, and what makes it unique."
                                className="resize-y min-h-[100px]"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="rules"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Course Rules</FormLabel>
                            <FormControl>
                                 <Textarea
                                placeholder="Enter course-specific rules like dress code, spike policy, etc."
                                className="resize-y"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={form.control}
                        name="basePrice"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Base Price ($)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="250" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end">
                        <Button type="submit">{course ? 'Save Changes' : 'Create Course'}</Button>
                    </div>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
