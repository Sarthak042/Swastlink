import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default marker icon issue in Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Red marker icon for hospitals
const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 12);
    }
  }, [center, map]);
  return null;
}

export default function HospitalMap({ hospitals, onSelectHospital, selectedHospitalId }) {
  const defaultCenter = [18.5204, 73.8567]; // Pune center default

  return (
    <div className="w-full h-full min-h-[400px] relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={defaultCenter} />

        {hospitals.map((hosp) => {
          if (!hosp.lat || !hosp.lng) return null;
          return (
            <Marker
              key={hosp._id}
              position={[hosp.lat, hosp.lng]}
              icon={hospitalIcon}
              eventHandlers={{
                click: () => onSelectHospital && onSelectHospital(hosp),
              }}
            >
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <h4 className="font-bold text-sm text-slate-900">{hosp.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{hosp.address}</p>
                  
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-600">
                      {hosp.totalAvailableBeds} Beds Free
                    </span>
                    <span className="text-slate-400 font-medium">{hosp.distance} km</span>
                  </div>

                  <button
                    onClick={() => onSelectHospital && onSelectHospital(hosp)}
                    className="w-full mt-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold py-1 rounded transition"
                  >
                    View Details & Book
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
