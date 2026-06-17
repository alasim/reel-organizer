import React, { useState, useEffect } from 'react';
import { Reel, Category } from '../types';
import LucideIcon from './LucideIcon';
import { parseReelUrl } from '../utils/reelParser';
import { motion } from 'motion/react';

interface ReelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reelData: Omit<Reel, 'id' | 'createdAt'> & { id?: string }) => void;
  categories: Category[];
  editingReel?: Reel | null;
}

export default function ReelFormModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  editingReel,
}: ReelFormModalProps) {
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [rating, setRating] = useState(5);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (editingReel) {
      setTitle(editingReel.title);
      setCategoryId(editingReel.categoryId);
      setInputUrl(editingReel.url || editingReel.embedCode);
      setNotes(editingReel.notes || '');
      setTagsInput(editingReel.tags.join(', '));
      setIsFavorite(editingReel.isFavorite);
      setRating(editingReel.rating || 5);
      setValidationError('');
    } else {
      // Reset form for fresh creation
      setTitle('');
      setCategoryId(categories[0]?.id || '');
      setInputUrl('');
      setNotes('');
      setTagsInput('');
      setIsFavorite(false);
      setRating(5);
      setValidationError('');
    }
  }, [editingReel, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setValidationError('Please enter a title for this Reel.');
      return;
    }
    if (!categoryId) {
      setValidationError('Please select a category.');
      return;
    }
    if (!inputUrl.trim()) {
      setValidationError('Please paste an iframe embed code or link (Instagram, TikTok, Facebook).');
      return;
    }

    // Parse the input link or iframe string
    const parsed = parseReelUrl(inputUrl);
    if (!parsed.embedUrl) {
      setValidationError('Could not parse a valid embed source from the input. Please enter a valid URL.');
      return;
    }

    // Process tags
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const dataSubmit: Omit<Reel, 'id' | 'createdAt'> & { id?: string } = {
      title: title.trim(),
      categoryId,
      embedCode: parsed.embedUrl,
      url: inputUrl.includes('http') && !inputUrl.includes('<iframe') ? inputUrl.trim() : editingReel?.url,
      notes: notes.trim(),
      tags,
      isFavorite,
      rating,
      platform: parsed.platform,
    };

    if (editingReel) {
      dataSubmit.id = editingReel.id;
    }

    onSubmit(dataSubmit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-[#0F0F11] text-zinc-100 shadow-2xl bento-glow"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-850 bg-zinc-950/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <LucideIcon
              name={editingReel ? 'Edit2' : 'PlusCircle'}
              className="text-indigo-400"
              size={20}
            />
            <h3 className="text-base font-bold text-white font-sans tracking-tight">
              {editingReel ? 'Edit Reel Info' : 'Organize New Reel'}
            </h3>
          </div>
          <button
            id="close-reel-modal-header"
            onClick={onClose}
            className="rounded-full p-1 text-zinc-500 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
          >
            <LucideIcon name="X" size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="flex items-start gap-2.5 rounded-lg bg-rose-950/30 p-3 text-xs text-rose-455 border border-rose-900/50">
              <LucideIcon name="AlertCircle" size={16} className="shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 font-mono">
              Reel Title *
            </label>
            <input
              id="reel-title-input"
              type="text"
              placeholder="e.g., Crispy Air Fryer Baked Potatoes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-700 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-shadow font-sans"
              required
            />
          </div>

          {/* Grid for Category & Rating */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 font-mono">
                Category *
              </label>
              <select
                id="reel-category-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-zinc-950 text-zinc-100">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 font-mono">
                Star Rating
              </label>
              <div className="flex items-center h-[38px] gap-1 px-1">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <button
                    id={`modal-rate-star-${starVal}`}
                    type="button"
                    key={starVal}
                    onClick={() => setRating(starVal)}
                    className={`transition-colors cursor-pointer ${
                      starVal <= rating ? 'text-amber-400 hover:text-amber-500' : 'text-zinc-700 hover:text-amber-300'
                    }`}
                  >
                    <LucideIcon name="Star" size={18} className={starVal <= rating ? 'fill-current' : ''} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Embed or Link */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                Embed Code or Original Link *
              </label>
              <span className="text-[9px] text-indigo-400 font-bold bg-indigo-950/40 border border-indigo-900/40 px-2 py-0.5 rounded-md font-mono">
                Auto-Parsing
              </span>
            </div>
            <textarea
              id="reel-url-input"
              rows={3}
              placeholder="Paste Instagram video link, TikTok url, FB reel link or raw <iframe> code..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs md:text-sm text-zinc-100 placeholder-zinc-700 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-shadow font-mono"
              required
            />
            <p className="mt-1.5 text-[10px] text-zinc-500 leading-relaxed font-sans">
              We split links instantly (e.g. <code>instagram.com/reel/C8Hk...</code>) into proper visual cards and load the interactive video player.
            </p>
          </div>

          {/* Notes / Steps */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 font-mono">
              Notes / Recipe Steps / Product Links
            </label>
            <textarea
              id="reel-notes-input"
              rows={3}
              placeholder="e.g. Ingredients: 4 Russet potatoes, 2tbsp olive oil... or 'Buy link is in creator bio, price $19.99'"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-700 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-shadow font-sans"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 font-mono">
              Tags (comma separated)
            </label>
            <div className="relative">
              <input
                id="reel-tags-input"
                type="text"
                placeholder="e.g., recipe, airfryer, dinner, storage"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 pl-9 pr-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-700 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-shadow font-sans"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-650">
                <LucideIcon name="Tag" size={14} />
              </div>
            </div>
          </div>

          {/* Favorite switch */}
          <div className="flex items-center justify-between rounded-lg bg-zinc-900/30 border border-zinc-850 p-3">
            <div className="flex items-center gap-2">
              <LucideIcon name="Heart" size={16} className={`${isFavorite ? 'text-rose-550 fill-current' : 'text-zinc-500'}`} />
              <div>
                <p className="text-xs font-semibold text-zinc-300">Add to Favorites</p>
                <p className="text-[10px] text-zinc-500">Instantly pins to the favorite filter</p>
              </div>
            </div>
            <button
              id="favorite-toggle-btn"
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isFavorite ? 'bg-rose-600' : 'bg-zinc-805'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isFavorite ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              id="cancel-reel-modal-footer"
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-350 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-reel-modal"
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 active:scale-98 transition-all cursor-pointer"
            >
              {editingReel ? 'Save Changes' : 'Organize Reel'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
