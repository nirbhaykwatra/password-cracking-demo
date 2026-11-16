import PasswordCracker from "@/components/PasswordCracker";
import { getDemoUsernames, getDemoWebsites, requireOwnedSession } from "@/lib/dal";
import { getConfig } from "@/lib/store";

export default async function SessionAdminPasswordToolPage({ params }: { params: Promise<{sessionCode: string}> }){
    const { sessionCode } = await params;

    await requireOwnedSession(sessionCode);

    const usernames = await getDemoUsernames(sessionCode);
    const websites = await getDemoWebsites();

    return (
        <PasswordCracker usernames={usernames} websites={websites} initialConfig={getConfig(sessionCode)} />
    );
}