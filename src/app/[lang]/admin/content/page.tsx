
import { TeamMemberManager } from "@/components/admin/TeamMemberManager";
import { getTeamMembers } from "@/lib/data";

export default async function SiteContentPage() {
    const initialTeamMembers = await getTeamMembers();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline text-primary mb-2">Manage Site Content</h1>
                <p className="text-muted-foreground">Update information displayed on public pages like "About Us".</p>
            </div>
            <TeamMemberManager initialTeamMembers={initialTeamMembers} />
        </div>
    );
}
