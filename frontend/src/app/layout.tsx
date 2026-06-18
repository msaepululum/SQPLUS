import { AuthProvider } from "@/components/providers/AuthProvider";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { ThemeProvider, themeNoFlashScript } from "@/components/providers/ThemeProvider";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SQ+ — Sistem Integrasi Rumah Sakit",
  description: "Platform administrasi rumah sakit terintegrasi",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
      </head>
      <body className="min-h-full bg-sq-bg text-slate-800 dark:bg-slate-950 dark:text-slate-200">
        <ThemeProvider>
          <LocaleProvider>
            <AuthProvider>{children}</AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
