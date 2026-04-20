import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HNStory {
  id: number;
  title: string;
  url?: string;
  score: number;
  by: string;
}

export const HackerNewsWidget: React.FC = () => {
  const [stories, setStories] = useState<HNStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchHN = async () => {
      try {
        const res = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        const ids: number[] = await res.json();
        const top10 = ids.slice(0, 10);

        const storyPromises = top10.map(async (id) => {
          const sRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          const story: HNStory = await sRes.json();
          return story;
        });

        const fetchedStories = await Promise.all(storyPromises);
        if (isMounted) {
          setStories(fetchedStories);
          setLoading(false);
        }
      } catch {
        if (isMounted) setLoading(false);
      }
    };

    fetchHN();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-sm md:rounded-[32px] md:border md:border-white/20 md:bg-black/30 md:backdrop-blur-2xl md:p-5 flex items-center justify-center min-h-[120px]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-6 h-6 border-2 border-[#ff6600]/50 border-t-[#ff6600] rounded-full" />
        <span className="ml-3 text-white/50 text-xs font-bold tracking-widest uppercase">Fetching HN Top 10...</span>
      </div>
    );
  }

  if (stories.length === 0) return null;

  return (
    <div className="w-full max-w-sm md:rounded-[32px] md:border md:border-white/20 md:bg-white/10 md:backdrop-blur-2xl md:px-5 md:pt-4 md:pb-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1 px-1 md:mt-0 mt-2">
        <span className="text-[10px] uppercase font-bold tracking-[0.18em] text-[#ff6600]">Hacker News Top 10</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
      
      {/* Content */}
      <div className="flex flex-col gap-2">
        {stories.map((story, i) => (
          <a
            key={story.id}
            href={story.url || `https://news.ycombinator.com/item?id=${story.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-3 rounded-2xl bg-black/20 hover:bg-black/40 border border-white/5 transition-colors group"
          >
            <span className="text-[#ff6600] font-bold text-sm min-w-[18px] mt-0.5">{i + 1}.</span>
            <div className="flex flex-col gap-1">
              <span className="text-white/90 text-sm font-medium leading-tight group-hover:text-white transition-colors">
                {story.title}
              </span>
              <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-wider font-semibold mt-1">
                <span>{story.score} pts</span>
                <span>•</span>
                <span className="truncate">{story.by}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
