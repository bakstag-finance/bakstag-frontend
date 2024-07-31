import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RootProvider } from "@/lib/providers";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width, shrink-to-fit=no",
  minimumScale: 1,
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Bakstag",
  description: "Bakstag OTC Market",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* TODO: remove suppressHydrationWarning on prod */}
      <body className={inter.className} suppressHydrationWarning={true}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
