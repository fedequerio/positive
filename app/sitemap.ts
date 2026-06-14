import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: businesses } = await supabase
    .from("businesses")
    .select("id");

  const businessUrls =
    businesses?.map((business) => ({
      url: `https://positive.town/business/${business.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })) || [];

  return [
    {
      url: "https://positive.town",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },

    ...businessUrls,
  ];
}