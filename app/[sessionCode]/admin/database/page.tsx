
// Add two sections to this page: A password cracking tool section and a section with readouts of the session database
// The session database tables will simply collate the users with a session id matching the current session, with a
// different table for each of the 3 test websites.
import { getSessionByCode } from "@/lib/dal";
import {SessionDatabaseView} from "@/components/dashboard/DashboardServerComponents";

export default async function SessionAdminDatabasePage({ params }: { params: Promise<{ sessionCode: string }>}){
     const { sessionCode } = await params;
     const session = await getSessionByCode(sessionCode);
     if (!session) {
          return (
              <div className="flex flex-col gap-4">
                  <h1>Session not found</h1>
              </div>
          );
     }

     return (
        <div className="flex flex-col gap-4">
            <h1 className="text-9xl font-bold self-center">{sessionCode}</h1>
            <SessionDatabaseView session={session} />
        </div>
    );
}