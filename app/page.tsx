"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

const BusinessMap = dynamic(() => import("./map"), {
  ssr: false,
});

type Business = {
  id: number;
  name: string | null;
  category: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  positives: number;
  tags: string[];
  distance?: number;
};

type AddressSuggestion = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

function formatCreatedAt(dateString: string) {
  return new Date(dateString).toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
  });
}

function normalizeText(text?: string | null) {
  return (text || "").trim().toLowerCase();
}

function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const earthRadiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newLatitude, setNewLatitude] = useState<number | null>(null);
  const [newLongitude, setNewLongitude] = useState<number | null>(null);

  const [addressSuggestions, setAddressSuggestions] = useState<
    AddressSuggestion[]
  >([]);

  const [positiveTags, setPositiveTags] = useState<Record<string, string>>({});

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  async function loginWithMagicLink() {
    if (isSendingEmail) return;

    setIsSendingEmail(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });

    setMessage(
      error
        ? error.message
        : "Ti abbiamo inviato un link di accesso. Clicca sul link ricevuto via email per completare il login. Se non lo trovi, controlla anche la cartella Spam."
    );

    setIsSendingEmail(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  async function loadBusinesses(searchTerm = "") {
    const term = normalizeText(searchTerm);
    const words = term.split(/\s+/).filter(Boolean);

    let businessData: any[] = [];

    if (!term) {
      const { data } = await supabase
        .from("businesses")
        .select("*")
        .range(0, 999);

      businessData = data || [];
    } else {
      const { data: candidateBusinesses } = await supabase
        .from("businesses")
        .select("*")
        .or(
          words
            .map(
              (word) =>
                `name.ilike.%${word}%,category.ilike.%${word}%,city.ilike.%${word}%,address.ilike.%${word}%`
            )
            .join(",")
        )
        .range(0, 999);

      const { data: tagData } = await supabase
        .from("positives")
        .select("business_name, tag")
        .or(words.map((word) => `tag.ilike.%${word}%`).join(","))
        .range(0, 999);

      const tagNames = Array.from(
        new Set(
          (tagData || []).map((item) => item.business_name).filter(Boolean)
        )
      );

      let tagBusinessData: any[] = [];

      if (tagNames.length > 0) {
        const { data } = await supabase
          .from("businesses")
          .select("*")
          .in("name", tagNames)
          .range(0, 999);

        tagBusinessData = data || [];
      }

      const merged = [...(candidateBusinesses || []), ...tagBusinessData];

      businessData = Array.from(
        new Map(merged.map((business) => [business.id, business])).values()
      );
    }

    const businessIds = businessData.map((business) => business.id);

let allPositives: any[] = [];

if (businessIds.length > 0) {
  const { data } = await supabase
    .from("positives")
    .select("id, business_id, tag")
    .in("business_id", businessIds)
    .range(0, 4999);

  allPositives = data || [];
}

const businessesWithCounts = businessData.map((business) => {
  const positivesForBusiness = allPositives.filter(
    (positive) => positive.business_id === business.id
  );

      const tags = Array.from(
        new Set(
          positivesForBusiness
            .map((positive) => normalizeText(positive.tag))
            .filter(Boolean)
        )
      );

      return {
        ...business,
        positives: positivesForBusiness.length,
        tags,
      };
    });

    const filtered = businessesWithCounts.filter((business) => {
      if (words.length === 0) return true;

      const text = `${business.name || ""} ${business.category || ""} ${
        business.city || ""
      } ${business.address || ""} ${business.tags.join(" ")}`.toLowerCase();

      return words.every((word) => text.includes(word));
    });

    setBusinesses(filtered);
  }

  function useMyLocationForNewBusiness() {
    if (isLocating) return;

    if (!navigator.geolocation) {
      setMessage("Geolocalizzazione non supportata.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNewLatitude(position.coords.latitude);
        setNewLongitude(position.coords.longitude);
        setMessage("Posizione salvata.");
        setIsLocating(false);
      },
      () => {
        setMessage("Non riesco ad accedere alla posizione.");
        setIsLocating(false);
      }
    );
  }

  async function searchAddressSuggestions() {
    if (!newAddress || !newCity) {
      setMessage("Scrivi indirizzo e città.");
      return;
    }

    setIsSearchingAddress(true);

    try {
      const query = encodeURIComponent(`${newAddress}, ${newCity}`);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5`
      );

      const data = await response.json();
      setAddressSuggestions(data || []);

      if (!data || data.length === 0) {
        setMessage("Nessun indirizzo trovato.");
      }
    } catch {
      setMessage("Errore ricerca indirizzo.");
    }

    setIsSearchingAddress(false);
  }

  async function geocodeAddress() {
    try {
      const query = encodeURIComponent(`${newAddress}, ${newCity}`);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`
      );

      const data = await response.json();

      if (data && data.length > 0) {
        return {
          latitude: Number(data[0].lat),
          longitude: Number(data[0].lon),
        };
      }
    } catch {}

    return {
      latitude: null,
      longitude: null,
    };
  }

  async function addBusiness() {
    if (isCreating) return;

    if (!user) {
      setMessage(
        "Per inserire un'attività è necessario effettuare il login con la propria email. È gratuito e richiede solo pochi secondi."
      );
      return;
    }

    if (!newName || !newCategory || !newCity || !newAddress) {
      setMessage("Compila tutti i campi.");
      return;
    }

    const name = normalizeText(newName);
    const category = normalizeText(newCategory);
    const city = normalizeText(newCity);
    const address = normalizeText(newAddress);

    const { data: existingBusinesses } = await supabase
      .from("businesses")
      .select("id, name, category, city, address")
      .ilike("city", newCity.trim())
      .ilike("address", newAddress.trim());

    const existingDuplicate = (existingBusinesses || []).find((business) => {
      const sameName = normalizeText(business.name) === name;
      const sameCategory = normalizeText(business.category) === category;

      return sameName || sameCategory;
    });

    if (existingDuplicate) {
      setMessage(
        `Questa attività è già presente su Positive oppure è già stata inviata per l'approvazione. Se non la trovi ancora, potrebbe essere in attesa di verifica: ${existingDuplicate.name}`
      );
      return;
    }

    const duplicate = businesses.find((business) => {
      const sameAddress =
        normalizeText(business.city) === city &&
        normalizeText(business.address) === address;

      const sameName = normalizeText(business.name) === name;
      const sameCategory = normalizeText(business.category) === category;

      return sameAddress && (sameName || sameCategory);
    });

    if (duplicate) {
      setMessage(`Possibile duplicato: ${duplicate.name}`);
      return;
    }

    setIsCreating(true);

    let latitude = newLatitude;
    let longitude = newLongitude;

    if (latitude === null || longitude === null) {
      const result = await geocodeAddress();
      latitude = result.latitude;
      longitude = result.longitude;
    }

    const { error } = await supabase.from("businesses").insert([
      {
        name: newName,
        category: newCategory,
        city: newCity,
        address: newAddress,
        latitude,
        longitude,
        created_by: user.id,
      },
    ]);

    if (error) {
      if (error.code === "23505") {
        setMessage(
          "Questa attività è già presente su Positive oppure è già stata inviata per l'approvazione. Se non la trovi ancora, potrebbe essere in attesa di verifica."
        );
      } else {
        setMessage(error.message);
      }

      setIsCreating(false);
      return;
    }

    setNewName("");
    setNewCategory("");
    setNewCity("");
    setNewAddress("");
    setNewLatitude(null);
    setNewLongitude(null);
    setAddressSuggestions([]);

    setMessage("Attività creata!");
    setIsCreating(false);

    loadBusinesses(search);
  }

  function sortNearMe() {
    if (isSorting) return;

    if (!navigator.geolocation) {
      setMessage("Geolocalizzazione non supportata.");
      return;
    }

    setIsSorting(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setIsSorting(false);
      },
      () => {
        setMessage("Non riesco ad accedere alla posizione.");
        setIsSorting(false);
      }
    );
  }

  async function addPositive(business: Business) {
  if (!business.name) return;

  if (!user) {
    const next = window.location.pathname + window.location.search;
    router.push(`/login/qr?next=${encodeURIComponent(next)}`);
    return;
  }

  const tag = normalizeText(positiveTags[business.name || ""]);

  if (tag && tag.includes(" ")) {
    setMessage("Usa una sola parola.");
    return;
  }

  setBusinesses((current) =>
    current.map((item) =>
      item.id === business.id
        ? {
            ...item,
            positives: item.positives + 1,
            tags: tag
              ? Array.from(new Set([...item.tags, tag]))
              : item.tags,
          }
        : item
    )
  );

  const { error } = await supabase.from("positives").insert([
    {
      business_id: business.id,
      business_name: business.name,
      user_id: user.id,
      tag: tag || null,
    },
  ]);

  if (error) {
    if (error.code === "23505" && tag) {
      const { data: existingPositive, error: selectError } = await supabase
        .from("positives")
        .select("id")
        .eq("user_id", user.id)
        .eq("business_id", business.id)
        .single();

      if (selectError || !existingPositive) {
        setMessage(selectError?.message || "Positive esistente non trovato.");
        loadBusinesses(search);
        return;
      }

      const { error: updateError } = await supabase
        .from("positives")
        .update({ tag })
        .eq("id", existingPositive.id);

      if (updateError) {
        setMessage(updateError.message);
      } else {
        setMessage("Grazie per aver COSato!");
        setPositiveTags((current) => ({
          ...current,
          [business.name || ""]: "",
        }));
        loadBusinesses(search);
      }

      return;
    }

    if (error.code === "23505") {
      setMessage("Hai già dato Positive a questa attività.");
    } else {
      setMessage(error.message);
    }

    loadBusinesses(search);
    return;
  }

  setMessage(tag ? "Grazie per aver COSato!" : "Positive salvato!");
  setPositiveTags((current) => ({
    ...current,
    [business.name || ""]: "",
  }));
  loadBusinesses(search);
}
  useEffect(() => {
    const timer = setTimeout(() => {
      loadBusinesses(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const filteredBusinesses = (() => {
    const words = normalizeText(search).split(/\s+/).filter(Boolean);

    function getBusinessScore(business: Business) {
      let score = 0;

      for (const word of words) {
        if ((business.name || "").toLowerCase().includes(word)) score += 80;
        if (business.tags.join(" ").toLowerCase().includes(word)) score += 80;
        if ((business.category || "").toLowerCase().includes(word)) score += 40;
        if ((business.city || "").toLowerCase().includes(word)) score += 30;
        if ((business.address || "").toLowerCase().includes(word)) score += 20;
      }

      score += business.positives * 5;

      if (userLocation && business.latitude && business.longitude) {
        const distance = calculateDistanceKm(
          userLocation.latitude,
          userLocation.longitude,
          business.latitude,
          business.longitude
        );

        score += Math.max(0, 50 - distance);
      }

      return score;
    }

    const sorted = [...businesses].sort(
      (a, b) => getBusinessScore(b) - getBusinessScore(a)
    );

    return sorted.slice(0, 17);
  })();

  return (
    <main className="min-h-screen bg-white px-4 py-5 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-4">
          <img
            src="/positive-wordmark.png"
            alt="Positive"
            className="h-16 md:h-27 w-auto"
          />

          <div className="hidden lg:block rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-sm max-w-xs">
            <p className="font-bold text-gray-900">🏢 Hai un&apos;attività?</p>

            <p className="mt-1 text-sm text-gray-600">
              Gestiscila gratuitamente con Positive for Business.
            </p>

            <Link
              href="/for-business"
              className="mt-3 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Scopri Positive for Business
            </Link>
          </div>

          <div className="flex gap-2 lg:hidden">
            <a
              href="#login-section"
              className="border border-gray-400 px-4 py-2 rounded-2xl text-sm font-medium text-black bg-white"
            >
              Log in
            </a>

            <a
              href="#add-business-section"
              className="bg-black text-white px-4 py-2 rounded-2xl text-sm font-medium"
            >
              Agg. attività
            </a>
          </div>
        </div>

        <p className="text-gray-600 mb-5 text-lg md:text-xl">
          Solo esperienze positive.
        </p>

        <div className="lg:hidden mb-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="font-bold text-gray-900">🏢 Hai un&apos;attività?</p>

          <p className="mt-1 text-sm text-gray-600">
            Gestiscila gratuitamente con Positive for Business.
          </p>

          <Link
            href="/for-business"
            className="mt-3 inline-flex w-full justify-center rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition"
          >
            Scopri Positive for Business
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          <section>
            <BusinessMap businesses={filteredBusinesses} />

            <div className="flex flex-col md:flex-row gap-3 mb-8">
              <input
                placeholder="Cerca attività, città, categoria o COS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-400 rounded-2xl px-5 py-4 w-full text-lg text-black placeholder:text-gray-500"
              />

              <button
                onClick={sortNearMe}
                disabled={isSorting}
                className="border border-gray-400 px-5 py-4 rounded-2xl whitespace-nowrap text-black active:scale-95 transition disabled:opacity-50"
              >
                {isSorting ? "Calcolo..." : "Vicino a me"}
              </button>
            </div>

            <div className="space-y-6">
              {filteredBusinesses.map((business) => (
                <div
                  key={business.id}
                  className="border border-gray-300 rounded-3xl p-5 shadow-md flex flex-row items-center justify-between gap-4"
                >
                  <div>
                    <Link href={`/business/${business.id}`}>
                      <h2 className="text-2xl font-black text-black hover:underline cursor-pointer leading-tight">
                        {business.name}
                      </h2>
                    </Link>

                    <p className="text-gray-700">
                      {business.category} · {business.city}
                    </p>

                    <p className="text-gray-700">{business.address}</p>

                    {business.tags.length > 0 && (
                      <div className="mt-4">
                        <p className="text-[11px] font-black tracking-wide uppercase text-gray-500 mb-2">
                          Top COS
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {business.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="border border-gray-300 rounded-full px-3 py-1 text-xs font-medium text-black"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-gray-600 text-sm mt-1">
                      Positive dal: {formatCreatedAt(business.created_at)}
                    </p>

                    <p className="text-4xl font-black text-black mt-4">
                      +{business.positives}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <p className="text-xs font-black tracking-wide text-black uppercase">
                      COS
                    </p>

                    {(positiveTags[business.name || ""] || "")
                      .trim()
                      .includes(" ") && (
                      <p className="text-red-500 text-[10px] font-medium text-center leading-tight">
                        massimo una parola
                      </p>
                    )}

                    <input
                      placeholder="es. cena"
                      value={positiveTags[business.name || ""] || ""}
                      onChange={(e) =>
                        setPositiveTags((current) => ({
                          ...current,
                          [business.name || ""]: e.target.value,
                        }))
                      }
                      className={`w-24 border rounded-xl px-2 py-2 text-xs text-black placeholder:text-gray-500 text-center ${
                        (positiveTags[business.name || ""] || "")
                          .trim()
                          .includes(" ")
                          ? "border-red-500"
                          : "border-gray-400"
                      }`}
                    />

                    <button
                      onClick={() => addPositive(business)}
                      className="bg-black w-20 h-20 rounded-3xl flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-[0_8px_20px_rgba(0,0,0,0.25)]"
                    >
                      <img
                        src="/positive-logo.png"
                        alt="Positive"
                        className="w-14 h-14 object-contain drop-shadow-[0_0_12px_rgba(255,215,0,0.45)]"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6 lg:sticky lg:top-8 h-fit">
            <div
              id="login-section"
              className="border border-gray-300 rounded-3xl p-5"
            >
              {user ? (
                <div className="grid gap-4">
                  <p className="text-gray-700 text-sm">
                    Accesso come {user.email}
                  </p>

                  <button
                    onClick={logout}
                    className="border border-gray-400 px-4 py-2 rounded-xl text-black active:scale-95 transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid gap-3">
                  <input
                    type="email"
                    placeholder="La tua email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-gray-400 rounded-xl px-4 py-3 text-black placeholder:text-gray-500"
                  />

                  <button
                    onClick={loginWithMagicLink}
                    disabled={isSendingEmail}
                    className="bg-black text-white px-5 py-3 rounded-xl active:scale-95 transition disabled:opacity-50"
                  >
                    {isSendingEmail ? "Invio..." : "Entra"}
                  </button>
                </div>
              )}

              {message && (
                <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-red-700 text-sm font-medium">
                  {message}
                </div>
              )}
            </div>

            <div
              id="add-business-section"
              className="border border-gray-300 rounded-3xl p-5"
            >
              <h2 className="text-xl font-semibold text-black mb-4">
                Non trovi l&apos;attività che cerchi? Aggiungila tu!
              </h2>

              <div className="grid gap-3">
                <input
                  placeholder="Nome"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border border-gray-400 rounded-xl px-3 py-2 text-sm text-black placeholder:text-gray-500"
                />

                <input
                  placeholder="Categoria"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="border border-gray-400 rounded-xl px-3 py-2 text-sm text-black placeholder:text-gray-500"
                />

                <input
                  placeholder="Città"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="border border-gray-400 rounded-xl px-3 py-2 text-sm text-black placeholder:text-gray-500"
                />

                <input
                  placeholder="Indirizzo"
                  value={newAddress}
                  onChange={(e) => {
                    setNewAddress(e.target.value);
                    setNewLatitude(null);
                    setNewLongitude(null);
                    setAddressSuggestions([]);
                  }}
                  className="border border-gray-400 rounded-xl px-3 py-2 text-sm text-black placeholder:text-gray-500"
                />

                <button
                  onClick={searchAddressSuggestions}
                  disabled={isSearchingAddress}
                  className="border border-gray-400 px-4 py-3 rounded-xl text-sm text-black active:scale-95 transition disabled:opacity-50"
                >
                  {isSearchingAddress ? "Cerco..." : "Cerca indirizzo"}
                </button>

                {addressSuggestions.length > 0 && (
                  <div className="border border-gray-300 rounded-xl overflow-hidden text-sm">
                    {addressSuggestions.map((item) => (
                      <button
                        key={item.place_id}
                        onClick={() => {
                          setNewAddress(item.display_name);
                          setNewLatitude(Number(item.lat));
                          setNewLongitude(Number(item.lon));
                          setAddressSuggestions([]);
                          setMessage("Indirizzo selezionato.");
                        }}
                        className="block w-full text-left px-3 py-2 text-black hover:bg-gray-100 active:bg-gray-200 border-b last:border-b-0"
                      >
                        {item.display_name}
                      </button>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-600">
                  Non conosci l&apos;indirizzo?
                </p>

                <button
                  onClick={useMyLocationForNewBusiness}
                  disabled={isLocating}
                  className="border border-gray-400 px-4 py-3 rounded-xl text-sm text-black active:scale-95 transition disabled:opacity-50"
                >
                  {isLocating ? "Cerco..." : "Usa la mia posizione"}
                </button>

                {newLatitude !== null && newLongitude !== null && (
                  <p className="text-xs text-gray-600">
                    {newLatitude.toFixed(4)}, {newLongitude.toFixed(4)}
                  </p>
                )}

                <button
                  onClick={addBusiness}
                  disabled={isCreating}
                  className="bg-black text-white px-4 py-3 rounded-xl text-sm active:scale-95 transition disabled:opacity-50"
                >
                  {isCreating ? "Creazione..." : "Aggiungi attività"}
                </button>
              </div>
            </div>
          </aside>
        </div>

        <footer className="mt-20 border-t border-gray-200 pt-8 pb-10">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-sm text-gray-600">
            <Link href="/contact">Contatti</Link>

            <Link href="/privacy">Privacy & Cookies Policy</Link>

            <Link href="/legal">Note legali</Link>

            <Link href="/for-business">Positive for Business</Link>

            {user && <Link href="/profile">Profilo</Link>}

            {user && <Link href="/my-businesses">Le mie attività</Link>}

            {user?.email === "federico.querio@hotmail.it" && (
              <Link href="/admin">Admin</Link>
            )}
          </div>
        </footer>
      </div>
    </main>
  );
}