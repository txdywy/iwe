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
  lastRequestId: string;
  initApp: () => Promise<void>;
  setActiveLocation: (index: number) => Promise<void>;
}

// Memory cache for API responses
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const vibeCache = new Map<string, { data: VibeRecommendation; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let currentAbortController: AbortController | null = null;

export const useStore = create<AppState>((set, get) => ({
  locations: [],
  activeLocationIndex: 0,
  weatherData: null,
  vibeData: null,
  loading: true,
  vibeLoading: true,
  loadingLogs: [],
  error: null,
  lastRequestId: '',
  
  initApp: async () => {
    if (currentAbortController) currentAbortController.abort();
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;

    const requestId = crypto.randomUUID();
    set({ loading: true, error: null, loadingLogs: ['Initializing deep-scan telemetry...'], lastRequestId: requestId });
    
    const log = (msg: string) => set((s) => {
      // Use more efficient array update
      const newLogs = s.loadingLogs.length >= 20 
        ? [...s.loadingLogs.slice(1), msg] 
        : [...s.loadingLogs, msg];
      return { loadingLogs: newLogs };
    });

    try {
      const locations = await getBestLocations(log);
      
      if (get().lastRequestId !== requestId || signal.aborted) return;

      if (locations.length === 0) {
        set({ error: 'Failed to determine any location.', loading: false });
        return;
      }
      set({ locations, activeLocationIndex: 0 });
      
      const activeLoc = locations[0];
      const cacheKey = `${activeLoc.lat},${activeLoc.lon}`;
      const cachedWeather = weatherCache.get(cacheKey);
      
      let weather: WeatherData | null = null;
      if (cachedWeather && (Date.now() - cachedWeather.timestamp < CACHE_TTL)) {
        weather = cachedWeather.data;
        log(`[CACHE] Retrieved atmospheric data for ${activeLoc.city}`);
      } else {
        weather = await getAggregatedWeather(activeLoc, log, signal);
        if (weather) weatherCache.set(cacheKey, { data: weather, timestamp: Date.now() });
      }
      
      if (get().lastRequestId !== requestId || signal.aborted) return;

      if (!weather) {
        set({ error: 'Failed to fetch weather data.', loading: false });
        return;
      }

      set({ weatherData: weather, loading: false });

      set({ vibeLoading: true });
      const vibeCacheKey = weather.condition;
      const cachedVibe = vibeCache.get(vibeCacheKey);
      
      let vibe: VibeRecommendation | null = null;
      if (cachedVibe && (Date.now() - cachedVibe.timestamp < CACHE_TTL)) {
        vibe = cachedVibe.data;
      } else {
        vibe = await generateVibe(weather.condition, signal);
        if (vibe) vibeCache.set(vibeCacheKey, { data: vibe, timestamp: Date.now() });
      }
      
      if (get().lastRequestId !== requestId || signal.aborted) return;
      set({ vibeData: vibe, vibeLoading: false });
      
    } catch (e: unknown) {
      if (signal.aborted) return;
      if (get().lastRequestId !== requestId) return;
      set({ error: e instanceof Error ? e.message : 'Initialization failed', loading: false });
    }
  },

  setActiveLocation: async (index: number) => {
    const { locations } = get();
    if (index < 0 || index >= locations.length) return;
    
    if (currentAbortController) currentAbortController.abort();
    currentAbortController = new AbortController();
    const signal = currentAbortController.signal;

    const requestId = crypto.randomUUID();
    set({ activeLocationIndex: index, loading: true, vibeLoading: true, error: null, lastRequestId: requestId });
    
    try {
      const activeLoc = locations[index];
      const cacheKey = `${activeLoc.lat},${activeLoc.lon}`;
      const cachedWeather = weatherCache.get(cacheKey);
      
      let weather: WeatherData | null = null;
      if (cachedWeather && (Date.now() - cachedWeather.timestamp < CACHE_TTL)) {
        weather = cachedWeather.data;
      } else {
        weather = await getAggregatedWeather(activeLoc, undefined, signal);
        if (weather) weatherCache.set(cacheKey, { data: weather, timestamp: Date.now() });
      }
      
      if (get().lastRequestId !== requestId || signal.aborted) return;

      if (!weather) {
        set({ error: 'Failed to fetch weather data for this location.', loading: false });
        return;
      }

      set({ weatherData: weather, loading: false });

      const vibeCacheKey = weather.condition;
      const cachedVibe = vibeCache.get(vibeCacheKey);
      
      let vibe: VibeRecommendation | null = null;
      if (cachedVibe && (Date.now() - cachedVibe.timestamp < CACHE_TTL)) {
        vibe = cachedVibe.data;
      } else {
        vibe = await generateVibe(weather.condition, signal);
        if (vibe) vibeCache.set(vibeCacheKey, { data: vibe, timestamp: Date.now() });
      }
      
      if (get().lastRequestId !== requestId || signal.aborted) return;
      set({ vibeData: vibe, vibeLoading: false });
    } catch (e: unknown) {
      if (signal.aborted) return;
      if (get().lastRequestId !== requestId) return;
      set({ error: e instanceof Error ? e.message : 'Failed to switch location', loading: false });
    }
  }
}));
