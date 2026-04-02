import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://xn--80aecdepbbeb2aerrcg7ac1e1b.xn--p1ai";
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/payment`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
  ];
}
