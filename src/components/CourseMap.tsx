
"use client";

import { useState } from 'react';
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
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries
  });

  const center = { lat, lng };

  if (!isLoaded) {
    return <Skeleton className="w-full h-full" />;
  }

  return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
      >
        <Marker position={center} title={name} />
      </GoogleMap>
  );
}
