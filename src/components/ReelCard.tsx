import React from 'react';
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
  onEdit,
  onDelete,
  onTagClick,
}: ReelCardProps) {
  const getCategoryColors = () => {
    const c = category?.color || 'emerald';
    switch (c) {
      case 'emerald': return 'bg-emerald-950/45 text-emerald-400 border border-emerald-900/50';
      case 'amber':   return 'bg-amber-950/45 text-amber-400 border border-amber-900/50';
      case 'sky':     return 'bg-sky-950/45 text-sky-400 border border-sky-900/50';
      case 'purple':  return 'bg-indigo-950/45 text-indigo-400 border border-indigo-900/50';
      case 'rose':    return 'bg-rose-950/45 text-rose-400 border border-rose-900/50';
      default:        return 'bg-emerald-950/45 text-emerald-400 border border-emerald-900/50';
    }
  };

  return (
    <motion.div
      id={`reel-card-${reel.id}`}
      layout
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-[#0F0F11] shadow-xs transition-all duration-300 hover:border-zinc-700 hover:shadow-lg"
    >
      {/* Header: category + favorite */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase leading-none ${getCategoryColors()}`}>
          <LucideIcon name={category?.iconName || 'Folder'} size={8} />
          {category?.name || 'Unassigned'}
        </span>

        <button
          id={`favorite-btn-${reel.id}`}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(reel.id); }}
          className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all active:scale-95 cursor-pointer ${
            reel.isFavorite
              ? 'bg-rose-950/20 border-rose-900/50 text-rose-400'
              : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-rose-400 hover:border-rose-900/50'
          }`}
          title={reel.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
        >
          <LucideIcon name="Heart" size={13} className={reel.isFavorite ? 'fill-current' : ''} />
        </button>
      </div>

      {/* Media: 16:9 with hover play overlay */}
      <div
        className="relative aspect-video w-full overflow-hidden bg-zinc-950 border-y border-zinc-900/60 cursor-pointer"
        onClick={() => onPlay(reel)}
      >
        {reel.imageUrl && !reel.embedCode ? (
          <img
            src={reel.imageUrl}
            alt={reel.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <iframe
            src={reel.embedCode}
            className="absolute inset-0 h-full w-full border-0 pointer-events-none"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="no-referrer"
            title={reel.title}
          />
        )}

        {/* Play overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
            <LucideIcon name="Play" size={20} className="text-white translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col flex-grow px-4 pt-3 pb-4 gap-2.5">
        {/* Title */}
        <h3
          className="line-clamp-2 text-sm font-semibold tracking-tight text-white group-hover:text-indigo-400 transition-colors leading-snug cursor-pointer"
          onClick={() => onPlay(reel)}
        >
          {reel.title}
        </h3>

        {/* Tags */}
        {reel.tags && reel.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {reel.tags.map((tag) => (
              <button
                id={`tag-badge-btn-${reel.id}-${tag}`}
                key={tag}
                onClick={() => onTagClick?.(tag)}
                className="rounded-md bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[9px] font-mono font-semibold text-zinc-500 hover:text-indigo-400 hover:border-zinc-700 transition cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Actions — pinned to bottom, visible on hover */}
        <div className="flex items-center justify-end gap-1 mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {reel.url && (
            <button
              id={`copy-link-btn-${reel.id}`}
              onClick={() => { navigator.clipboard.writeText(reel.url || ''); alert('Link copied!'); }}
              className="p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
              title="Copy Original Link"
            >
              <LucideIcon name="Clipboard" size={13} />
            </button>
          )}
          <button
            id={`edit-reel-btn-${reel.id}`}
            onClick={() => onEdit(reel)}
            className="p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
            title="Edit"
          >
            <LucideIcon name="Edit2" size={13} />
          </button>
          <button
            id={`delete-reel-btn-${reel.id}`}
            onClick={() => onDelete(reel.id)}
            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
            title="Delete"
          >
            <LucideIcon name="Trash2" size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
