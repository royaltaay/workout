import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/landing-pages";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://dungym.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllSlugs();

  const landingPages = slugs.map((slug) => ({
    url: `${BASE_URL}/workout/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...landingPages,
  ];
}
