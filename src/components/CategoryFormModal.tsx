import React, { useState } from 'react';
import { Category, Reel } from '../types';
import LucideIcon from './LucideIcon';
import { motion, AnimatePresence } from 'motion/react';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  reels: Reel[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
}

const PALETTE_COLORS = [
  { name: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-500', label: 'Emerald Green' },
  { name: 'amber', bg: 'bg-amber-500', text: 'text-amber-500', label: 'Amber Gold' },
  { name: 'sky', bg: 'bg-sky-500', text: 'text-sky-500', label: 'Sky Blue' },
  { name: 'purple', bg: 'bg-indigo-500', text: 'text-indigo-500', label: 'Indigo Purple' },
  { name: 'rose', bg: 'bg-rose-500', text: 'text-rose-500', label: 'Rose Red' },
];

const SELECT_ICONS = [
  { name: 'ChefHat', label: 'Chef Hat (Cooking)' },
  { name: 'ShoppingBag', label: 'Shopping Bag' },
  { name: 'Lightbulb', label: 'Lightbulb (Life hack)' },
  { name: 'Sparkles', label: 'Sparkles (Ideas)' },
  { name: 'Layers', label: 'Layers (General)' },
  { name: 'Heart', label: 'Heart (Favorites)' },
  { name: 'Compass', label: 'Compass (Discoveries)' },
  { name: 'Folder', label: 'Folder (Basic)' },
];

export default function CategoryFormModal({
  isOpen,
  onClose,
  categories,
  reels,
  onAddCategory,
  onDeleteCategory,
}: CategoryFormModalProps) {
  const [newCatName, setNewCatName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('ChefHat');
  const [selectedColor, setSelectedColor] = useState('emerald');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCatName.trim()) {
      setErrorMessage('Please enter a category name.');
      return;
    }

    if (categories.some((c) => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
      setErrorMessage('A category with this name already exists.');
      return;
    }

    onAddCategory({
      name: newCatName.trim(),
      iconName: selectedIcon,
      color: selectedColor,
    });

    setNewCatName('');
    setErrorMessage('');
  };

  const getCategoryCount = (id: string) => {
    return reels.filter((r) => r.categoryId === id).length;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-[#0F0F11] text-zinc-100 shadow-2xl flex flex-col max-h-[90vh] bento-glow"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-850 bg-zinc-950/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <LucideIcon name="FolderPlus" className="text-indigo-400" size={20} />
            <h3 className="text-base font-bold text-white font-sans tracking-tight">Manage Reel Categories</h3>
          </div>
          <button
            id="close-category-modal-header"
            onClick={onClose}
            className="rounded-full p-1 text-zinc-500 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
          >
            <LucideIcon name="X" size={18} />
          </button>
        </div>

        {/* Scrollable Layout */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Section 1: Create Category */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/10 p-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3 font-mono">
              Create New Category
            </h4>

            <form onSubmit={handleAdd} className="space-y-4">
              {errorMessage && (
                <p className="text-xs text-rose-450 font-medium flex items-center gap-1">
                  <LucideIcon name="AlertCircle" size={12} />
                  {errorMessage}
                </p>
              )}

              {/* Title */}
              <div>
                <input
                  id="category-name-input"
                  type="text"
                  placeholder="e.g., Quick Dinners, Amazon Tech, Cleaning Hacks..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-700 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-505 transition-shadow font-sans"
                />
              </div>

              {/* Icon select */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 font-mono">
                  Category Icon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {SELECT_ICONS.map((icon) => (
                    <button
                      id={`icon-select-btn-${icon.name}`}
                      key={icon.name}
                      type="button"
                      onClick={() => setSelectedIcon(icon.name)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-zinc-300 transition-all cursor-pointer ${
                        selectedIcon === icon.name
                          ? 'border-indigo-500 bg-indigo-950/40 text-indigo-400 scale-102 ring-1 ring-indigo-500'
                          : 'border-zinc-800 bg-zinc-950/45 hover:border-zinc-700'
                      }`}
                    >
                      <LucideIcon name={icon.name} size={18} className="mb-1 text-zinc-400" />
                      <span className="text-[9px] text-zinc-500 truncate w-full text-center">
                        {icon.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Select */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5 font-mono">
                  Category Theme Color
                </label>
                <div className="flex items-center gap-3">
                  {PALETTE_COLORS.map((col) => (
                    <button
                      id={`color-select-btn-${col.name}`}
                      key={col.name}
                      type="button"
                      onClick={() => setSelectedColor(col.name)}
                      className={`relative flex h-8 w-8 items-center justify-center rounded-full text-white transition-transform cursor-pointer ${col.bg} ${
                        selectedColor === col.name ? 'scale-110 ring-2 ring-indigo-500 ring-offset-2' : 'hover:scale-105'
                      }`}
                      title={col.label}
                    >
                      {selectedColor === col.name && <LucideIcon name="Check" size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="add-category-submit"
                type="submit"
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all cursor-pointer"
              >
                Add Category
              </button>
            </form>
          </div>

          {/* Section 2: Active Categories List */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-3 font-mono">
              Existing Categories
            </h4>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {categories.map((cat) => {
                  const numReels = getCategoryCount(cat.id);
                  const isProtected = ['cook', 'shopping', 'life-hacks'].includes(cat.id);

                  return (
                    <motion.div
                      id={`category-row-${cat.id}`}
                      key={cat.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#121214] p-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                            cat.color === 'emerald'
                              ? 'bg-emerald-950/40 text-emerald-400'
                              : cat.color === 'amber'
                              ? 'bg-amber-950/40 text-amber-400'
                              : cat.color === 'sky'
                              ? 'bg-sky-950/40 text-sky-400'
                              : cat.color === 'purple'
                              ? 'bg-indigo-950/40 text-indigo-400'
                              : 'bg-rose-950/40 text-rose-450'
                          }`}
                        >
                          <LucideIcon name={cat.iconName} size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-100">{cat.name}</p>
                          <p className="text-[10px] text-zinc-500">
                            {numReels} {numReels === 1 ? 'reel' : 'reels'} organized
                          </p>
                        </div>
                      </div>

                      {/* Deletion of Custom Categories */}
                      {!isProtected ? (
                        <button
                          id={`delete-cat-btn-${cat.id}`}
                          onClick={() => {
                            if (numReels > 0) {
                              const proceed = window.confirm(
                                `Warning: This category contains ${numReels} Reels. Deleting it will re-categorize them to "Cooking & Recipes" or similar. Proceed?`
                              );
                              if (!proceed) return;
                            }
                            onDeleteCategory(cat.id);
                          }}
                          className="rounded-lg p-2 text-zinc-500 hover:bg-rose-955/20 hover:text-rose-455 transition-colors cursor-pointer"
                          title="Delete Custom Category"
                        >
                          <LucideIcon name="Trash2" size={14} />
                        </button>
                      ) : (
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-450 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-sm">
                          Locked
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-850 bg-zinc-950/60 px-6 py-4 flex justify-end">
          <button
            id="close-category-modal-footer"
            onClick={onClose}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
