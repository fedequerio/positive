import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://positive.town"),

  title: "Positive | Attività, luoghi e professionisti consigliati",

  description:
    "Scopri e valorizza attività, luoghi, negozi, ristoranti e professionisti consigliati dalla comunità. Positive raccoglie ciò che merita di essere scoperto.",

  keywords: [
    "Positive",
    "attività consigliate",
    "luoghi consigliati",
    "professionisti consigliati",
    "ristoranti",
    "negozi",
    "attività locali",
    "recensioni positive",
    "segnalazioni positive",
  ],

  openGraph: {
    title: "Positive | Scopri ciò che merita",
    description:
      "Attività, luoghi e professionisti consigliati dalla comunità.",
    url: "https://positive.town",
    siteName: "Positive",
    locale: "it_IT",
    type: "website",
    images: [
      {
        url: "/positive-logo.png",
        width: 1200,
        height: 630,
        alt: "Positive",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Positive | Scopri ciò che merita",
    description:
      "Attività, luoghi e professionisti consigliati dalla comunità.",
    images: ["/positive-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
