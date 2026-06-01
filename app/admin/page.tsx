"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

const ADMIN_EMAIL = "federico.querio@hotmail.it";

export default function AdminHomePage() {
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user || user.email !== ADMIN_EMAIL) {
        window.location.href = "/";
        return;
      }

      setCheckingAdmin(false);
    }

    checkAdmin();
  }, []);

  if (checkingAdmin) {
    return (
      <main className="min-h-screen bg-white p-8">
        <p className="text-black">Controllo permessi...</p>
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
          Admin
        </h1>

        <p className="text-neutral-600 mb-8">
          Pannello amministrazione Positive.
        </p>

        <div className="grid gap-4">
          <Link href="/admin/claim" className="border rounded-3xl p-6 hover:bg-gray-50">
            <h2 className="text-2xl font-bold text-black">Claim in attesa</h2>
            <p className="text-neutral-600 mt-1">Approva o rifiuta richieste proprietà.</p>
          </Link>

          <Link href="/admin/claim/approved" className="border rounded-3xl p-6 hover:bg-gray-50">
            <h2 className="text-2xl font-bold text-black">Claim approvati</h2>
            <p className="text-neutral-600 mt-1">Storico proprietà approvate.</p>
          </Link>

          <Link href="/admin/claim/rejected" className="border rounded-3xl p-6 hover:bg-gray-50">
            <h2 className="text-2xl font-bold text-black">Claim rifiutati</h2>
            <p className="text-neutral-600 mt-1">Storico richieste rifiutate.</p>
          </Link>

          <Link href="/admin/reports" className="border rounded-3xl p-6 hover:bg-gray-50">
            <h2 className="text-2xl font-bold text-black">Segnalazioni</h2>
            <p className="text-neutral-600 mt-1">Controlla attività segnalate.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}