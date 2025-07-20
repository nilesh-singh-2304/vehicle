"use client";

import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  useMap,
} from "react-leaflet";
import L, { LatLngTuple, Marker as LeafletMarker } from "leaflet";
import { useEffect, useRef, useState } from "react";
import dummyRoute from "@/public/dummy-route.json";

// Car icon
const carIcon = new L.Icon({
  iconUrl: "/car-door-1.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const FlyToLocation = ({ position }: { position: LatLngTuple }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, map.getZoom(), { duration: 1.2 });
  }, [position, map]);
  return null;
};

export default function MapComponent() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [loop, setLoop] = useState(false);
  const markerRef = useRef<LeafletMarker | null>(null);

  const coords: LatLngTuple[] = dummyRoute.map((pt) => [
    pt.latitude,
    pt.longitude,
  ]);
  const timestamps: number[] = dummyRoute.map((pt) =>
    new Date(pt.timestamp).getTime()
  );

  const current = coords[index];
  const nextIndex = reverse ? index - 1 : index + 1;
  const next = coords[nextIndex] ?? current;

  const heading =
    Math.atan2(next[1] - current[1], next[0] - current[0]) * (180 / Math.PI);
  const distance = getDistance(current, next);
  const timeDiff = Math.abs(timestamps[nextIndex] - timestamps[index]) / 1000;
  const speed =
    timeDiff > 0 ? (distance / 1000 / (timeDiff / 3600)).toFixed(2) : "0.00";

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (playing) {
      interval = setInterval(() => {
        setIndex((prev) => {
          if (reverse) {
            if (prev > 0) return prev - 1;
            return loop ? coords.length - 1 : prev;
          } else {
            if (prev < coords.length - 1) return prev + 1;
            return loop ? 0 : prev;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [playing, reverse, loop]);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(current);
    }
  }, [index]);

  return (
    <div className="relative w-full h-[85vh] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      <MapContainer
        center={coords[0]}
        zoom={16}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='© <a href="https://carto.com/">CARTO</a>'
        />
        <Polyline positions={coords.slice(0, index + 1)} color="#00FFAA" />
        <Marker position={coords[0]} icon={carIcon} ref={markerRef} />
        <FlyToLocation position={coords[index]} />
      </MapContainer>

      {/* Dashboard */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%] flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-black/60 text-white backdrop-blur-md z-[1000] shadow-lg border border-white/10 md:flex-nowrap">
        <button
          onClick={() => setPlaying((prev) => !prev)}
          className="px-6 py-2 w-full md:w-auto text-center bg-gradient-to-r from-indigo-500 to-purple-600 rounded shadow hover:scale-105 transition"
        >
          {playing ? "Pause" : "Play"}
        </button>

        <div className="text-xs space-y-1 text-center w-full md:w-auto">
          <div>
            <strong>Lat:</strong> {current[0].toFixed(5)}
          </div>
          <div>
            <strong>Lng:</strong> {current[1].toFixed(5)}
          </div>
          <div>
            <strong>Time:</strong>{" "}
            {new Date(timestamps[index]).toLocaleTimeString()}
          </div>
          <div>
            <strong>Speed:</strong> {speed} km/h
          </div>
        </div>

        {/* Compass */}
        <div className="flex flex-col items-center gap-1">
          <div className="text-xs text-gray-300">Heading</div>
          <div
            className="w-8 h-8 transition-transform"
            style={{ transform: `rotate(${heading + 90}deg)` }}
          >
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon points="50,5 60,50 50,95 40,50" fill="#fff" />
            </svg>
          </div>
        </div>

        {/* Toggles: Hidden on mobile */}
        <div className="hidden md:flex gap-4">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={loop}
              onChange={() => setLoop(!loop)}
              className="accent-purple-500"
            />
            Loop
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={reverse}
              onChange={() => setReverse(!reverse)}
              className="accent-indigo-500"
            />
            Reverse
          </label>
        </div>
      </div>
    </div>
  );
}

// Distance helper
function getDistance(a: LatLngTuple, b: LatLngTuple) {
  const toRad = (val: number) => (val * Math.PI) / 180;
  const R = 6371e3;
  const φ1 = toRad(a[0]);
  const φ2 = toRad(b[0]);
  const Δφ = toRad(b[0] - a[0]);
  const Δλ = toRad(b[1] - a[1]);
  const a2 =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1 - a2));
  return R * c;
}
