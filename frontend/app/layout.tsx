import type { Metadata } from 'next';
import { Fira_Code, Fira_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const firaSans = Fira_Sans({
  variable: '--font-sans',
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
});

const firaCode = Fira_Code({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Mini ERP Export Trading',
  description: 'Hệ thống quản lý xuất khẩu thủy sản',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${firaSans.variable} ${firaCode.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-950">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
