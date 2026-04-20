import { useState, useEffect, memo, useCallback } from 'react';
import { motion } from 'framer-motion';

interface HNStory {
  objectID: string;
  title: string;
  url?: string;
  points: number;
  author: string;
  created_at_i: number;
  num_comments: number;
}

export const HackerNewsWidget = memo(() => {
  const [stories, setStories] = useState<HNStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  const formatTime = useCallback((time: number) => {
    const diff = now - time;
    if (diff < 3600) return `${Math.floor(Math.max(1, diff / 60))}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  }, [now]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchHN = async () => {
      try {
        // Single request via Algolia HN API instead of 11 separate Firebase calls
        const res = await fetch(
          'https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=10',
          { signal: controller.signal }
        );
        const data = await res.json();

        if (isMounted && data.hits) {
          setStories(data.hits);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted && !(e instanceof Error && e.name === 'AbortError')) {
          setLoading(false);
        }
      }
    };

    fetchHN();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full md:max-w-none md:rounded-[32px] md:border md:border-white/20 md:bg-black/30 md:backdrop-blur-2xl md:p-8 flex items-center justify-center min-h-[150px]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-6 h-6 border-2 border-[#ff6600]/50 border-t-[#ff6600] rounded-full" />
        <span className="ml-3 text-white/50 text-xs font-bold tracking-widest uppercase italic">Deep-scanning Y-Combinator...</span>
      </div>
    );
  }

  if (stories.length === 0) return null;

  return (
    <div className="w-full md:max-w-none rounded-[24px] md:rounded-[32px] border border-white/10 md:border-white/20 bg-black/40 md:bg-white/5 backdrop-blur-xl md:backdrop-blur-2xl p-4 md:px-6 md:pt-5 md:pb-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#ff6600] animate-pulse shadow-[0_0_8px_rgba(255,102,0,0.8)]" />
          <span className="text-micro uppercase font-black tracking-[0.25em] text-white/70">Hacker News Top 10</span>
        </div>
        <a
          href="https://news.ycombinator.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-bold text-[#ff6600]/80 hover:text-[#ff6600] transition-colors tracking-widest"
        >
          HN.CO
        </a>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {stories.map((story, i) => (
          <a
            key={story.objectID}
            href={story.url || `https://news.ycombinator.com/item?id=${story.objectID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-300 group"
          >
            <span className="text-white/10 font-black text-2xl italic min-w-[32px] leading-none group-hover:text-[#ff6600]/30 transition-colors">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <span className="text-white/90 text-[13.5px] font-semibold leading-snug group-hover:text-white transition-colors line-clamp-2">
                {story.title}
              </span>
              <div className="flex items-center gap-3 text-[10px] text-white/70 font-bold uppercase tracking-tight">
                <span className="flex items-center gap-1 text-[#ff6600]/70">
                   {story.points} pts
                </span>
                <span className="truncate max-w-[70px]">@{story.author}</span>
                <span>{formatTime(story.created_at_i)}</span>
                <span className="flex items-center gap-1">
                   {story.num_comments || 0} comments
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
});
