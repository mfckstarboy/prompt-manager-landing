import type { Metadata } from "next";
import "./globals.css";
import { getMetadataBase } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "PromptTray",
  description: "Save, organize, and instantly reuse your best prompts directly inside AI tools.",
  metadataBase: getMetadataBase(),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
