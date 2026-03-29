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
  title: "HussamVision",
  description: "PRECISION ANALYTICS • STRATEGIC FORESIGHT - أرشيفي وأفكاري",
  keywords: ["HussamVision", "أرشيفي", "أفكاري", "أفلام", "مسلسلات", "أنمي", "كتب"],
  authors: [{ name: "Hussam" }],
  icons: {
    icon: "/favicon.ico",
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
        className={`${inter.variable} ${tajawal.variable} font-tajawal antialiased bg-[#030712] text-white`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
