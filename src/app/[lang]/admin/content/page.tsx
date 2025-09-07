
"use client";

import { useState, useEffect } from "react";
import { TeamMemberManager } from "@/components/admin/TeamMemberManager";
import { getTeamMembers, getAboutPageContent, getHeroImagesContent } from "@/lib/data";
import { AboutPageContentManager } from "@/components/admin/AboutPageContentManager";
import { HeroImageManager } from "@/components/admin/HeroImageManager";
import { Skeleton } from "@/components/ui/skeleton";
import type { TeamMember, AboutPageContent } from "@/types";

interface HeroImage {
    id: string;
    url: string;
    name: string;
}

export default function SiteContentPage() {
    const [initialTeamMembers, setInitialTeamMembers] = useState<TeamMember[]>([]);
    const [initialAboutContent, setInitialAboutContent] = useState<AboutPageContent | null>(null);
    const [initialHeroImages, setInitialHeroImages] = useState<HeroImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [teamMembers, aboutContent, heroImagesContent] = await Promise.all([
                    getTeamMembers(),
                    getAboutPageContent(),
                    getHeroImagesContent()
                ]);

                setInitialTeamMembers(teamMembers);
                setInitialAboutContent(aboutContent);
                
                // Convert hero images content to the format expected by HeroImageManager
                const heroImages = [
                    { id: '1', url: heroImagesContent.image1Url, name: 'Hero Image 1' },
                    { id: '2', url: heroImagesContent.image2Url, name: 'Hero Image 2' },
                    { id: '3', url: heroImagesContent.image3Url, name: 'Hero Image 3' },
                    { id: '4', url: heroImagesContent.image4Url, name: 'Hero Image 4' },
                ];
                setInitialHeroImages(heroImages);
            } catch (error) {
                console.error('Error loading content data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

    if (isLoading || !initialAboutContent) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold font-headline text-primary mb-2">Manage Site Content</h1>
                    <p className="text-muted-foreground">Update information displayed on public pages like "About Us" and Hero section.</p>
                </div>
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline text-primary mb-2">Manage Site Content</h1>
                <p className="text-muted-foreground">Update information displayed on public pages like "About Us" and Hero section.</p>
            </div>
            <HeroImageManager initialImages={initialHeroImages} />
            <AboutPageContentManager initialContent={initialAboutContent} />
            <TeamMemberManager initialTeamMembers={initialTeamMembers} />
        </div>
    );
}
