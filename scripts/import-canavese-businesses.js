require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://z.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const comuni = [
  "Agliè",
  "Albiano d'Ivrea",
  "Alice Superiore",
  "Alpette",
  "Andrate",
  "Azeglio",
  "Bairo",
  "Baldissero Canavese",
  "Banchette",
  "Barbania",
  "Barone Canavese",
  "Bollengo",
  "Borgaro Torinese",
  "Borgiallo",
  "Borgofranco d'Ivrea",
  "Borgomasino",
  "Bosconero",
  "Brandizzo",
  "Brosso",
  "Burolo",
  "Busano",
  "Caluso",
  "Candia Canavese",
  "Canischio",
  "Caravino",
  "Carema",
  "Cascinette d'Ivrea",
  "Caselle",
  "Castellamonte",
  "Castelnuovo Nigra",
  "Ceresole Reale",
  "Chiaverano",
  "Chiesanuova",
  "Chivasso",
  "Ciconio",
  "Cintano",
  "Ciriè",
  "Colleretto Castelnuovo",
  "Colleretto Giacosa",
  "Corio",
  "Cossano Canavese",
  "Cuceglio",
  "Cuorgnè",
  "Favria",
  "Feletto",
  "Fiorano Canavese",
  "Foglizzo",
  "Forno Canavese",
  "Frassinetto",
  "Front",
  "Ingria",
  "Issiglio",
  "Ivrea",
  "Leini",
  "Lessolo",
  "Levone",
  "Locana",
  "Lombardore",
  "Loranzè",
  "Lugnacco",
  "Lusiglie",
  "Maglione",
  "Mappano",
  "Mazze",
  "Mercenasco",
  "Meugliano",
  "Montalenghe",
  "Montalto Dora",
  "Montanaro",
  "Noasca",
  "Nomaglio",
  "Oglianico",
  "Orio Canavese",
  "Ozegna",
  "Palazzo Canavese",
  "Parella",
  "Pavone Canavese",
  "Pecco",
  "Perosa Canavese",
  "Pertusio",
  "Piverone",
  "Pont-Canavese",
  "Prascorsano",
  "Pratiglione",
  "Quagliuzzo",
  "Quassolo",
  "Quincinetto",
  "Ribordone",
  "Rivara",
  "Rivarolo Canavese",
  "Rivarossa",
  "Rocca Canavese",
  "Romano Canavese",
  "Ronco Canavese",
  "Rondissone",
  "Rueglio",
  "Salassa",
  "Salerano Canavese",
  "Samone",
  "San Benigno Canavese",
  "San Carlo Canavese",
  "San Colombano Belmonte",
  "San Francesco al Campo",
  "San Giorgio Canavese",
  "San Giusto Canavese",
  "San Martino Canavese",
  "San Maurizio Canavese",
  "San Ponso",
  "Scarmagno",
  "Settimo Rottaro",
  "Settimo Vittone",
  "Sparone",
  "Strambinello",
  "Strambino",
  "Tavagnasco",
  "Torrazza Piemonte",
  "Torre Canavese",
  "Trausella",
  "Traversella",
  "Val di Chy",
  "Valperga",
  "Valprato Soana",
  "Vauda Canavese",
  "Verolengo",
  "Vestignè",
  "Vialfrè",
  "Vico Canavese",
  "Vidracco",
  "Villareggia",
  "Vische",
  "Vistrorio",
  "Volpiano",
];

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

async function fetchBusinessesForComune(comune) {
  const query = `
    [out:json][timeout:120];
    area["name"="${comune}"]["boundary"="administrative"]->.searchArea;
    (
      node["amenity"~"restaurant|cafe|bar|pub|fast_food|ice_cream"](area.searchArea);
      way["amenity"~"restaurant|cafe|bar|pub|fast_food|ice_cream"](area.searchArea);
      relation["amenity"~"restaurant|cafe|bar|pub|fast_food|ice_cream"](area.searchArea);
    );
    out center tags;
  `;

  for (const url of OVERPASS_URLS) {
    try {
      console.log(`Uso Overpass: ${url}`);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "User-Agent": "Positive Canavese importer",
        },
        body: query,
      });

      const text = await response.text();

      if (!response.ok) {
        console.log(`Errore Overpass ${response.status} su ${url}`);
        console.log(text.slice(0, 300));
        continue;
      }

      const data = JSON.parse(text);
      return data.elements || [];
    } catch (error) {
      console.log(`Server non disponibile: ${url}`);
      console.log(error.message);
    }
  }

  console.log(`Nessun server Overpass disponibile per ${comune}`);
  return [];
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

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const comune of comuni) {
    console.log(`\nCerco attività a ${comune}...`);

    const items = await fetchBusinessesForComune(comune);

    console.log(`Trovate ${items.length} attività a ${comune}`);

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

      const latitude = item.lat || item.center?.lat;
      const longitude = item.lon || item.center?.lon;

      if (!latitude || !longitude) {
        skipped++;
        continue;
      }

      const cleanAddress = address || comune;

      const { data: existing, error: existingError } = await supabase
        .from("businesses")
        .select("id")
        .eq("name", name)
        .eq("city", comune)
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
          city: comune,
          address: cleanAddress,
          latitude,
          longitude,
        },
      ]);

      if (error) {
        console.log("Errore:", name, error.message);
        errors++;
      } else {
        console.log("Importata:", name, "-", comune);
        imported++;
      }

      await wait(250);
    }

    await wait(1500);
  }

  console.log("\nImport Canavese completato");
  console.log(`Importate: ${imported}`);
  console.log(`Saltate: ${skipped}`);
  console.log(`Errori: ${errors}`);
}

importBusinesses();