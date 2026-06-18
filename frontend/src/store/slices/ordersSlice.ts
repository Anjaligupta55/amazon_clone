import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order } from '../../../../shared/types';

interface OrdersState {
  orders: Order[];
}

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord-9821037',
    items: [
      {
        product: {
          id: 1,
          title: 'Essence Mascara Lash Princess',
          price: 9.99,
          thumbnail: 'https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/thumbnail.png'
        },
        quantity: 2,
        selectedColor: 'Black'
      },
      {
        product: {
          id: 2,
          title: 'Eyeshadow Palette with Mirror',
          price: 19.99,
          thumbnail: 'https://cdn.dummyjson.com/products/images/beauty/Eyeshadow%20Palette%20with%20Mirror/thumbnail.png'
        },
        quantity: 1
      }
    ],
    shippingAddress: {
      id: 'addr-1',
      name: 'John Doe',
      street: '123 Main Street, Apt 4B',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'United States',
      phone: '+1 206-555-0199',
      isDefault: true
    },
    paymentMethod: 'stripe',
    paymentDetails: {
      cardBrand: 'Visa',
      last4: '4242',
      transactionId: 'ch_3Mtg4sLkdIwHu7ix1qYr7zZt'
    },
    subtotal: 39.97,
    shippingCost: 0,
    tax: 3.20,
    discount: 0,
    total: 43.17,
    status: 'delivered',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    deliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    trackingNumber: '1Z999AA10123456784'
  }
];

const initialState: OrdersState = {
  orders: DEFAULT_ORDERS,
};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: Order['status'] }>) => {
      const order = state.orders.find(o => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
        if (action.payload.status === 'delivered') {
          order.deliveryDate = new Date().toISOString();
        }
      }
    },
    cancelOrder: (state, action: PayloadAction<string>) => {
      const order = state.orders.find(o => o.id === action.payload);
      if (order && (order.status === 'pending' || order.status === 'shipped')) {
        order.status = 'cancelled';
      }
    },
    returnOrder: (state, action: PayloadAction<string>) => {
      const order = state.orders.find(o => o.id === action.payload);
      if (order && order.status === 'delivered') {
        order.status = 'returned';
      }
    }
  },
});

export const { addOrder, updateOrderStatus, cancelOrder, returnOrder } = ordersSlice.actions;

export default ordersSlice.reducer;
