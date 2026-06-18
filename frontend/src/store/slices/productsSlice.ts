import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, Review } from '../../../../shared/types';

interface ProductsState {
  items: Product[];
  customItems: Product[]; // Products added or modified by admin locally
  banners: string[];
}

export const DEFAULT_BANNERS = [
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80'
];

export const sanitizeBanners = (banners: string[] | undefined): string[] => {
  if (!banners || banners.length === 0) return DEFAULT_BANNERS;
  return banners.map(url => {
    if (url.includes('images-eu.ssl-images-amazon.com')) {
      if (url.includes('SBC-PC_1')) return DEFAULT_BANNERS[0];
      if (url.includes('W-sbc')) return DEFAULT_BANNERS[1];
      if (url.includes('Unrec-1x')) return DEFAULT_BANNERS[2];
      return DEFAULT_BANNERS[0];
    }
    return url;
  });
};

const initialState: ProductsState = {
  items: [],
  customItems: [],
  banners: DEFAULT_BANNERS,
};

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      // Merge with custom products that exist locally
      state.items = action.payload;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.customItems.unshift(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const idx = state.customItems.findIndex(p => p.id === action.payload.id);
      if (idx > -1) {
        state.customItems[idx] = action.payload;
      } else {
        const itemIdx = state.items.findIndex(p => p.id === action.payload.id);
        if (itemIdx > -1) {
          // If we edit a fetched catalog item, copy it into custom items
          state.customItems.push(action.payload);
        }
      }
    },
    deleteProduct: (state, action: PayloadAction<number>) => {
      state.customItems = state.customItems.filter(p => p.id !== action.payload);
      state.items = state.items.filter(p => p.id !== action.payload);
    },
    addProductReview: (state, action: PayloadAction<{ productId: number; review: Review }>) => {
      const { productId, review } = action.payload;
      
      // Look in custom items first
      const customProduct = state.customItems.find(p => p.id === productId);
      if (customProduct) {
        if (!customProduct.reviews) customProduct.reviews = [];
        customProduct.reviews.unshift(review);
        // Recalculate rating
        const totalRating = customProduct.reviews.reduce((acc, curr) => acc + curr.rating, 0);
        customProduct.rating = Number((totalRating / customProduct.reviews.length).toFixed(1));
      }

      // Also look in fetched items
      const catalogProduct = state.items.find(p => p.id === productId);
      if (catalogProduct) {
        if (!catalogProduct.reviews) catalogProduct.reviews = [];
        catalogProduct.reviews.unshift(review);
        const totalRating = catalogProduct.reviews.reduce((acc, curr) => acc + curr.rating, 0);
        catalogProduct.rating = Number((totalRating / catalogProduct.reviews.length).toFixed(1));
      }
    },
    updateBanners: (state, action: PayloadAction<string[]>) => {
      state.banners = action.payload;
    },
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  updateBanners,
} = productsSlice.actions;

export default productsSlice.reducer;
