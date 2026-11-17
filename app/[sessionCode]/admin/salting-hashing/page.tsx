import { requireOwnedSession } from "@/lib/dal";
import { SaltingHashingDemo } from "@/components/dashboard/DashboardClientComponents";

export default async function SessionAdminSaltingHashingPage({ params }: { params: Promise<{ sessionCode: string }> }) {
    const { sessionCode } = await params;
    await requireOwnedSession(sessionCode);

    return <SaltingHashingDemo />;
}