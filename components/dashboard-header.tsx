"use client"

import Link from "next/link"
import { Bell, Menu, Settings, Shield } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useAdmin } from "@/context/admin-context"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function DashboardHeader() {
  const { user, signOut } = useAuth()
  const { isAdmin } = useAdmin()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.substring(0, 2).toUpperCase()
    } else if (user?.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-56">
          <nav className="grid gap-2 text-lg font-medium">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <span>DevDash</span>
            </Link>
            <Link href="/" className="hover:text-foreground/80">
              Dashboard
            </Link>
            <Link href="/github" className="hover:text-foreground/80">
              GitHub Issues
            </Link>
            <Link href="/github/pull-requests" className="hover:text-foreground/80">
              Pull Requests
            </Link>
            <Link href="/account" className="hover:text-foreground/80">
              Account
            </Link>
            {isAdmin && (
              <Link href="/admin" className="hover:text-foreground/80">
                Admin Panel
              </Link>
            )}
          </nav>
        </SheetContent>
      </Sheet>
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <span className="hidden md:inline-block">DevDash</span>
      </Link>
      <nav className="hidden gap-6 md:flex md:flex-1">
        <Link href="/" className="flex items-center text-lg font-medium">
          Dashboard
        </Link>
        <Link href="/github" className="flex items-center text-lg font-medium text-muted-foreground">
          GitHub Issues
        </Link>
        <Link href="/github/pull-requests" className="flex items-center text-lg font-medium text-muted-foreground">
          Pull Requests
        </Link>
        {isAdmin && (
          <Link href="/admin" className="flex items-center text-lg font-medium text-muted-foreground">
            Admin
          </Link>
        )}
      </nav>
      <div className="flex flex-1 items-center justify-end gap-2">
        <ModeToggle />
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || user?.email || "User"} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.displayName || user?.email || "My Account"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account">
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Link>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Panel
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
