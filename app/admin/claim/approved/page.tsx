"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../../lib/supabase";

const ADMIN_EMAIL = "federico.querio@hotmail.it";

type BusinessFromClaim = {
  id: number;
  name: string | null;
  city: string | null;
  address: string | null;
};

type Claim = {
  id: number;
  claimant_name: string | null;
  role: string | null;
  business_email: string | null;
  phone: string | null;
  message: string | null;
  admin_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  businesses: BusinessFromClaim | BusinessFromClaim[] | null;
};

export default function ApprovedClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  async function loadClaims() {
    const { data } = await supabase
      .from("business_claims")
      .select(`
        id,
        claimant_name,
        role,
        business_email,
        phone,
        message,
        admin_note,
        reviewed_at,
        created_at,
        businesses (
          id,
          name,
          city,
          address
        )
      `)
      .eq("status", "approved")
      .order("reviewed_at", { ascending: false });

    setClaims((data || []) as Claim[]);
  }

  useEffect(() => {
    async function checkAdmin() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user || user.email !== ADMIN_EMAIL) {
        window.location.href = "/";
        return;
      }

      await loadClaims();
      setCheckingAdmin(false);
    }

    checkAdmin();
  }, []);

  if (checkingAdmin) {
    return (
      <main className="min-h-screen bg-white p-8">
        <p>Controllo permessi...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin/claim" className="text-gray-500 hover:underline">
          ← Claim in attesa
        </Link>

        <h1 className="text-5xl font-bold mt-8 mb-8">Claim approvati</h1>

        <div className="space-y-5">
          {claims.map((claim) => {
            const business = Array.isArray(claim.businesses)
              ? claim.businesses[0]
              : claim.businesses;

            return (
              <div key={claim.id} className="border rounded-3xl p-6">
                <h2 className="text-2xl font-semibold">
                  {business?.name || "Attività non trovata"}
                </h2>

                <p className="text-gray-500">
                  {business?.city} · {business?.address}
                </p>

                <p className="text-sm text-gray-400 mt-2">
                  Approvato il{" "}
                  {claim.reviewed_at
                    ? new Date(claim.reviewed_at).toLocaleString("it-IT")
                    : "-"}
                </p>

                <div className="grid md:grid-cols-2 gap-4 mt-6 text-sm">
                  <p><strong>Richiedente:</strong> {claim.claimant_name}</p>
                  <p><strong>Ruolo:</strong> {claim.role}</p>
                  <p><strong>Email:</strong> {claim.business_email}</p>
                  <p><strong>Telefono:</strong> {claim.phone}</p>
                </div>

                {business?.id && (
                  <Link href={`/business/${business.id}`} className="inline-block mt-5 border px-4 py-2 rounded-xl">
                    Apri attività
                  </Link>
                )}
              </div>
            );
          })}

          {claims.length === 0 && (
            <p className="text-gray-500">Nessun claim approvato.</p>
          )}
        </div>
      </div>
    </main>
  );
}