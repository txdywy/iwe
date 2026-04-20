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
    music: ["Indie Pop", "Sunny Day Real Estate", "Bossa Nova", "Acoustic Sunrise"],
    movie: ["Call Me By Your Name", "La La Land", "Spirited Away", "The Grand Budapest Hotel"],
    book: ["The Great Gatsby", "On the Road", "A Room with a View"]
  },
  Rain: {
    music: ["Lofi Hip Hop", "Ryuichi Sakamoto", "Cigarettes After Sex", "Tchaikovsky"],
    movie: ["The Garden of Words", "Blade Runner 2049", "In the Mood for Love", "Se7en"],
    book: ["Norwegian Wood", "Kafka on the Shore", "The Shadow of the Wind"]
  },
  Snow: {
    music: ["Sigur Ros", "Bon Iver", "Ambient Winter", "Chopin Nocturnes"],
    movie: ["Fargo", "The Shining", "Eternal Sunshine of the Spotless Mind", "Snowpiercer"],
    book: ["The Girl with the Dragon Tattoo", "A Wild Sheep Chase", "Smilla's Sense of Snow"]
  },
  Clouds: {
    music: ["Radiohead", "Shoegaze", "The National", "Post-Rock"],
    movie: ["Drive", "Lost in Translation", "Her", "Good Will Hunting"],
    book: ["The Catcher in the Rye", "Never Let Me Go", "1984"]
  },
  Thunderstorm: {
    music: ["Hans Zimmer", "Dark Synthwave", "Nine Inch Nails", "Beethoven Symphony 9"],
    movie: ["The Dark Knight", "Inception", "Mad Max Fury Road", "Matrix"],
    book: ["Frankenstein", "Dracula", "Dune", "The Call of Cthulhu"]
  }
};

const pickRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

// Fetch from open APIs
const fetchITunes = async (query: string, media: 'music' | 'movie'): Promise<VibeItem | undefined> => {
  try {
    // iTunes movie search is strictly region-locked/flaky. We use soundtrack trick to get gorgeous movie covers.
    const searchTerm = media === 'movie' ? `${query} soundtrack` : query;
    const searchMedia = media === 'movie' ? 'music' : media;
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&media=${searchMedia}&limit=1`);
    if (!res.ok) return undefined;
    const data = await res.json();
    const item = data.results[0];
    if (item) {
      const hiResCover = item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : '';
      return {
        type: media,
        title: media === 'movie' ? query : (item.trackName || item.collectionName || query),
        subtitle: item.artistName || '',
        coverUrl: hiResCover,
        link: item.trackViewUrl || item.collectionViewUrl
      };
    }
  } catch (e) {
    console.warn(`iTunes fetch failed for ${query}`);
  }
  return undefined;
};

const fetchITunesBook = async (query: string): Promise<VibeItem | undefined> => {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=ebook&limit=1`);
    if (!res.ok) return undefined;
    const data = await res.json();
    const item = data.results[0];
    if (item) {
      const hiResCover = item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.trackName || query)}&background=random`;
      return {
        type: 'book',
        title: item.trackName || query,
        subtitle: item.artistName || 'Unknown Author',
        coverUrl: hiResCover,
        link: item.trackViewUrl
      };
    }
  } catch (e) {
    console.warn(`iTunes Book fetch failed for ${query}`);
  }
  return undefined;
};

export const generateVibe = async (condition: 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Thunderstorm'): Promise<VibeRecommendation> => {
  const seeds = seedLibrary[condition] || seedLibrary.Clear;
  
  // Custom retry wrapper that tests different random seeds up to 3 times
  const fetchWithRetry = async (
    fetcher: (q: string) => Promise<VibeItem | undefined>,
    seedArray: string[],
    retries = 3
  ): Promise<VibeItem | undefined> => {
    let result: VibeItem | undefined;
    for (let i = 0; i < retries; i++) {
        const query = pickRandom(seedArray);
        result = await fetcher(query);
        if (result) return result;
    }
    return undefined;
  };

  const [music, movie, book] = await Promise.all([
    fetchWithRetry((q) => fetchITunes(q, 'music'), seeds.music),
    fetchWithRetry((q) => fetchITunes(q, 'movie'), seeds.movie),
    fetchWithRetry((q) => fetchITunesBook(q), seeds.book)
  ]);

  return {
    music,
    movie,
    book
  };
};
