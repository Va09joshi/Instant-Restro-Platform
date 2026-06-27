"use client";

import { useState } from "react";

export function useLocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = async (): Promise<string | null> => {
    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        setLoading(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Use OpenStreetMap Nominatim for free reverse geocoding
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`, {
              headers: {
                'Accept-Language': 'en-US,en;q=0.9',
                // Nominatim requests a User-Agent identifying the application
                'User-Agent': 'InstantRestroApp/1.0'
              }
            });
            
            if (!response.ok) {
              throw new Error("Failed to fetch location data");
            }
            
            const data = await response.json();
            
            // Extract the most relevant city-like name
            const address = data.address;
            const city = address.city || address.town || address.village || address.suburb || address.county || address.state;
            
            setLoading(false);
            resolve(city || null);
          } catch (err) {
            console.error("Geocoding error:", err);
            setError("Could not determine city from coordinates.");
            setLoading(false);
            resolve(null);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError(err.message || "Failed to get location permission.");
          setLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  return { requestLocation, loading, error };
}
