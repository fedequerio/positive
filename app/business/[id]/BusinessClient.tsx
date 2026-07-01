"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
  FaWhatsapp,
  FaTelegramPlane,
  FaFacebook,
  FaInstagram,
  FaLink,
} from "react-icons/fa";

type Business = {
  id: number;
  name: string | null;
  category: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  owner_id: string | null;
  description: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  created_at: string;
};

type BusinessPhoto = {
  id: number;
  business_id: number;
  photo_url: string;
  is_cover: boolean;
  created_at: string;
};

type BusinessHour = {
  day_of_week: number;
  is_closed: boolean;
  is_continuous: boolean | null;
  open_time: string | null;
  close_time: string | null;
  open_time_2: string | null;
  close_time_2: string | null;
};

const DAYS = [
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
  "Domenica",
];

function formatCreatedAt(dateString: string) {
  return new Date(dateString).toLocaleDateString("it-IT", {
    month: "long",
    year: "numeric",
  });
}

function normalizeUrl(url: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

function normalizeInstagram(instagram: string | null) {
  if (!instagram) return "";

  if (instagram.startsWith("http://") || instagram.startsWith("https://")) {
    return instagram;
  }

  const cleanHandle = instagram.replace("@", "").trim();
  return `https://instagram.com/${cleanHandle}`;
}
function normalizeText(text?: string | null) {
  return (text || "").trim().toLowerCase();
}

export default function BusinessPage() {
  const params = useParams();
  const businessId = Number(params.id);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [photos, setPhotos] = useState<BusinessPhoto[]>([]);
  const [hours, setHours] = useState<BusinessHour[]>([]);
  const [positives, setPositives] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [cosText, setCosText] = useState("");
  const [topCos, setTopCos] = useState<{ tag: string; count: number }[]>([]);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null
  );
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  async function loadBusiness() {
    const { data } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .single();

    if (!data) return;

    setBusiness(data);

    const { data: positivesData } = await supabase
      .from("positives")
      .select("id, tag")
      .eq("business_id", businessId);

    setPositives(positivesData ? positivesData.length : 0);
    const cosCounts = new Map<string, number>();

(positivesData || []).forEach((positive: any) => {
  const tag = normalizeText(positive.tag);

  if (!tag) return;

  cosCounts.set(tag, (cosCounts.get(tag) || 0) + 1);
});

const sortedCos = Array.from(cosCounts.entries())
  .map(([tag, count]) => ({ tag, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 6);

setTopCos(sortedCos);

    const { data: photoData } = await supabase
      .from("business_photos")
      .select("*")
      .eq("business_id", businessId)
      .order("is_cover", { ascending: false })
      .order("created_at", { ascending: true });

    setPhotos(photoData || []);

    const { data: hoursData } = await supabase
      .from("business_hours")
      .select("*")
      .eq("business_id", businessId)
      .order("day_of_week", { ascending: true });

    setHours(hoursData || []);
  }

  async function loadUser() {
  const { data } = await supabase.auth.getSession();
  const currentUser = data.session?.user ?? null;

  const isFromQr = searchParams.get("source") === "qr";

  if (isFromQr && !currentUser) {
    router.replace(
      `/login/qr?next=${encodeURIComponent(
        `/business/${businessId}?source=qr`
      )}`
    );
    return;
  }

  setUser(currentUser);
}

  async function addPositive() {
  if (!user) {
  const next = window.location.pathname + window.location.search;

  router.push(`/login/qr?next=${encodeURIComponent(next)}`);
  return;
}

  if (!business?.name) return;

  const cleanCos = normalizeText(cosText);

  if (cleanCos && cleanCos.includes(" ")) {
    setMessage("Il COS deve essere una sola parola.");
    return;
  }

  setPositives((current) => current + 1);

  const { error } = await supabase.from("positives").insert([
  {
    business_id: business.id,
    business_name: business.name,
    user_id: user.id,
    tag: cleanCos || null,
  },
]);

  if (error) {
  if (error.code === "23505" && cleanCos) {
  const { data: existingPositive, error: selectError } = await supabase
    .from("positives")
    .select("id")
    .eq("user_id", user.id)
    .eq("business_id", businessId)
    .single();

  if (selectError || !existingPositive) {
    setMessage(selectError?.message || "Positive esistente non trovato.");
    loadBusiness();
    return;
  }

  const { error: updateError } = await supabase
    .from("positives")
    .update({ tag: cleanCos })
    .eq("id", existingPositive.id);

  if (updateError) {
    setMessage(updateError.message);
  } else {
    setMessage("Grazie per aver COSato!");
    setCosText("");
    loadBusiness();
  }

  return;
}

  if (error.code === "23505") {
    setMessage("Hai già dato Positive a questa attività.");
  } else {
    setMessage(error.message);
  }

  loadBusiness();
} else {
  setMessage("Positive salvato!");
  setCosText("");
  loadBusiness();
}
}

  function openPhoto(index: number) {
    setSelectedPhotoIndex(index);
  }

  function closePhoto() {
    setSelectedPhotoIndex(null);
  }

  function showPreviousPhoto() {
    if (selectedPhotoIndex === null || photos.length === 0) return;

    setSelectedPhotoIndex(
      selectedPhotoIndex === 0 ? photos.length - 1 : selectedPhotoIndex - 1
    );
  }

  function showNextPhoto() {
    if (selectedPhotoIndex === null || photos.length === 0) return;

    setSelectedPhotoIndex(
      selectedPhotoIndex === photos.length - 1 ? 0 : selectedPhotoIndex + 1
    );
  }
    function getShareUrl() {
  if (typeof window === "undefined") return "";
  return window.location.href;
}

function getShareText() {
  return `Guarda ${business?.name || "questa attività"} su Positive`;
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(getShareUrl());
    setMessage("Link copiato!");
  } catch {
    setMessage("Non riesco a copiare il link.");
  }
}
  useEffect(() => {
    loadUser();
    loadBusiness();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!business) {
    return (
      <main className="min-h-screen bg-white p-6">
        <p className="text-black">Caricamento...</p>
      </main>
    );
  }

  const coverPhoto = photos.find((photo) => photo.is_cover) || photos[0];

  const mapsUrl =
    business.latitude !== null && business.longitude !== null
      ? `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${business.address || ""}, ${business.city || ""}`
        )}`;

  const isOwner = user?.id === business.owner_id;

  const websiteUrl = normalizeUrl(business.website);
  const instagramUrl = normalizeInstagram(business.instagram);
  const structuredData = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: business.name,
  description: business.description,
  image: coverPhoto?.photo_url,
  address: {
    "@type": "PostalAddress",
    streetAddress: business.address,
    addressLocality: business.city,
    addressCountry: "IT",
  },
  telephone: business.phone,
  url: `https://positive.town/business/${business.id}`,
  sameAs: [
    business.website ? websiteUrl : null,
    business.instagram ? instagramUrl : null,
  ].filter(Boolean),
};
  return (
    <main className="min-h-screen bg-white px-5 py-6 sm:p-8">
      <script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(structuredData),
  }}
