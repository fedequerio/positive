import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-8 md:px-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-gray-600 hover:text-black">
          ← Torna a Positive
        </Link>

        <h1 className="text-4xl font-black text-black mt-8 mb-4">
          Contatti
        </h1>

        <p className="text-gray-700 mb-8">
          Hai domande, suggerimenti o vuoi contattarci? Compila il form qui sotto.
        </p>

        <form
          action="https://formspree.io/f/mzdwvqzw"
          method="POST"
          className="grid gap-4"
        >
          <input
            required
            type="text"
            name="name"
            placeholder="Nome"
            className="border border-gray-400 rounded-xl px-4 py-3 text-black placeholder:text-gray-500"
          />

          <input
            required
            type="email"
            name="email"
            placeholder="Email"
            className="border border-gray-400 rounded-xl px-4 py-3 text-black placeholder:text-gray-500"
          />

          <textarea
            required
            name="message"
            placeholder="Messaggio"
            rows={6}
            className="border border-gray-400 rounded-xl px-4 py-3 text-black placeholder:text-gray-500"
          />

          <button className="bg-black text-white rounded-xl px-5 py-3 active:scale-95 transition">
            Invia
          </button>
        </form>
      </div>
    </main>
  );
}