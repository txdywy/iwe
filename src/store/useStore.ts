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
  lastRequestId: number;
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
  lastRequestId: 0,
  
  initApp: async () => {
    const requestId = Date.now();
    set({ loading: true, error: null, loadingLogs: ['Initializing deep-scan telemetry...'], lastRequestId: requestId });
    const log = (msg: string) => set((s) => ({ loadingLogs: [...s.loadingLogs, msg].slice(-20) }));

    try {
      const locations = await getBestLocations(log);
      
      if (get().lastRequestId !== requestId) return;

      if (locations.length === 0) {
        set({ error: 'Failed to determine any location.', loading: false });
        return;
      }
      set({ locations, activeLocationIndex: 0 });
      
      const weather = await getAggregatedWeather(locations[0], log);
      
      if (get().lastRequestId !== requestId) return;

      if (!weather) {
        set({ error: 'Failed to fetch weather data.', loading: false });
        return;
      }

      set({ weatherData: weather, loading: false });

      set({ vibeLoading: true });
      const vibe = await generateVibe(weather.condition);
      
      if (get().lastRequestId !== requestId) return;
      set({ vibeData: vibe, vibeLoading: false });
      
    } catch (e: unknown) {
      if (get().lastRequestId !== requestId) return;
      set({ error: e instanceof Error ? e.message : 'Initialization failed', loading: false });
    }
  },

  setActiveLocation: async (index: number) => {
    const { locations } = get();
    if (index < 0 || index >= locations.length) return;
    
    const requestId = Date.now();
    set({ activeLocationIndex: index, loading: true, vibeLoading: true, error: null, lastRequestId: requestId });
    
    try {
      const weather = await getAggregatedWeather(locations[index]);
      
      if (get().lastRequestId !== requestId) return;

      if (!weather) {
        set({ error: 'Failed to fetch weather data for this location.', loading: false });
        return;
      }

      set({ weatherData: weather, loading: false });

      const vibe = await generateVibe(weather.condition);
      
      if (get().lastRequestId !== requestId) return;
      set({ vibeData: vibe, vibeLoading: false });
    } catch (e: unknown) {
      if (get().lastRequestId !== requestId) return;
      set({ error: e instanceof Error ? e.message : 'Failed to switch location', loading: false });
    }
  }
}));
