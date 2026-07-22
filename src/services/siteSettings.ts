export interface InstagramFeedItem {
  url: string;
  sortOrder: number;
  type: 'post' | 'reel' | 'unknown';
  thumbnail?: string;
  title?: string;
}

export interface HomeCategory {
  id: string;
  name: string;
  desc: string;
  image: string;
}

export interface SiteSettings {
  whatsapp: string;
  supportPhone: string;
  supportEmail: string;
  supportAddress: string;
  freeShippingThreshold: number;
  seoTitle: string;
  seoDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;
  homeNewArrivals: string[];
  homeBestSellers: string[];
  homeTrending: string[];
  homeCategories: HomeCategory[];
  instagramFeedUrls: InstagramFeedItem[];
}

const key = 'md_site_settings_v1';

export const defaultSiteSettings: SiteSettings = {
  whatsapp: '918448229528',
  supportPhone: '+918448229528',
  supportEmail: 'support@maadiaries.com',
  supportAddress: 'D-16, Part 1, Chanakya Place, 40 Feet Road, Opp. Gurudwara, New Delhi - 110059',
  freeShippingThreshold: 1000,
  seoTitle: 'Maa Diaries | Premium Anti-Tarnish Jewellery',
  seoDescription: 'Premium anti-tarnish jewellery and everyday elegance.',
  heroTitle: 'Anti-Tarnish Elegance',
  heroSubtitle: 'Premium Anti-Tarnish Jewellery',
  heroDescription: 'Beautifully crafted jewelry micro-plated with a tarnish-resistant polymer seal. Designed for daily wear, sweat, and showers.',
  heroImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80',
  homeNewArrivals: [],
  homeBestSellers: [],
  homeTrending: [],
  homeCategories: [],
  instagramFeedUrls: []
};

export const siteSettingsService = {
  get: (): SiteSettings => ({ ...defaultSiteSettings, ...JSON.parse(localStorage.getItem(key) || '{}') }),
  save: (value: SiteSettings) => localStorage.setItem(key, JSON.stringify(value))
};
