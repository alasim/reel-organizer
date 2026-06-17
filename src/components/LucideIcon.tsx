import React from 'react';
import {
  ChefHat,
  ShoppingBag,
  Lightbulb,
  Heart,
  Star,
  Search,
  Plus,
  Trash2,
  Edit2,
  Share2,
  Clipboard,
  ExternalLink,
  X,
  Compass,
  Filter,
  Sparkles,
  FolderPlus,
  HelpCircle,
  Check,
  Play,
  PlayCircle,
  Tag,
  AlertCircle,
  Calendar,
  Layers,
  Sparkle,
  PlusCircle,
  Info,
  Download,
  Upload,
  Bookmark,
  Instagram,
  Facebook,
  Chrome,
  Folder
} from 'lucide-react';

const iconMap = {
  ChefHat,
  ShoppingBag,
  Lightbulb,
  Heart,
  Star,
  Search,
  Plus,
  Trash2,
  Edit2,
  Share2,
  Clipboard,
  ExternalLink,
  X,
  Compass,
  Filter,
  Sparkles,
  FolderPlus,
  HelpCircle,
  Check,
  Play,
  PlayCircle,
  Tag,
  AlertCircle,
  Calendar,
  Layers,
  Sparkle,
  PlusCircle,
  Info,
  Download,
  Upload,
  Bookmark,
  Instagram,
  Facebook,
  Chrome,
  Folder
};

export type IconName = keyof typeof iconMap;

interface LucideIconProps extends React.ComponentPropsWithoutRef<'svg'> {
  name: string;
  size?: number | string;
  className?: string;
}

export default function LucideIcon({ name, size = 18, className, ...props }: LucideIconProps) {
  const IconComponent = iconMap[name as IconName] || HelpCircle;
  return <IconComponent size={size} className={className} {...props} />;
}

export const AVAILABLE_ICONS = Object.keys(iconMap) as IconName[];
