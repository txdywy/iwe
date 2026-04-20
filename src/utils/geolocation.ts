export interface GeoLocationResult {
  source: string;
  lat: number;
  lon: number;
  city?: string;
  country?: string;
  confidence: number;
  ip?: string[];
  ipv4?: string[];
  ipv6?: string[];
  isp?: string[];
}

const reverseGeocode = async (lat: number, lon: number, signal?: AbortSignal): Promise<string | undefined> => {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`, { signal });
    if (res.ok) {
      const data = await res.json();
      return data.city || data.locality || data.principalSubdivision;
    }
  } catch (e) {
    if ((e as Error).name !== 'AbortError') {
      console.error('Reverse geocode failed', e);
    }
  }
  return undefined;
};

export const getGPSLocation = (signal?: AbortSignal): Promise<GeoLocationResult | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    let aborted = false;
    if (signal) {
      signal.addEventListener('abort', () => {
        aborted = true;
        resolve(null);
      }, { once: true });
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (aborted) return;
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const city = await reverseGeocode(lat, lon, signal) || 'GPS Location';
        if (aborted) return;
        resolve({ source: 'gps', lat, lon, city, confidence: 100 });
      },
      () => resolve(null),
      { timeout: 5000, maximumAge: 60000, enableHighAccuracy: false }
    );
  });
};

export const getIPLocation = async (ip?: string, source: 'ip'|'webrtc' = 'ip', signal?: AbortSignal): Promise<GeoLocationResult | null> => {
  try {
    const url = ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/';
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;
    
    return {
      source: source === 'ip' ? 'ip (overseas)' : source,
      lat: data.latitude,
      lon: data.longitude,
      city: data.city,
      country: data.country_name,
      confidence: source === 'webrtc' ? 90 : 80,
      ip: [data.ip],
      ipv4: data.version === 'IPv4' ? [data.ip] : [],
      ipv6: data.version === 'IPv6' ? [data.ip] : [],
      isp: [data.org]
    };
  } catch {
    return null;
  }
};

// City-to-coordinate mapping for domestic IP API (which doesn't return lat/lon)
const domesticCityCoords: Record<string, { lat: number; lon: number }> = {
  '北京': { lat: 39.9042, lon: 116.4074 },
  '上海': { lat: 31.2304, lon: 121.4737 },
  '广州': { lat: 23.1291, lon: 113.2644 },
  '深圳': { lat: 22.5431, lon: 114.0579 },
  '杭州': { lat: 30.2741, lon: 120.1551 },
  '成都': { lat: 30.5728, lon: 104.0668 },
  '武汉': { lat: 30.5928, lon: 114.3055 },
  '南京': { lat: 32.0603, lon: 118.7969 },
  '重庆': { lat: 29.4316, lon: 106.9123 },
  '西安': { lat: 34.3416, lon: 108.9398 },
  '天津': { lat: 39.3434, lon: 117.3616 },
  '苏州': { lat: 31.2990, lon: 120.5853 },
  '长沙': { lat: 28.2282, lon: 112.9388 },
  '郑州': { lat: 34.7466, lon: 113.6254 },
  '青岛': { lat: 36.0671, lon: 120.3826 },
  '大连': { lat: 38.9140, lon: 121.6147 },
  '厦门': { lat: 24.4798, lon: 118.0894 },
  '昆明': { lat: 25.0389, lon: 102.7183 },
  '合肥': { lat: 31.8206, lon: 117.2272 },
  '福州': { lat: 26.0745, lon: 119.2965 },
};

export const getDomesticIPLocation = async (signal?: AbortSignal): Promise<GeoLocationResult | null> => {
  try {
    const res = await fetch('https://myip.ipip.net/json', { signal });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.ret !== 'ok') return null;
    
    const p = data.data.location[1];
    const c = data.data.location[2];
    const city = p === c ? p : `${p} ${c}`;
    const isp = data.data.location[4] || 'Domestic Node';
    
    // Try to resolve actual coordinates from city name
    const cityKey = c || p;
    const coords = domesticCityCoords[cityKey] || domesticCityCoords[p];
    
    // Without real coordinates, this location is too inaccurate for weather
    if (!coords) {
      return {
        source: 'ip (domestic)',
        lat: 35.8617,
        lon: 104.1954,
        city: city || 'Domestic',
        country: 'China',
        confidence: 5, // Very low — coordinates are just China's center
        ip: [data.data.ip],
        isp: [isp]
      };
    }
    
    return {
      source: 'ip (domestic)',
      lat: coords.lat,
      lon: coords.lon,
      city: city || 'Domestic',
      country: 'China',
      confidence: 60,
      ip: [data.data.ip],
      isp: [isp]
    };
  } catch {
    return null;
  }
};

const isPrivateIP = (ip: string): boolean => {
  if (ip.startsWith('192.168.') || ip.startsWith('10.')) return true;
  if (ip.startsWith('172.')) {
    const parts = ip.split('.');
    if (parts.length >= 2) {
      const secondOctet = parseInt(parts[1], 10);
      return secondOctet >= 16 && secondOctet <= 31;
    }
  }
  return false;
};

export const getWebRTCLocation = (signal?: AbortSignal): Promise<GeoLocationResult | null> => {
  return new Promise((resolve) => {
    try {
      const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      
      let aborted = false;
      if (signal) {
        signal.addEventListener('abort', () => {
          aborted = true;
          peer.close();
          resolve(null);
        }, { once: true });
      }

      peer.createDataChannel('');
      peer.createOffer().then(offer => {
        if (aborted) return;
        return peer.setLocalDescription(offer);
      }).catch(() => resolve(null));

      peer.onicecandidate = async (event) => {
        if (aborted) return;
        if (!event || !event.candidate) return;
        const candidate = event.candidate.candidate;
        // Extract IP
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/;
        const match = ipRegex.exec(candidate);
        if (match) {
          peer.close();
          const ip = match[1];
          // Modern browsers use mDNS (.local) addresses — skip those
          if (candidate.includes('.local')) {
            resolve(null);
            return;
          }
          // Local IP mask check
          if (isPrivateIP(ip)) {
            resolve({ source: 'webrtc (local)', lat: 0, lon: 0, city: 'Local Network', confidence: 10, ip: [ip], isp: ['LAN'] });
          } else {
            const loc = await getIPLocation(ip, 'webrtc', signal);
            resolve(loc);
          }
        }
      };
      setTimeout(() => { peer.close(); resolve(null); }, 3000);
    } catch {
      resolve(null);
    }
  });
};

export const getLanguageLocation = (): GeoLocationResult | null => {
  const lang = navigator.languages?.[0] || navigator.language;
  // Very basic country/capital mapping
  const capitals: Record<string, {lat: number, lon: number, city: string}> = {
    'zh-CN': { lat: 39.9042, lon: 116.4074, city: 'Beijing (L10n)' },
    'en-US': { lat: 38.9072, lon: -77.0369, city: 'Washington D.C. (L10n)' },
    'en-GB': { lat: 51.5072, lon: -0.1276, city: 'London (L10n)' },
    'ja-JP': { lat: 35.6762, lon: 139.6503, city: 'Tokyo (L10n)' },
    'fr-FR': { lat: 48.8566, lon: 2.3522, city: 'Paris (L10n)' },
    'ko-KR': { lat: 37.5665, lon: 126.9780, city: 'Seoul (L10n)' },
  };

  const parsedLang = lang.length >= 2 ? lang.substring(0, 5) : '';
  if (capitals[parsedLang]) {
    return {
      source: 'l10n',
      ...capitals[parsedLang],
      confidence: 50,
    };
  }
  return null;
};

export const getTimezoneLocation = (): GeoLocationResult | null => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzMap: Record<string, {lat: number, lon: number, city: string}> = {
    'Asia/Shanghai': { lat: 31.2304, lon: 121.4737, city: 'Shanghai (TZ)' },
    'America/New_York': { lat: 40.7128, lon: -74.0060, city: 'New York (TZ)' },
    'Europe/London': { lat: 51.5074, lon: -0.1278, city: 'London (TZ)' },
    'Asia/Tokyo': { lat: 35.6762, lon: 139.6503, city: 'Tokyo (TZ)' },
    'Australia/Sydney': { lat: -33.8688, lon: 151.2093, city: 'Sydney (TZ)' },
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

export const getBestLocations = async (onProgress?: (msg: string) => void, signal?: AbortSignal): Promise<GeoLocationResult[]> => {
  const locations: GeoLocationResult[] = [];
  if (onProgress) onProgress("Initializing multi-layer geographic probes...");

  // Parallelize fetch where possible without hanging indefinitely
  const [gps, ip, webrtc, homeIp] = await Promise.all([
    getGPSLocation(signal).then(res => {
      if (res && onProgress) onProgress(`[GPS] Satellite lock: ${res.city || 'Coordinates acquired'}`);
      return res;
    }),
    getIPLocation(undefined, 'ip', signal).then(res => {
      if (res && onProgress) onProgress(`[IP-WAN] Proxy node traced: ${res.city || 'Unknown'}`);
      return res;
    }),
    getWebRTCLocation(signal).then(res => {
      if (res && onProgress) onProgress(`[STUN] WebRTC proxy bypassed: ${res.city || 'Unknown'}`);
      return res;
    }),
    getDomesticIPLocation(signal).then(res => {
      if (res && onProgress) onProgress(`[IP-LAN] Domestic direct route: ${res.city || 'Unknown'}`);
      return res;
    }),
  ]);

  if (gps) locations.push(gps);
  if (ip) locations.push(ip);
  if (homeIp) locations.push(homeIp);
  if (webrtc) locations.push(webrtc);

  const l10n = getLanguageLocation();
  if (l10n) {
    if (onProgress) onProgress(`[L10N] Browser footprint detected: ${typeof l10n.city === 'string' ? l10n.city : 'Locale set'}`);
    locations.push(l10n);
  }

  const tz = getTimezoneLocation();
  if (tz) {
    if (onProgress) onProgress(`[TIMEZONE] System clock synced: ${tz.city}`);
    locations.push(tz);
  }

  if (onProgress) onProgress("Cross-referencing and deduplicating coordinates...");

  // Dedup logic: Group locations by roughly same coordinates (dist < ~50km)
  const deduped: GeoLocationResult[] = [];
  for (const loc of locations) {
    const isDuplicate = deduped.find(d => 
      Math.abs(d.lat - loc.lat) < 0.5 && Math.abs(d.lon - loc.lon) < 0.5
    );
    if (!isDuplicate) {
      deduped.push(loc);
    } else {
      // It is duplicate. Append source info so user knows the power of our sniffer.
      isDuplicate.source = `${isDuplicate.source}+${loc.source}`;
      
      const appendUnique = (arr: string[] | undefined, newItems: string[] | undefined) => {
        if (!newItems) return arr;
        const current = new Set(arr || []);
        newItems.forEach(item => current.add(item));
        return Array.from(current);
      };

      isDuplicate.ip = appendUnique(isDuplicate.ip, loc.ip);
      isDuplicate.ipv4 = appendUnique(isDuplicate.ipv4, loc.ipv4);
      isDuplicate.ipv6 = appendUnique(isDuplicate.ipv6, loc.ipv6);
      isDuplicate.isp = appendUnique(isDuplicate.isp, loc.isp);
    }
  }

  return deduped.sort((a, b) => b.confidence - a.confidence);
};
