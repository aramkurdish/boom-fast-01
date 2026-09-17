// Geographic distance calculation utilities

export interface Coordinates {
  lat: number;
  lng: number;
}

// Calculate distance in kilometers between two GPS coordinates using Haversine formula
export function calculateDistanceKm(
  coord1?: Coordinates,
  coord2?: Coordinates,
  fallbackKm: number = 2.4
): number {
  if (!coord1 || !coord2 || typeof coord1.lat !== 'number' || typeof coord2.lat !== 'number') {
    return fallbackKm;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLon = (coord2.lng - coord1.lng) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
      Math.cos(coord2.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

// Estimate delivery travel time in minutes based on distance
export function estimateDeliveryMinutes(distanceKm: number): number {
  // Base 10 mins plus ~3.5 mins per km
  return Math.max(12, Math.round(10 + distanceKm * 3.5));
}
