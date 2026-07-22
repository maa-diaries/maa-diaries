export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number; // in ₹
  originalPrice?: number; // original price in ₹ before discount
  discount?: number; // discount percentage (e.g. 10 for 10% off)
  image: string;
  rating: number;
  reviewsCount: number;
  metalOptions: string[];
  stoneOptions: string[];
  specs: {
    metal: string;
    coating?: string;
    stoneType: string;
    durability: string;
    finish: string;
  };
  isFeatured?: boolean;
  stock?: number;
  sku?: string;
}

export const INITIAL_PRODUCTS: Product[] = [
  // --- EARRINGS (4) ---
  {
    id: 'earring-01',
    name: 'Celestial Anti-Tarnish Drops',
    description: 'Elegant western-style drop earrings featuring high-grade cubic zirconia crystals. Specially coated with our signature anti-tarnish formula to survive daily sweat and moisture.',
    category: 'earrings',
    subcategory: 'western',
    price: 899,
    image: '/products/earrings_luxury.png',
    rating: 4.8,
    reviewsCount: 42,
    metalOptions: ['Anti-Tarnish Silver Plated', '18k Gold Plated'],
    stoneOptions: ['Premium Cubic Zirconia', 'None'],
    specs: {
      metal: 'Anti-Tarnish Plated Copper Base',
      coating: 'Organic Anti-Tarnish E-Coating',
      stoneType: 'AAA Grade Cubic Zirconia',
      durability: '100% Waterproof & Sweatproof',
      finish: 'High Polish Silver / Rose Gold'
    },
    isFeatured: true
  },
  {
    id: 'earring-02',
    name: 'Royal Heritage Kundan Studs',
    description: 'Intricately designed traditional Kundan ear studs with premium plating. Crafted with hypoallergenic backing for zero-irritation all-day festival wear.',
    category: 'earrings',
    subcategory: 'traditional',
    price: 1199,
    image: '/products/earrings_luxury.png',
    rating: 4.9,
    reviewsCount: 31,
    metalOptions: ['18k Gold Plated', 'Antique Gold Plated'],
    stoneOptions: ['Polki Kundan Glass', 'Faux Pearls'],
    specs: {
      metal: '18k Gold Plated',
      coating: 'Anti-Oxidation Shield',
      stoneType: 'Traditional Kundan & Pearls',
      durability: 'Sweat Resistant & Hypoallergenic',
      finish: 'Matte Antique Gold Finish'
    },
    isFeatured: true
  },
  {
    id: 'earring-03',
    name: 'Classic Solitaire Studs',
    description: 'Minimalist round brilliant solitaire studs designed for everyday understated luxury. Feature secure butterfly back clasps.',
    category: 'earrings',
    subcategory: 'western',
    price: 999,
    image: '/products/earrings_luxury.png',
    rating: 4.7,
    reviewsCount: 15,
    metalOptions: ['Platinum Plated', '18k Gold Plated'],
    stoneOptions: ['Cubic Zirconia (1.0 Carat)', 'Cubic Zirconia (2.0 Carat)'],
    specs: {
      metal: 'Sterling Silver 925 Base',
      coating: 'Rhodium Protective Plating',
      stoneType: 'Hearts & Arrows CZ Stones',
      durability: 'Water-Safe Daily Wear',
      finish: 'Mirror Platinum Finish'
    },
    isFeatured: false
  },
  {
    id: 'earring-04',
    name: 'Pearl Drop Hoop Earrings',
    description: 'Classic gold hoops adorned with dangling natural baroque pearls. Perfect transition piece from desk to dinner.',
    category: 'earrings',
    subcategory: 'western',
    price: 1099,
    image: '/products/earrings_luxury.png',
    rating: 4.8,
    reviewsCount: 20,
    metalOptions: ['18k Gold Plated'],
    stoneOptions: ['Natural Baroque Pearls'],
    specs: {
      metal: '18k Micro-Plated Brass',
      coating: 'Luster Lacquer Seal',
      stoneType: 'Freshwater Baroque Pearls',
      durability: 'Sweatproof Protection',
      finish: 'High Polish Gold Sheen'
    },
    isFeatured: false
  },

  // --- KASHMIRI JHUMKE (4) ---
  {
    id: 'jhumke-01',
    name: 'Kashmiri Jhumke Chandelier',
    description: 'Bespoke Kashmiri Jhumkas with cascading pearl trails and delicate floral patterns. Light-weight design optimized for maximum comfort.',
    category: 'kashmiri_jhumke',
    price: 1499,
    image: '/products/earrings_luxury.png',
    rating: 5.0,
    reviewsCount: 26,
    metalOptions: ['18k Gold Plated', 'Oxidized Silver Plated'],
    stoneOptions: ['Natural Shell Pearls', 'Lab Crystals'],
    specs: {
      metal: 'Gold Plated / Oxidized Brass',
      coating: 'Double Lacquer Protective Film',
      stoneType: 'Seed Pearls & Crystals',
      durability: 'Waterproof protective layer',
      finish: 'Textured Kashmiri Polish'
    },
    isFeatured: true
  },
  {
    id: 'jhumke-02',
    name: 'Devasena Triple-Tier Jhumkas',
    description: 'A masterpiece of traditional design, featuring three nested dome structures adorned with delicate ruby-colored beads and tiny hanging pearls.',
    category: 'kashmiri_jhumke',
    price: 1899,
    image: '/products/earrings_luxury.png',
    rating: 4.9,
    reviewsCount: 18,
    metalOptions: ['22k Micro Gold Plated', 'Antique Gold Plated'],
    stoneOptions: ['Faux Rubies & Seed Pearls'],
    specs: {
      metal: 'Jewelry Brass Alloy Base',
      coating: 'Heritage Antique Lacquer',
      stoneType: 'Ruby-colored Cabochons',
      durability: 'Sweat Resistant',
      finish: 'Imperial Matte Antique Finish'
    },
    isFeatured: false
  },
  {
    id: 'jhumke-03',
    name: 'Oxidized Silver Lotus Jhumkas',
    description: 'Stunning oxidized silver-look jhumkas detailed with carved lotus patterns and tiny metallic ghungroo beads at the base. Lightweight and hypoallergenic.',
    category: 'kashmiri_jhumke',
    price: 899,
    image: '/products/earrings_luxury.png',
    rating: 4.8,
    reviewsCount: 12,
    metalOptions: ['Oxidized Silver Plated'],
    stoneOptions: ['None'],
    specs: {
      metal: 'German Silver Plated Pewter',
      coating: 'Anti-Tarnish Silver Guard',
      stoneType: 'None',
      durability: 'Waterproof & Sweatproof',
      finish: 'Brushed Charcoal Matte Polish'
    },
    isFeatured: false
  },
  {
    id: 'jhumke-04',
    name: 'Pearl Bell Jhumkis',
    description: 'Dainty bell-shaped jhumkis suspended from delicate floral studs, bordered entirely with mini white pearls for a classic, sophisticated aesthetic.',
    category: 'kashmiri_jhumke',
    price: 1199,
    image: '/products/earrings_luxury.png',
    rating: 4.9,
    reviewsCount: 22,
    metalOptions: ['18k Gold Plated', 'Rose Gold Plated'],
    stoneOptions: ['Imitation Pearls'],
    specs: {
      metal: 'High Grade Brass Base',
      coating: 'Gold Luster Lacquer Seal',
      stoneType: 'White Seed Pearls',
      durability: 'Sweat Resistant Coating',
      finish: 'Smooth Glossy Gold'
    },
    isFeatured: false
  },

  // --- NECKLACES (4) ---
  {
    id: 'necklace-01',
    name: 'Ethereal Pendant Choker',
    description: 'A delicate tarnish-free chain featuring a sleek heart pendant. A perfect accessory for minimalist office wear or styling layered look.',
    category: 'necklaces',
    price: 1299,
    image: '/products/necklace_emerald.png',
    rating: 4.7,
    reviewsCount: 19,
    metalOptions: ['Anti-Tarnish Silver Plated', '18k Gold Plated', 'Rose Gold Plated'],
    stoneOptions: ['None', 'Single Cubic Zirconia'],
    specs: {
      metal: '316L Stainless Steel Base',
      coating: 'PVD Anti-Tarnish Plating',
      stoneType: 'Hearts & Arrows CZ Stone',
      durability: 'Showerproof, Gym-proof, Ocean-proof',
      finish: 'Mirror Platinum Finish'
    },
    isFeatured: true
  },
  {
    id: 'necklace-02',
    name: 'Regal Emerald Cut Choker',
    description: 'Exquisite evening choker showcasing a brilliant emerald-cut lab crystal center stone flanked by delicate halo crystals on a highly flexible gold collar.',
    category: 'necklaces',
    price: 2499,
    image: '/products/necklace_emerald.png',
    rating: 4.9,
    reviewsCount: 14,
    metalOptions: ['18k Gold Plated', 'Platinum Plated'],
    stoneOptions: ['Lab Emerald Green Crystal', 'Clear Cubic Zirconia'],
    specs: {
      metal: 'Jeweler Copper Alloy Base',
      coating: 'Anti-Oxidation Seal Coat',
      stoneType: 'Lab Emerald (AAA Grade)',
      durability: 'Sweat Resistant',
      finish: 'Imperial Gold Polish'
    },
    isFeatured: false
  },
  {
    id: 'necklace-03',
    name: 'Layered Herringbone Chain',
    description: 'Premium PVD-plated double-layer herringbone snake chain. Lays flat against the skin for a beautiful liquid gold appearance.',
    category: 'necklaces',
    price: 1599,
    image: '/products/necklace_emerald.png',
    rating: 4.8,
    reviewsCount: 23,
    metalOptions: ['18k Gold Plated', 'Platinum Plated'],
    stoneOptions: ['None'],
    specs: {
      metal: 'Surgical Stainless Steel Base',
      coating: 'Physical Vapor Deposition (PVD)',
      stoneType: 'None',
      durability: '100% Shower & Gym Safe',
      finish: 'Smooth Flat Polish'
    },
    isFeatured: false
  },
  {
    id: 'necklace-04',
    name: 'Classic Pearl Strand Necklace',
    description: 'Timeless strand of hand-selected freshwater cultured pearls, complete with an elegant gold-plated filigree safety clasp.',
    category: 'necklaces',
    price: 1899,
    image: '/products/necklace_emerald.png',
    rating: 4.8,
    reviewsCount: 16,
    metalOptions: ['18k Gold Plated Clasp'],
    stoneOptions: ['Cultured Freshwater Pearls'],
    specs: {
      metal: 'Freshwater Pearls & Gold Clasp',
      coating: 'Natural Pearl Luster Shield',
      stoneType: '6-7mm Freshwater Cultured Pearls',
      durability: 'Daily Wear Protection',
      finish: 'Natural Mother-of-Pearl Gloss'
    },
    isFeatured: false
  },

  // --- PENDANTS (4) ---
  {
    id: 'pendant-01',
    name: 'Infinity Sparkle Pendant',
    description: 'An elegant infinity-loop pendant suspended on a micro-plated tarnish-resistant chain. Symbolizes everlasting love and modern simplicity.',
    category: 'pendants',
    price: 699,
    image: '/products/necklace_emerald.png',
    rating: 4.8,
    reviewsCount: 15,
    metalOptions: ['18k Gold Plated', 'Anti-Tarnish Silver Plated'],
    stoneOptions: ['AAA Cubic Zirconia'],
    specs: {
      metal: 'Brass alloy micro plated with gold',
      coating: 'Anti-Tarnish Protective Seal',
      stoneType: 'CZ Crystal Accent',
      durability: 'Daily Wear Resistant',
      finish: 'High Gloss Polishing'
    },
    isFeatured: false
  },
  {
    id: 'pendant-02',
    name: 'Royal Sapphire Pendant',
    description: 'A deep blue oval-cut lab sapphire pendant surrounded by a sparkling halo of diamonds. Includes a premium anti-tarnish link chain.',
    category: 'pendants',
    price: 899,
    image: '/products/necklace_emerald.png',
    rating: 4.9,
    reviewsCount: 9,
    metalOptions: ['18k Gold Plated', 'Platinum Plated'],
    stoneOptions: ['Lab-Grown Sapphire & CZ'],
    specs: {
      metal: 'Copper Alloy Core Base',
      coating: 'Organic Lacquer Coat',
      stoneType: 'Faceted Blue Sapphire Simulant',
      durability: 'Water Resistant Protection',
      finish: 'High Shine Polish'
    },
    isFeatured: false
  },
  {
    id: 'pendant-03',
    name: 'Golden Leaf Vine Pendant',
    description: 'Beautifully detailed tiny vine leaf pendant suspended on a delicate cable chain. A stunning tribute to nature.',
    category: 'pendants',
    price: 799,
    image: '/products/necklace_emerald.png',
    rating: 4.7,
    reviewsCount: 11,
    metalOptions: ['18k Gold Plated', 'Rose Gold Plated'],
    stoneOptions: ['None'],
    specs: {
      metal: '316L Stainless Steel Base',
      coating: 'PVD Anti-Tarnish Coating',
      stoneType: 'None',
      durability: 'Waterproof & Sweatproof',
      finish: 'Gold Satin Brushed Finish'
    },
    isFeatured: false
  },
  {
    id: 'pendant-04',
    name: 'Guardian Angel Wing Pendant',
    description: 'Detailed feather-carved angel wing pendant, perfect for gifting protection and love. Comes with a matching cable chain.',
    category: 'pendants',
    price: 949,
    image: '/products/necklace_emerald.png',
    rating: 4.8,
    reviewsCount: 13,
    metalOptions: ['Anti-Tarnish Silver Plated', '18k Gold Plated'],
    stoneOptions: ['Tiny CZ Accents'],
    specs: {
      metal: '925 Silver Base Plated',
      coating: 'Anti-Oxidation Coating',
      stoneType: 'Micro CZ Accent Stones',
      durability: 'Showerproof Daily Wear',
      finish: 'Detailed High-Polish Relief'
    },
    isFeatured: false
  },

  // --- BRACELETS (4) ---
  {
    id: 'bracelet-01',
    name: 'Lumina Tennis Bracelet',
    description: 'A classic tennis-style bracelet with continuous row of premium diamond-cut cubic zirconia. Features secure double-clasp security.',
    category: 'bracelets',
    price: 1399,
    image: '/products/bracelet_gold.png',
    rating: 4.9,
    reviewsCount: 54,
    metalOptions: ['Anti-Tarnish Silver Plated', '18k Gold Plated', 'Rose Gold Plated'],
    stoneOptions: ['3.0mm AAA Cubic Zirconia', '4.0mm AAA Cubic Zirconia'],
    specs: {
      metal: 'Anti-Tarnish Silver Base',
      coating: 'Organic Anti-Tarnish Seal',
      stoneType: 'Precision Cut CZ Stones',
      durability: 'Waterproof & Fade-Resistant',
      finish: 'Brilliant Jewelry Polish'
    },
    isFeatured: false
  },
  {
    id: 'bracelet-02',
    name: 'Eternal Knot Bangle',
    description: 'A beautifully contoured open-cuff gold bangle featuring a delicate interlocking love knot at the center. Extremely durable and flexible.',
    category: 'bracelets',
    price: 999,
    image: '/products/bracelet_gold.png',
    rating: 4.8,
    reviewsCount: 26,
    metalOptions: ['18k Gold Plated', 'Rose Gold Plated'],
    stoneOptions: ['None'],
    specs: {
      metal: '316L Stainless Steel Base',
      coating: 'PVD Gold Ion-Plating',
      stoneType: 'None',
      durability: 'Fully Waterproof & Shower-Safe',
      finish: 'Mirror Gold Polish'
    },
    isFeatured: false
  },
  {
    id: 'bracelet-03',
    name: 'Dainty Heart Charm Bracelet',
    description: 'Delicate chain link bracelet decorated with five tiny high-polished gold heart charms. Adjustable extender link included.',
    category: 'bracelets',
    price: 899,
    image: '/products/bracelet_gold.png',
    rating: 4.7,
    reviewsCount: 19,
    metalOptions: ['18k Gold Plated', 'Anti-Tarnish Silver Plated'],
    stoneOptions: ['None'],
    specs: {
      metal: 'Surgical Stainless Steel Core',
      coating: 'PVD Anti-Tarnish Coating',
      stoneType: 'None',
      durability: 'Gym, Ocean, and Shower Proof',
      finish: 'High Shine Polish'
    },
    isFeatured: false
  },
  {
    id: 'bracelet-04',
    name: 'Antique Filigree Cuff',
    description: 'A wide traditional brass cuff bracelet featuring hand-crafted wire filigree and floral patterns in antique gold finish.',
    category: 'bracelets',
    price: 1499,
    image: '/products/bracelet_gold.png',
    rating: 4.9,
    reviewsCount: 30,
    metalOptions: ['Antique Gold Plated', 'Antique Silver Plated'],
    stoneOptions: ['None'],
    specs: {
      metal: 'Brass filigree overlay',
      coating: 'Antique Matte Lacquer Protection',
      stoneType: 'None',
      durability: 'Sweat Resistant Coating',
      finish: 'Distressed Matte Antique Gold'
    },
    isFeatured: false
  },

  // --- PAYALS (4) ---
  {
    id: 'payal-01',
    name: 'Asha Ghungroo Payals',
    description: 'Traditional Indian anklets (payals) updated with anti-tarnish plating. Embellished with delicate ghungroo bells that hum sweet melody.',
    category: 'payals',
    price: 799,
    image: '/products/bracelet_gold.png',
    rating: 4.7,
    reviewsCount: 22,
    metalOptions: ['Anti-Tarnish Silver Plated', '18k Gold Plated'],
    stoneOptions: ['None'],
    specs: {
      metal: 'Anti-Tarnish Plated Copper',
      coating: 'Extra Lacquer Finish',
      stoneType: 'None',
      durability: 'Waterproof Anklets',
      finish: 'Traditional Indian Silver Finish'
    },
    isFeatured: false
  },
  {
    id: 'payal-02',
    name: 'Meenakari Peacock Anklets',
    description: 'Exquisite traditional pair of bridal payals featuring beautifully painted blue-green Meenakari peacock designs on a detailed silver chain.',
    category: 'payals',
    price: 1099,
    image: '/products/bracelet_gold.png',
    rating: 4.9,
    reviewsCount: 16,
    metalOptions: ['Antique Silver Plated'],
    stoneOptions: ['None'],
    specs: {
      metal: 'Copper base with silver overlay',
      coating: 'Enamel paint protection shield',
      stoneType: 'Hand-painted Enamel (Meenakari)',
      durability: 'Festival Wear Resistant',
      finish: 'Chiseled Antique Silver Finish'
    },
    isFeatured: false
  },
  {
    id: 'payal-03',
    name: 'Minimalist Bead Chain Anklet',
    description: 'Ultra-thin sleek chain anklet spaced with tiny polished silver spheres. Perfect for modern sandals or beachwear.',
    category: 'payals',
    price: 599,
    image: '/products/bracelet_gold.png',
    rating: 4.8,
    reviewsCount: 14,
    metalOptions: ['Anti-Tarnish Silver Plated', '18k Gold Plated'],
    stoneOptions: ['None'],
    specs: {
      metal: '925 Sterling Silver Plated Base',
      coating: 'Anti-Tarnish E-Coating Shield',
      stoneType: 'None',
      durability: 'Ocean & Pool waterproof',
      finish: 'Polished Smooth Silver'
    },
    isFeatured: false
  },
  {
    id: 'payal-04',
    name: 'Royal Bridal Kundan Payal',
    description: 'A heavy luxury foot harness anklet featuring elaborate Polki Kundan settings and red-green crystal drops for traditional weddings.',
    category: 'payals',
    price: 1699,
    image: '/products/bracelet_gold.png',
    rating: 4.9,
    reviewsCount: 25,
    metalOptions: ['22k Gold Plated'],
    stoneOptions: ['Polki Kundan Glass', 'Ruby Emerald simulant beads'],
    specs: {
      metal: 'Heavy Jewelry Alloy Base',
      coating: 'Anti-Oxidation Coating protection',
      stoneType: 'Traditional Kundan Settings',
      durability: 'Bridal Occasions Wear',
      finish: 'Bright Royal Gold Finish'
    },
    isFeatured: false
  },

  // --- HAIR ACCESSORIES (4) ---
  {
    id: 'hair-01',
    name: 'Luxury Pearl Clutcher',
    description: 'High-strength metallic hair clutcher embedded with faux freshwater pearls. Crafted to secure hair neatly without snagging.',
    category: 'hair_accessories',
    subcategory: 'clutcher',
    price: 349,
    image: '/products/ring_luxury_gold.png',
    rating: 4.9,
    reviewsCount: 68,
    metalOptions: ['Champagne Gold Metallic', 'Rose Gold Metallic'],
    stoneOptions: ['Faux Freshwater Pearls'],
    specs: {
      metal: 'High-Strength Zinc Alloy Frame',
      coating: 'Anti-Corrosion Plating',
      stoneType: 'Freshwater Imitation Pearls',
      durability: 'Daily Wear Heavy Duty Spring',
      finish: 'Polished Metallic Gold'
    },
    isFeatured: true
  },
  {
    id: 'hair-02',
    name: 'Premium Silk Scrunchie Set',
    description: 'Pack of three ultra-soft mulberry silk scrunchies. Protects hair from friction, reduces split ends, and leaves zero creases.',
    category: 'hair_accessories',
    subcategory: 'scrunchies',
    price: 249,
    image: '/products/ring_luxury_gold.png',
    rating: 5.0,
    reviewsCount: 75,
    metalOptions: ['Multi-Color Set'],
    stoneOptions: ['None'],
    specs: {
      metal: '100% Pure Mulberry Silk',
      coating: 'None',
      stoneType: 'Premium Elastic Band Interior',
      durability: 'Hand Washable / Gentle stretch',
      finish: 'Satin Silk Sheen'
    },
    isFeatured: true
  },
  {
    id: 'hair-03',
    name: 'Gold Leaf Hair Vine',
    description: 'Flexible luxury bridal hair vine featuring intricate metal leaves and crystal branches. Can be woven into buns or braids easily.',
    category: 'hair_accessories',
    subcategory: 'bridal',
    price: 699,
    image: '/products/ring_luxury_gold.png',
    rating: 4.8,
    reviewsCount: 14,
    metalOptions: ['Champagne Gold Wire'],
    stoneOptions: ['High Luster Crystal Beads'],
    specs: {
      metal: 'Pliable Alloy Wire Base',
      coating: 'None',
      stoneType: 'Faceted Glass Crystals',
      durability: 'Flexible / Reuseable',
      finish: 'Polished Yellow Gold Wire'
    },
    isFeatured: false
  },
  {
    id: 'hair-04',
    name: 'Crystal Star Bobby Pins',
    description: 'Set of five gorgeous luxury bobby pins capped with glittering crystal star clusters. Adds a cosmic sparkle to any hairstyle.',
    category: 'hair_accessories',
    subcategory: 'clips',
    price: 399,
    image: '/products/ring_luxury_gold.png',
    rating: 4.7,
    reviewsCount: 22,
    metalOptions: ['Gold Plated Pins', 'Silver Plated Pins'],
    stoneOptions: ['Cubic Zirconia Stars'],
    specs: {
      metal: 'Tempered Steel Bobby Pins',
      coating: 'Anti-Rust Coating Protection',
      stoneType: 'Twinkling CZ Crystals',
      durability: 'Heavy-Duty Grip Spring',
      finish: 'Bright Silver / Gold Plating'
    },
    isFeatured: false
  }
];
