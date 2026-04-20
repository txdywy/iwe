export interface VibeItem {
  title: string;
  subtitle: string;
  coverUrl: string;
  link?: string;
  type: 'music' | 'movie' | 'book';
}

export interface VibeRecommendation {
  music?: VibeItem;
  movie?: VibeItem;
  book?: VibeItem;
}

const seedLibrary = {
  Clear: {
    music: ["Bossa Nova", "Sunny Day Real Estate", "Acoustic Sunrise", "Pharrell Williams Happy"],
    movie: ["Spirited Away", "La La Land", "The Grand Budapest Hotel", "Call Me By Your Name"],
    book: ["The Great Gatsby", "On the Road", "A Room with a View"]
  },
  Rain: {
    music: ["Ryuichi Sakamoto", "Cigarettes After Sex", "Tchaikovsky", "Nils Frahm"],
    movie: ["Blade Runner 2049", "In the Mood for Love", "The Garden of Words", "Se7en"],
    book: ["Norwegian Wood", "Kafka on the Shore", "The Shadow of the Wind"]
  },
  Snow: {
    music: ["Bon Iver", "Chopin Nocturnes", "Sigur Ros", "Max Richter"],
    movie: ["Fargo", "The Shining", "Eternal Sunshine of the Spotless Mind", "Snowpiercer"],
    book: ["The Girl with the Dragon Tattoo", "A Wild Sheep Chase", "Smilla's Sense of Snow"]
  },
  Clouds: {
    music: ["Radiohead", "The National", "Beach House", "Explosions in the Sky"],
    movie: ["Drive 2011 film", "Lost in Translation", "Her 2013 film", "Good Will Hunting"],
    book: ["The Catcher in the Rye", "Never Let Me Go", "1984"]
  },
  Thunderstorm: {
    music: ["Hans Zimmer", "Nine Inch Nails", "Beethoven Symphony 9", "Trent Reznor"],
    movie: ["The Dark Knight", "Inception", "Mad Max Fury Road", "The Matrix"],
    book: ["Frankenstein", "Dracula", "Dune", "The Call of Cthulhu"]
  }
};

// ── Music via MusicBrainz + CoverArtArchive ──
// KEY INSIGHT: img tags load CoverArtArchive URLs without CORS restriction — only fetch() is blocked.
// MusicBrainz release objects include a `cover-art-archive.front` boolean; use that to avoid any HEAD checks.
interface MusicBrainzRelease {
  id: string;
  title: string;
  'artist-credit'?: { artist: { name: string } }[];
  'release-group'?: { id: string };
}

const fetchMusic = async (query: string, signal?: AbortSignal): Promise<VibeItem | undefined> => {
  try {
    const res = await fetch(
      `https://musicbrainz.org/ws/2/release?query=${encodeURIComponent(query)}&fmt=json&limit=5`,
      { signal }
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    const releases: MusicBrainzRelease[] = data.releases || [];

    const best = releases[0];
    if (!best) return undefined;

    const artistName = best['artist-credit']?.[0]?.artist?.name || '';
    // Use release-group ID if available, otherwise release ID.
    // CoverArtArchive supports both.
    const entityId = best['release-group']?.id || best.id;
    const entityType = best['release-group']?.id ? 'release-group' : 'release';
    
    const coverUrl = `https://coverartarchive.org/${entityType}/${entityId}/front-500`;

    return {
      type: 'music',
      title: best.title || query,
      subtitle: artistName,
      coverUrl,
      link: `https://musicbrainz.org/release/${best.id}`,
    };
  } catch {
    return undefined;
  }
};

interface WikiSearchPage {
  key: string;
}

const fetchMovie = async (query: string, signal?: AbortSignal): Promise<VibeItem | undefined> => {
  try {
    // Step 1: Search Wikipedia for the film page
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(query + ' film')}&limit=5`,
      { signal }
    );
    if (!searchRes.ok) return undefined;
    const searchData = await searchRes.json();
    const pages: WikiSearchPage[] = searchData.pages || [];

    // Step 2: Fetch summaries in parallel to avoid serial fetch waterfall
    const results = await Promise.allSettled(
      pages.map(page => 
        fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page.key)}`, { signal })
          .then(res => res.ok ? res.json() : null)
      )
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value?.thumbnail?.source) {
        const summary = result.value;
        return {
          type: 'movie',
          title: summary.title || query,
          subtitle: summary.description || '',
          coverUrl: summary.thumbnail.source.replace(/\/\d+px-/, '/400px-'),
          link: summary.content_urls?.desktop?.page,
        };
      }
    }
  } catch {
    return undefined;
  }
  return undefined;
};

const fetchBook = async (query: string, signal?: AbortSignal): Promise<VibeItem | undefined> => {
  try {
    // OpenLibrary Search API (CORS friendly)
    const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=1`, { signal });
    if (!res.ok) return undefined;
    const data = await res.json();
    const doc = data.docs?.[0];
    
    if (doc) {
      // OpenLibrary Cover API
      const coverUrl = doc.cover_i 
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : '';
        
      return {
        type: 'book',
        title: doc.title || query,
        subtitle: doc.author_name?.[0] || 'Unknown Author',
        coverUrl,
        link: doc.key ? `https://openlibrary.org${doc.key}` : undefined,
      };
    }
  } catch {
    return undefined;
  }
  return undefined;
};

const fisherYatesShuffle = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const generateVibe = async (
  condition: 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Thunderstorm',
  signal?: AbortSignal
): Promise<VibeRecommendation> => {
  const seeds = seedLibrary[condition] || seedLibrary.Clear;

  // Retry wrapper: tries different random seeds up to `retries` times
  const fetchWithRetry = async <T>(
    fetcher: (q: string, s?: AbortSignal) => Promise<T | undefined>,
    seedArray: string[],
    retries = 3
  ): Promise<T | undefined> => {
    const shuffled = fisherYatesShuffle(seedArray);
    for (let i = 0; i < Math.min(retries, shuffled.length); i++) {
      const result = await fetcher(shuffled[i], signal);
      if (result) return result;
    }
    return undefined;
  };

  const [music, movie, book] = await Promise.all([
    fetchWithRetry(fetchMusic, seeds.music),
    fetchWithRetry(fetchMovie, seeds.movie),
    fetchWithRetry(fetchBook, seeds.book),
  ]);

  return { music, movie, book };
};
