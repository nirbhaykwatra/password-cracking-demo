import Link from "next/link";
import {getInstructionSessionsByUserId, getCurrentInstructor, getUsersBySession} from "@/lib/dal";
import {NewSessionButton, RefreshButton} from "@/components/dashboard/DashboardClientComponents";

export type  Session = {
    id: number;
    code: string;
    createdAt: Date;
}

export async function InstructionSessionTable() {

    const instructor = await getCurrentInstructor();
    if (!instructor) {
        return null;
    }

    const instructionSessions = await getInstructionSessionsByUserId(instructor.id);
    const hasSessions: boolean = instructionSessions.length >= 1;

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-foreground-10 bg-primary-foreground p-6 shadow-sm mx-100 my-4">
            <div className="flex flex-row justify-between">
                <h2 className="text-lg font-bold text-primary">Sessions</h2>
                <NewSessionButton />
            </div>
            <div className="h-px w-full" />

            { hasSessions ?
                <table>
                    <thead className="text-left">
                    <tr>
                        <th>Session</th>
                        <th>Created At</th>
                    </tr>
                    </thead>
                    <tbody>
                    {instructionSessions.map((session) => (
                        <tr key={session.id}>
                            <td>
                                <Link href={`/${session.code}/admin/database`}>
                                            <span className="text-primary font-bold hover:underline">
                                                 {session.code}
                                            </span>
                                </Link>
                            </td>
                            <td>{session.createdAt.toLocaleString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                timeZoneName: 'short'
                            })}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                :
                <p className="text-sm text-primary text-center py-8">
                    No sessions created.
                </p>
            }
        </div>
    )
}

export async function SessionDatabaseView({ session }:  { session: Session }) {
    const users = await getUsersBySession(session.id);
    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-foreground-10 bg-primary-foreground p-6 shadow-sm my-4">
            <div className="flex flex-row justify-between">
                <h2 className="text-lg font-bold text-primary">Database</h2>
                <RefreshButton />
            </div>
            <div className="h-px w-full" />

            { users.length > 0 ?
                <table>
                    <thead className="text-left">
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Password</th>
                        <th>Site ID</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((session) => (
                        <tr key={session.id}>
                            <td>
                                {session.id}
                            </td>
                            <td>
                                {session.name}
                            </td>
                             <td>
                                {session.email}
                            </td>
                            <td>
                                {session.password}
                            </td>
                            <td>
                                {session.siteId}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                :
                <p className="text-sm text-primary text-center py-8">
                    No users created.
                </p>
            }
        </div>
    );
}