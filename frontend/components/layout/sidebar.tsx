'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fish, Building2, Package, Tag, Ruler, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  {
    label: 'Nhà cung cấp',
    href: '/vendors',
    icon: Building2,
  },
  {
    label: 'Sản phẩm',
    icon: Package,
    children: [
      { label: 'Danh sách', href: '/products', icon: Package },
      { label: 'Danh mục', href: '/products/categories', icon: Tag },
      { label: 'Đơn vị tính', href: '/products/units', icon: Ruler },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<string[]>(['Sản phẩm']);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-slate-900 flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-800">
        <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center shrink-0">
          <Fish className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-white text-sm leading-tight">Mini ERP</p>
          <p className="text-xs text-slate-400 leading-tight">Export Trading</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          if (item.children) {
            const isOpen = openGroups.includes(item.label);
            const isActive = item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + '/'));
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                    isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
                {isOpen && (
                  <div className="ml-4 mt-0.5 space-y-0.5">
                    {item.children.map((child) => {
                      const active = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                            active
                              ? 'bg-sky-600/20 text-sky-400'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          )}
                        >
                          <child.icon className="w-3.5 h-3.5 shrink-0" />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-sky-600/20 text-sky-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
