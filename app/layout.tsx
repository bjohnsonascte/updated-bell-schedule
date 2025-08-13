import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { JetBrains_Mono } from "next/font/google";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "ASCTE Bell Schedule",
    template: "%s | ASCTE Bell Schedule",
  },
  description: "Bell schedule with pre-bell alerts",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },               // public/favicon.ico
      { url: "/icon.png", type: "image/png", sizes: "512x512" }, // app/icon.png or public/icon.png
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }], // public/apple-icon.png (optional)
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jetbrainsMono.variable} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
