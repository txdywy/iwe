import type { GeoLocationResult } from './geolocation';

export interface WeatherData {
  temperature: number;
  condition: 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Thunderstorm';
  precipitationProb: number;
  humidity: number;
  sourceUsed: string;
}

/**
 * Fetches data from Open-Meteo
 */
const fetchOpenMeteo = async (lat: number, lon: number): Promise<WeatherData | null> => {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=precipitation_probability,relativehumidity_2m`);
    if (!res.ok) return null;
    const data = await res.json();
    
    // WMO Weather interpretation codes
    // 0: Clear, 1-3: Partly cloudy, 45-48: Fog, 51-67: Rain, 71-77: Snow, 95-99: Thunderstorm
    const code = data.current_weather.weathercode;
    let condition: WeatherData['condition'] = 'Clear';
    if (code >= 1 && code <= 3) condition = 'Clouds';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) condition = 'Rain';
    if (code >= 71 && code <= 77 || code === 85 || code === 86) condition = 'Snow';
    if (code >= 95) condition = 'Thunderstorm';

    return {
      temperature: data.current_weather.temperature,
      condition,
      precipitationProb: data.hourly?.precipitation_probability?.[0] || 0,
      humidity: data.hourly?.relativehumidity_2m?.[0] || 50,
      sourceUsed: 'Open-Meteo',
    };
  } catch (e) {
    console.error('Open-Meteo failed', e);
    return null;
  }
};

/**
 * Fetches data from wttr.in (Fallback)
 */
const fetchWttrIn = async (city?: string, lat?: number, lon?: number): Promise<WeatherData | null> => {
  try {
    const target = city ? city : (lat !== undefined && lon !== undefined ? `${lat},${lon}` : '');
    if (!target) return null;

    const res = await fetch(`https://wttr.in/${encodeURIComponent(target)}?format=j1`);
    if (!res.ok) return null;
    const data = await res.json();
    
    const current = data.current_condition[0];
    const desc = current.weatherDesc[0].value.toLowerCase();
    
    let condition: WeatherData['condition'] = 'Clear';
    if (desc.includes('cloud') || desc.includes('overcast')) condition = 'Clouds';
    if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) condition = 'Rain';
    if (desc.includes('snow') || desc.includes('ice')) condition = 'Snow';
    if (desc.includes('thunder') || desc.includes('storm')) condition = 'Thunderstorm';

    return {
      temperature: parseFloat(current.temp_C),
      condition,
      precipitationProb: parseFloat(data.weather?.[0]?.hourly?.[0]?.chanceofrain || '0'),
      humidity: parseFloat(current.humidity),
      sourceUsed: 'wttr.in',
    };
  } catch (e) {
    console.error('wttr.in failed', e);
    return null;
  }
};

/**
 * Aggregate weather data using a fallback waterfall
 */
export const getAggregatedWeather = async (location: GeoLocationResult): Promise<WeatherData | null> => {
  // 1. Try Open-Meteo first (Extremely reliable and well-formatted JSON)
  const meteo = await fetchOpenMeteo(location.lat, location.lon);
  if (meteo) return meteo;

  // 2. Fallback to wttr.in 
  const wttr = await fetchWttrIn(location.city, location.lat, location.lon);
  if (wttr) return wttr;

  return null; // Both failed
};
