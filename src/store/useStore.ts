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

// --- Internal state (not exposed to React) ---
const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 50;
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const vibeCache = new Map<string, { data: VibeRecommendation; timestamp: number }>();
let currentAbortController: AbortController | null = null;
let lastRequestId = '';
let fallbackRequestCounter = 0;

/** Evict expired entries from a cache map, and cap size. */
const evictCache = <T>(cache: Map<string, { data: T; timestamp: number }>) => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now - entry.timestamp > CACHE_TTL) cache.delete(key);
  }
  // If still over limit, remove oldest entries
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = [...cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, cache.size - MAX_CACHE_SIZE);
    for (const [key] of toRemove) cache.delete(key);
  }
};

/** Shared helper: fetch weather + vibe for a location, with caching & abort. */
const activeRequests = new Map<string, Promise<WeatherData | null>>();
const activeVibeRequests = new Map<string, Promise<VibeRecommendation | null>>();

const fetchWeatherAndVibe = async (
  location: GeoLocationResult,
  requestId: string,
  signal: AbortSignal,
  set: (partial: Partial<AppState>) => void,
  onProgress?: (msg: string) => void,
) => {
  evictCache(weatherCache);

  const cacheKey = `${location.lat},${location.lon}`;
  const cachedWeather = weatherCache.get(cacheKey);

  let weather: WeatherData | null = null;
  if (cachedWeather && Date.now() - cachedWeather.timestamp < CACHE_TTL) {
    weather = cachedWeather.data;
    onProgress?.(`[CACHE] Retrieved atmospheric data for ${location.city}`);
  } else if (activeRequests.has(cacheKey)) {
    // Wait for in-flight request
    weather = await activeRequests.get(cacheKey)!;
  } else {
    const fetchPromise = getAggregatedWeather(location, onProgress, signal);
    activeRequests.set(cacheKey, fetchPromise);
    try {
      weather = await fetchPromise;
      if (weather) weatherCache.set(cacheKey, { data: weather, timestamp: Date.now() });
    } finally {
      activeRequests.delete(cacheKey);
    }
  }

  if (lastRequestId !== requestId || signal.aborted) return;

  if (!weather) {
    set({ error: 'Failed to fetch weather data.', loading: false });
    return;
  }

  set({ weatherData: weather, loading: false, vibeLoading: true });

  evictCache(vibeCache);
  const vibeCacheKey = weather.condition;
  const cachedVibe = vibeCache.get(vibeCacheKey);

  let vibe: VibeRecommendation | null = null;
  if (cachedVibe && Date.now() - cachedVibe.timestamp < CACHE_TTL) {
    vibe = cachedVibe.data;
  } else if (activeVibeRequests.has(vibeCacheKey)) {
    // Wait for in-flight vibe request
    vibe = await activeVibeRequests.get(vibeCacheKey)!;
  } else {
    const vibePromise = generateVibe(weather.condition, signal);
    activeVibeRequests.set(vibeCacheKey, vibePromise);
    try {
      vibe = await vibePromise;
      if (vibe) vibeCache.set(vibeCacheKey, { data: vibe, timestamp: Date.now() });
    } finally {
      activeVibeRequests.delete(vibeCacheKey);
    }
  }

  if (lastRequestId !== requestId || signal.aborted) return;
  set({ vibeData: vibe, vibeLoading: false });
};

/** Create a fresh AbortController, cancelling any previous one. */
const resetAbort = (): AbortSignal => {
  currentAbortController?.abort();
  currentAbortController = new AbortController();
  return currentAbortController.signal;
};

const createRequestId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  fallbackRequestCounter += 1;
  return `${Date.now()}-${fallbackRequestCounter}`;
};

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
    const signal = resetAbort();
    const requestId = createRequestId();
    lastRequestId = requestId;
    set({ loading: true, error: null, loadingLogs: ['Initializing deep-scan telemetry...'] });

    const log = (msg: string) => set((s) => {
      const newLogs = s.loadingLogs.length >= 20
        ? [...s.loadingLogs.slice(1), msg]
        : [...s.loadingLogs, msg];
      return { loadingLogs: newLogs };
    });

    try {
      const locations = await getBestLocations(log, signal);
      if (lastRequestId !== requestId || signal.aborted) return;

      if (locations.length === 0) {
        set({ error: 'Failed to determine any location.', loading: false, loadingLogs: [] });
        return;
      }
      set({ locations, activeLocationIndex: 0 });

      await fetchWeatherAndVibe(locations[0], requestId, signal, set, log);
      // Clear loading logs after successful init
      if (lastRequestId === requestId) set({ loadingLogs: [] });
    } catch (e: unknown) {
      if (signal.aborted || lastRequestId !== requestId) return;
      set({ error: e instanceof Error ? e.message : 'Initialization failed', loading: false, loadingLogs: [] });
    }
  },

  setActiveLocation: async (index: number) => {
    const { locations } = get();
    if (index < 0 || index >= locations.length) return;

    const signal = resetAbort();
    const requestId = createRequestId();
    lastRequestId = requestId;
    // Clear stale vibeData immediately so UI doesn't flash old content
    set({ activeLocationIndex: index, loading: true, vibeLoading: true, vibeData: null, error: null });

    try {
      await fetchWeatherAndVibe(locations[index], requestId, signal, set);
    } catch (e: unknown) {
      if (signal.aborted || lastRequestId !== requestId) return;
      set({ error: e instanceof Error ? e.message : 'Failed to switch location', loading: false });
    }
  }
}));
