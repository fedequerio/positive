"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

type Business = {
  id: number;
  name: string | null;
  category: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  positives: number;
};

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function BusinessMap({
  businesses = [],
}: {
  businesses?: Business[];
}) {
  const businessesWithLocation = businesses.filter(
    (business) => business.latitude !== null && business.longitude !== null
  );

  const center: [number, number] =
    businessesWithLocation.length > 0
      ? [
          businessesWithLocation[0].latitude!,
          businessesWithLocation[0].longitude!,
        ]
      : [45.0703, 7.6869];

  return (
    <div className="border rounded-3xl overflow-hidden mb-8">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="h-[220px] md:h-[300px] w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {businessesWithLocation.map((business) => {
          const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`;

          return (
            <Marker
              key={business.id}
              position={[business.latitude!, business.longitude!]}
              icon={markerIcon}
            >
              <Popup>
                <div>
                  <strong>{business.name}</strong>
                  <br />
                  {business.category} · {business.city}
                  <br />
                  +{business.positives} Positive
                  <br />
                  <br />
                  <Link href={`/business/${business.id}`}>Apri pagina</Link>
                  <br />
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                    Indicazioni Google Maps
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}