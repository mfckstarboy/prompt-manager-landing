import type { Metadata } from "next";
import "./globals.css";
import { getMetadataBase } from "@/lib/site-url";

const siteUrl = getMetadataBase();
const seoTitle = "AI Prompt Manager for ChatGPT | PromptTray";
const seoDescription =
  "Save, organize, and reuse AI prompts in ChatGPT with PromptTray, a Chrome extension that keeps your best prompts ready whenever you need them.";
const ogImage = "/android-chrome-512x512.png";

export const metadata: Metadata = {
  title: {
    default: seoTitle,
    template: "%s | PromptTray",
  },
  description: seoDescription,
  metadataBase: siteUrl,
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    url: siteUrl.toString(),
    siteName: "PromptTray",
    title: seoTitle,
    description: seoDescription,
    images: [
      {
        url: ogImage,
        width: 512,
        height: 512,
        alt: "PromptTray",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: seoTitle,
    description: seoDescription,
    images: [ogImage],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PromptTray",
    applicationCategory: "ProductivityApplication",
    applicationSubCategory: "BrowserExtension",
    operatingSystem: "Chrome",
    description: seoDescription,
    url: siteUrl.toString(),
    downloadUrl:
      "https://chromewebstore.google.com/detail/mcieonpjdkhnjbkhkifhdlpkioaehiod",
    browserRequirements: "Requires Google Chrome",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareApplicationSchema),
          }}
        />
        {children}
      </body>
    </html>
  );
}
