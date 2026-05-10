import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/app",
        "/app/",
        "/account",
        "/account/",
        "/auth/",
        "/checkout/",
        "/dashboard",
        "/dashboard/",
        "/landing",
        "/sign-in",
        "/sign-up",
        "/upgrade/",
        "/extension/",
        "/demo",
        "/v2",
        "/v3",
      ],
    },
    sitemap: "https://www.prompttray.app/sitemap.xml",
    host: "https://www.prompttray.app",
  };
}
