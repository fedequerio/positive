"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

const ADMIN_EMAIL = "federico.querio@hotmail.it";

type BusinessFromClaim = {
  id: number;
  name: string | null;
  city: string | null;
  address: string | null;
};

type Claim = {
  id: number;
  business_id: number;
  user_id: string;
  claimant_name: string | null;
  role: string | null;
  business_email: string | null;
  phone: string | null;
  message: string | null;
  bill_file_path: string | null;
  status: string | null;
  created_at: string;
  businesses: BusinessFromClaim | BusinessFromClaim[] | null;
};

export default function AdminClaimPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [message, setMessage] = useState("");
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  async function loadClaims() {
    const { data, error } = await supabase
      .from("business_claims")
      .select(`
        id,
        business_id,
        user_id,
        claimant_name,
        role,
        business_email,
        phone,
        message,
        bill_file_path,
        status,
        created_at,
        businesses (
          id,
          name,
          city,
          address
        )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      setMessage("Errore caricamento claim.");
      return;
    }

    setClaims((data || []) as Claim[]);
  }

  async function openDocument(path: string | null) {
    if (!path) return;

    const { data, error } = await supabase.storage
      .from("claim-documents")
      .createSignedUrl(path, 60);

    if (error || !data?.signedUrl) {
      console.log(error);
      setMessage("Errore apertura documento.");
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  async function approveClaim(claim: Claim) {
    const confirmApprove = window.confirm(
      "Vuoi approvare questo claim e rendere l'utente proprietario dell'attività?"
    );

    if (!confirmApprove) return;

    const { error: businessError } = await supabase
      .from("businesses")
      .update({ owner_id: claim.user_id })
      .eq("id", claim.business_id);

    if (businessError) {
      console.log(businessError);
      setMessage("Errore approvazione attività.");
      return;
    }

    const { error: claimError } = await supabase
      .from("business_claims")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", claim.id);

    if (claimError) {
      console.log(claimError);
      setMessage("Attività approvata, ma errore aggiornamento claim.");
      return;
    }

    setMessage("Claim approvato.");
    loadClaims();
  }

  async function rejectClaim(claimId: number) {
    const confirmReject = window.confirm("Vuoi rifiutare questo claim?");

    if (!confirmReject) return;

    const { error } = await supabase
      .from("business_claims")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", claimId);

    if (error) {
      console.log(error);
      setMessage("Errore rifiuto claim.");
      return;
    }

    setMessage("Claim rifiutato.");
    loadClaims();
  }

  useEffect(() => {
    async function checkAdmin() {
      const { data } = await supabase.auth.getUser();

      if (data.user?.email !== ADMIN_EMAIL) {
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
        <Link href="/" className="text-gray-500 hover:underline">
          ← Torna alla homepage
        </Link>

        <h1 className="text-5xl font-bold mt-8 mb-4">Claim attività</h1>

        <p className="text-gray-500 mb-4">Claim in attesa di approvazione.</p>

        <div className="flex gap-3 mb-8">
          <Link href="/admin/claim/approved" className="border px-4 py-2 rounded-xl">
            Approvati
          </Link>

          <Link href="/admin/claim/rejected" className="border px-4 py-2 rounded-xl">
            Rifiutati
          </Link>
        </div>

        {message && <p className="text-sm text-gray-500 mb-6">{message}</p>}

        <div className="space-y-5">
          {claims.map((claim) => {
            const business = Array.isArray(claim.businesses)
              ? claim.businesses[0]
              : claim.businesses;

            return (
              <div key={claim.id} className="border rounded-3xl p-6 shadow-sm">
                <h2 className="text-2xl font-semibold">
                  {business?.name || "Attività non trovata"}
                </h2>

                <p className="text-gray-500">
                  {business?.city} · {business?.address}
                </p>

                <div className="grid md:grid-cols-2 gap-4 mt-6 text-sm">
                  <p><strong>Richiedente:</strong> {claim.claimant_name}</p>
                  <p><strong>Ruolo:</strong> {claim.role}</p>
                  <p><strong>Email:</strong> {claim.business_email}</p>
                  <p><strong>Telefono:</strong> {claim.phone}</p>
                </div>

                {claim.message && (
                  <p className="mt-4 text-gray-600">
                    <strong>Note:</strong> {claim.message}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 mt-6">
                  {business?.id && (
                    <Link href={`/business/${business.id}`} className="border px-4 py-2 rounded-xl">
                      Apri attività
                    </Link>
                  )}

                  {claim.bill_file_path && (
                    <button onClick={() => openDocument(claim.bill_file_path)} className="border px-4 py-2 rounded-xl">
                      Apri fattura
                    </button>
                  )}

                  <button onClick={() => approveClaim(claim)} className="bg-black text-white px-4 py-2 rounded-xl">
                    Approva
                  </button>

                  <button onClick={() => rejectClaim(claim.id)} className="bg-red-600 text-white px-4 py-2 rounded-xl">
                    Rifiuta
                  </button>
                </div>
              </div>
            );
          })}

          {claims.length === 0 && (
            <p className="text-gray-500">Nessun claim in attesa.</p>
          )}
        </div>
      </div>
    </main>
  );
}