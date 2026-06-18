import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Product } from '../../../../shared/types';

interface CartState {
  items: CartItem[];
  savedForLater: CartItem[];
  couponCode: string | null;
  discountValue: number; // Flat value in dollars
  discountType: 'percentage' | 'fixed' | null;
  couponPercentage: number;
}

const initialState: CartState = {
  items: [],
  savedForLater: [],
  couponCode: null,
  discountValue: 0,
  discountType: null,
  couponPercentage: 0,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; quantity: number; color?: string; size?: string }>) => {
      const { product, quantity, color, size } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item =>
          item.product.id === product.id &&
          item.selectedColor === color &&
          item.selectedSize === size
      );

      if (existingItemIndex > -1) {
        state.items[existingItemIndex].quantity += quantity;
      } else {
        state.items.push({
          product,
          quantity,
          selectedColor: color,
          selectedSize: size,
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<{ id: number; color?: string; size?: string }>) => {
      const { id, color, size } = action.payload;
      state.items = state.items.filter(
        item =>
          !(item.product.id === id &&
            item.selectedColor === color &&
            item.selectedSize === size)
      );
    },
    updateQuantity: (state, action: PayloadAction<{ id: number; color?: string; size?: string; quantity: number }>) => {
      const { id, color, size, quantity } = action.payload;
      const existingItem = state.items.find(
        item =>
          item.product.id === id &&
          item.selectedColor === color &&
          item.selectedSize === size
      );
      if (existingItem) {
        existingItem.quantity = Math.max(1, quantity);
      }
    },
    saveForLater: (state, action: PayloadAction<{ id: number; color?: string; size?: string }>) => {
      const { id, color, size } = action.payload;
      const cartItemIndex = state.items.findIndex(
        item =>
          item.product.id === id &&
          item.selectedColor === color &&
          item.selectedSize === size
      );

      if (cartItemIndex > -1) {
        const itemToSave = state.items[cartItemIndex];
        state.items.splice(cartItemIndex, 1);
        state.savedForLater.push(itemToSave);
      }
    },
    moveToCart: (state, action: PayloadAction<{ id: number; color?: string; size?: string }>) => {
      const { id, color, size } = action.payload;
      const savedItemIndex = state.savedForLater.findIndex(
        item =>
          item.product.id === id &&
          item.selectedColor === color &&
          item.selectedSize === size
      );

      if (savedItemIndex > -1) {
        const itemToMove = state.savedForLater[savedItemIndex];
        state.savedForLater.splice(savedItemIndex, 1);
        state.items.push(itemToMove);
      }
    },
    removeSavedForLater: (state, action: PayloadAction<{ id: number; color?: string; size?: string }>) => {
      const { id, color, size } = action.payload;
      state.savedForLater = state.savedForLater.filter(
        item =>
          !(item.product.id === id &&
            item.selectedColor === color &&
            item.selectedSize === size)
      );
    },
    applyCoupon: (state, action: PayloadAction<string>) => {
      const code = action.payload.toUpperCase();
      if (code === 'SHOPMART20') {
        state.couponCode = 'SHOPMART20';
        state.discountType = 'percentage';
        state.couponPercentage = 20;
        state.discountValue = 0;
      } else if (code === 'SAVE10') {
        state.couponCode = 'SAVE10';
        state.discountType = 'fixed';
        state.discountValue = 10;
        state.couponPercentage = 0;
      } else {
        // Invalid coupon
        state.couponCode = null;
        state.discountType = null;
        state.discountValue = 0;
        state.couponPercentage = 0;
      }
    },
    removeCoupon: (state) => {
      state.couponCode = null;
      state.discountType = null;
      state.discountValue = 0;
      state.couponPercentage = 0;
    },
    clearCart: (state) => {
      state.items = [];
      state.couponCode = null;
      state.discountType = null;
      state.discountValue = 0;
      state.couponPercentage = 0;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  saveForLater,
  moveToCart,
  removeSavedForLater,
  applyCoupon,
  removeCoupon,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
