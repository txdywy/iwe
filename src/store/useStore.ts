import { create } from 'zustand';
import type { GeoLocationResult } from '../utils/geolocation';
import { getBestLocations } from '../utils/geolocation';
import type { WeatherData } from '../utils/weather';
import { getAggregatedWeather } from '../utils/weather';
import type { VibeRecommendation } from '../utils/vibeEngine';
import { generateVibe } from '../utils/vibeEngine';

interface AppState {
  locations: GeoLocationResult[];
  activeLocationIndex: number;
  weatherData: WeatherData | null;
  vibeData: VibeRecommendation | null;
  loading: boolean;
  vibeLoading: boolean;
  loadingLogs: string[];
  error: string | null;
  initApp: () => Promise<void>;
  setActiveLocation: (index: number) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  locations: [],
  activeLocationIndex: 0,
  weatherData: null,
  vibeData: null,
  loading: true,
  vibeLoading: true,
  loadingLogs: [],
  error: null,
  
  initApp: async () => {
    set({ loading: true, error: null, loadingLogs: ['Initializing deep-scan telemetry...'] });
    const log = (msg: string) => set((s) => ({ loadingLogs: [...s.loadingLogs, msg] }));

    try {
      const locations = await getBestLocations(log);
      if (locations.length === 0) {
        set({ error: 'Failed to determine any location.', loading: false });
        return;
      }
      set({ locations, activeLocationIndex: 0 });
      
      // Fetch weather for the best location
      const weather = await getAggregatedWeather(locations[0], log);
      set({ weatherData: weather, loading: false });

      if (weather) {
        set({ vibeLoading: true });
        const vibe = await generateVibe(weather.condition);
        set({ vibeData: vibe, vibeLoading: false });
      }
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

      if (weather) {
        set({ vibeLoading: true });
        const vibe = await generateVibe(weather.condition);
        set({ vibeData: vibe, vibeLoading: false });
      }
    } catch (e: any) {
      set({ error: e.message || 'Failed to switch location', loading: false });
    }
  }
}));
