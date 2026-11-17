import Link from "next/link";
import {getInstructionSessionsByUserId, getCurrentInstructor, getUsersBySession} from "@/lib/dal";
import {
    NewSessionButton,
    RefreshButton,
    RollDemoAccountsButton
} from "@/components/dashboard/DashboardClientComponents";

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
                <div className="flex items-center gap-3">
                    <RollDemoAccountsButton sessionCode={session.code} />
                    <RefreshButton />
                </div>
            </div>
            <div className="h-px w-full" />

            { users.length > 0 ?
                <div className="w-full overflow-x-auto">
                    <table className="min-w-full whitespace-nowrap [&_th]:px-4 [&_td]:px-4 [&_th]:py-2 [&_td]:py-2">
                        <thead className="text-left">
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Password</th>
                            <th>Website</th>
                            <th>Credit Card Number</th>
                            <th>Card Expiry Month</th>
                            <th>Card Expiry Year</th>
                            <th>Card CVC</th>
                            <th>Address Line 1</th>
                            <th>Address Line 2</th>
                            <th>City</th>
                            <th>State</th>
                            <th>Postal Code</th>
                            <th>Country</th>
                            <th>Phone Number</th>
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
                                    {session.site.slug}
                                </td>
                                <td>
                                    {session.creditCard}
                                </td>
                                <td>
                                    {session.cardExpMonth}
                                </td>
                                <td>
                                    {session.cardExpYear}
                                </td>
                                <td>
                                    {session.cardCvc}
                                </td>
                                <td>
                                    {session.addressLine1}
                                </td>
                                <td>
                                    {session.addressLine2}
                                </td>
                                <td>
                                    {session.addressCity}
                                </td>
                                <td>
                                    {session.addressState}
                                </td>
                                <td>
                                    {session.addressZip}
                                </td>
                                <td>
                                    {session.addressCountry}
                                </td>
                                <td>
                                    {session.phoneNumber}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                :
                <p className="text-sm text-primary text-center py-8">
                    No users created.
                </p>
            }
        </div>
    );
}