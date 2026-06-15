import type { Metadata } from "next";
import { supabase } from "../../../lib/supabase";
import BusinessClient from "./BusinessClient";

type Props = {
  params: Promise<{ id: string }>;
};

async function getBusiness(id: string) {
  const { data } = await supabase
    .from("businesses")
    .select(`
      id,
      name,
      category,
      city,
      address,
      description,
      business_photos (
        photo_url,
        is_cover
        )
      `)
    .eq("id", Number(id))
    .single();

  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const business = await getBusiness(id);

  if (!business) {
    return {
      title: "Attività non trovata | Positive",
      description: "Questa attività non è disponibile su Positive.",
    };
  }

  const name = business.name || "Attività";
  const city = business.city ? ` a ${business.city}` : "";
  const photos = business.business_photos || [];
  const coverPhoto =
  photos.find((photo: any) => photo.is_cover)?.photo_url ||
  photos[0]?.photo_url ||
  "/positive-logo.png";

  return {
    title: `${name} | Positive`,
    description:
      business.description ||
      `Scopri informazioni, orari, contatti e Positive di ${name}${city}.`,

    openGraph: {
      title: `${name} | Positive`,
      description:
        business.description ||
        `Scopri informazioni, orari, contatti e Positive di ${name}${city}.`,
      url: `https://positive.town/business/${business.id}`,
      siteName: "Positive",
      type: "website",
      locale: "it_IT",
        images: [
    {
    url: coverPhoto,
      width: 1200,
      height: 630,
      alt: name,
    },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `${name} | Positive`,
      description:
        business.description ||
        `Scopri informazioni, orari, contatti e Positive di ${name}${city}.`,
      images: [coverPhoto],
    },
  };
}

export default function Page() {
  return <BusinessClient />;
}