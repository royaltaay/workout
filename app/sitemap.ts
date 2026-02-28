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
    images: [
      `${BASE_URL}/og-image.jpg`,
      `${BASE_URL}/screenshots/workout1.webp`,
      `${BASE_URL}/screenshots/workout2withrest.webp`,
      `${BASE_URL}/screenshots/stats1.webp`,
    ],
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      images: [
        `${BASE_URL}/og-image.jpg`,
        `${BASE_URL}/screenshots/workout1.webp`,
        `${BASE_URL}/screenshots/workout2withrest.webp`,
        `${BASE_URL}/screenshots/stats1.webp`,
        `${BASE_URL}/screenshots/history.webp`,
        `${BASE_URL}/screenshots/stats2.webp`,
      ],
    },
    ...landingPages,
  ];
}
