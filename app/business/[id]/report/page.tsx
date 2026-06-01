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
};

export default function ReportBusinessPage() {
  const params = useParams();
  const businessId = Number(params.id);

  const [business, setBusiness] = useState<Business | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [sendingReport, setSendingReport] = useState(false);

  async function loadBusiness() {
    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .single();

    if (error) {
      console.log(error);
      setMessage("Errore caricamento attività.");
      return;
    }

    setBusiness(data);
  }

  async function loadUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  }

  async function reportBusiness() {
    if (!user) {
      setMessage("Devi accedere dalla homepage per segnalare un'attività.");
      return;
    }

    if (!business) return;

    if (!reportReason) {
      setMessage("Scegli un motivo per la segnalazione.");
      return;
    }

    setSendingReport(true);

    const { error } = await supabase.from("reports").insert([
      {
        business_id: business.id,
        user_id: user.id,
        reason: reportReason,
      },
    ]);

    if (error) {
      console.log(error);
      setMessage("Hai già inviato questa segnalazione.");
    } else {
      setMessage("Segnalazione inviata. Grazie!");
      setReportReason("");
    }

    setSendingReport(false);
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
      <main className="min-h-screen bg-white p-6 sm:p-8">
        <p className="text-black">Caricamento...</p>
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

        <div className="border rounded-3xl p-6 sm:p-8 mt-6 bg-white shadow-sm">
          <p className="text-black font-medium mb-2">
            {business.category} · {business.city}
          </p>

          <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-black leading-tight">
            Segnala attività
          </h1>

          <p className="text-black text-base sm:text-lg mb-2">
            {business.name}
          </p>

          <p className="text-neutral-700 mb-8">
            {business.address}
          </p>

          <p className="text-neutral-600 text-sm mb-5">
            Aiutaci a mantenere Positive pulito e affidabile. Scegli il motivo
            più adatto alla segnalazione.
          </p>

          <div className="grid gap-4 mb-6 text-black">
            <label className="flex items-center gap-3 border rounded-2xl px-4 py-3">
              <input
                type="radio"
                name="reportReason"
                value="duplicato"
                checked={reportReason === "duplicato"}
                onChange={(e) => setReportReason(e.target.value)}
              />
              <span>Duplicato</span>
            </label>

            <label className="flex items-center gap-3 border rounded-2xl px-4 py-3">
              <input
                type="radio"
                name="reportReason"
                value="fake"
                checked={reportReason === "fake"}
                onChange={(e) => setReportReason(e.target.value)}
              />
              <span>Attività fake</span>
            </label>

            <label className="flex items-center gap-3 border rounded-2xl px-4 py-3">
              <input
                type="radio"
                name="reportReason"
                value="spam"
                checked={reportReason === "spam"}
                onChange={(e) => setReportReason(e.target.value)}
              />
              <span>Spam</span>
            </label>

            <label className="flex items-center gap-3 border rounded-2xl px-4 py-3">
              <input
                type="radio"
                name="reportReason"
                value="offensivo"
                checked={reportReason === "offensivo"}
                onChange={(e) => setReportReason(e.target.value)}
              />
              <span>Contenuto offensivo</span>
            </label>
          </div>

          <button
            onClick={reportBusiness}
            disabled={sendingReport}
            className="bg-black text-white w-full sm:w-auto px-5 py-3 rounded-xl active:scale-95 transition disabled:opacity-50"
          >
            {sendingReport ? "Invio..." : "Invia segnalazione"}
          </button>

          {message && (
            <p className="text-sm text-neutral-600 mt-5">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}