
import { TeamMemberManager } from "@/components/admin/TeamMemberManager";
import { getTeamMembers, getAboutPageContent } from "@/lib/data";
import { AboutPageContentManager } from "@/components/admin/AboutPageContentManager";

export default async function SiteContentPage() {
    const [initialTeamMembers, initialAboutContent] = await Promise.all([
        getTeamMembers(),
        getAboutPageContent()
    ]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline text-primary mb-2">Manage Site Content</h1>
                <p className="text-muted-foreground">Update information displayed on public pages like "About Us".</p>
            </div>
             <AboutPageContentManager initialContent={initialAboutContent} />
            <TeamMemberManager initialTeamMembers={initialTeamMembers} />
        </div>
    );
}
