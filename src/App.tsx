import React, { useState, useEffect } from 'react';
import { Category, Reel } from './types';
import { INITIAL_CATEGORIES, INITIAL_REELS } from './data/initialData';
import LucideIcon from './components/LucideIcon';
import ReelCard from './components/ReelCard';
import ReelFormModal from './components/ReelFormModal';
import CategoryFormModal from './components/CategoryFormModal';
import ReelPlayerModal from './components/ReelPlayerModal';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // --- Persistent States ---
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('reel_organizer_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [reels, setReels] = useState<Reel[]>(() => {
    const saved = localStorage.getItem('reel_organizer_reels');
    return saved ? JSON.parse(saved) : INITIAL_REELS;
  });

  // --- Filtering States ---
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // --- Modals Toggle States ---
  const [isReelFormOpen, setIsReelFormOpen] = useState<boolean>(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState<boolean>(false);
  const [isBackupOpen, setIsBackupOpen] = useState<boolean>(false);

  // --- Inspector / Active Work States ---
  const [activeReel, setActiveReel] = useState<Reel | null>(null);
  const [editingReel, setEditingReel] = useState<Reel | null>(null);
  const [backupInput, setBackupInput] = useState<string>('');
  const [backupNotice, setBackupNotice] = useState<{ text: string; error: boolean } | null>(null);

  // Synchronize Categories and Reels with LocalStorage on update
  useEffect(() => {
    localStorage.setItem('reel_organizer_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('reel_organizer_reels', JSON.stringify(reels));
  }, [reels]);

  // Synchronize Theater Mode active reel if details are modified
  useEffect(() => {
    if (activeReel) {
      const updated = reels.find((r) => r.id === activeReel.id);
      if (updated) {
        setActiveReel(updated);
      }
    }
  }, [reels]);

  // --- Data Handlers ---

  // Create or Update Reel
  const handleReelSubmit = (newData: Omit<Reel, 'id' | 'createdAt'> & { id?: string }) => {
    if (newData.id) {
      // Editing
      setReels((prev) =>
        prev.map((r) =>
          r.id === newData.id
            ? {
                ...r,
                ...newData,
              }
            : r
        )
      );
    } else {
      // Creating
      const newReel: Reel = {
        ...newData,
        id: `reel-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setReels((prev) => [newReel, ...prev]);
    }
    setEditingReel(null);
  };

  // Delete Reel
  const handleReelDelete = (id: string) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this reel bookmark?');
    if (!isConfirmed) return;

    setReels((prev) => prev.filter((r) => r.id !== id));
    if (activeReel?.id === id) {
      setActiveReel(null);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    setReels((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  };

  // Rate Reel
  const handleRateReel = (id: string, rating: number) => {
    setReels((prev) =>
      prev.map((r) => (r.id === id ? { ...r, rating } : r))
    );
  };

  // Add Category
  const handleAddCategory = (newCat: Omit<Category, 'id'>) => {
    const freshCat: Category = {
      ...newCat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, freshCat]);
  };

  // Delete Category
  const handleDeleteCategory = (catId: string) => {
    // Remove category
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    // Reassigned reels to first category
    const fallbackId = categories.find((c) => c.id !== catId)?.id || 'cook';
    setReels((prev) =>
      prev.map((r) => (r.categoryId === catId ? { ...r, categoryId: fallbackId } : r))
    );
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const payload = {
      categories,
      reels,
      version: '1.0.0',
    };
    const stringified = JSON.stringify(payload, null, 2);
    setBackupInput(stringified);
    navigator.clipboard.writeText(stringified);
    setBackupNotice({ text: 'Backup code copied to clipboard!', error: false });
  };

  // Import JSON Backup
  const handleImportBackup = () => {
    try {
      const parsed = JSON.parse(backupInput);
      if (!parsed.categories || !parsed.reels) {
        setBackupNotice({ text: 'Invalid format: Must contain categories and reels fields.', error: true });
        return;
      }
      
      setCategories(parsed.categories);
      setReels(parsed.reels);
      setBackupNotice({ text: 'Data successfully restored!', error: false });
      setTimeout(() => {
        setIsBackupOpen(false);
        setBackupNotice(null);
      }, 1500);
    } catch (e) {
      setBackupNotice({ text: 'Failed to parse JSON backup. Make sure the code is pasted intact.', error: true });
    }
  };

  // Reset ALL to Initial Mock Data
  const handleResetData = () => {
    const isConfirmed = window.confirm(
      'This will erase all custom entries and restore the default Cooking, Shopping, and Life Hacks presets. Do you want to continue?'
    );
    if (!isConfirmed) return;

    setCategories(INITIAL_CATEGORIES);
    setReels(INITIAL_REELS);
    localStorage.removeItem('reel_organizer_categories');
    localStorage.removeItem('reel_organizer_reels');
    setSelectedCategoryId('all');
    setFavoritesOnly(false);
    setSelectedTag(null);
    setSearchQuery('');
  };

  // --- Filtering Mechanics ---
  const filteredReels = reels.filter((reel) => {
    // 1. Category Fit
    if (selectedCategoryId !== 'all' && reel.categoryId !== selectedCategoryId) {
      return false;
    }
    // 2. Favorites Fit
    if (favoritesOnly && !reel.isFavorite) {
      return false;
    }
    // 3. Search Query Fit (Checks Title, Notes, or specific Category Name, or Tags)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const catName = categories.find((c) => c.id === reel.categoryId)?.name.toLowerCase() || '';
      const stringMatches =
        reel.title.toLowerCase().includes(q) ||
        (reel.notes || '').toLowerCase().includes(q) ||
        catName.includes(q) ||
        reel.tags.some((t) => t.toLowerCase().includes(q));

      if (!stringMatches) return false;
    }
    // 4. Dedicated Tag Filter fit
    if (selectedTag && !reel.tags.includes(selectedTag)) {
      return false;
    }

    return true;
  });

  // Unique list of all active tags across ALL reels (used for helper filter suggestions)
  const allTags = Array.from(new Set(reels.flatMap((r) => r.tags || []))).slice(0, 15);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-white leading-normal antialiased">
      {/* Decorative top ambient color bars replaced with high-end slim neon separator */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-90 shadow-sm" />

      {/* --- Top Navbar Header --- */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-[#0F0F11]/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4.5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Brand Title */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-650 to-purple-600 text-white shadow-lg shadow-indigo-550/10 border border-indigo-500/20">
                <LucideIcon name="PlayCircle" size={24} className="fill-current text-indigo-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-lg font-extrabold tracking-tight text-white sm:text-xl">
                    Reel Organizer
                  </h1>
                  <span className="rounded-full bg-zinc-900 px-2.5 py-0.5 text-[9px] font-extrabold text-indigo-400 uppercase tracking-wider border border-zinc-800">
                    My Scrapbook
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-sans mt-0.5">
                  Save, categorize, search, and play social media reels directly without bookmarks clutter
                </p>
              </div>
            </div>

            {/* Quick Utility Actions Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                id="utility-backup-btn"
                onClick={() => {
                  setBackupNotice(null);
                  setBackupInput('');
                  setIsBackupOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
                title="Backup and Restore organized library data"
              >
                <LucideIcon name="Download" size={13} />
                Backup & Restore
              </button>

              <div className="h-6 w-px bg-zinc-800 mx-1 hidden sm:block" />

              <button
                id="header-manage-categories-btn"
                onClick={() => setIsCategoryFormOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-350 hover:bg-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
              >
                <LucideIcon name="FolderPlus" size={14} className="text-indigo-400" />
                Manage Categories
              </button>

              <button
                id="header-add-reel-btn"
                onClick={() => {
                  setEditingReel(null);
                  setIsReelFormOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4.5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-950/25 hover:bg-indigo-505 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <LucideIcon name="Plus" size={14} />
                Organize Reel
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- Main Dashboard Area --- */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          
          {/* --- LEFT SIDEBAR PANEL: Filter Controls --- */}
          <section className="lg:col-span-1 space-y-5">
            
            {/* 1. Universal Text Search */}
            <div className="rounded-xl border border-zinc-800 bg-[#0F0F11] p-4.5 shadow-md space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                Search Organized Reels
              </label>
              <div className="relative">
                <input
                  id="sidebar-search-input"
                  type="text"
                  placeholder="e.g., potatoes, flight hacks..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (selectedTag) setSelectedTag(null); // Clear tag if user starts typing manually
                  }}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 pl-9 pr-8.5 py-2 text-xs md:text-sm text-zinc-200 placeholder-zinc-650 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-shadow"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
                  <LucideIcon name="Search" size={14} />
                </div>
                {searchQuery && (
                  <button
                    id="clear-search-btn"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300"
                  >
                    <LucideIcon name="X" size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Unified Category Feeds Links */}
            <div className="rounded-xl border border-zinc-800 bg-[#0F0F11] p-4.5 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                  Active Feed
                </label>
                {selectedCategoryId !== 'all' || favoritesOnly ? (
                  <button
                    id="reset-all-filters"
                    onClick={() => {
                      setSelectedCategoryId('all');
                      setFavoritesOnly(false);
                      setSelectedTag(null);
                    }}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
                  >
                    Reset
                  </button>
                ) : null}
              </div>

              {/* Sidebar Menu Items */}
              <div className="space-y-1">
                {/* All Reels */}
                <button
                  id="tab-all-reels"
                  onClick={() => {
                    setSelectedCategoryId('all');
                    setFavoritesOnly(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    selectedCategoryId === 'all' && !favoritesOnly
                      ? 'bg-zinc-850 text-white shadow-inner border border-zinc-700/50'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <LucideIcon name="Compass" size={14} />
                    All Organized Reels
                  </span>
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                    selectedCategoryId === 'all' && !favoritesOnly ? 'bg-zinc-900 text-zinc-300 border border-zinc-800' : 'bg-zinc-900 text-zinc-500 border border-zinc-800/30'
                  }`}>
                    {reels.length}
                  </span>
                </button>

                {/* Favorites Filters */}
                <button
                  id="tab-favorite-reels"
                  onClick={() => {
                    setFavoritesOnly(true);
                    setSelectedCategoryId('all');
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                    favoritesOnly
                      ? 'bg-rose-950/40 text-rose-300 shadow-sm border border-rose-900/50'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <LucideIcon name="Heart" size={14} className={favoritesOnly ? 'fill-current text-rose-400' : 'text-rose-500'} />
                    Starred Favorites
                  </span>
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                    favoritesOnly ? 'bg-rose-950 text-rose-300 border border-rose-900' : 'bg-zinc-900 text-zinc-550 border border-zinc-800/30'
                  }`}>
                    {reels.filter((r) => r.isFavorite).length}
                  </span>
                </button>

                {/* Categories Divider */}
                <div className="h-px bg-zinc-800/60 my-2" />

                {/* Custom list of dynamic user categories */}
                {categories.map((cat) => {
                  const numReels = reels.filter((r) => r.categoryId === cat.id).length;
                  const isActive = selectedCategoryId === cat.id && !favoritesOnly;

                  const getThemes = () => {
                    if (isActive) {
                      switch (cat.color) {
                        case 'emerald': return 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/60 shadow-sm';
                        case 'amber': return 'bg-amber-950/50 text-amber-350 border border-amber-800/60 shadow-sm';
                        case 'sky': return 'bg-sky-950/50 text-sky-300 border border-sky-800/60 shadow-sm';
                        case 'purple': return 'bg-indigo-950/50 text-indigo-300 border border-indigo-800/60 shadow-sm';
                        case 'rose': return 'bg-rose-950/50 text-rose-300 border border-rose-800/60 shadow-sm';
                        default: return 'bg-zinc-800 text-white border border-zinc-700';
                      }
                    } else {
                      switch (cat.color) {
                        case 'emerald': return 'text-zinc-400 hover:bg-emerald-950/20 hover:text-emerald-300 border border-transparent hover:border-emerald-900/30';
                        case 'amber': return 'text-zinc-400 hover:bg-amber-950/20 hover:text-amber-300 border border-transparent hover:border-amber-900/30';
                        case 'sky': return 'text-zinc-400 hover:bg-sky-950/20 hover:text-sky-300 border border-transparent hover:border-sky-900/30';
                        case 'purple': return 'text-zinc-400 hover:bg-indigo-950/20 hover:text-indigo-300 border border-transparent hover:border-indigo-900/30';
                        case 'rose': return 'text-zinc-400 hover:bg-rose-950/20 hover:text-rose-305 border border-transparent hover:border-rose-900/30';
                        default: return 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 border border-transparent';
                      }
                    }
                  };

                  return (
                    <button
                      id={`tab-category-${cat.id}`}
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        setFavoritesOnly(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all ${getThemes()}`}
                    >
                      <span className="flex items-center gap-2">
                        <LucideIcon name={cat.iconName} size={14} />
                        {cat.name}
                      </span>
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                        isActive ? 'bg-black/30 text-white border border-white/5' : 'bg-zinc-900 text-zinc-500 border border-zinc-804'
                      }`}>
                        {numReels}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Browse Hot Tags / Filter Tags */}
            {allTags.length > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-[#0F0F11] p-4.5 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                    Filter by Tag
                  </label>
                  {selectedTag && (
                    <button
                      id="clear-tag-filter"
                      onClick={() => setSelectedTag(null)}
                      className="text-[10px] text-zinc-400 hover:text-indigo-400 font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag) => {
                    const isSelected = selectedTag === tag;
                    return (
                      <button
                        id={`sidebar-tag-pill-${tag}`}
                        key={tag}
                        onClick={() => setSelectedTag(isSelected ? null : tag)}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-mono font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tip card */}
            <div className="rounded-xl border border-zinc-800 bg-gradient-to-tr from-zinc-950 to-indigo-950/50 p-4.5 shadow-md space-y-2.5">
              <div className="flex items-center gap-1.5 text-amber-400">
                <LucideIcon name="Sparkles" size={14} />
                <h4 className="text-xs font-extrabold uppercase tracking-widest font-display">How to Add?</h4>
              </div>
              <p className="text-[11px] text-zinc-450 leading-relaxed font-sans">
                Click <b>Organize Reel</b> and paste any Reels URL from Instagram, Facebook, or TikTok. Our smart parser converts it instantly into an active, theater-ready video inside your categories!
              </p>
            </div>

          </section>

          {/* --- RIGHT CONTENT PANEL: Active Grid of Reels --- */}
          <section className="lg:col-span-3 space-y-6">
            
            {/* Grid Header Info Card */}
            <div className="rounded-2xl border border-zinc-800 bg-[#0F0F11] p-5 md:p-6 shadow-md">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="text-xs font-bold text-zinc-250 uppercase tracking-widest font-display">
                      {favoritesOnly
                        ? 'Favorites Collection'
                        : selectedCategoryId === 'all'
                        ? 'Global Feed'
                        : `${categories.find((c) => c.id === selectedCategoryId)?.name || 'Feed'}`}
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    {favoritesOnly
                      ? 'Displaying all your curated starred items.'
                      : selectedCategoryId === 'all'
                      ? 'Displaying all organized reels across all folders.'
                      : `Browsing folder items configured for ${categories.find((c) => c.id === selectedCategoryId)?.name}.`}
                  </p>
                </div>

                {/* Stats badge indicators */}
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-zinc-900 p-2.5 border border-zinc-800 text-center min-w-[75px]">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider font-mono">Total</p>
                    <p className="text-lg font-black text-white font-display">{filteredReels.length}</p>
                  </div>
                  <div className="rounded-xl bg-indigo-950/20 p-2.5 border border-indigo-900/40 text-center min-w-[75px]">
                    <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider font-mono">Starred</p>
                    <p className="text-lg font-black text-indigo-400 font-display">
                      {filteredReels.filter((r) => r.isFavorite).length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Tag feedback indicator in Grid Header */}
              {selectedTag && (
                <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3 text-xs text-zinc-405">
                  <div className="flex items-center gap-1.5">
                    <LucideIcon name="Filter" size={12} className="text-indigo-400" />
                    <span className="text-zinc-400">Filtering only posts with tag:</span>
                    <span className="rounded-full bg-indigo-950/85 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300 border border-indigo-900/60">
                      #{selectedTag}
                    </span>
                  </div>
                  <button
                    id="remove-header-tag-pill"
                    onClick={() => setSelectedTag(null)}
                    className="text-[11px] font-medium text-zinc-400 hover:text-indigo-400 hover:underline"
                  >
                    Show all items
                  </button>
                </div>
              )}
            </div>

            {/* --- REELS CARD GRID --- */}
            <AnimatePresence mode="popLayout">
              {filteredReels.length > 0 ? (
                <motion.div
                  layout
                  className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {filteredReels.map((reel) => {
                    const cat = categories.find((c) => c.id === reel.categoryId);
                    return (
                      <ReelCard
                        key={reel.id}
                        reel={reel}
                        category={cat}
                        onPlay={(r) => setActiveReel(r)}
                        onToggleFavorite={handleToggleFavorite}
                        onRate={handleRateReel}
                        onEdit={(r) => {
                          setEditingReel(r);
                          setIsReelFormOpen(true);
                        }}
                        onDelete={handleReelDelete}
                        onTagClick={(tag) => setSelectedTag(tag)}
                      />
                    );
                  })}
                </motion.div>
              ) : (
                // --- Zero state empty illustration ---
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-[#0F0F11] p-12 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-zinc-500 mb-4 border border-zinc-800 shadow-sm">
                    <LucideIcon name="AlertCircle" size={28} className="text-zinc-500" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-200">No organized Reels in this view</h3>
                  <p className="mt-2.5 max-w-sm text-xs text-zinc-400 leading-relaxed font-sans">
                    {searchQuery
                      ? 'No match found for your search inquiry. Try clarifying spelling or clearing filters.'
                      : 'You have no reels cataloged in this folder. Tap the button below to organize your first social video!'}
                  </p>
                  
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {searchQuery || selectedTag || selectedCategoryId !== 'all' || favoritesOnly ? (
                      <button
                        id="clear-zero-state-search"
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedTag(null);
                          setSelectedCategoryId('all');
                          setFavoritesOnly(false);
                        }}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800 text-white transition-colors cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    ) : null}

                    <button
                      id="zero-state-add-btn"
                      onClick={() => {
                        setEditingReel(null);
                        setIsReelFormOpen(true);
                      }}
                      className="rounded-lg bg-indigo-600 px-4.5 py-2 text-xs font-bold text-white hover:bg-indigo-505 transition cursor-pointer"
                    >
                      Organize Reel Now
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </section>

        </div>
      </main>

      {/* --- MODALS BLOCK --- */}

      {/* 1. Add / Edit Reel Form Modal */}
      <ReelFormModal
        isOpen={isReelFormOpen}
        onClose={() => {
          setIsReelFormOpen(false);
          setEditingReel(null);
        }}
        onSubmit={handleReelSubmit}
        categories={categories}
        editingReel={editingReel}
      />

      {/* 2. Manage Categories Modal */}
      <CategoryFormModal
        isOpen={isCategoryFormOpen}
        onClose={() => setIsCategoryFormOpen(false)}
        categories={categories}
        reels={reels}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* 3. Theater Immersive Player Modal */}
      <ReelPlayerModal
        isOpen={!!activeReel}
        reel={activeReel}
        category={categories.find((c) => c.id === activeReel?.categoryId)}
        onClose={() => setActiveReel(null)}
        onToggleFavorite={handleToggleFavorite}
        onRate={handleRateReel}
      />

      {/* 4. Backup & Restore Modal */}
      <AnimatePresence>
        {isBackupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setIsBackupOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-[#0F0F11] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-5 py-4">
                <div className="flex items-center gap-2">
                  <LucideIcon name="Download" size={16} className="text-zinc-300" />
                  <h3 className="text-sm font-bold text-white font-display">Backup & Restore</h3>
                </div>
                <button
                  id="close-backup"
                  onClick={() => setIsBackupOpen(false)}
                  className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-850 hover:text-white transition-colors cursor-pointer"
                >
                  <LucideIcon name="X" size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {backupNotice && (
                  <p className={`p-2.5 rounded-lg text-xs leading-normal ${
                    backupNotice.error ? 'bg-rose-950/40 text-rose-300 border border-rose-900/55' : 'bg-emerald-950/40 text-emerald-300 border border-emerald-900/55'
                  }`}>
                    {backupNotice.text}
                  </p>
                )}

                <p className="text-xs text-zinc-400 leading-normal font-sans">
                  To migrate your organized reels between devices or save a hard copy, copy this backup string or paste a previously saved backup string.
                </p>

                <textarea
                  id="backup-raw-textarea"
                  rows={6}
                  placeholder="Paste backup code here to restore..."
                  value={backupInput}
                  onChange={(e) => setBackupInput(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 p-3 text-xs font-mono text-zinc-200 bg-zinc-950 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 transition-shadow"
                />

                <div className="flex items-center gap-3">
                  <button
                    id="copy-backup-btn"
                    onClick={handleExportBackup}
                    className="flex-1 rounded-lg border border-zinc-800 py-2.5 text-xs font-bold text-zinc-300 bg-zinc-900 hover:bg-zinc-850 hover:text-white transition cursor-pointer"
                  >
                    Export & Copy Code
                  </button>
                  <button
                    id="restore-backup-btn"
                    onClick={handleImportBackup}
                    className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-505 transition cursor-pointer shadow-lg shadow-indigo-950/20"
                  >
                    Restore / Import
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Ambient Footer */}
      <footer className="mt-16 border-t border-zinc-900 bg-[#0F0F11]/60 py-8 text-center text-xs text-zinc-500 font-sans">
        <p>© 2026 Reel Organizer. A private zero-tracking scrapbook database.</p>
        <p className="mt-1.5 text-[10px] font-mono text-zinc-600">
          Framer Motion Enabled • Responsive Viewports • Dynamic JSON Storage Sync
        </p>
      </footer>
    </div>
  );
}
