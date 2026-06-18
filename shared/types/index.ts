export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'customer' | 'admin';
  addresses: Address[];
  savedCards: SavedCard[];
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  holderName: string;
}

export interface ProductVariant {
  color?: string;
  size?: string;
  stock: number;
  sku: string;
  price?: number; // Override default price if applicable
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
  reviews: Review[];
  specifications: Record<string, string>;
  variants?: ProductVariant[];
  isPrime: boolean;
  deliveryDays: number;
  seller: string;
  videos?: string[];
}

export interface Review {
  id: string;
  productId: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  title?: string;
  createdAt: string;
  helpfulVotes: number;
  images?: string[];
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minimumCartAmount?: number;
  expiryDate: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface OrderItem {
  product: {
    id: number;
    title: string;
    price: number;
    thumbnail: string;
  };
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: 'stripe' | 'cod';
  paymentDetails?: {
    cardBrand?: string;
    last4?: string;
    transactionId?: string;
  };
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  status: 'pending' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
  createdAt: string;
  deliveryDate: string;
  trackingNumber: string;
  invoiceUrl?: string;
}
