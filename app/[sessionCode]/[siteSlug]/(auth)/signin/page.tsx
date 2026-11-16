import { FlixWatchLogin, FMailLogin, ShopZoneLogin } from "@/components/demo-sites/logins";

export default async function DemoSignInPage({ params }:  { params: Promise<{ sessionCode: string, siteSlug: string }> }) {
    const { sessionCode, siteSlug } = await params;

    switch (siteSlug) {
        case "flixwatch":
            return (
                <div>
                    <FlixWatchLogin sessionCode={sessionCode} siteSlug={siteSlug} />
                </div>
            );

        case "fmail":
            return (
                <div>
                    <FMailLogin sessionCode={sessionCode} siteSlug={siteSlug} />
                </div>
            );

        case "shopzone":
            return (
                <div>
                    <ShopZoneLogin sessionCode={sessionCode} siteSlug={siteSlug} />
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

