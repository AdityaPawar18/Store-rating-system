import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Playfair_Display, Source_Sans_3 } from "next/font/google"
import "./globals.css"

const geistSans = GeistSans({ subsets: ["latin"] })
const geistMono = GeistMono({ subsets: ["latin"] })

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "700"],
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "Rating System Admin",
  description: "Professional admin dashboard for managing users, stores, and ratings",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${sourceSans.variable}`}>
      <head>
        <style>{`
html {
  font-family: ${geistSans.style.fontFamily};
  --font-sans: ${sourceSans.style.fontFamily};
  --font-serif: ${playfairDisplay.style.fontFamily};
  --font-mono: ${geistMono.style.fontFamily};
}
        `}</style>
      </head>
      <body className="font-sans">{children}</body>
    </html>
  )
}
