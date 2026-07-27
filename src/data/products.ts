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


