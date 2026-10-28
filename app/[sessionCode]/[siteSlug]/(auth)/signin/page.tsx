import { FlixWatchLogin, FMailLogin, ShopZoneLogin } from "@/components/demo-sites/logins";

export default async function DemoSignInPage({ params }:  { params: Promise<{ siteSlug: string }> }) {
    const { siteSlug } = await params;

    switch (siteSlug) {
        case "flixwatch":
            return (
                <div>
                    <FlixWatchLogin />
                </div>
            );

        case "fmail":
            return (
                <div>
                    <FMailLogin />
                </div>
            );

        case "shopzone":
            return (
                <div>
                    <ShopZoneLogin />
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

