import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

  title: "Positive | Attività, luoghi e professionisti consigliati nel Canavese",

  description:
    "Scopri attività, negozi, ristoranti e professionisti consigliati dalla comunità nel Canavese. Positive valorizza ciò che merita di essere scoperto.",

  keywords: [
    "Canavese",
    "Ivrea",
    "Rivarolo Canavese",
    "attività locali",
    "ristoranti",
    "negozi",
    "professionisti",
    "Positive",
  ],

  openGraph: {
    title: "Positive",
    description:
      "Scopri attività, luoghi e professionisti consigliati nel Canavese.",
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
    title: "Positive",
    description:
      "Scopri attività, luoghi e professionisti consigliati nel Canavese.",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
