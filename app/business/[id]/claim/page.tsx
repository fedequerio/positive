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
};

export default function ClaimBusinessPage() {
  const params = useParams();
  const businessId = Number(params.id);

  const [business, setBusiness] = useState<Business | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");

  const [claimantName, setClaimantName] = useState("");
  const [claimRole, setClaimRole] = useState("");
  const [claimBusinessEmail, setClaimBusinessEmail] = useState("");
  const [claimPhone, setClaimPhone] = useState("");
  const [claimMessage, setClaimMessage] = useState("");
  const [claimBillFile, setClaimBillFile] = useState<File | null>(null);
  const [sendingClaim, setSendingClaim] = useState(false);

  async function loadBusiness() {
    const { data } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .single();

    if (data) setBusiness(data);
  }

  async function loadUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  }

  async function claimBusiness() {
    if (!user) {
      setMessage("Devi accedere per richiedere la proprietà.");
      return;
    }

    if (!business) return;

    if (
      !claimantName ||
      !claimRole ||
      !claimBusinessEmail ||
      !claimPhone ||
      !claimBillFile
    ) {
      setMessage("Compila tutti i campi e carica la fattura.");
      return;
    }

    setSendingClaim(true);

    const fileExt = claimBillFile.name.split(".").pop();
    const filePath = `${business.id}/${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("claim-documents")
      .upload(filePath, claimBillFile);

    if (uploadError) {
      console.log(uploadError);
      setMessage("Errore caricamento fattura.");
      setSendingClaim(false);
      return;
    }

    const { error } = await supabase.from("business_claims").insert([
      {
        business_id: business.id,
        user_id: user.id,
        claimant_name: claimantName,
        role: claimRole,
        business_email: claimBusinessEmail,
        phone: claimPhone,
        message: claimMessage,
        bill_file_path: filePath,
        status: "pending",
      },
    ]);

    if (error) {
      console.log(error);
      setMessage("Hai già inviato una richiesta o c'è stato un errore.");
    } else {
      setMessage("Richiesta inviata. Verrà controllata dall'admin.");
      setClaimantName("");
      setClaimRole("");
      setClaimBusinessEmail("");
      setClaimPhone("");
      setClaimMessage("");
      setClaimBillFile(null);
    }

    setSendingClaim(false);
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
      <main className="min-h-screen bg-white px-5 py-6 sm:p-8">
        <p className="text-black">Caricamento...</p>
      </main>
    );
  }

  if (business.owner_id) {
    return (
      <main className="min-h-screen bg-white px-5 py-6 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <Link
            href={`/business/${business.id}`}
            className="text-neutral-600 hover:underline text-sm"
          >
            ← Torna all’attività
          </Link>

          <div className="border rounded-3xl p-5 sm:p-8 mt-6 sm:mt-8 bg-white">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-black">
              Proprietà già verificata
            </h1>

            <p className="text-black">
              Questa attività ha già un proprietario verificato.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-5 py-6 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/business/${business.id}`}
          className="text-neutral-600 hover:underline text-sm"
        >
          ← Torna all’attività
        </Link>

        <div className="border rounded-3xl p-5 sm:p-8 mt-6 sm:mt-8 bg-white">
          <p className="text-black mb-2 font-medium">
            {business.category} · {business.city}
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-black leading-tight">
            Richiedi proprietà
          </h1>

          <p className="text-black mb-8">
            {business.name} · {business.address}
          </p>

          <div className="grid gap-3">
            <input
              placeholder="Nome richiedente"
              value={claimantName}
              onChange={(e) => setClaimantName(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-black"
            />

            <select
              value={claimRole}
              onChange={(e) => setClaimRole(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-black"
            >
              <option value="">Seleziona ruolo</option>
              <option value="proprietario">Proprietario</option>
              <option value="manager">Manager</option>
              <option value="dipendente">Dipendente</option>
            </select>

            <input
              type="email"
              placeholder="Email aziendale"
              value={claimBusinessEmail}
              onChange={(e) => setClaimBusinessEmail(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-black"
            />

            <input
              placeholder="Telefono"
              value={claimPhone}
              onChange={(e) => setClaimPhone(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 text-black"
            />

            <textarea
              placeholder="Note aggiuntive opzionali"
              value={claimMessage}
              onChange={(e) => setClaimMessage(e.target.value)}
              className="w-full border rounded-xl px-4 py-3 min-h-24 text-black"
            />

            <p className="text-sm text-black leading-relaxed">
              Carica una fattura energia elettrica recente intestata
              all’attività. Devono essere visibili intestazione e indirizzo.
              Puoi oscurare importi, POD, consumi, codice cliente e altri dati
              non necessari.
            </p>

            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setClaimBillFile(e.target.files?.[0] || null)}
              className="w-full border rounded-xl px-4 py-3 text-black"
            />

            <button
              onClick={claimBusiness}
              disabled={sendingClaim}
              className="bg-black text-white px-5 py-3 rounded-xl active:scale-95 transition disabled:opacity-50"
            >
              {sendingClaim ? "Invio..." : "Richiedi proprietà"}
            </button>

            {message && (
              <p className="text-sm text-black mt-2">
                {message}
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