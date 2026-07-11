import { useState } from "react";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

const mockCoordinates: Coordinates = {
  latitude: 26.8951,
  longitude: 75.7684,
};

export function useCurrentLocation() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setCoordinates(mockCoordinates);
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        });
        setIsLoading(false);
      },
      () => {
        setCoordinates(mockCoordinates);
        setError("Using mock location because current location is unavailable.");
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000 },
    );
  };

  return { coordinates, isLoading, error, requestLocation };
}
