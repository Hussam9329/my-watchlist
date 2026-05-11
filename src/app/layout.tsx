import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["400", "700"],  // ✅ بدل 5 أوزان، اثنين يكفون
  display: "swap",          // ✅ يمنع FOIT (وميض النص)
});

export const metadata: Metadata = {
  title: "HussamVision",
  description: "PRECISION ANALYTICS • STRATEGIC FORESIGHT - أرشيفي",
  keywords: ["HussamVision", "أرشيفي", "أفلام", "مسلسلات", "أنمي", "كتب"],
  authors: [{ name: "Hussam" }],
  icons: {
    icon: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HussamVision",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body
        className={`${tajawal.variable} font-tajawal antialiased bg-[#030712] text-white`}
      >
        {children}
        <Toaster position="top-center" dir="rtl" />
      </body>
    </html>
  );
}
