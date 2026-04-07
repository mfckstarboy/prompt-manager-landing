import type { MetadataRoute } from "next";

const base = "https://www.prompttray.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/signup`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/forgot-password`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/support`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
