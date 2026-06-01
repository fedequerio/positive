export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-8 md:px-8">
      <div className="max-w-3xl mx-auto">
        <a
          href="/"
          className="text-gray-600 hover:text-black"
        >
          ← Torna a Positive
        </a>

        <h1 className="text-4xl font-black text-black mt-8 mb-8">
          Privacy & Cookies Policy
        </h1>

        <div className="space-y-8 text-gray-700 leading-7">
          <section>
            <h2 className="text-2xl font-bold text-black mb-3">
              1. Introduzione
            </h2>

            <p>
              Positive (“Positive”, “noi”, “nostro”) rispetta la privacy degli
              utenti e si impegna a proteggere i dati personali raccolti tramite
              il sito positive.town.
            </p>

            <p className="mt-3">
              Utilizzando il sito, accetti la presente Privacy & Cookies Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-3">
              2. Dati raccolti
            </h2>

            <p>
              Possiamo raccogliere le seguenti informazioni:
            </p>

            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>indirizzo email utilizzato per l’accesso;</li>
              <li>dati inviati tramite form di contatto;</li>
              <li>richieste di modifica o rimozione attività;</li>
              <li>dati tecnici e di utilizzo del sito;</li>
              <li>geolocalizzazione, solo previa autorizzazione dell’utente.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-3">
              3. Finalità del trattamento
            </h2>

            <p>
              I dati raccolti vengono utilizzati per:
            </p>

            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>consentire l’accesso al servizio;</li>
              <li>gestire i Positive e le attività presenti sul sito;</li>
              <li>rispondere alle richieste inviate tramite i form;</li>
              <li>migliorare il funzionamento della piattaforma;</li>
              <li>prevenire spam, abusi e utilizzi fraudolenti.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-3">
              4. Base giuridica
            </h2>

            <p>
              Il trattamento dei dati avviene sulla base:
            </p>

            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>del consenso dell’utente;</li>
              <li>dell’esecuzione del servizio richiesto;</li>
              <li>del legittimo interesse alla sicurezza e gestione del sito.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-3">
              5. Conservazione dei dati
            </h2>

            <p>
              I dati vengono conservati solo per il tempo necessario alle finalità
              indicate nella presente policy o per obblighi di legge.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-3">
              6. Servizi terzi
            </h2>

            <p>
              Positive può utilizzare servizi esterni per il funzionamento della
              piattaforma, inclusi:
            </p>

            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Supabase (database e autenticazione);</li>
              <li>Vercel (hosting);</li>
              <li>OpenStreetMap / Nominatim (mappe e geolocalizzazione);</li>
              <li>Formspree (gestione dei form).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-3">
              7. Cookie
            </h2>

            <p>
              Positive può utilizzare cookie tecnici necessari al funzionamento
              del sito.
            </p>

            <p className="mt-3">
              Al momento non vengono utilizzati cookie pubblicitari o sistemi di
              profilazione avanzata.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-3">
              8. Diritti dell’utente
            </h2>

            <p>
              Gli utenti possono richiedere:
            </p>

            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>accesso ai propri dati;</li>
              <li>rettifica o aggiornamento;</li>
              <li>cancellazione;</li>
              <li>limitazione del trattamento;</li>
              <li>opposizione al trattamento.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-3">
              9. Modifiche
            </h2>

            <p>
              Questa policy può essere aggiornata in qualsiasi momento. Le modifiche
              saranno pubblicate su questa pagina.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-3">
              10. Contatti
            </h2>

            <p>
              Per richieste relative alla privacy o ai dati personali è possibile
              utilizzare il form contatti disponibile sul sito.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}