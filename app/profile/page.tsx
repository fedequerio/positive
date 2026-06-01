"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import type { User } from "@supabase/supabase-js";

type Positive = {
  id: number;
  business_name: string;
  created_at: string;
};

type Business = {
  id: number;
  name: string | null;
  city: string | null;
  address: string | null;
  category: string | null;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [positives, setPositives] = useState<Positive[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadProfile() {
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      window.location.href = "/";
      return;
    }

    setUser(userData.user);

    const { data: positivesData, error: positivesError } = await supabase
      .from("positives")
      .select("id, business_name, created_at")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (positivesError) {
      console.log(positivesError);
      setMessage("Errore caricamento Positive.");
      setLoading(false);
      return;
    }

    setPositives(positivesData || []);

    const names = (positivesData || []).map((positive) => positive.business_name);

    if (names.length > 0) {
      const { data: businessesData } = await supabase
        .from("businesses")
        .select("id, name, city, address, category")
        .in("name", names);

      setBusinesses(businessesData || []);
    }

    setLoading(false);
  }

  async function removePositive(positiveId: number) {
    const confirmRemove = window.confirm("Vuoi togliere questo Positive?");

    if (!confirmRemove) return;

    const { error } = await supabase
      .from("positives")
      .delete()
      .eq("id", positiveId);

    if (error) {
      console.log(error);
      setMessage("Errore rimozione Positive.");
      return;
    }

    setMessage("Positive rimosso.");
    loadProfile();
  }

  function findBusinessByName(name: string) {
    return businesses.find((business) => business.name === name);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-white p-8">
        <p className="text-black">Caricamento profilo...</p>
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
          Il mio profilo
        </h1>

        <p className="text-neutral-600 mb-8">
          Accesso come {user?.email}
        </p>

        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href="/my-businesses"
            className="border px-5 py-3 rounded-xl text-black hover:bg-gray-50"
          >
            Le mie attività
          </Link>
        </div>

        {message && (
          <p className="text-sm text-neutral-600 mb-6">
            {message}
          </p>
        )}

        <div className="border rounded-3xl p-6 sm:p-8 bg-white shadow-sm">
          <h2 className="text-3xl font-bold text-black mb-6">
            I miei Positive
          </h2>

          <div className="space-y-4">
            {positives.map((positive) => {
              const business = findBusinessByName(positive.business_name);

              return (
                <div
                  key={positive.id}
                  className="border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div>
                    {business ? (
                      <Link href={`/business/${business.id}`}>
                        <h3 className="text-xl font-bold text-black hover:underline">
                          {business.name}
                        </h3>
                      </Link>
                    ) : (
                      <h3 className="text-xl font-bold text-black">
                        {positive.business_name}
                      </h3>
                    )}

                    {business && (
                      <p className="text-neutral-700 mt-1">
                        {business.category} · {business.city}
                      </p>
                    )}

                    <p className="text-neutral-500 text-sm mt-1">
                      Positive dato il{" "}
                      {new Date(positive.created_at).toLocaleDateString("it-IT")}
                    </p>
                  </div>

                  <button
                    onClick={() => removePositive(positive.id)}
                    className="border px-4 py-2 rounded-xl text-black hover:bg-gray-50 active:scale-95 transition"
                  >
                    Togli Positive
                  </button>
                </div>
              );
            })}

            {positives.length === 0 && (
              <p className="text-neutral-600">
                Non hai ancora dato nessun Positive.
              </p>
            )}
          </div>
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