import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { PwaRegistration } from "@/components/pwa-registration";

export const metadata: Metadata = {
  title: "SafarSet",
  description: "Deterministic family travel-disruption recovery.",
  applicationName: "SafarSet",
  appleWebApp: {
    capable: true,
    title: "SafarSet",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#07101c",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} dark h-full font-sans antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <PwaRegistration />
      </body>
    </html>
  );
}
