'use client';

import { useActionState } from "react";
import { ActionResponse } from "@/app/actions/auth";
import { joinSession } from "@/app/actions/sessions";

export function JoinSessionForm() {
    const [state, formAction, pending] = useActionState<ActionResponse | null, FormData>(
        joinSession,
        null
    );

    return (
        <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex flex-1 flex-col gap-1.5">
                <label htmlFor="sessionCode" className="sr-only">
                    Session code
                </label>
                <input
                    id="sessionCode"
                    name="sessionCode"
                    required
                    maxLength={12}
                    placeholder="e.g. 7F3K9Q"
                    autoCapitalize="characters"
                    autoComplete="off"
                    className="w-full rounded-xl border border-black/15 bg-transparent px-4 py-2.5 font-mono text-sm uppercase tracking-[0.2em] text-foreground placeholder:text-foreground/30 outline-none transition focus:border-brand"
                />
                {state?.error && (
                    <span role="alert" className="text-xs font-medium text-brand">
            {state.error}
          </span>
                )}
            </div>

            <button
                type="submit"
                disabled={pending}
                className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary transition hover:opacity-90"
            >
                {pending ? "Joining…" : "Join Session"}
            </button>
        </form>
    );
}