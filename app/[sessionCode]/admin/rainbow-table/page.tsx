import { getLeakedCredentials, requireOwnedSession } from "@/lib/dal";
import { RainbowTableLookup } from "@/components/dashboard/DashboardClientComponents";

export default async function SessionAdminRainbowTablePage({ params }: { params: Promise<{ sessionCode: string }> }) {
    const { sessionCode } = await params;
    await requireOwnedSession(sessionCode);

    const [flixwatch, shopzone] = await Promise.all([
        getLeakedCredentials(sessionCode, "flixwatch"),
        getLeakedCredentials(sessionCode, "shopzone"),
    ]);

    return (
        <RainbowTableLookup
            targets={[
                { slug: "flixwatch", label: "FlixWatch (unsalted MD5)", credentials: flixwatch },
                { slug: "shopzone", label: "ShopZone (salted bcrypt)", credentials: shopzone },
            ]}
        />
    );
}