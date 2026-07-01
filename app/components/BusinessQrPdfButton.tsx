"use client";

import jsPDF from "jspdf";
import QRCode from "qrcode";

type Props = {
  businessId: number;
  businessName: string | null;
};

export default function BusinessQrPdfButton({ businessId, businessName }: Props) {
  async function downloadPdf() {
    const url = `https://positive.town/business/${businessId}?source=qr`;

    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 900,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a5",
    });

    const pageWidth = 148;
    const centerX = pageWidth / 2;

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 148, 210, "F");

    pdf.addImage("/positive-wordmark.png", "PNG", 29, 14, 90, 32);

    pdf.setTextColor(17, 17, 17);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("Hai vissuto", centerX, 62, { align: "center" });
    pdf.text("un'esperienza positiva?", centerX, 72, { align: "center" });

    pdf.setFontSize(37);
    pdf.setTextColor(80, 80, 80);
    pdf.text(businessName || "Questa attività", centerX, 86, {
      align: "center",
    });

    pdf.addImage(qrDataUrl, "PNG", 34, 96, 80, 80);

    pdf.setTextColor(17, 17, 17);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("Lascia il tuo Positive", centerX, 186, { align: "center" });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    pdf.text("Condividi ciò che hai apprezzato, bastano 30 secondi", centerX, 196, {
      align: "center",
    });
    pdf.text("e aiuta altre persone a scoprire questa attività.", centerX, 201, {
      align: "center",
    });

    pdf.setFontSize(9);
    pdf.setTextColor(120, 120, 120);
    pdf.text("positive.town", centerX, 207, { align: "center" });

    pdf.save(`positive-qr-${businessName || businessId}.pdf`);
  }

  return (
    <button
      onClick={downloadPdf}
      className="rounded-2xl bg-black px-5 py-3 font-bold text-white active:scale-95 transition"
    >
      Scarica QR Code A5
    </button>
  );
}