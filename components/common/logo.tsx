import Image from 'next/image'

export function Logo({ className = '' }: { className?: string }) {
    return (
        <>
            <Image
                src="/public/geeringup/gu-wordmark-red.svg"
                alt="UBC Geering Up Engineering Outreach"
                width={240}
                height={64}
                priority
                className={`dark:hidden ${className}`}
            />
            <Image
                src="/logo/gu-wordmark-chalk.svg"
                alt="UBC Geering Up Engineering Outreach"
                width={240}
                height={64}
                priority
                className={`hidden dark:block ${className}`}
            />
        </>
    )
}