import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Address, SavedCard } from '../../../../shared/types';

interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
  selectedAddressId: string | null;
}

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    name: 'John Doe',
    street: '123 Main Street, Apt 4B',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98101',
    country: 'United States',
    phone: '+1 206-555-0199',
    isDefault: true,
  },
  {
    id: 'addr-2',
    name: 'John Doe (Office)',
    street: '821 Westlake Ave N',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98109',
    country: 'United States',
    phone: '+1 206-555-0122',
    isDefault: false,
  }
];

const DEFAULT_CARDS: SavedCard[] = [
  {
    id: 'card-1',
    brand: 'Visa',
    last4: '4242',
    expiryMonth: '12',
    expiryYear: '2028',
    holderName: 'JOHN DOE',
  }
];

const CUSTOMER_USER: User = {
  id: 'usr-cust-1',
  email: 'customer@shopmart.com',
  name: 'John Doe',
  role: 'customer',
  avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=John+Doe',
  addresses: DEFAULT_ADDRESSES,
  savedCards: DEFAULT_CARDS,
};

const ADMIN_USER: User = {
  id: 'usr-admin-1',
  email: 'admin@shopmart.com',
  name: 'Admin Moderator',
  role: 'admin',
  avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Admin',
  addresses: [
    {
      id: 'addr-admin',
      name: 'Admin HQ',
      street: '410 Terry Ave N',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98109',
      country: 'United States',
      phone: '+1 206-555-0100',
      isDefault: true,
    }
  ],
  savedCards: [],
};

const initialState: AuthState = {
  isAuthenticated: true, // Default to logged in as customer for demonstration
  currentUser: CUSTOMER_USER,
  selectedAddressId: 'addr-1',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ role: 'customer' | 'admin' }>) => {
      state.isAuthenticated = true;
      state.currentUser = action.payload.role === 'admin' ? ADMIN_USER : CUSTOMER_USER;
      state.selectedAddressId = state.currentUser.addresses[0]?.id || null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
      state.selectedAddressId = null;
    },
    addAddress: (state, action: PayloadAction<Omit<Address, 'id'>>) => {
      if (state.currentUser) {
        const newAddress: Address = {
          ...action.payload,
          id: `addr-${Date.now()}`,
        };
        if (newAddress.isDefault) {
          state.currentUser.addresses.forEach(addr => addr.isDefault = false);
        }
        state.currentUser.addresses.push(newAddress);
        if (newAddress.isDefault || !state.selectedAddressId) {
          state.selectedAddressId = newAddress.id;
        }
      }
    },
    removeAddress: (state, action: PayloadAction<string>) => {
      if (state.currentUser) {
        state.currentUser.addresses = state.currentUser.addresses.filter(
          addr => addr.id !== action.payload
        );
        if (state.selectedAddressId === action.payload) {
          state.selectedAddressId = state.currentUser.addresses[0]?.id || null;
        }
      }
    },
    setSelectedAddress: (state, action: PayloadAction<string>) => {
      state.selectedAddressId = action.payload;
    },
    addSavedCard: (state, action: PayloadAction<Omit<SavedCard, 'id'>>) => {
      if (state.currentUser) {
        const newCard: SavedCard = {
          ...action.payload,
          id: `card-${Date.now()}`,
        };
        state.currentUser.savedCards.push(newCard);
      }
    },
    removeSavedCard: (state, action: PayloadAction<string>) => {
      if (state.currentUser) {
        state.currentUser.savedCards = state.currentUser.savedCards.filter(
          card => card.id !== action.payload
        );
      }
    },
  },
});

export const {
  login,
  logout,
  addAddress,
  removeAddress,
  setSelectedAddress,
  addSavedCard,
  removeSavedCard,
} = authSlice.actions;

export default authSlice.reducer;
