import type { Metadata } from 'next'
import { Lexend, IBM_Plex_Sans } from 'next/font/google'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { ThemeToggle } from '@/components/common/theme-toggle'
import './globals.css'

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
})

const plex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '600', '700'], // Thin → Bold, per the guide
  variable: '--font-plex',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "UBC Geering Up Cybersecurity Lab",
  description: "A demo application created to demonstrate cybersecurity concepts and password cracking techniques for educational purposes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html
          lang="en"
          className={`${lexend.variable} ${plex.variable}`}
          data-location="vancouver" // switch to "kelowna" for the maroon variant
          suppressHydrationWarning
      >
      <body className="min-h-dvh antialiased">
      <ThemeProvider>
        {children}
        <div className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 print:hidden">
          <ThemeToggle />
        </div>
      </ThemeProvider>
      </body>
      </html>
  )
}
