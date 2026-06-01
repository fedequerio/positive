import Link from "next/link";

export default function BusinessRequestPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-8 md:px-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-gray-600 hover:text-black">
          ← Torna a Positive
        </Link>

        <h1 className="text-4xl font-black text-black mt-8 mb-4">
          Modifica / rimuovi attività
        </h1>

        <p className="text-gray-700 mb-8">
          Sei il proprietario di un’attività o vuoi segnalare una scheda errata?
          Compila il form qui sotto.
        </p>

        <form
          action="https://formspree.io/f/xeedzwzn"
          method="POST"
          className="grid gap-4"
        >
          <input
            required
            type="text"
            name="business_name"
            placeholder="Nome attività"
            className="border border-gray-400 rounded-xl px-4 py-3 text-black placeholder:text-gray-500"
          />

          <input
            required
            type="text"
            name="business_address"
            placeholder="Indirizzo attività"
            className="border border-gray-400 rounded-xl px-4 py-3 text-black placeholder:text-gray-500"
          />

          <input
            required
            type="email"
            name="email"
            placeholder="La tua email"
            className="border border-gray-400 rounded-xl px-4 py-3 text-black placeholder:text-gray-500"
          />

          <select
            required
            name="request_type"
            className="border border-gray-400 rounded-xl px-4 py-3 text-black bg-white"
          >
            <option value="">Tipo di richiesta</option>
            <option value="modify">Modifica dati attività</option>
            <option value="remove">Rimozione attività</option>
            <option value="claim">Rivendica attività</option>
            <option value="duplicate">Segnala duplicato</option>
          </select>

          <textarea
            required
            name="message"
            placeholder="Spiega la richiesta"
            rows={6}
            className="border border-gray-400 rounded-xl px-4 py-3 text-black placeholder:text-gray-500"
          />

          <button className="bg-black text-white rounded-xl px-5 py-3 active:scale-95 transition">
            Invia richiesta
          </button>
        </form>
      </div>
    </main>
  );
}