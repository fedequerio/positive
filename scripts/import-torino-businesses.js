require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const OVERPASS_URL = "https://lz4.overpass-api.de/api/interpreter";

const categories = {
  restaurant: "Ristorante",
  cafe: "Caffè",
  bar: "Bar",
  pub: "Pub",
  fast_food: "Fast Food",
  ice_cream: "Gelateria",
};

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchTorinoBusinesses() {
  const query = `
    [out:json][timeout:180];
    (
      node["amenity"~"restaurant|cafe|bar|pub|fast_food|ice_cream"]
      (45.03,7.60,45.13,7.78);
    );
    out tags center 1000;
  `;

  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      "User-Agent": "Positive MVP importer",
    },
    body: query,
  });

  const text = await response.text();

  if (!response.ok) {
    console.log("Errore Overpass:", response.status);
    console.log(text.slice(0, 500));
    return [];
  }

  try {
    const data = JSON.parse(text);
    return data.elements || [];
  } catch {
    console.log("Risposta non JSON da Overpass:");
    console.log(text.slice(0, 500));
    return [];
  }
}

async function importBusinesses() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log("Manca NEXT_PUBLIC_SUPABASE_URL in .env.local");
    return;
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log("Manca SUPABASE_SERVICE_ROLE_KEY in .env.local");
    return;
  }

  const items = await fetchTorinoBusinesses();

  console.log(`Trovate ${items.length} attività`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const item of items) {
    const tags = item.tags || {};
    const name = tags.name;

    if (!name) {
      skipped++;
      continue;
    }

    const categoryKey = tags.amenity || "Attività";
    const category = categories[categoryKey] || categoryKey;

    const street = tags["addr:street"] || "";
    const houseNumber = tags["addr:housenumber"] || "";
    const address = `${street} ${houseNumber}`.trim();

    if (!address) {
      skipped++;
      continue;
    }

    const latitude = item.lat;
    const longitude = item.lon;

    const { data: existing, error: existingError } = await supabase
      .from("businesses")
      .select("id")
      .eq("name", name)
      .eq("address", address)
      .eq("city", "Torino")
      .maybeSingle();

    if (existingError) {
      console.log("Errore controllo duplicato:", name, existingError.message);
      errors++;
      continue;
    }

    if (existing) {
      console.log(`Duplicato saltato: ${name}`);
      skipped++;
      continue;
    }

    const { error } = await supabase.from("businesses").insert([
      {
        name,
        category,
        city: "Torino",
        address,
        latitude,
        longitude,
      },
    ]);

    if (error) {
      console.log("Errore:", name, error.message);
      errors++;
    } else {
      console.log("Importata:", name);
      imported++;
    }

    await wait(250);
  }

  console.log("Import completato");
  console.log(`Importate: ${imported}`);
  console.log(`Saltate: ${skipped}`);
  console.log(`Errori: ${errors}`);
}

importBusinesses();