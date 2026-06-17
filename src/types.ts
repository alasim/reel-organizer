export interface Category {
  id: string;
  name: string;
  iconName: string; // Lucide icon name
  color: string; // Tailwind key e.g. "emerald", "amber", "sky", "purple", "rose"
}

export interface Reel {
  id: string;
  title: string;
  categoryId: string;
  embedCode: string; // Raw iframe HTML or parsed src URL
  url?: string;      // Original input link
  notes?: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  rating?: number; // 1 to 5 stars
  platform: 'instagram' | 'facebook' | 'tiktok' | 'other';
  imageUrl?: string;
}
