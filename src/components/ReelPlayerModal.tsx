import React from 'react';
import { Reel, Category } from '../types';
import LucideIcon from './LucideIcon';
import { motion } from 'motion/react';

interface ReelPlayerModalProps {
  reel: Reel | null;
  category?: Category;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onRate: (id: string, rating: number) => void;
}

export default function ReelPlayerModal({
  reel,
  category,
  isOpen,
  onClose,
  onToggleFavorite,
  onRate,
}: ReelPlayerModalProps) {
  if (!isOpen || !reel) return null;

  const getPlatformLabel = () => {
    switch (reel.platform) {
      case 'instagram': return { name: 'Instagram', color: 'bg-gradient-to-tr from-yellow-500/10 via-pink-500/10 to-purple-500/10 text-purple-400 border border-purple-900/50', icon: 'Instagram' };
      case 'facebook': return { name: 'Facebook', color: 'bg-blue-950/40 text-blue-400 border border-blue-900/50', icon: 'Facebook' };
      case 'tiktok': return { name: 'TikTok', color: 'bg-zinc-950/40 text-zinc-350 border border-zinc-800', icon: 'Chrome' };
      default: return { name: 'Social Post', color: 'bg-[#121214] text-zinc-400 border border-zinc-850', icon: 'Bookmark' };
    }
  };

  const getCategoryTheme = () => {
    const c = category?.color || 'emerald';
    switch (c) {
      case 'emerald': return 'bg-emerald-950/45 text-emerald-400 border border-emerald-900/50';
      case 'amber': return 'bg-amber-950/45 text-amber-400 border border-amber-900/50';
      case 'sky': return 'bg-sky-950/45 text-sky-400 border border-sky-900/50';
      case 'purple': return 'bg-indigo-950/45 text-indigo-400 border border-indigo-900/50';
      case 'rose': return 'bg-rose-955/45 text-rose-450 border border-rose-900/50';
      default: return 'bg-emerald-955/45 text-emerald-400 border border-emerald-900/50';
    }
  };

  const plat = getPlatformLabel();

  // Helper to pre-format lines inside Notes (such as bullet points, numbered recipes)
  const renderNotesContent = (notesText: string) => {
    if (!notesText) return <p className="text-sm text-zinc-550 italic font-medium">No instructions or product links logged yet.</p>;

    // Split on double line breaks or bullets to make it highly legible
    const sentences = notesText.split('\n').filter(Boolean);
    if (sentences.length > 1) {
      return (
        <ul className="space-y-2.5">
          {sentences.map((line, idx) => {
            const cleanLine = line.replace(/^[\s-*•\d.]+/g, '').trim();
            const isLabel = line.trim().endsWith(':');
            
            if (isLabel) {
              return <li key={idx} className="font-bold text-zinc-200 text-xs md:text-sm mt-3 border-l-2 border-indigo-500 pl-2 uppercase tracking-wide font-mono">{line}</li>;
            }
            return (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-300 leading-relaxed font-sans">
                <span className="flex h-5 w-5 select-none items-center justify-center rounded-full bg-indigo-950/80 border border-indigo-900/50 text-[10px] font-bold text-indigo-400 shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{cleanLine}</span>
              </li>
            );
          })}
        </ul>
      );
    }
    return <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">{notesText}</p>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 lg:p-10">
      {/* Dark immersive backdrop */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />

      {/* Close button on Top Right */}
      <button
        id="theater-close-float"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 border border-zinc-805 text-zinc-300 backdrop-blur-md hover:bg-zinc-800 transition-all active:scale-95 duration-200 cursor-pointer hover:text-white"
        title="Close Theater Mode"
      >
        <LucideIcon name="X" size={24} />
      </button>

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        className="relative z-10 flex h-full w-full max-w-5xl flex-col md:flex-row overflow-hidden bg-[#0F0F11] border border-zinc-800 shadow-2xl md:rounded-3xl bento-glow"
      >
        {/* Left Side: Video stage (taking full vertical on mobile, 9/16 constraint on desktop) */}
        <div className="relative flex flex-1 items-center justify-center bg-zinc-950 p-2 md:p-6 lg:p-8 shrink-0 select-none">
          {/* Constrained 9:16 frame container */}
          <div className="relative h-full aspect-[9/16] max-h-[85vh] w-full max-w-sm rounded-2xl overflow-hidden shadow-xl border border-zinc-850 bg-zinc-950 flex items-center">
            <iframe
              src={reel.embedCode}
              className="absolute inset-0 h-full w-full border-0"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="no-referrer"
              title={reel.title}
            />
          </div>
        </div>

        {/* Right Side: Details Inspector (scrolling list) */}
        <div className="flex w-full flex-col bg-[#0F0F11] border-t border-zinc-900 md:border-t-0 md:border-l md:border-zinc-850 md:w-[440px] shrink-0">
          {/* Header metadata block */}
          <div className="border-b border-zinc-930 p-6 space-y-4">
            {/* Badges line */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-[9px] font-bold tracking-wide uppercase ${getCategoryTheme()}`}>
                <LucideIcon name={category?.iconName || 'Folder'} size={10} />
                {category?.name || 'Cook'}
              </span>

              <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[9px] font-bold tracking-wide uppercase ${plat.color}`}>
                <LucideIcon name={plat.icon} size={10} />
                {plat.name}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-lg font-extrabold text-white leading-snug font-sans tracking-tight">
              {reel.title}
            </h2>

            {/* Quick Actions (Favorite Toggle & Rating Stars) */}
            <div className="flex items-center justify-between rounded-xl bg-zinc-950 p-4 border border-zinc-850">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Your Rating</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <button
                      id={`theater-rate-star-${starValue}`}
                      key={starValue}
                      onClick={() => onRate(reel.id, starValue)}
                      className={`transition-all hover:scale-110 duration-150 cursor-pointer ${
                        starValue <= (reel.rating || 0) ? 'text-amber-400 hover:text-amber-500' : 'text-zinc-800 hover:text-amber-400'
                      }`}
                    >
                      <LucideIcon
                        name="Star"
                        size={20}
                        className={starValue <= (reel.rating || 0) ? 'fill-current' : ''}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-8 w-px bg-zinc-800/80" />

              <button
                id="theater-favorite-toggle"
                onClick={() => onToggleFavorite(reel.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold select-none transition-all duration-200 active:scale-95 cursor-pointer ${
                  reel.isFavorite
                    ? 'bg-rose-955/20 border-rose-900/50 text-rose-400 shadow-2xs'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-350 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <LucideIcon name="Heart" size={14} className={reel.isFavorite ? 'fill-current text-rose-500' : ''} />
                {reel.isFavorite ? 'Favorited' : 'Add to Favs'}
              </button>
            </div>
          </div>

          {/* Body Information (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Reel Notes Section */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2.5 flex items-center gap-2 font-mono">
                <LucideIcon name="Info" size={13} className="text-indigo-400" />
                Notes & Steps
              </h3>
              <div className="rounded-xl bg-zinc-950 p-4 border border-zinc-850">
                {renderNotesContent(reel.notes || '')}
              </div>
            </div>

            {/* Reel Tags */}
            {reel.tags && reel.tags.length > 0 && (
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 px-0.5 font-mono">
                  Assigned Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {reel.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-md bg-zinc-950 border border-zinc-800 px-3 py-1 text-xs font-mono font-medium text-zinc-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Launch original URL */}
            {reel.url && (
              <div className="pt-2">
                <a
                  href={reel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-950/20"
                >
                  <LucideIcon name="ExternalLink" size={14} />
                  Open Original on Creator Channel
                </a>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
