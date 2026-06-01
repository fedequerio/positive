"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase";
import type { User } from "@supabase/supabase-js";

type Business = {
  id: number;
  name: string | null;
  category: string | null;
  city: string | null;
  address: string | null;
  owner_id: string | null;
  description: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
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
  is_continuous: boolean;
  open_time: string;
  close_time: string;
  open_time_2: string;
  close_time_2: string;
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

const DEFAULT_HOURS: BusinessHour[] = DAYS.map((_, index) => ({
  day_of_week: index,
  is_closed: false,
  is_continuous: true,
  open_time: "08:00",
  close_time: "19:00",
  open_time_2: "15:00",
  close_time_2: "19:00",
}));

export default function OwnerDashboardPage() {
  const params = useParams();
  const businessId = Number(params.id);

  const [business, setBusiness] = useState<Business | null>(null);
  const [photos, setPhotos] = useState<BusinessPhoto[]>([]);
  const [hours, setHours] = useState<BusinessHour[]>(DEFAULT_HOURS);
  const [user, setUser] = useState<User | null>(null);

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");

  async function loadPage() {
    const { data: userData } = await supabase.auth.getUser();
    const currentUser = userData.user;

    if (!currentUser) {
      window.location.href = "/";
      return;
    }

    setUser(currentUser);

    const { data: businessData, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .single();

    if (error || !businessData) {
      window.location.href = "/";
      return;
    }

    if (businessData.owner_id !== currentUser.id) {
      window.location.href = `/business/${businessId}`;
      return;
    }

    setBusiness(businessData);
    setDescription(businessData.description || "");
    setPhone(businessData.phone || "");
    setWebsite(businessData.website || "");
    setInstagram(businessData.instagram || "");

    await loadPhotos();
    await loadHours();

    setCheckingAccess(false);
  }

  async function loadPhotos() {
    const { data } = await supabase
      .from("business_photos")
      .select("*")
      .eq("business_id", businessId)
      .order("is_cover", { ascending: false })
      .order("created_at", { ascending: true });

    setPhotos(data || []);
  }

  async function loadHours() {
    const { data } = await supabase
      .from("business_hours")
      .select("*")
      .eq("business_id", businessId)
      .order("day_of_week", { ascending: true });

    if (!data || data.length === 0) {
      setHours(DEFAULT_HOURS);
      return;
    }

    const merged = DEFAULT_HOURS.map((defaultDay) => {
      const existing = data.find(
        (item) => item.day_of_week === defaultDay.day_of_week
      );

      return existing
        ? {
            day_of_week: existing.day_of_week,
            is_closed: existing.is_closed,
            is_continuous: existing.is_continuous ?? true,
            open_time: existing.open_time || "08:00",
            close_time: existing.close_time || "19:00",
            open_time_2: existing.open_time_2 || "15:00",
            close_time_2: existing.close_time_2 || "19:00",
          }
        : defaultDay;
    });

    setHours(merged);
  }

  async function saveBusiness() {
    if (!business || !user) return;

    setSaving(true);

    const { error } = await supabase
      .from("businesses")
      .update({
        description,
        phone,
        website,
        instagram,
      })
      .eq("id", business.id);

    setMessage(error ? "Errore salvataggio informazioni." : "Informazioni salvate.");
    setSaving(false);
  }

  function updateHour(
    dayIndex: number,
    field:
      | "is_closed"
      | "is_continuous"
      | "open_time"
      | "close_time"
      | "open_time_2"
      | "close_time_2",
    value: boolean | string
  ) {
    setHours((current) =>
      current.map((hour) =>
        hour.day_of_week === dayIndex ? { ...hour, [field]: value } : hour
      )
    );
  }

  async function saveHours() {
    if (!business) return;

    setSavingHours(true);

    for (const hour of hours) {
      const { error } = await supabase.from("business_hours").upsert(
        {
          business_id: business.id,
          day_of_week: hour.day_of_week,
          is_closed: hour.is_closed,
          is_continuous: hour.is_continuous,
          open_time: hour.is_closed ? null : hour.open_time,
          close_time: hour.is_closed ? null : hour.close_time,
          open_time_2:
            hour.is_closed || hour.is_continuous ? null : hour.open_time_2,
          close_time_2:
            hour.is_closed || hour.is_continuous ? null : hour.close_time_2,
        },
        { onConflict: "business_id,day_of_week" }
      );

      if (error) {
        setMessage("Errore salvataggio orari.");
        setSavingHours(false);
        return;
      }
    }

    setMessage("Orari salvati.");
    setSavingHours(false);
    loadHours();
  }

  async function uploadPhoto(file: File) {
    if (!business || !user) return;

    if (photos.length >= 5) {
      setMessage("Puoi caricare massimo 5 foto per attività.");
      return;
    }

    setUploadingPhoto(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `${business.id}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("business-photos")
      .upload(filePath, file);

    if (uploadError) {
      setMessage("Errore caricamento foto.");
      setUploadingPhoto(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("business-photos")
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase.from("business_photos").insert([
      {
        business_id: business.id,
        photo_url: publicUrlData.publicUrl,
        is_cover: photos.length === 0,
      },
    ]);

    setMessage(
      insertError ? "Foto caricata, ma errore salvataggio." : "Foto caricata."
    );

    await loadPhotos();
    setUploadingPhoto(false);
  }

  async function setCoverPhoto(photoId: number) {
    if (!business) return;

    await supabase
      .from("business_photos")
      .update({ is_cover: false })
      .eq("business_id", business.id);

    await supabase
      .from("business_photos")
      .update({ is_cover: true })
      .eq("id", photoId);

    setMessage("Foto copertina aggiornata.");
    loadPhotos();
  }

  async function deletePhoto(photo: BusinessPhoto) {
    const confirmDelete = window.confirm("Vuoi eliminare questa foto?");
    if (!confirmDelete) return;

    const urlParts = photo.photo_url.split("/business-photos/");
    const filePath = urlParts[1];

    if (filePath) {
      await supabase.storage.from("business-photos").remove([filePath]);
    }

    await supabase.from("business_photos").delete().eq("id", photo.id);

    setMessage("Foto eliminata.");
    loadPhotos();
  }

  useEffect(() => {
    loadPage();
  }, []);

  if (checkingAccess) {
    return (
      <main className="min-h-screen bg-white p-8">
        <p className="text-black">Controllo accesso proprietario...</p>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="min-h-screen bg-white p-8">
        <p className="text-black">Attività non trovata.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-5 py-6 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/business/${business.id}`}
          className="text-neutral-600 hover:underline text-sm"
        >
          ← Torna all’attività
        </Link>

        <div className="border rounded-3xl p-6 sm:p-8 mt-6 bg-white shadow-sm">
          <p className="text-black font-medium mb-2">Dashboard proprietario</p>

          <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-black leading-tight">
            {business.name}
          </h1>

          <p className="text-neutral-700 mb-8">
            {business.category} · {business.city} · {business.address}
          </p>

          <div className="grid gap-4">
            <textarea
              placeholder="Descrizione attività"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded-xl px-4 py-3 w-full min-h-32 text-black"
            />

            <input
              placeholder="Telefono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border rounded-xl px-4 py-3 w-full text-black"
            />

            <input
              placeholder="Sito web"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="border rounded-xl px-4 py-3 w-full text-black"
            />

            <input
              placeholder="Instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="border rounded-xl px-4 py-3 w-full text-black"
            />

            <button
              onClick={saveBusiness}
              disabled={saving}
              className="bg-black text-white px-5 py-3 rounded-xl disabled:opacity-50"
            >
              {saving ? "Salvo..." : "Salva informazioni"}
            </button>
          </div>
        </div>

        <div className="border rounded-3xl p-6 sm:p-8 mt-6 bg-white shadow-sm">
          <h2 className="text-2xl font-bold text-black mb-2">
            Orari di apertura
          </h2>

          <p className="text-neutral-600 text-sm mb-5">
            Puoi usare orario continuato oppure due fasce orarie con pausa.
          </p>

          <div className="grid gap-4">
            {hours.map((hour) => (
              <div key={hour.day_of_week} className="border rounded-2xl p-4">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <p className="font-semibold text-black">
                    {DAYS[hour.day_of_week]}
                  </p>

                  <label className="flex items-center gap-2 text-sm text-black">
                    <input
                      type="checkbox"
                      checked={hour.is_closed}
                      onChange={(e) =>
                        updateHour(
                          hour.day_of_week,
                          "is_closed",
                          e.target.checked
                        )
                      }
                    />
                    Chiuso
                  </label>
                </div>

                {!hour.is_closed && (
                  <div className="grid gap-3">
                    <label className="flex items-center gap-2 text-sm text-black">
                      <input
                        type="checkbox"
                        checked={hour.is_continuous}
                        onChange={(e) =>
                          updateHour(
                            hour.day_of_week,
                            "is_continuous",
                            e.target.checked
                          )
                        }
                      />
                      Orario continuato
                    </label>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <input
                        type="time"
                        value={hour.open_time}
                        onChange={(e) =>
                          updateHour(
                            hour.day_of_week,
                            "open_time",
                            e.target.value
                          )
                        }
                        className="border rounded-xl px-3 py-2 text-black w-full"
                      />

                      <span className="text-neutral-500">-</span>

                      <input
                        type="time"
                        value={hour.close_time}
                        onChange={(e) =>
                          updateHour(
                            hour.day_of_week,
                            "close_time",
                            e.target.value
                          )
                        }
                        className="border rounded-xl px-3 py-2 text-black w-full"
                      />
                    </div>

                    {!hour.is_continuous && (
                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <input
                          type="time"
                          value={hour.open_time_2}
                          onChange={(e) =>
                            updateHour(
                              hour.day_of_week,
                              "open_time_2",
                              e.target.value
                            )
                          }
                          className="border rounded-xl px-3 py-2 text-black w-full"
                        />

                        <span className="text-neutral-500">-</span>

                        <input
                          type="time"
                          value={hour.close_time_2}
                          onChange={(e) =>
                            updateHour(
                              hour.day_of_week,
                              "close_time_2",
                              e.target.value
                            )
                          }
                          className="border rounded-xl px-3 py-2 text-black w-full"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={saveHours}
              disabled={savingHours}
              className="bg-black text-white px-5 py-3 rounded-xl disabled:opacity-50"
            >
              {savingHours ? "Salvo orari..." : "Salva orari"}
            </button>
          </div>
        </div>

        <div className="border rounded-3xl p-6 sm:p-8 mt-6 bg-white shadow-sm">
          <h2 className="text-2xl font-bold text-black mb-2">Foto attività</h2>

          <p className="text-neutral-600 text-sm mb-5">
            Puoi caricare massimo 5 foto. Una foto può essere scelta come
            copertina.
          </p>

          <input
            type="file"
            accept="image/*"
            disabled={uploadingPhoto || photos.length >= 5}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadPhoto(file);
              e.currentTarget.value = "";
            }}
            className="border rounded-xl px-4 py-3 w-full text-black mb-5"
          />

          <div className="grid sm:grid-cols-2 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="border rounded-2xl overflow-hidden">
                <img
                  src={photo.photo_url}
                  alt="Foto attività"
                  className="w-full h-48 object-cover"
                />

                <div className="p-4">
                  {photo.is_cover ? (
                    <p className="text-sm font-medium text-green-700 mb-3">
                      ✓ Foto copertina
                    </p>
                  ) : (
                    <button
                      onClick={() => setCoverPhoto(photo.id)}
                      className="border px-4 py-2 rounded-xl text-sm text-black mb-3"
                    >
                      Imposta copertina
                    </button>
                  )}

                  <button
                    onClick={() => deletePhoto(photo)}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            ))}
          </div>

          {photos.length === 0 && (
            <p className="text-neutral-600 text-sm">Nessuna foto caricata.</p>
          )}
        </div>

        {message && (
          <p className="text-sm text-neutral-600 mt-5">{message}</p>
        )}
        <footer className="mt-20 border-t border-gray-200 pt-8 pb-10">
  <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-sm text-gray-600">
    <Link href="/contact">Contatti</Link>

    <Link href="/privacy">
      Privacy & Cookies Policy
    </Link>

    <Link href="/legal">
      Note legali
    </Link>

    {user && (
      <Link href="/profile">
        Profilo
      </Link>
    )}

    {user && (
      <Link href="/my-businesses">
        Le mie attività
      </Link>
    )}
  </div>
</footer>
      </div>
    </main>
  );
}