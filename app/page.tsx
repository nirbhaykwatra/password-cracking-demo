import {JoinSessionForm} from "@/components/forms";
import {InstructorLoginButton} from "@/components/dashboard/DashboardClientComponents";
import {GURedHeader} from "@/components/common/headers";

export default function Home() {
    return (
        <div className="h-dvh">
            <GURedHeader />
            <div className="flex flex-col flex-1 items-center justify-center font-sans h-full relative">
                <main className="flex w-full max-w-3xl flex-col items-center justify-between py-32 px-16  sm:items-center gap-10">
                    <InstructorLoginButton />
                    <h1 className="text-6xl bg-primary-foreground font-bold">Enter Session Code</h1>
                    <JoinSessionForm />
                </main>
            </div>
        </div>
    );
}
