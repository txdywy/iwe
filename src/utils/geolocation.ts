export interface GeoLocationResult {
  source: string;
  lat: number;
  lon: number;
  city?: string;
  country?: string;
  confidence: number;
}

const reverseGeocode = async (lat: number, lon: number): Promise<string | undefined> => {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    if (res.ok) {
      const data = await res.json();
      return data.city || data.locality || data.principalSubdivision;
    }
  } catch (e) {
    console.error('Reverse geocode failed', e);
  }
  return undefined;
};

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
        const city = await reverseGeocode(lat, lon) || 'GPS Location';
        resolve({ source: 'gps', lat, lon, city, confidence: 100 });
      },
      () => resolve(null),
      { timeout: 5000, maximumAge: 60000, enableHighAccuracy: false }
    );
  });
};

export const getIPLocation = async (ip?: string, source: 'ip'|'webrtc' = 'ip'): Promise<GeoLocationResult | null> => {
  try {
    const url = ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/';
    const res = await fetch(url);
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
    };
  } catch {
    return null;
  }
};

export const getDomesticIPLocation = async (): Promise<GeoLocationResult | null> => {
  try {
    // ipip.net is a massive domestic router standard, almost universally hit via DIRECT proxy rules.
    const res = await fetch('https://myip.ipip.net/json');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.ret !== 'ok') return null;
    
    // Convert Chinese Province/City to a generic string (e.g. "China, Beijing")
    const p = data.data.location[1];
    const c = data.data.location[2];
    const city = p === c ? p : `${p} ${c}`;
    
    // We cannot easily get exact lat/lon from ipip json alone, but we can set a dummy or use reverse lookup if needed.
    // For Vibe purposes, we'll map a basic central coordinate or let it just be an extra location badge.
    return {
      source: 'ip (domestic)',
      lat: 35.8617,
      lon: 104.1954, // central China roughly
      city: city || 'Domestic Node',
      country: 'China',
      confidence: 79,
    };
  } catch {
    return null;
  }
};

export const getWebRTCLocation = (): Promise<GeoLocationResult | null> => {
  return new Promise((resolve) => {
    try {
      const peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
      peer.createDataChannel('');
      peer.createOffer().then(offer => peer.setLocalDescription(offer)).catch(() => resolve(null));
      peer.onicecandidate = async (event) => {
        if (!event || !event.candidate) return;
        const candidate = event.candidate.candidate;
        // Extract IP
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/;
        const match = ipRegex.exec(candidate);
        if (match) {
          peer.close();
          const ip = match[1];
          // Local IP mask check
          if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
            // Unlikely to geocode local IPs via ipapi.co
            resolve(null);
          } else {
            const loc = await getIPLocation(ip, 'webrtc');
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

export const getBestLocations = async (onProgress?: (msg: string) => void): Promise<GeoLocationResult[]> => {
  const locations: GeoLocationResult[] = [];
  if (onProgress) onProgress("Initializing multi-layer geographic probes...");

  // Parallelize fetch where possible without hanging indefinitely
  const [gps, ip, webrtc, homeIp] = await Promise.all([
    getGPSLocation().then(res => {
      if (res && onProgress) onProgress(`[GPS] Satellite lock: ${res.city || 'Coordinates acquired'}`);
      return res;
    }),
    getIPLocation().then(res => {
      if (res && onProgress) onProgress(`[IP-WAN] Proxy node traced: ${res.city || 'Unknown'}`);
      return res;
    }),
    getWebRTCLocation().then(res => {
      if (res && onProgress) onProgress(`[STUN] WebRTC proxy bypassed: ${res.city || 'Unknown'}`);
      return res;
    }),
    getDomesticIPLocation().then(res => {
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
    }
  }

  return deduped.sort((a, b) => b.confidence - a.confidence);
};
