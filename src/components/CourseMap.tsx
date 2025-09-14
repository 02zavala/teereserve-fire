
"use client";

import { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Skeleton } from './ui/skeleton';

const containerStyle = {
  width: '100%',
  height: '100%'
};

interface CourseMapProps {
    lat: number;
    lng: number;
    name: string;
}

const libraries: ("maps" | "marker")[] = ["maps", "marker"];

export function CourseMap({ lat, lng, name }: CourseMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries
  });

  const center = { lat, lng };

  useEffect(() => {
    if (isLoaded && !loadError) {
      // Pequeño delay para asegurar que el DOM esté completamente listo
      const timer = setTimeout(() => {
        setMapLoaded(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded, loadError]);

  if (!isLoaded || loadError || !mapLoaded) {
    return <Skeleton className="w-full h-full" />;
  }

  return (
    <div ref={mapRef} className="w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={() => {
          // Mapa cargado exitosamente
        }}
      >
        <Marker position={center} title={name} />
      </GoogleMap>
    </div>
  );
}

export default CourseMap;
