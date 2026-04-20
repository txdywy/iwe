import { create } from 'zustand';
import type { GeoLocationResult } from '../utils/geolocation';
import { getBestLocations } from '../utils/geolocation';
import type { WeatherData } from '../utils/weather';
import { getAggregatedWeather } from '../utils/weather';

interface AppState {
  locations: GeoLocationResult[];
  activeLocationIndex: number;
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  initApp: () => Promise<void>;
  setActiveLocation: (index: number) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  locations: [],
  activeLocationIndex: 0,
  weatherData: null,
  loading: true,
  error: null,
  
  initApp: async () => {
    set({ loading: true, error: null });
    try {
      const locations = await getBestLocations();
      if (locations.length === 0) {
        set({ error: 'Failed to determine any location.', loading: false });
        return;
      }
      set({ locations, activeLocationIndex: 0 });
      
      // Fetch weather for the best location
      const weather = await getAggregatedWeather(locations[0]);
      set({ weatherData: weather, loading: false });
    } catch (e: any) {
      set({ error: e.message || 'Initialization failed', loading: false });
    }
  },

  setActiveLocation: async (index: number) => {
    const { locations } = get();
    if (index < 0 || index >= locations.length) return;
    
    set({ activeLocationIndex: index, loading: true });
    try {
      const weather = await getAggregatedWeather(locations[index]);
      set({ weatherData: weather, loading: false });
    } catch (e: any) {
      set({ error: e.message || 'Failed to switch location', loading: false });
    }
  }
}));
