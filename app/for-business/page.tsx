import Link from "next/link";

export const metadata = {
  title: "Positive for Business | Positive",
  description:
    "Gestisci gratuitamente la presenza della tua attività su Positive e fatti scoprire da chi cerca esperienze positive.",
};

export default function PositiveForBusinessPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-8 md:px-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          ← Torna a Positive
        </Link>

        <section className="mt-10">
          <h1 className="text-4xl md:text-6xl font-black text-black leading-tight">
            Positive <span className="text-[#D4AF37]">for Business</span>
          </h1>

          <p className="mt-6 text-xl md:text-2xl text-gray-700 leading-relaxed">
            Gestisci la presenza della tua attività su Positive.
          </p>

          <p className="mt-6 text-gray-700 text-lg leading-relaxed">
              Con Positive puoi dare più visibilità alla tua attività, valorizzare ciò che i clienti apprezzano davvero e completare la tua scheda con informazioni utili come foto, orari e dettagli.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">

  {/* Attività già presente */}
  <div className="rounded-3xl border border-gray-200 bg-gray-50 p-8 flex flex-col">
    <h2 className="text-2xl font-black text-black">
      ✔ La tua attività è già presente?
    </h2>

    <p className="mt-4 text-gray-700 leading-relaxed flex-1">
      Cercala su Positive, apri la scheda e richiedine la gestione gratuitamente.
    
      Potrai aggiungere foto, orari e tutte le informazioni utili.
    </p>

    <Link
      href="/"
      className="mt-6 inline-flex justify-center rounded-2xl bg-black px-6 py-4 font-bold text-white hover:opacity-90 transition"
    >
      Trova la tua attività
    </Link>
  </div>

  {/* Attività non presente */}
  <div className="rounded-3xl border border-gray-200 bg-gray-50 p-8 flex flex-col">
    <h2 className="text-2xl font-black text-black">
      ➕ Non trovi la tua attività?
    </h2>

    <p className="mt-4 text-gray-700 leading-relaxed flex-1">
      Aggiungila gratuitamente. Dopo una rapida verifica sarà pubblicata su
      Positive e potrà essere scoperta da tutti.
    </p>

    <Link
      href="/#add-business-section"
      className="mt-6 inline-flex justify-center rounded-2xl border border-gray-400 px-6 py-4 font-bold text-black hover:bg-gray-100 transition"
    >
      Aggiungi attività
    </Link>
  </div>

</div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-gray-200 p-6">
              <h3 className="font-black text-black">1. Cerca</h3>
              <p className="mt-3 text-gray-700">
                Trova la tua attività nella mappa o nella ricerca.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 p-6">
              <h3 className="font-black text-black">2. Apri</h3>
              <p className="mt-3 text-gray-700">
                Clicca sul nome ed entra nella scheda dell’attività.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-200 p-6">
              <h3 className="font-black text-black">3. Richiedi</h3>
              <p className="mt-3 text-gray-700">
                Clicca su “Questa attività è mia” e invia la richiesta.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-3xl bg-black p-6 md:p-8 text-white">
            <h2 className="text-2xl font-black">
              Perché usare Positive for Business?
            </h2>

            <ul className="mt-6 grid gap-3 text-gray-200">
              <li>✓ Fai conoscere la tua attività a nuovi clienti.</li>
              <li>✓ Dai spazio alle esperienze positive.</li>
              <li>✓ Completa la tua scheda con informazioni utili.</li>
              <li>✓ È gratuito e richiede pochi minuti.</li>
            </ul>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            Positive è appena nato: ogni attività inserita contribuisce a
            costruire una mappa delle esperienze positive del territorio.
          </p>
        </section>
      </div>
    </main>
  );
}