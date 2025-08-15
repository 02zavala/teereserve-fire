
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, LayoutGrid, GanttChartSquare } from 'lucide-react';
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "../ui/skeleton";
import { usePathname } from "next/navigation";

export function UserNav() {
  const { user, userProfile, loading, logout } = useAuth();
  const pathname = usePathname();
  const lang = pathname.split('/')[1] || 'en';

  const isAdmin = userProfile?.role === 'Admin' || userProfile?.role === 'SuperAdmin';

  if (loading) {
    return <Skeleton className="h-8 w-20 rounded-md" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href={`/${lang}/login`}>Log In</Link>
        </Button>
        <Button asChild>
            <Link href={`/${lang}/signup`}>Sign Up</Link>
        </Button>
      </div>
    );
  }

  // Display the user menu as soon as the user object is available,
  // even if the full userProfile is still loading.
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
            <AvatarFallback>{user.displayName ? user.displayName.substring(0,2).toUpperCase() : user.email?.substring(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName || 'TeeReserve User'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/${lang}/profile`}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
             <Link href={`/${lang}/profile#bookings`}>
                <LayoutGrid className="mr-2 h-4 w-4" />
                <span>My Bookings</span>
             </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
                <Link href={`/${lang}/admin/dashboard`}>
                    <GanttChartSquare className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
