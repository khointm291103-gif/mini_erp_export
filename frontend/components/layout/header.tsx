'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Header({ title }: { title?: string }) {
  const router = useRouter();

  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userStr ? JSON.parse(userStr) : null;

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    document.cookie = 'access_token=; path=/; max-age=0';
    router.push('/login');
  };

  const initials = user?.fullName
    ?.split(' ')
    .slice(-2)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() ?? 'U';

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-slate-200 fixed top-0 left-60 right-0 z-20">
      <h1 className="text-sm font-semibold text-slate-700">{title ?? 'Mini ERP'}</h1>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="text-xs bg-sky-100 text-sky-700 font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-slate-700 max-w-32 truncate">{user?.fullName}</span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5">
            <p className="text-xs font-medium text-slate-900 truncate">{user?.fullName}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-slate-600">
            <User className="w-4 h-4 mr-2" /> Tài khoản
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600">
            <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
