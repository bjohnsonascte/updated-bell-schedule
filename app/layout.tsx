import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { JetBrains_Mono } from "next/font/google"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "ASCTE Bell Schedule",
  description: "Bell schedule with pre-bell alerts",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Put the font variable on <html>, no inline <style>, and keep suppressHydrationWarning
    <html lang="en" className={jetbrainsMono.variable} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
