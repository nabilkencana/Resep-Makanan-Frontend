// Shared recipe data used by RecipesSection + individual recipe pages

export interface Ingredient {
  amount: string;
  name: string;
  note?: string;
}

export interface Step {
  step: number;
  title: string;
  text: string;
  icon: string; // emoji icon
}

export interface RecipeData {
  id: string;
  title: string;
  tag: string;
  tags: string[];
  rating: string;
  reviews: number;
  prepTime: string;
  cookTime: string;
  servings: number;
  calories: number;
  src: string;         // card thumbnail
  heroSrc: string;     // large hero image
  description: string;
  ingredients: Ingredient[];
  steps: Step[];
  author: string;
}

export const RECIPES: RecipeData[] = [
  {
    id: 'chicken',
    title: 'Lemon Herb Roasted Chicken',
    tag: 'Makan Malam',
    tags: ['Main Course', 'Poultry'],
    rating: '4.9',
    reviews: 312,
    prepTime: '20 mnt',
    cookTime: '1j 15 mnt',
    servings: 4,
    calories: 480,
    src: '/recipe-chicken.jpg',
    heroSrc: '/recipe-chicken.jpg',
    description: 'Ayam panggang klasik yang anti-gagal, dibalur lemon segar, rosemary harum, dan bawang putih, menghasilkan kulit renyah keemasan dan daging yang juicy.',
    ingredients: [
      { amount: '1 ekor', name: 'Ayam Utuh (1.8–2 kg)', note: 'jeroan dibuang' },
      { amount: '3 buah', name: 'Lemon', note: '2 dibelah, 1 diiris untuk garnish' },
      { amount: '4 tangkai', name: 'Rosemary Segar', note: 'plus ekstra untuk garnish' },
      { amount: '1 kepala', name: 'Bawang Putih', note: 'dibelah melintang' },
      { amount: '60 ml', name: 'Minyak Zaitun Extra Virgin' },
      { amount: 'secukupnya', name: 'Garam Laut Kasar', note: 'sesuai selera' },
      { amount: 'secukupnya', name: 'Lada Hitam Segar', note: 'sesuai selera' },
    ],
    steps: [
      {
        step: 1,
        title: 'Siapkan Ayam',
        icon: '🍽️',
        text: 'Panaskan oven pada suhu 220°C. Bersihkan ayam, buang sisa bulu, dan tepuk-tepuk bagian luar hingga benar-benar kering dengan kertas dapur. Pro tip: Kulit yang benar-benar kering adalah rahasia kulit panggang yang renyah keemasan.',
      },
      {
        step: 2,
        title: 'Bumbui dengan Royal',
        icon: '🧂',
        text: 'Taburi garam dan lada di dalam rongga ayam. Isi rongga dengan rosemary, setengah lemon, dan bawang putih. Olesi seluruh permukaan luar ayam dengan minyak zaitun lalu taburi garam dan lada lagi. Ikat kaki dengan benang dapur.',
      },
      {
        step: 3,
        title: 'Panggang hingga Keemasan',
        icon: '🔥',
        text: 'Letakkan ayam di loyang panggang. Panggang selama 1 jam hingga 1 jam 15 menit, atau sampai cairan bening mengalir saat ditusuk di antara paha dan badan. Siram ayam dengan cairan di loyang di tengah waktu memasak untuk warna dan rasa extra.',
      },
      {
        step: 4,
        title: 'Istirahatkan dan Sajikan',
        icon: '⏱️',
        text: 'Keluarkan ayam dari oven dan pindahkan ke talenan. Tutup dengan aluminium foil secara longgar dan biarkan beristirahat selama 15 menit. Hal ini memungkinkan cairan meresap kembali ke dalam daging. Potong dan sajikan dengan cairan panggang.',
      },
    ],
    author: 'Chef Anisa',
  },
  {
    id: 'salad',
    title: 'Garden Harvest Salad',
    tag: 'Vegan',
    tags: ['Vegan', 'Salad'],
    rating: '4.8',
    reviews: 218,
    prepTime: '15 mnt',
    cookTime: '0 mnt',
    servings: 2,
    calories: 320,
    src: '/recipe-salad.png',
    heroSrc: '/recipe-salad.png',
    description: 'Salad segar penuh sayuran musiman, dressing vinaigrette lemon, dan taburan biji bunga matahari renyah.',
    ingredients: [
      { amount: '2 genggam', name: 'Bayam Muda' },
      { amount: '1 buah', name: 'Timun', note: 'diiris tipis' },
      { amount: '100 g', name: 'Tomat Ceri', note: 'dibelah dua' },
      { amount: '1/2 buah', name: 'Alpukat', note: 'dipotong dadu' },
      { amount: '3 sdm', name: 'Biji Bunga Matahari' },
      { amount: '2 sdm', name: 'Minyak Zaitun Extra Virgin' },
      { amount: '1 sdm', name: 'Air Perasan Lemon' },
      { amount: '1 sdt', name: 'Madu' },
      { amount: 'secukupnya', name: 'Garam & Lada Hitam' },
    ],
    steps: [
      { step: 1, title: 'Cuci Sayuran', icon: '🥬', text: 'Cuci semua sayuran dan tiriskan hingga kering.' },
      { step: 2, title: 'Buat Dressing', icon: '🍋', text: 'Campur minyak zaitun, lemon, dan madu dalam mangkuk kecil; kocok hingga tercampur rata.' },
      { step: 3, title: 'Susun Salad', icon: '🥗', text: 'Tata bayam, timun, tomat ceri, dan alpukat di dalam mangkuk saji besar.' },
      { step: 4, title: 'Finishing', icon: '✨', text: 'Tuangkan dressing, taburi biji bunga matahari. Aduk ringan dan sajikan segera.' },
    ],
    author: 'Chef Rani',
  },
  {
    id: 'bowl',
    title: 'Berry & Granola Power Bowl',
    tag: 'Sarapan',
    tags: ['Sarapan', 'Sehat'],
    rating: '4.9',
    reviews: 341,
    prepTime: '10 mnt',
    cookTime: '0 mnt',
    servings: 1,
    calories: 410,
    src: '/recipe-bowl.png',
    heroSrc: '/recipe-bowl.png',
    description: 'Mangkuk sarapan bertenaga dengan yogurt Yunani creamy, granola renyah, dan ledakan antioksidan dari buah beri segar.',
    ingredients: [
      { amount: '200 g', name: 'Yogurt Yunani Plain' },
      { amount: '60 g', name: 'Granola' },
      { amount: '50 g', name: 'Blueberry Segar' },
      { amount: '50 g', name: 'Strawberry', note: 'dipotong-potong' },
      { amount: '1 sdm', name: 'Madu atau Maple Syrup' },
      { amount: '1 sdm', name: 'Selai Kacang' },
      { amount: '1 sdt', name: 'Biji Chia' },
    ],
    steps: [
      { step: 1, title: 'Siapkan Yogurt', icon: '🥣', text: 'Tuang yogurt Yunani ke dalam mangkuk saji.' },
      { step: 2, title: 'Susun Topping', icon: '🫐', text: 'Susun granola dan buah beri secara rapi di sisi-sisi yang berbeda.' },
      { step: 3, title: 'Tambahkan Saus', icon: '🥜', text: 'Gerimiskan selai kacang dan madu di atas seluruh bowl.' },
      { step: 4, title: 'Sajikan', icon: '✨', text: 'Taburi biji chia dan sajikan segera agar granola tetap renyah.' },
    ],
    author: 'Chef Budi',
  },
  {
    id: 'bread',
    title: 'Traditional Sourdough',
    tag: 'Roti',
    tags: ['Roti', 'Tradisional'],
    rating: '5.0',
    reviews: 127,
    prepTime: '30 mnt',
    cookTime: '45 mnt',
    servings: 8,
    calories: 180,
    src: '/recipe-bread.png',
    heroSrc: '/recipe-bread.png',
    description: 'Roti sourdough tradisional dengan kulit renyah, remah lembut dan kenyal, serta aroma asam yang kompleks. Memerlukan starter aktif.',
    ingredients: [
      { amount: '500 g', name: 'Tepung Terigu Protein Tinggi' },
      { amount: '375 ml', name: 'Air Hangat', note: 'suhu 30°C' },
      { amount: '100 g', name: 'Sourdough Starter Aktif' },
      { amount: '10 g', name: 'Garam Laut' },
    ],
    steps: [
      { step: 1, title: 'Autolyse', icon: '⏳', text: 'Campurkan tepung dan air, biarkan autolyse selama 30 menit.' },
      { step: 2, title: 'Tambahkan Starter', icon: '🧫', text: 'Tambahkan starter dan garam, aduk hingga tercampur rata.' },
      { step: 3, title: 'Bulk Fermentation', icon: '🔄', text: 'Lakukan stretch & fold setiap 30 menit selama 2 jam.' },
      { step: 4, title: 'Bentuk & Fermentasi', icon: '🍞', text: 'Bentuk boule, masukkan ke banneton, fermentasi dingin 8–12 jam.' },
      { step: 5, title: 'Panggang', icon: '🔥', text: 'Panggang dalam dutch oven pada 250°C selama 45 menit hingga kulit gelap dan renyah.' },
    ],
    author: 'Chef Marco',
  },
  {
    id: 'pizza',
    title: 'Heirloom Tomato & Prosciutto Pizza',
    tag: 'Makan Malam',
    tags: ['Makan Malam', 'Italia'],
    rating: '4.7',
    reviews: 289,
    prepTime: '10 mnt',
    cookTime: '15 mnt',
    servings: 4,
    calories: 520,
    src: '/recipe-pizza.png',
    heroSrc: '/recipe-pizza.png',
    description: 'Pizza tipis bergaya Neapolitan dengan saus tomat sederhana, mozzarella segar, dan prosciutto yang meleleh di mulut.',
    ingredients: [
      { amount: '1 lembar', name: 'Adonan Pizza' },
      { amount: '3 sdm', name: 'Saus Tomat San Marzano' },
      { amount: '150 g', name: 'Mozzarella Segar', note: 'diiris tipis' },
      { amount: '3 buah', name: 'Tomat Heirloom', note: 'diiris tipis' },
      { amount: '6 lembar', name: 'Prosciutto di Parma' },
      { amount: 'segenggam', name: 'Daun Basil Segar' },
      { amount: '2 sdm', name: 'Minyak Zaitun' },
    ],
    steps: [
      { step: 1, title: 'Panaskan Oven', icon: '🔥', text: 'Panaskan oven pada suhu tertinggi (250–280°C) dengan batu pizza selama 45 menit.' },
      { step: 2, title: 'Giling Adonan', icon: '🫲', text: 'Giling adonan pizza setipis mungkin di atas permukaan berterung.' },
      { step: 3, title: 'Susun Topping', icon: '🍅', text: 'Oleskan saus tomat, susun mozzarella dan irisan tomat heirloom.' },
      { step: 4, title: 'Panggang', icon: '🍕', text: 'Geser pizza ke batu panas, panggang 10–12 menit hingga pinggiran kecoklatan.' },
      { step: 5, title: 'Finishing', icon: '🌿', text: 'Taruh prosciutto dan daun basil, gerimiskan minyak zaitun. Sajikan segera.' },
    ],
    author: 'Chef Marco',
  },
];

export function getRecipeById(id: string): RecipeData | undefined {
  return RECIPES.find((r) => r.id === id);
}
