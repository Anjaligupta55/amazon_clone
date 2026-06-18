import { describe, it, expect } from 'vitest';
import cartReducer, {
  addToCart,
  removeFromCart,
  updateQuantity,
  applyCoupon,
  removeCoupon,
} from '../store/slices/cartSlice';
import { Product } from '../../../shared/types';

// Mock Product
const mockProduct: Product = {
  id: 99,
  title: 'Test Perfume Bottle',
  description: 'A luxurious smell test product.',
  price: 50.0,
  discountPercentage: 10,
  rating: 4.8,
  stock: 15,
  brand: 'LuxBrand',
  category: 'fragrances',
  thumbnail: 'https://picsum.photos/200/200',
  images: [],
  reviews: [],
  isPrime: true,
  deliveryDays: 2,
  seller: 'LuxRetail',
  specifications: {},
};

describe('Cart Redux Reducer Slice', () => {
  const initialState = {
    items: [],
    savedForLater: [],
    couponCode: null,
    discountValue: 0,
    discountType: null,
    couponPercentage: 0,
  };

  it('should return the initial state by default', () => {
    expect(cartReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('should add a new product item to the shopping cart', () => {
    const nextState = cartReducer(
      initialState,
      addToCart({ product: mockProduct, quantity: 2, color: 'Red', size: 'M' })
    );

    expect(nextState.items).toHaveLength(1);
    expect(nextState.items[0].product.id).toBe(99);
    expect(nextState.items[0].quantity).toBe(2);
    expect(nextState.items[0].selectedColor).toBe('Red');
    expect(nextState.items[0].selectedSize).toBe('M');
  });

  it('should update quantities of an existing item in the cart', () => {
    const populatedState = {
      ...initialState,
      items: [{ product: mockProduct, quantity: 2, selectedColor: 'Red', selectedSize: 'M' }],
    };

    const nextState = cartReducer(
      populatedState,
      updateQuantity({ id: 99, color: 'Red', size: 'M', quantity: 5 })
    );

    expect(nextState.items[0].quantity).toBe(5);
  });

  it('should delete a product item matching ID and selections from the cart', () => {
    const populatedState = {
      ...initialState,
      items: [
        { product: mockProduct, quantity: 2, selectedColor: 'Red', selectedSize: 'M' },
        { product: mockProduct, quantity: 1, selectedColor: 'Blue', selectedSize: 'S' },
      ],
    };

    const nextState = cartReducer(
      populatedState,
      removeFromCart({ id: 99, color: 'Red', size: 'M' })
    );

    expect(nextState.items).toHaveLength(1);
    expect(nextState.items[0].selectedColor).toBe('Blue');
  });

  it('should apply valid promo coupon codes (SHOPMART20)', () => {
    const nextState = cartReducer(initialState, applyCoupon('shopmart20'));
    expect(nextState.couponCode).toBe('SHOPMART20');
    expect(nextState.discountType).toBe('percentage');
    expect(nextState.couponPercentage).toBe(20);
  });

  it('should clear coupon states when removing active coupons', () => {
    const couponState = {
      ...initialState,
      couponCode: 'SHOPMART20',
      discountType: 'percentage' as const,
      couponPercentage: 20,
    };

    const nextState = cartReducer(couponState, removeCoupon());
    expect(nextState.couponCode).toBeNull();
    expect(nextState.couponPercentage).toBe(0);
  });
});
