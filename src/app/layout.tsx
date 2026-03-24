import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "أرشيفي - قائمة المشاهدات والقراءة",
  description: "تتبع أفلامك ومسلسلاتك وأنمياتك وكتبك في مكان واحد",
  keywords: ["أرشيفي", "قائمة", "أفلام", "مسلسلات", "أنمي", "كتب"],
  authors: [{ name: "أرشيفي" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${tajawal.variable} font-tajawal antialiased bg-[#0a0a0a] text-white`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
