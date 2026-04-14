import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { getMetadataBase } from "@/lib/site-url";

const siteUrl = getMetadataBase();
const seoTitle = "AI Prompt Manager for ChatGPT | PromptTray";
const seoDescription =
  "Save, organize, and reuse AI prompts in ChatGPT with PromptTray, a Chrome extension that keeps your best prompts ready whenever you need them.";
// TODO: Create /public/og-image.png at 1200×630px for proper social sharing previews
const ogImage = "/og-image.png";

export const metadata: Metadata = {
  title: {
    default: seoTitle,
    template: "%s | PromptTray",
  },
  description: seoDescription,
  metadataBase: siteUrl,
  openGraph: {
    type: "website",
    url: siteUrl.toString(),
    siteName: "PromptTray",
    title: seoTitle,
    description: seoDescription,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "PromptTray — AI Prompt Manager for ChatGPT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
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
        <Analytics />
      </body>
    </html>
  );
}
