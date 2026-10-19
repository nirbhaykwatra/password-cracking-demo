'use client';

import { useActionState } from 'react';
import { createNewSession } from '@/app/actions/sessions';

export function NewSessionButton(){
    const [state, formAction, isPending] = useActionState(
        createNewSession,
        null
    );

    return (
        <form action={formAction}>
            <button
                type="submit"
                className="rounded-2xl bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary transition hover:opacity-90"
            >
                New Session
            </button>
        </form>
    )
}