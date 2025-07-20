import dynamic from "next/dynamic";

const VehicleMap = dynamic(() => import("@/components/MapComponent"), {
  ssr: false, // Important: Leaflet requires window
});

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#0f0f0f] text-white p-6">
      <h1 className="text-4xl font-bold mb-6 animate-pulse text-center">
        🚗 Vehicle Tracker
      </h1>
      <VehicleMap />
    </main>
  );
}
