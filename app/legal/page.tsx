export default function LegalPage() {
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
          Note legali
        </h1>

        <div className="space-y-8 text-gray-700 leading-7">
          <section>
            <h2 className="text-2xl font-bold text-black mb-3">
              1. Informazioni generali
            </h2>

            <p>
              Positive è una piattaforma online che consente agli utenti di
              scoprire, segnalare e valorizzare attività locali tramite il
              sistema “Positive”.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-3">
              2. Contenuti della piattaforma
            </h2>

            <p>
              Le informazioni presenti sul sito possono essere inserite dagli
              utenti o provenire da fonti pubbliche.
            </p>

            <p className="mt-3">
              Positive non garantisce l’accuratezza, completezza o aggiornamento
              costante dei contenuti pubblicati.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-3">
              3. Responsabilità degli utenti
            </h2>

            <p>
              Gli utenti si impegnano a utilizzare il servizio in modo corretto,
              evitando:
            </p>

            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>spam;</li>
              <li>attività fraudolente;</li>
              <li>contenuti offensivi o illeciti;</li>
              <li>manipolazioni del sistema Positive.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-3">
              4. Limitazione di responsabilità
            </h2>

            <p>
              Positive non è responsabile per eventuali danni diretti o indiretti
              derivanti dall’utilizzo della piattaforma o dalle informazioni
              pubblicate dagli utenti.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-3">
              5. Attività e richieste di rimozione
            </h2>

            <p>
              I proprietari delle attività possono richiedere modifiche,
              aggiornamenti o rimozioni tramite l’apposita sezione del sito.
            </p>

            <p className="mt-3">
              Positive si riserva il diritto di valutare e gestire tali richieste
              caso per caso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-3">
              6. Proprietà intellettuale
            </h2>

            <p>
              Il nome “Positive”, il logo, il design e i contenuti originali del
              sito sono protetti dalle normative applicabili in materia di
              proprietà intellettuale.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-3">
              7. Modifiche del servizio
            </h2>

            <p>
              Positive può modificare, sospendere o interrompere il servizio in
              qualsiasi momento senza preavviso.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-3">
              8. Legge applicabile
            </h2>

            <p>
              Le presenti note legali sono regolate dalla legge italiana.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}