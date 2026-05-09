import type { MetadataRoute } from "next";

const base = "https://www.prompttray.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/pricing`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/support`, changeFrequency: "monthly", priority: 0.5 },
    {
      url: `${base}/guides/save-prompts-in-chatgpt`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/guides/organize-ai-prompts`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/guides/manage-prompts-across-ai-tools`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/compare/best-chatgpt-prompt-manager`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/refund`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
