'use client';

import { useState, useEffect } from 'react';
import { CourseForm } from '@/components/admin/CourseForm';
import { TeeTimeManager } from '@/components/admin/TeeTimeManager';
import { PricingManager } from '@/components/admin/PricingManager';
import { PricingCalendar } from '@/components/admin/PricingCalendar';
import { BulkPricingOperations } from '@/components/admin/BulkPricingOperations';
import { PricingTemplates } from '@/components/admin/PricingTemplates';
import TimeIntervalSettings from '@/components/admin/TimeIntervalSettings';
import { updateCourse } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PricingEngine } from '@/lib/pricing-engine';
import type { Course } from "@/types/course";
import type { Locale } from "@/i18n-config";

interface EditCourseClientProps {
    course: Course;
    lang?: Locale;
}

export function EditCourseClient({ course, lang = "en" }: EditCourseClientProps) {
    const [pricingEngine] = useState(() => new PricingEngine());

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline text-primary mb-2">Edit Course</h1>
                <p className="text-muted-foreground">Manage course details, images, and pricing.</p>
            </div>
            <CourseForm course={course} />
            
            <Tabs defaultValue="availability" className="border-t pt-8">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
                    <TabsTrigger value="intervals">Intervalos</TabsTrigger>
                    <TabsTrigger value="pricing">Precios</TabsTrigger>
                    <TabsTrigger value="calendar">Calendario</TabsTrigger>
                    <TabsTrigger value="bulk">Operaciones</TabsTrigger>
                    <TabsTrigger value="templates">Plantillas</TabsTrigger>
                </TabsList>
                
                <TabsContent value="availability" className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold font-headline text-primary mb-2">Manage Availability</h2>
                        <p className="text-muted-foreground mb-6">Select a date to view and edit tee times, prices, and status.</p>
                        <TeeTimeManager course={course} lang={lang} />
                    </div>
                </TabsContent>
                
                <TabsContent value="intervals" className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold font-headline text-primary mb-2">Configuración de Intervalos</h2>
                        <p className="text-muted-foreground mb-6">Configure los intervalos de tiempo y horarios de operación para este campo de golf.</p>
                        <TimeIntervalSettings
                            courseId={course.id}
                            initialInterval={course.teeTimeInterval || 15}
                            initialOperatingHours={course.operatingHours}
                            onSave={async (settings) => {
                                try {
                                    await updateCourse(course.id, {
                                        name: course.name,
                                        location: course.location,
                                        description: course.description,
                                        rules: course.rules,
                                        basePrice: course.basePrice,
                                        existingImageUrls: course.imageUrls || [],
                                        newImages: [],
                                        teeTimeInterval: settings.teeTimeInterval,
                                        operatingHours: settings.operatingHours,
                                        availableHoles: course.availableHoles,
                                        totalYards: course.totalYards,
                                        par: course.par,
                                        holeDetails: course.holeDetails
                                    });
                                    
                                    // Mostrar mensaje de éxito
                                    alert('Configuración de intervalos guardada exitosamente');
                                    
                                    // Recargar la página para mostrar los cambios
                                    window.location.reload();
                                } catch (error) {
                                    console.error('Error guardando configuración:', error);
                                    alert('Error al guardar la configuración. Por favor intenta de nuevo.');
                                }
                            }}
                        />
                    </div>
                </TabsContent>
                
                <TabsContent value="pricing" className="space-y-6">
                    <PricingManager courseId={course.id} pricingEngine={pricingEngine} />
                </TabsContent>
                
                <TabsContent value="calendar" className="space-y-6">
                    <PricingCalendar courseId={course.id} courseName={course.name} />
                </TabsContent>
                
                <TabsContent value="teetimes" className="space-y-6">
                    <TeeTimeManager courseId={course.id} />
                </TabsContent>
                
                <TabsContent value="bulk" className="space-y-6">
                    <BulkPricingOperations courseId={course.id} pricingEngine={pricingEngine} />
                </TabsContent>
                
                <TabsContent value="templates" className="space-y-6">
                    <PricingTemplates courseId={course.id} pricingEngine={pricingEngine} />
                </TabsContent>
                
                <TabsContent value="intervals" className="space-y-6">
                    <TimeIntervalSettings
                        courseId={course.id}
                        initialInterval={course.teeTimeInterval || 15}
                        initialOperatingHours={course.operatingHours}
                        onSave={async (settings) => {
                            try {
                                await updateCourse(course.id, {
                                    name: course.name,
                                    location: course.location,
                                    description: course.description,
                                    rules: course.rules,
                                    basePrice: course.basePrice,
                                    existingImageUrls: course.imageUrls || [],
                                    newImages: [],
                                    teeTimeInterval: settings.teeTimeInterval,
                                    operatingHours: settings.operatingHours,
                                    availableHoles: course.availableHoles,
                                    totalYards: course.totalYards,
                                    par: course.par,
                                    holeDetails: course.holeDetails
                                });
                                
                                // Mostrar mensaje de éxito
                                alert('Configuración de intervalos guardada exitosamente');
                                
                                // Recargar la página para mostrar los cambios
                                window.location.reload();
                            } catch (error) {
                                console.error('Error guardando configuración:', error);
                                alert('Error al guardar la configuración. Por favor intenta de nuevo.');
                            }
                        }}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}