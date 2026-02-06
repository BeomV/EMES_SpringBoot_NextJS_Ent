'use client';

import { Bell, LogOut, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Header() {

  return (
    <header className="fixed right-0 top-0 z-30 h-10 w-[calc(100%-12rem)] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-3">
        {/* Search */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-7 h-7 text-[10px]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-7 w-7">
            <Bell className="h-3.5 w-3.5" />
            <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-destructive" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1 h-7 px-1.5">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-[9px]">AD</AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <div className="text-[10px] font-medium">Admin</div>
                  <div className="text-[9px] text-muted-foreground">
                    admin@emes.com
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel className="text-[10px]">내 계정</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[10px]">
                <User className="mr-1 h-3 w-3" />
                프로필
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive text-[10px]">
                <LogOut className="mr-1 h-3 w-3" />
                로그아웃
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
