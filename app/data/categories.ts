// Category data for the categories page

export interface CategoryData {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;       // gradient top color
  colorEnd: string;    // gradient bottom color
  textColor: string;   // label color
  recipeCount: number;
  featuredTag: string; // tag used to filter from RECIPES
  highlight: string;   // short highlight text
}

export const CATEGORIES: CategoryData[] = [
  {
    id: 'sarapan',
    name: 'Sarapan',
    description: 'Mulai hari dengan energi penuh. Bowl bergizi, roti panggang, dan sajian pagi yang menyenangkan.',
    emoji: '🌅',
    color: '#FF9A3C',
    colorEnd: '#FF6B35',
    textColor: '#7A3000',
    recipeCount: 24,
    featuredTag: 'Sarapan',
    highlight: 'Energi Pagi',
  },
  {
    id: 'makan-siang',
    name: 'Makan Siang',
    description: 'Menu siang lezat dan praktis untuk mengisi tenaga di tengah hari yang produktif.',
    emoji: '☀️',
    color: '#4ADE80',
    colorEnd: '#16A34A',
    textColor: '#14532D',
    recipeCount: 38,
    featuredTag: 'Makan Siang',
    highlight: 'Praktis & Lezat',
  },
  {
    id: 'makan-malam',
    name: 'Makan Malam',
    description: 'Sajian istimewa untuk menutup hari dengan keluarga. Dari yang simple hingga fine-dining.',
    emoji: '🌙',
    color: '#818CF8',
    colorEnd: '#4F46E5',
    textColor: '#1E1B4B',
    recipeCount: 52,
    featuredTag: 'Makan Malam',
    highlight: 'Istimewa',
  },
  {
    id: 'cemilan',
    name: 'Cemilan',
    description: 'Camilan sehat dan lezat untuk teman santai, kerja, atau nonton film bersama.',
    emoji: '🍿',
    color: '#FDE68A',
    colorEnd: '#F59E0B',
    textColor: '#78350F',
    recipeCount: 31,
    featuredTag: 'Cemilan',
    highlight: 'Teman Santai',
  },
  {
    id: 'vegan',
    name: 'Vegan',
    description: 'Resep berbasis tanaman yang kaya nutrisi, penuh warna, dan luar biasa lezat.',
    emoji: '🌿',
    color: '#86EFAC',
    colorEnd: '#22C55E',
    textColor: '#14532D',
    recipeCount: 19,
    featuredTag: 'Vegan',
    highlight: 'Plant-Based',
  },
  {
    id: 'minuman',
    name: 'Minuman',
    description: 'Dari smoothie segar hingga teh tradisional. Minuman menyegarkan untuk setiap suasana.',
    emoji: '🥤',
    color: '#7DD3FC',
    colorEnd: '#0284C7',
    textColor: '#0C4A6E',
    recipeCount: 16,
    featuredTag: 'Minuman',
    highlight: 'Segar & Sehat',
  },
  {
    id: 'roti-kue',
    name: 'Roti & Kue',
    description: 'Kreasi baking dari sourdough tradisional, kue ulang tahun, hingga pastry modern.',
    emoji: '🍞',
    color: '#FCA5A5',
    colorEnd: '#DC2626',
    textColor: '#7F1D1D',
    recipeCount: 27,
    featuredTag: 'Roti',
    highlight: 'Fresh Baked',
  },
  {
    id: 'italia',
    name: 'Italia',
    description: 'Pasta autentik, pizza Neapolitan, risotto creamy — masakan Italia terbaik langsung dari dapur.',
    emoji: '🍝',
    color: '#FED7AA',
    colorEnd: '#EA580C',
    textColor: '#7C2D12',
    recipeCount: 21,
    featuredTag: 'Italia',
    highlight: 'Authentic',
  },
];