/>
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-neutral-600 hover:underline text-sm">
          ← Torna alla lista
        </Link>

        <div className="border rounded-3xl overflow-hidden shadow-md mt-6 bg-white">
          {coverPhoto && (
            <button
              onClick={() =>
                openPhoto(
                  Math.max(
                    0,
                    photos.findIndex((photo) => photo.id === coverPhoto.id)
                  )
                )
              }
              className="block w-full"
            >
              <img
                src={coverPhoto.photo_url}
                alt={business.name || "Foto attività"}
                className="w-full h-72 object-cover"
              />
            </button>
          )}

          <div className="p-6 sm:p-8">
            <p className="text-black font-medium mb-2">
              {business.category} · {business.city}
            </p>

            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-black leading-tight">
              {business.name}
            </h1>

            <p className="text-black text-base sm:text-lg mb-3">
              {business.address}
            </p>

            <p className="text-neutral-500 text-sm mb-4">
              Positive dal: {formatCreatedAt(business.created_at)}
            </p>

            {business.owner_id ? (
              <p className="text-sm text-green-700 font-medium mb-8">
                ✓ Proprietà verificata
              </p>
            ) : (
              <p className="text-sm text-neutral-500 mb-8">
                Proprietà non verificata
              </p>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <p className="text-neutral-600 text-sm mb-1">
                  Positive totali
                </p>

                <p className="text-6xl font-bold text-black">+{positives}</p>
              </div>

              <div className="w-full sm:w-72">
  <label className="block text-xs font-bold uppercase tracking-wide text-black mb-2">
    COS
  </label>

  <input
    placeholder="es. caffè"
    value={cosText}
    onChange={(e) => setCosText(e.target.value)}
    className="w-full border rounded-xl px-4 py-3 text-black placeholder:text-neutral-500 mb-3"
  />

  {cosText.trim().includes(" ") && (
    <p className="text-red-600 text-xs mb-3">
      Usa una sola parola.
    </p>
  )}

 <button
  onClick={addPositive}
  className="w-full bg-black text-white rounded-2xl py-4
             flex items-center justify-center gap-3
             hover:scale-105 active:scale-95 transition"
>
  <img
    src="/positive-logo.png"
    alt="Positive"
    className="w-8 h-8 object-contain shrink-0"
  />

  <span className="text-2xl font-semibold tracking-tight">
    Positive
  </span>
</button>
{message && (
  <p
    className={`mt-3 text-sm text-center font-medium ${
      message.includes("già")
        ? "text-amber-600"
        : message.includes("salvato")
        ? "text-green-600"
        : "text-red-600"
    }`}
  >
    {message}
  </p>
)}

</div>
            </div>
            {topCos.length > 0 && (
  <div className="mt-8 border-t pt-6">
    <h2 className="text-2xl font-bold text-black mb-4">
      COS più citati
    </h2>

    <div className="flex flex-wrap gap-2">
      {topCos.map((item) => (
        <span
          key={item.tag}
          className="border rounded-full px-4 py-2 text-sm text-black"
        >
          {item.tag} ({item.count})
        </span>
      ))}
    </div>
  </div>
)}

            {business.description && (
              <div className="mt-8 border-t pt-6">
                <h2 className="text-2xl font-bold text-black mb-3">
                  Descrizione
                </h2>
                <p className="text-neutral-800 leading-relaxed">
                  {business.description}
                </p>
              </div>
            )}

            {hours.length > 0 && (
              <div className="mt-8 border-t pt-6">
                <h2 className="text-2xl font-bold text-black mb-4">
                  Orari di apertura
                </h2>

                <div className="grid gap-3">
                  {hours.map((hour) => (
                    <div
                      key={hour.day_of_week}
                      className="grid grid-cols-[110px_1fr] gap-4 text-black border-b pb-3 last:border-b-0"
                    >
                      <span className="font-medium">
                        {DAYS[hour.day_of_week]}
                      </span>

                      {hour.is_closed ? (
                        <span className="text-right">Chiuso</span>
                      ) : (
                        <div className="text-right">
                          <p>
                            {hour.open_time || "--:--"} -{" "}
                            {hour.close_time || "--:--"}
                          </p>

                          {!hour.is_continuous &&
                            hour.open_time_2 &&
                            hour.close_time_2 && (
                              <p className="mt-1">
                                {hour.open_time_2} - {hour.close_time_2}
                              </p>
                            )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(business.phone || business.website || business.instagram) && (
              <div className="mt-8 border-t pt-6">
                <h2 className="text-2xl font-bold text-black mb-4">
                  Contatti
                </h2>

                <div className="grid gap-3">
                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="border px-5 py-3 rounded-2xl text-black hover:bg-gray-50"
                    >
                      📞 {business.phone}
                    </a>
                  )}

                  {business.website && (
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border px-5 py-3 rounded-2xl text-black hover:bg-gray-50"
                    >
                      🌐 Sito web
                    </a>
                  )}

                  {business.instagram && (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border px-5 py-3 rounded-2xl text-black hover:bg-gray-50"
                    >
                      📷 Instagram
                    </a>
                  )}
                </div>
              </div>
            )}

            {photos.length > 1 && (
              <div className="mt-8 border-t pt-6">
                <h2 className="text-2xl font-bold text-black mb-4">Foto</h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => openPhoto(index)}
                      className="block w-full"
                    >
                      <img
                        src={photo.photo_url}
                        alt="Foto attività"
                        className="w-full h-32 object-cover rounded-2xl"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-3 mt-8 sm:flex sm:flex-wrap">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border px-5 py-3 rounded-2xl hover:bg-gray-50 text-black text-center"
              >
                📍 Indicazioni Google Maps
              </a>

              {!business.owner_id && (
                <Link
                  href={`/business/${business.id}/claim`}
                  className="border px-5 py-3 rounded-2xl hover:bg-gray-50 text-black text-center"
                >
                  🏢 Questa attività è mia
                </Link>
              )}

              <Link
                href={`/business/${business.id}/report`}
                className="border px-5 py-3 rounded-2xl hover:bg-gray-50 text-black text-center"
              >
                ⚠️ Segnala attività
              </Link>
            </div>
                  <div className="mt-8 border-t pt-6">
  <h2 className="text-2xl font-bold text-black mb-4">
    Condividi attività
  </h2>

  <div className="flex flex-wrap gap-3">

  <a
    href={`https://wa.me/?text=${encodeURIComponent(
      `${getShareText()} ${getShareUrl()}`
    )}`}
    target="_blank"
    rel="noopener noreferrer"
    className="border w-12 h-12 rounded-full hover:bg-gray-50 text-black flex items-center justify-center"
    title="WhatsApp"
  >
    <FaWhatsapp className="text-xl" />
  </a>

  <a
    href={`https://t.me/share/url?url=${encodeURIComponent(
      getShareUrl()
    )}&text=${encodeURIComponent(getShareText())}`}
    target="_blank"
    rel="noopener noreferrer"
    className="border w-12 h-12 rounded-full hover:bg-gray-50 text-black flex items-center justify-center"
    title="Telegram"
  >
    <FaTelegramPlane className="text-xl" />
  </a>

  <a
    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      getShareUrl()
    )}`}
    target="_blank"
    rel="noopener noreferrer"
    className="border w-12 h-12 rounded-full hover:bg-gray-50 text-black flex items-center justify-center"
    title="Facebook"
  >
    <FaFacebook className="text-xl" />
  </a>

  <a
    href="https://instagram.com"
    target="_blank"
    rel="noopener noreferrer"
    className="border w-12 h-12 rounded-full hover:bg-gray-50 text-black flex items-center justify-center"
    title="Instagram"
  >
    <FaInstagram className="text-xl" />
  </a>

  <button
    onClick={copyLink}
    className="border w-12 h-12 rounded-full hover:bg-gray-50 text-black flex items-center justify-center"
    title="Copia link"
  >
    <FaLink className="text-xl" />
  </button>

</div>
</div>


            {isOwner && (
              <div className="mt-8 border rounded-2xl p-5 bg-gray-50">
                <h2 className="text-xl font-semibold mb-2 text-black">
                  Dashboard proprietario
                </h2>

                <p className="text-neutral-700 text-sm">
                  Sei il proprietario verificato di questa attività.
                </p>

                <Link
                  href={`/business/${business.id}/owner`}
                  className="inline-block mt-4 bg-black text-white px-5 py-3 rounded-xl"
                >
                  Gestisci attività
                </Link>
              </div>
            )}

            {message && (
              <p className="text-sm text-neutral-600 mt-6">{message}</p>
            )}
          </div>
        </div>

        <footer className="mt-20 border-t border-gray-200 pt-8 pb-10">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-sm text-gray-600">
            <Link href="/contact">Contatti</Link>

            <Link href="/privacy">Privacy & Cookies Policy</Link>

            <Link href="/legal">Note legali</Link>

            {user && <Link href="/profile">Profilo</Link>}

            {user && <Link href="/my-businesses">Le mie attività</Link>}
          </div>
        </footer>
      </div>

      {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center px-4"
          onClick={closePhoto}
          onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStartX === null) return;

            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) {
              if (diff > 0) {
                showNextPhoto();
              } else {
                showPreviousPhoto();
              }
            }

            setTouchStartX(null);
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              closePhoto();
            }}
            className="absolute top-5 right-5 text-white text-4xl"
          >
            ×
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              showPreviousPhoto();
            }}
            className="hidden sm:flex absolute left-5 text-white text-6xl"
          >
            ‹
          </button>

          <img
            src={photos[selectedPhotoIndex].photo_url}
            alt="Foto attività"
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl"
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              showNextPhoto();
            }}
            className="hidden sm:flex absolute right-5 text-white text-6xl"
          >
            ›
          </button>

          <p className="absolute bottom-5 text-white text-sm">
            {selectedPhotoIndex + 1} / {photos.length}
          </p>
        </div>
      )}
    </main>
  );
}