import { Category, Reel } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cook',
    name: 'Cooking & Recipes',
    iconName: 'ChefHat',
    color: 'emerald',
  },
  {
    id: 'shopping',
    name: 'Shopping & Finds',
    iconName: 'ShoppingBag',
    color: 'amber',
  },
  {
    id: 'life-hacks',
    name: 'Life Hacks & DIY',
    iconName: 'Lightbulb',
    color: 'sky',
  },
];

export const INITIAL_REELS: Reel[] = [
  {
    id: 'reel-1-cook',
    title: 'Ultimate 15-Minute Air Fryer Golden Potatoes',
    categoryId: 'cook',
    embedCode: 'https://www.instagram.com/reel/C8HkYj_Pz1A/embed/',
    url: 'https://www.instagram.com/reel/C8HkYj_Pz1A/',
    notes: 'Preheat air fryer to 400°F (200°C). Toss bite-sized potato pieces with olive oil, garlic powder, smoked paprika, salt, freshly cracked pepper, and a pinch of cornstarch for that unbelievable crunch. Air fry for 18-20 minutes, shaking vigorously halfway through to ensure even browning.',
    tags: ['potatoes', 'airfryer', 'quick-snack', 'asmr'],
    isFavorite: true,
    createdAt: '2026-05-10T12:00:00Z',
    rating: 5,
    platform: 'instagram'
  },
  {
    id: 'reel-2-cook',
    title: 'Garlic Chili Crisp Cream Noodles',
    categoryId: 'cook',
    embedCode: 'https://www.instagram.com/p/C9N_h4iO6zW/embed/',
    url: 'https://www.instagram.com/p/C9N_h4iO6zW/',
    notes: 'The perfect late-night bowl! Whisk soy sauce, black vinegar, sesame oil, 2 heap tablespoons of premium chili crisp, minced fresh garlic, and green onions. Toss with hot ramen or knife-cut noodles, splash with a bit of starch water and heavy cream for a silky finish.',
    tags: ['noodles', 'chili-crisp', 'comfortfood', 'easy-dinner'],
    isFavorite: false,
    createdAt: '2026-05-15T18:30:00Z',
    rating: 4,
    platform: 'instagram'
  },
  {
    id: 'reel-3-shop',
    title: 'Aesthetic Waterproof Travel Tech Organizer',
    categoryId: 'shopping',
    embedCode: 'https://www.tiktok.com/embed/v2/736582495819',
    url: 'https://www.tiktok.com/@organizer_expert/video/736582495819',
    notes: 'Minimalist canvas organizer that expands to lay flat. Separate mesh pockets, elastic bands for wires, and a dedicated soft pocket for a power bank and small tablet. Truly excellent stitches, fits right into a backpack!',
    tags: ['tech-gear', 'travel-accessories', 'amazonfinds', 'musthave'],
    isFavorite: true,
    createdAt: '2026-06-01T09:15:00Z',
    rating: 5,
    platform: 'tiktok'
  },
  {
    id: 'reel-4-shop',
    title: 'Super-Quiet Under-Desk Slim Walking Pad',
    categoryId: 'shopping',
    embedCode: 'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Freel%2F284918491294819%2F&show_text=0&t=0',
    url: 'https://www.facebook.com/reel/284918491294819/',
    notes: 'The ultimate tool to reach 10k daily steps while working from home! Fits under adjustable height standing desks, goes up to 4.0 mph, and weighs under 45 lbs. Slides out of sight under the sofa when finished.',
    tags: ['homeoffice', 'fitness', 'wfh-setup', 'health'],
    isFavorite: false,
    createdAt: '2026-06-03T11:45:00Z',
    rating: 4,
    platform: 'facebook'
  },
  {
    id: 'reel-5-hack',
    title: 'Slide-out Acrylic Lazy Susan Hack',
    categoryId: 'life-hacks',
    embedCode: 'https://www.instagram.com/reel/C-K9L1xOKmF/embed/',
    url: 'https://www.instagram.com/reel/C-K9L1xOKmF/',
    notes: 'No more lost pantry jars! Secure these clever peel-and-stick slide-out spinning trays to standard cupboard shelves. Allows you to spin the back row directly to the front. Perfect for high-density storage.',
    tags: ['pantry', 'organization', 'space-saver', 'diy'],
    isFavorite: true,
    createdAt: '2026-06-10T14:20:00Z',
    rating: 5,
    platform: 'instagram'
  },
  {
    id: 'reel-6-hack',
    title: '2-Second T-Shirt Pinch-and-Fold Trick',
    categoryId: 'life-hacks',
    embedCode: 'https://www.tiktok.com/embed/v2/728347102931',
    url: 'https://www.tiktok.com/@laundry_guru/video/728347102931',
    notes: 'Step-by-step tutorial on the legendary geometric folding method. Imagine a line down the shoulder and across the middle. Pinch points A (shoulder), B (center), and C (hem). Cross-over, lift, and fold. Super neat drawers!',
    tags: ['laundry', 'folding-hacks', 'mindblown', 'efficiency'],
    isFavorite: false,
    createdAt: '2026-06-12T16:05:00Z',
    rating: 5,
    platform: 'tiktok'
  }
];
