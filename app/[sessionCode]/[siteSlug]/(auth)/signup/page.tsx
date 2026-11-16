import { FlixWatchSignup, FMailSignup, ShopZoneSignup } from "@/components/demo-sites/signups";

export default async function DemoSignUpPage({ params }: { params: Promise<{ sessionCode: string, siteSlug: string}> }) {
    const { sessionCode, siteSlug } = await params;

    switch (siteSlug) {
        case "flixwatch":
            return (
                <div>
                    <FlixWatchSignup sessionCode={sessionCode} siteSlug={siteSlug} />
                </div>
            );

        case "fmail":
            return (
                <div>
                    <FMailSignup sessionCode={sessionCode} siteSlug={siteSlug} />
                </div>
            );

        case "shopzone":
            return (
                <div>
                    <ShopZoneSignup sessionCode={sessionCode} siteSlug={siteSlug} />
                </div>
            );

        default:
            return (
                <div>
                    <h1>Site not found</h1>
                </div>
            );
    }
}