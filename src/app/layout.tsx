import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page Studio",
  description: "Schema-driven Contentful page preview",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
