
import Image from "next/image";

export function GURedHeader() {
     return (
         <header className="w-full bg-(--color-primary) px-4 sm:px-6 lg:px-8">
              <div className="mx-auto flex h-20 sm:h-20 max-w-8xl items-center justify-between">
                   <Image
                       src="/geeringup/GU Wordmark White.png"
                       alt="Geering Up"
                       width={320}
                       height={80}
                       className="h-10 sm:h-12 w-auto object-contain"
                       priority
                   />
                   <Image
                       src="/geeringup/UBC_APSC_long_white.png"
                       alt="UBC Applied Science"
                       width={200}
                       height={40}
                       className="hidden sm:block h-10 sm:h-12 w-auto object-contain"
                       priority
                   />
                   <Image
                       src="/geeringup/UBC_short_white.png"
                       alt="UBC"
                       width={160}
                       height={40}
                       className="block sm:hidden h-10 w-auto object-contain"
                       priority
                   />
              </div>
         </header>
     );
}

export function UBCBlueHeader() {
     return (
         <header className="w-full bg-(--color-ubc-primary) px-4 sm:px-6 lg:px-8">
              <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-4">
                   <Image
                       src="/geeringup/UBC_APSC_long_white.png"
                       alt="UBC Applied Science"
                       width={200}
                       height={40}
                       className="hidden sm:block h-7 sm:h-8 w-auto object-contain"
                       priority
                   />
                   <Image
                       src="/geeringup/UBC_short_white.png"
                       alt="UBC"
                       width={40}
                       height={40}
                       className="block sm:hidden h-7 w-auto object-contain"
                       priority
                   />
                   <Image
                       src="/geeringup/GU Wordmark White.png"
                       alt="Geering Up"
                       width={160}
                       height={40}
                       className="h-7 sm:h-8 w-auto object-contain"
                       priority
                   />
              </div>
         </header>
     );
}