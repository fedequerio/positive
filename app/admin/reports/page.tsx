"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

const ADMIN_EMAIL = "federico.querio@hotmail.it";

type BusinessFromReport = {
  id: number;
  name: string | null;
  city: string | null;
  address: string | null;
};

type Report = {
  id: number;
  reason: string;
  created_at: string;
  business_id: number;
  businesses: BusinessFromReport | BusinessFromReport[] | null;
};

export default function ReportsAdminPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [message, setMessage] = useState("");
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  async function loadReports() {
    const { data, error } = await supabase
      .from("reports")
      .select(`
        id,
        reason,
        created_at,
        business_id,
        businesses (
          id,
          name,
          city,
          address
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      setMessage("Errore caricamento segnalazioni.");
      return;
    }

    setReports((data || []) as Report[]);
  }

  async function ignoreReport(reportId: number) {
    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", reportId);

    if (error) {
      console.log(error);
      setMessage("Errore eliminazione segnalazione.");
      return;
    }

    setMessage("Segnalazione ignorata.");
    loadReports();
  }

  async function deleteBusiness(businessId: number) {
    const confirmDelete = window.confirm(
      "Sei sicuro? Questa azione elimina l'attività e le sue segnalazioni."
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("businesses")
      .delete()
      .eq("id", businessId);

    if (error) {
      console.log(error);
      setMessage("Errore eliminazione attività.");
      return;
    }

    setMessage("Attività eliminata.");
    loadReports();
  }

  useEffect(() => {
    async function checkAdmin() {
      const { data } = await supabase.auth.getUser();

      if (!data.user || data.user.email !== ADMIN_EMAIL) {
        window.location.href = "/";
        return;
      }

      await loadReports();
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
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-gray-500 hover:underline">
          ← Torna alla homepage
        </Link>

        <h1 className="text-5xl font-bold mt-8 mb-4 text-black">
          Segnalazioni
        </h1>

        <p className="text-gray-500 mb-8">
          Pannello moderation per controllare attività segnalate.
        </p>

        {message && <p className="text-sm text-gray-500 mb-6">{message}</p>}

        <div className="space-y-4">
          {reports.map((report) => {
            const business = Array.isArray(report.businesses)
              ? report.businesses[0]
              : report.businesses;

            return (
              <div key={report.id} className="border rounded-3xl p-6 shadow-sm">
                <p className="text-sm text-gray-400 mb-2">
                  {new Date(report.created_at).toLocaleString("it-IT")}
                </p>

                <h2 className="text-2xl font-semibold text-black">
                  {business?.name || "Attività non trovata"}
                </h2>

                <p className="text-gray-500">
                  {business?.city} · {business?.address}
                </p>

                <p className="mt-4 text-black">
                  Motivo: <strong>{report.reason}</strong>
                </p>

                <div className="flex flex-wrap gap-3 mt-5">
                  {business?.id && (
                    <Link
                      href={`/business/${business.id}`}
                      className="border px-4 py-2 rounded-xl hover:bg-gray-50 text-black"
                    >
                      Apri attività
                    </Link>
                  )}

                  <button
                    onClick={() => ignoreReport(report.id)}
                    className="border px-4 py-2 rounded-xl hover:bg-gray-50 text-black"
                  >
                    Ignora
                  </button>

                  {business?.id && (
                    <button
                      onClick={() => deleteBusiness(business.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-xl hover:opacity-90"
                    >
                      Elimina attività
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {reports.length === 0 && (
            <p className="text-gray-500">Nessuna segnalazione presente.</p>
          )}
        </div>
      </div>
    </main>
  );
}