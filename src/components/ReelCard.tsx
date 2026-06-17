import React, { useState } from 'react';
import { Reel, Category } from '../types';
import LucideIcon from './LucideIcon';
import { motion } from 'motion/react';

interface ReelCardProps {
  key?: string | number;
  reel: Reel;
  category?: Category;
  onPlay: (reel: Reel) => void;
  onToggleFavorite: (id: string) => void;
  onRate: (id: string, rating: number) => void;
  onEdit: (reel: Reel) => void;
  onDelete: (id: string) => void;
  onTagClick?: (tag: string) => void;
}

export default function ReelCard({
  reel,
  category,
  onPlay,
  onToggleFavorite,
  onRate,
  onEdit,
  onDelete,
  onTagClick,
}: ReelCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getPlatformColors = () => {
    switch (reel.platform) {
      case 'instagram':
        return {
          bg: 'bg-gradient-to-tr from-yellow-500/10 via-pink-500/10 to-purple-500/10 border border-purple-900/50 text-purple-400',
          badge: 'bg-gradient-to-tr from-pink-500/20 to-purple-650/20 text-purple-300 border border-purple-800/40',
          icon: 'Instagram',
        };
      case 'facebook':
        return {
          bg: 'bg-blue-950/40 border border-blue-900/50 text-blue-400',
          badge: 'bg-blue-950/40 border border-blue-800/40 text-blue-400',
          icon: 'Facebook',
        };
      case 'tiktok':
        return {
          bg: 'bg-zinc-950/40 border border-zinc-800 text-zinc-300',
          badge: 'bg-zinc-950/60 border border-zinc-800 text-zinc-300',
          icon: 'Chrome',
        };
      default:
        return {
          bg: 'bg-[#121214] border border-zinc-850 text-zinc-400',
          badge: 'bg-zinc-950/60 border border-zinc-850 text-zinc-400',
          icon: 'Bookmark',
        };
    }
  };

  const getCategoryColors = () => {
    const defaultColor = 'emerald';
    const c = category?.color || defaultColor;
    switch (c) {
      case 'emerald': return 'bg-emerald-950/45 text-emerald-400 border border-emerald-900/50';
      case 'amber': return 'bg-amber-950/45 text-amber-400 border border-amber-900/50';
      case 'sky': return 'bg-sky-950/45 text-sky-400 border border-sky-900/50';
      case 'purple': return 'bg-indigo-950/45 text-indigo-400 border border-indigo-900/50';
      case 'rose': return 'bg-rose-950/45 text-rose-455 border border-rose-900/50';
      default: return 'bg-emerald-950/45 text-emerald-400 border border-emerald-900/50';
    }
  };

  const plat = getPlatformColors();

  return (
    <motion.div
      id={`reel-card-${reel.id}`}
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#0F0F11] shadow-xs bento-glow transition-all duration-300 hover:border-zinc-700 hover:shadow-lg"
    >
      {/* Header Info Block */}
      <div className="flex flex-col p-4 pb-2.5">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Category Pill */}
            <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase leading-none ${getCategoryColors()}`}>
              <LucideIcon name={category?.iconName || 'Folder'} size={8} />
              {category?.name || 'Unassigned'}
            </span>
            
            {/* Platform Badge */}
            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[9px] font-mono font-bold tracking-wide uppercase ${plat.badge}`}>
              <LucideIcon name={plat.icon} size={9} />
              {reel.platform}
            </span>
          </div>

          {/* Favorite Toggle Button */}
          <button
            id={`favorite-btn-${reel.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(reel.id);
            }}
            className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all active:scale-95 cursor-pointer ${
              reel.isFavorite
                ? 'bg-rose-955/20 border-rose-900/50 text-rose-400 shadow-sm'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
            title={reel.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
          >
            <LucideIcon
              name="Heart"
              size={13}
              className={reel.isFavorite ? 'fill-current' : ''}
            />
          </button>
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 text-sm font-semibold tracking-tight text-white group-hover:text-indigo-400 transition-colors leading-snug cursor-pointer" onClick={() => onPlay(reel)}>
          {reel.title}
        </h3>
      </div>

      {/* Media Window Container / Direct Native Iframe Preview */}
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-zinc-950 border-y border-zinc-900/80">
        <iframe
          src={reel.embedCode}
          className="absolute inset-0 h-full w-full border-0 select-text"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="no-referrer"
          title={reel.title}
        />
      </div>

      {/* Rating & Actions Panel Footer */}
      <div className="flex flex-col p-4 bg-zinc-950/40">
        {/* Rating & Action Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5" title="User Rating">
            {[1, 2, 3, 4, 5].map((starValue) => (
              <button
                id={`star-rating-btn-${reel.id}-${starValue}`}
                key={starValue}
                onClick={() => onRate(reel.id, starValue)}
                className={`transition-colors duration-150 cursor-pointer ${
                  starValue <= (reel.rating || 0)
                    ? 'text-amber-400 hover:text-amber-500'
                    : 'text-zinc-800 hover:text-amber-300'
                }`}
              >
                <LucideIcon
                  name="Star"
                  size={14}
                  className={starValue <= (reel.rating || 0) ? 'fill-current' : ''}
                />
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <button
              id={`theater-play-btn-${reel.id}`}
              onClick={() => onPlay(reel)}
              className="p-1 px-1.5 text-[10px] gap-1 font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-zinc-850 border border-indigo-950/40 rounded-lg transition-colors cursor-pointer inline-flex items-center"
              title="Open full interactive text & notes theater modal"
            >
              <LucideIcon name="Play" size={10} />
              Theater
            </button>
            
            {reel.url && (
              <button
                id={`copy-link-btn-${reel.id}`}
                onClick={() => {
                  navigator.clipboard.writeText(reel.url || '');
                  alert('Original Reel link copied to clipboard!');
                }}
                className="p-1 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-850 rounded-lg transition-colors cursor-pointer"
                title="Copy Original Link"
              >
                <LucideIcon name="Clipboard" size={13} />
              </button>
            )}
            <button
              id={`edit-reel-btn-${reel.id}`}
              onClick={() => onEdit(reel)}
              className="p-1 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-850 rounded-lg transition-colors cursor-pointer"
              title="Edit Reel Details"
            >
              <LucideIcon name="Edit2" size={13} />
            </button>
            <button
              id={`delete-reel-btn-${reel.id}`}
              onClick={() => onDelete(reel.id)}
              className="p-1 text-zinc-400 hover:text-rose-450 hover:bg-rose-955/20 rounded-lg transition-colors cursor-pointer"
              title="Delete Organized Reel"
            >
              <LucideIcon name="Trash2" size={13} />
            </button>
          </div>
        </div>

        {/* Short Notes */}
        {reel.notes && (
          <p className="mt-3 line-clamp-2 text-xs text-zinc-400 leading-relaxed italic border-l border-zinc-800 pl-2">
            "{reel.notes}"
          </p>
        )}

        {/* Dynamic Tags list */}
        {reel.tags && reel.tags.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-zinc-900/60 flex flex-wrap gap-1">
            {reel.tags.map((tag) => (
              <button
                id={`tag-badge-btn-${reel.id}-${tag}`}
                key={tag}
                onClick={() => onTagClick?.(tag)}
                className="inline-flex items-center gap-0.5 rounded-md bg-zinc-950 border border-zinc-900 px-2 py-0.5 text-[9px] font-mono font-semibold text-zinc-500 hover:text-indigo-400 hover:bg-zinc-900 hover:border-zinc-800 transition"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
