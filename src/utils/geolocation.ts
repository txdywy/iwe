export interface GeoLocationResult {
  source: 'gps' | 'ip' | 'timezone';
  lat: number;
  lon: number;
  city?: string;
  country?: string;
  confidence: number; // 0-100
}

/**
 * Get coordinates using HTML5 Geolocation API
 */
export const getGPSLocation = (): Promise<GeoLocationResult | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        let city = 'GPS Location';
        
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
          if (res.ok) {
            const data = await res.json();
            city = data.city || data.locality || data.principalSubdivision || 'GPS Location';
          }
        } catch (e) {
          console.error('Reverse geocode failed', e);
        }

        resolve({
          source: 'gps',
          lat,
          lon,
          city,
          confidence: 100,
        });
      },
      () => {
        resolve(null);
      },
      { timeout: 5000, maximumAge: 60000, enableHighAccuracy: false }
    );
  });
};

/**
 * Get rough location using public IP API
 */
export const getIPLocation = async (): Promise<GeoLocationResult | null> => {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) return null;
    const data = await res.json();
    return {
      source: 'ip',
      lat: data.latitude,
      lon: data.longitude,
      city: data.city,
      country: data.country_name,
      confidence: 80,
    };
  } catch (error) {
    console.error('IP Location failed', error);
    return null;
  }
};

/**
 * Fallback to timezone based rough detection
 * Uses a basic map, can be expanded to rely on open-meteo city search
 */
export const getTimezoneLocation = (): GeoLocationResult | null => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // A very basic map just for the absolute worst case fallback
  const tzMap: Record<string, {lat: number, lon: number, city: string}> = {
    'Asia/Shanghai': { lat: 31.2304, lon: 121.4737, city: 'Shanghai' },
    'America/New_York': { lat: 40.7128, lon: -74.0060, city: 'New York' },
    'Europe/London': { lat: 51.5074, lon: -0.1278, city: 'London' },
    'Asia/Tokyo': { lat: 35.6762, lon: 139.6503, city: 'Tokyo' },
  };

  if (tzMap[tz]) {
    return {
      source: 'timezone',
      ...tzMap[tz],
      confidence: 40,
    };
  }
  return null;
};

/**
 * Gets the best available location and a list of alternative locations
 */
export const getBestLocations = async (): Promise<GeoLocationResult[]> => {
  const locations: GeoLocationResult[] = [];

  // Try GPS (Might prompt user)
  const gps = await getGPSLocation();
  if (gps) locations.push(gps);

  // Try IP 
  const ip = await getIPLocation();
  if (ip) locations.push(ip);

  // Fallback Timezone
  const tz = getTimezoneLocation();
  if (tz) locations.push(tz);

  return locations.sort((a, b) => b.confidence - a.confidence);
};
