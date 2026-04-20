import type { GeoLocationResult } from './geolocation';

export interface DailyForecast {
  time: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
}

export interface WeatherData {
  temperature: number;
  condition: 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Thunderstorm';
  precipitationProb: number;
  humidity: number;
  aqi?: number;
  uvIndex?: number;
  forecast?: DailyForecast[];
  sourceUsed: string;
}

const mapWeatherCode = (code: number): WeatherData['condition'] => {
  if (code >= 1 && code <= 3) return 'Clouds';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Rain';
  if (code >= 71 && code <= 77 || code === 85 || code === 86) return 'Snow';
  if (code >= 95) return 'Thunderstorm';
  return 'Clear';
}

const fetchOpenMeteo = async (lat: number, lon: number): Promise<WeatherData | null> => {
  try {
    // Main weather API + 14-day forecasts
    // Using daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m&hourly=precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto&forecast_days=14`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    
    // Air Quality API
    let aqi: number | undefined = undefined;
    try {
      const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi`);
      if (aqiRes.ok) {
        const aqiData = await aqiRes.json();
        aqi = aqiData.current?.european_aqi;
      }
    } catch {}

    const current = data.current;
    if (!current) return null;

    const condition = mapWeatherCode(current.weather_code);

    const forecastList: DailyForecast[] = [];
    if (data.daily?.time) {
      for (let i = 0; i < data.daily.time.length; i++) {
        forecastList.push({
          time: data.daily.time[i],
          maxTemp: data.daily.temperature_2m_max[i],
          minTemp: data.daily.temperature_2m_min[i],
          weatherCode: data.daily.weather_code[i],
        });
      }
    }

    return {
      temperature: current.temperature_2m,
      condition,
      precipitationProb: data.hourly?.precipitation_probability?.[0] || 0,
      humidity: current.relative_humidity_2m || 50,
      aqi,
      uvIndex: data.daily?.uv_index_max?.[0], // Today's max UV
      forecast: forecastList,
      sourceUsed: 'Open-Meteo',
    };
  } catch (e) {
    console.error('Open-Meteo failed', e);
    return null;
  }
};

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

    const forecastList: DailyForecast[] = [];
    data.weather?.forEach((day: any) => {
      forecastList.push({
        time: day.date,
        maxTemp: parseFloat(day.maxtempC),
        minTemp: parseFloat(day.mintempC),
        weatherCode: 0, // wttr doesn't provide strict standard WMO codes easily mapped here
      });
    });

    return {
      temperature: parseFloat(current.temp_C),
      condition,
      precipitationProb: parseFloat(data.weather?.[0]?.hourly?.[0]?.chanceofrain || '0'),
      humidity: parseFloat(current.humidity),
      uvIndex: parseFloat(current.uvIndex),
      forecast: forecastList,
      sourceUsed: 'wttr.in',
    };
  } catch (e) {
    return null;
  }
};

export const getAggregatedWeather = async (location: GeoLocationResult, onProgress?: (msg: string) => void): Promise<WeatherData | null> => {
  if (onProgress) onProgress(`[METEO] Parsing atmospheric layers for [${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}]...`);
  const meteo = await fetchOpenMeteo(location.lat, location.lon);
  if (meteo) {
    if (onProgress) onProgress(`[METEO] Synced! Condition: ${meteo.condition}, ${meteo.temperature}°`);
    return meteo;
  }

  if (onProgress) onProgress(`[WTTR] Fallback parsing waterfall metrics...`);
  const wttr = await fetchWttrIn(location.city, location.lat, location.lon);
  if (wttr) {
    if (onProgress) onProgress(`[WTTR] Synced! Condition: ${wttr.condition}, ${wttr.temperature}°`);
    return wttr;
  }

  return null;
};
