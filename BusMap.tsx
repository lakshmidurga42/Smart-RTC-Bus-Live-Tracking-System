import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Bus, MapPin, Navigation } from 'lucide-react';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const busIcon = L.divIcon({
  html: `<div class="bg-emerald-500 p-2 rounded-full border-2 border-white shadow-lg text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s1-1 1-4-1-4-1-4h-3"/><path d="M3 18h3s1-1 1-4-1-4-1-4H3"/><path d="M3 6h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/></svg></div>`,
  className: 'custom-bus-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const stopIcon = L.divIcon({
  html: `<div class="bg-slate-800 p-1 rounded-full border border-white shadow-sm text-white"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
  className: 'custom-stop-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

interface BusState {
  busId: string;
  lat: number;
  lng: number;
  speed: number;
  crowd: number;
}

interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export default function BusMap({ busStates, stops }: { busStates: Record<string, BusState>, stops: Stop[] }) {
  const center: [number, number] = [17.4948, 78.3498];

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50 relative">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {stops.map(stop => (
          <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={stopIcon}>
            <Popup>
              <div className="font-medium">{stop.name}</div>
              <div className="text-xs text-slate-500">Bus Stop</div>
            </Popup>
          </Marker>
        ))}

        {Object.values(busStates).map(bus => (
          <Marker key={bus.busId} position={[bus.lat, bus.lng]} icon={busIcon}>
            <Popup>
              <div className="p-1">
                <div className="font-bold text-emerald-600">Bus {bus.busId}</div>
                <div className="text-sm">Speed: {Math.round(bus.speed)} km/h</div>
                <div className="text-sm">Crowd: {bus.crowd}/50</div>
                <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${bus.crowd > 40 ? 'bg-red-500' : bus.crowd > 25 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                    style={{ width: `${(bus.crowd / 50) * 100}%` }}
                  />
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
        <button className="p-3 bg-white rounded-full shadow-lg hover:bg-slate-50 transition-colors border border-slate-200">
          <Navigation className="w-5 h-5 text-slate-600" />
        </button>
      </div>
    </div>
  );
}
