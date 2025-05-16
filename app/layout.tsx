import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import { GitHubProvider } from "@/context/github-context"
import { AdminProvider } from "@/context/admin-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DevTabs",
  description: "A minimalist dashboard for developers",
}

if (process.env.NODE_ENV === "development") {
  console.log("API KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <GitHubProvider>
              <AdminProvider>{children}</AdminProvider>
            </GitHubProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
