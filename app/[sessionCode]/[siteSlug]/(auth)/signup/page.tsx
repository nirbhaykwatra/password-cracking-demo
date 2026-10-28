import { FlixWatchSignup, FMailSignup, ShopZoneSignup } from "@/components/demo-sites/signups";

export default async function DemoSignUpPage({ params }: { params: Promise<{ siteSlug: string}> }) {
    const { siteSlug } = await params;

    switch (siteSlug) {
        case "flixwatch":
            return (
                <div>
                    <FlixWatchSignup />
                </div>
            );

        case "fmail":
            return (
                <div>
                    <FMailSignup />
                </div>
            );

        case "shopzone":
            return (
                <div>
                    <ShopZoneSignup />
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