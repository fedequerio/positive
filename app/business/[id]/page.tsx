import type { Metadata } from "next";
import { supabase } from "../../../lib/supabase";
import BusinessClient from "./BusinessClient";

type Props = {
  params: Promise<{ id: string }>;
};

async function getBusiness(id: string) {
  const { data } = await supabase
    .from("businesses")
    .select("id, name, category, city, address, description")
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
    },

    twitter: {
      card: "summary_large_image",
      title: `${name} | Positive`,
      description:
        business.description ||
        `Scopri informazioni, orari, contatti e Positive di ${name}${city}.`,
    },
  };
}

export default function Page() {
  return <BusinessClient />;
}