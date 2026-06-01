"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import type { User } from "@supabase/supabase-js";

type Business = {
  id: number;
  name: string | null;
  category: string | null;
  city: string | null;
  address: string | null;
};

export default function MyBusinessesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMyBusinesses() {
    const { data: userData } = await supabase.auth.getUser();
    const currentUser = userData.user;

    if (!currentUser) {
      window.location.href = "/";
      return;
    }

    setUser(currentUser);

    const { data, error } = await supabase
      .from("businesses")
      .select("id, name, category, city, address")
      .eq("owner_id", currentUser.id)
      .order("name", { ascending: true });

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    setBusinesses(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadMyBusinesses();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-8">
        <p className="text-black">Caricamento attività...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-5 py-6 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-neutral-600 hover:underline text-sm">
          ← Torna alla homepage
        </Link>

        <h1 className="text-5xl font-bold mt-8 mb-3 text-black">
          Le mie attività
        </h1>

        <p className="text-neutral-600 mb-8">
          {businesses.length === 1
            ? "1 attività verificata"
            : `${businesses.length} attività verificate`}
        </p>

        <div className="space-y-4">
          {businesses.map((business) => (
            <div
              key={business.id}
              className="border rounded-3xl p-6 shadow-sm bg-white"
            >
              <Link href={`/business/${business.id}`}>
                <h2 className="text-2xl font-bold text-black hover:underline">
                  {business.name}
                </h2>
              </Link>

              <p className="text-black mt-1">
                {business.category} · {business.city}
              </p>

              <p className="text-neutral-700 mt-1">
                {business.address}
              </p>

              <Link
                href={`/business/${business.id}/owner`}
                className="inline-block mt-5 bg-black text-white px-5 py-3 rounded-xl active:scale-95 transition"
              >
                Gestisci
              </Link>
            </div>
          ))}

          {businesses.length === 0 && (
            <div className="border rounded-3xl p-6">
              <p className="text-black font-medium">
                Non gestisci ancora nessuna attività.
              </p>

              <p className="text-neutral-600 mt-2">
                Quando una tua richiesta di proprietà viene approvata, apparirà qui.
              </p>
            </div>
          )}
        </div>
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