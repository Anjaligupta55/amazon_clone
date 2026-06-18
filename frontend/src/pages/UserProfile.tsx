import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { addAddress, removeAddress, addSavedCard, removeSavedCard } from '../store/slices/authSlice';
import { addToCart } from '../store/slices/cartSlice';
import { Address, SavedCard, Product } from '../../../shared/types';
import {
  User,
  MapPin,
  CreditCard,
  Heart,
  Plus,
  Trash2,
  CheckCircle,
  Bell,
  Sliders,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTabParam = searchParams.get('tab') || 'profile';

  const { isAuthenticated, currentUser, selectedAddressId } = useAppSelector((state) => state.auth);
  const { items: catalogProducts, customItems } = useAppSelector((state) => state.products);
  const allProducts = [...customItems, ...catalogProducts];

  // Validate authenticated status
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Tabs states
  const [activeTab, setActiveTab] = useState(activeTabParam);

  // Sync with params
  useEffect(() => {
    setActiveTab(activeTabParam);
  }, [activeTabParam]);

  // Form toggles
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);

  // Address form inputs
  const [addrName, setAddrName] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');
  const [addrPhone, setAddrPhone] = useState('');

  // Card form inputs
  const [cardHolder, setCardHolder] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExpMonth, setCardExpMonth] = useState('12');
  const [cardExpYear, setCardExpYear] = useState('2028');
  const [cardBrand, setCardBrand] = useState('Visa');

  // Wishlist Mock list (items with rating >= 4.8)
  const wishlistItems = allProducts.slice(10, 14);

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName.trim() || !addrStreet.trim() || !addrCity.trim() || !addrState.trim() || !addrZip.trim()) {
      toast.error('Fill in all address details.');
      return;
    }

    const payload: Omit<Address, 'id'> = {
      name: addrName,
      street: addrStreet,
      city: addrCity,
      state: addrState,
      zipCode: addrZip,
      country: 'United States',
      phone: addrPhone,
      isDefault: currentUser?.addresses.length === 0,
    };

    dispatch(addAddress(payload));
    toast.success('New delivery address registered.');
    setShowAddrForm(false);

    // Reset inputs
    setAddrName('');
    setAddrStreet('');
    setAddrCity('');
    setAddrState('');
    setAddrZip('');
    setAddrPhone('');
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardHolder.trim() || !cardNum.trim()) {
      toast.error('Fill in cardholder name and card number.');
      return;
    }

    const payload: Omit<SavedCard, 'id'> = {
      brand: cardBrand,
      last4: cardNum.slice(-4),
      expiryMonth: cardExpMonth,
      expiryYear: cardExpYear,
      holderName: cardHolder.toUpperCase(),
    };

    dispatch(addSavedCard(payload));
    toast.success('Credit card saved successfully.');
    setShowCardForm(false);
    setCardHolder('');
    setCardNum('');
  };

  const handleDeleteAddress = (id: string) => {
    dispatch(removeAddress(id));
    toast.success('Address removed.');
  };

  const handleDeleteCard = (id: string) => {
    dispatch(removeSavedCard(id));
    toast.success('Credit card removed.');
  };

  const handleAddWishToCart = (p: Product) => {
    dispatch(
      addToCart({
        product: p,
        quantity: 1,
      })
    );
    toast.success(`${p.title} added to cart!`);
  };

  const changeTab = (tab: string) => {
    setSearchParams({ tab });
    setActiveTab(tab);
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-gray-800 font-sans select-none bg-amazon-gray-bg min-h-screen flex flex-col md:flex-row gap-5 items-start">
      {/* Navigation sidebar (3 columns) */}
      <div className="w-full md:w-56 bg-white border rounded shadow-sm shrink-0 flex flex-col text-xs text-gray-600 overflow-hidden">
        <div className="bg-amazon-blue text-white p-4 font-bold flex items-center gap-1.5">
          <User size={15} /> Your Account Settings
        </div>

        <button
          onClick={() => changeTab('profile')}
          className={`px-4 py-3 border-b border-gray-100 font-bold hover:bg-gray-50 flex items-center gap-2 transition cursor-pointer text-left ${
            activeTab === 'profile' ? 'text-amazon-orange bg-orange-50/20 border-r-4 border-r-amazon-orange' : ''
          }`}
        >
          <Sliders size={14} /> Profile Overview
        </button>

        <button
          onClick={() => changeTab('addresses')}
          className={`px-4 py-3 border-b border-gray-100 font-bold hover:bg-gray-50 flex items-center gap-2 transition cursor-pointer text-left ${
            activeTab === 'addresses' ? 'text-amazon-orange bg-orange-50/20 border-r-4 border-r-amazon-orange' : ''
          }`}
        >
          <MapPin size={14} /> Address Book
        </button>

        <button
          onClick={() => changeTab('payments')}
          className={`px-4 py-3 border-b border-gray-100 font-bold hover:bg-gray-50 flex items-center gap-2 transition cursor-pointer text-left ${
            activeTab === 'payments' ? 'text-amazon-orange bg-orange-50/20 border-r-4 border-r-amazon-orange' : ''
          }`}
        >
          <CreditCard size={14} /> Saved Credit Cards
        </button>

        <button
          onClick={() => changeTab('wishlist')}
          className={`px-4 py-3 border-b border-gray-100 font-bold hover:bg-gray-50 flex items-center gap-2 transition cursor-pointer text-left ${
            activeTab === 'wishlist' ? 'text-amazon-orange bg-orange-50/20 border-r-4 border-r-amazon-orange' : ''
          }`}
        >
          <Heart size={14} /> Your Wishlist
        </button>
      </div>

      {/* Main Panel Content (9 columns) */}
      <div className="flex-grow bg-white border rounded shadow-sm p-6 w-full text-xs text-gray-700 min-h-[500px]">
        {activeTab === 'profile' && (
          /* TAB 1: Profile overview */
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-bold font-display border-b pb-2 text-gray-900">Profile Settings</h2>

            <div className="flex items-center gap-4">
              <img src={currentUser.avatar} alt="avatar" className="h-16 w-16 bg-gray-200 border rounded-full" />
              <div>
                <h3 className="font-bold text-sm text-gray-900">{currentUser.name}</h3>
                <span className="text-gray-500 font-semibold">{currentUser.email}</span>
                <span className="bg-gray-100 border text-gray-600 font-bold px-2 py-0.5 rounded text-[9px] block mt-1.5 w-max uppercase tracking-wider">
                  Role: {currentUser.role}
                </span>
              </div>
            </div>

            <div className="border-t pt-5 mt-2 flex flex-col gap-3">
              <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5"><Bell size={15} /> Store Notifications</h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-amazon-orange h-4 w-4" />
                <span className="text-gray-700 font-semibold">Send me emails on shipping courier location updates</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-amazon-orange h-4 w-4" />
                <span className="text-gray-700 font-semibold">Notify me about deals and discounts on favorited items</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'addresses' && (
          /* TAB 2: Address Book CRUD */
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-bold font-display text-gray-900">Address Book</h2>
              <button
                onClick={() => setShowAddrForm(!showAddrForm)}
                className="bg-amazon-gold hover:bg-amazon-gold-hover border border-amazon-dark-gold py-1.5 px-4 font-bold rounded flex items-center gap-1 cursor-pointer transition text-[11px] shadow-sm"
              >
                <Plus size={14} /> Add Address
              </button>
            </div>

            {showAddrForm && (
              <form onSubmit={handleAddAddress} className="border p-4 bg-gray-50/50 rounded flex flex-col gap-3 max-w-lg">
                <h3 className="font-bold text-gray-900 border-b pb-1">Enter a new delivery address</h3>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-700">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={addrName}
                    onChange={(e) => setAddrName(e.target.value)}
                    className="amazon-input"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-700">Street Address</label>
                  <input
                    type="text"
                    required
                    value={addrStreet}
                    onChange={(e) => setAddrStreet(e.target.value)}
                    className="amazon-input"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-gray-700">City</label>
                    <input
                      type="text"
                      required
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="amazon-input"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-gray-700">State</label>
                    <input
                      type="text"
                      required
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      className="amazon-input"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-gray-700">ZIP Code</label>
                    <input
                      type="text"
                      required
                      value={addrZip}
                      onChange={(e) => setAddrZip(e.target.value)}
                      className="amazon-input"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-700">Phone</label>
                  <input
                    type="text"
                    required
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    className="amazon-input"
                  />
                </div>

                <div className="flex gap-2 justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddrForm(false)}
                    className="amazon-btn-secondary px-4 py-1.5"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="amazon-btn-primary px-4 py-1.5 font-bold">
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {/* List addresses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {currentUser.addresses.map((addr) => (
                <div key={addr.id} className="border rounded p-4 relative flex flex-col justify-between hover:shadow transition bg-neutral-50/50">
                  <div className="flex flex-col gap-0.5 text-xs text-gray-800">
                    <span className="font-bold text-gray-900 text-sm block mb-1">{addr.name}</span>
                    <span>{addr.street}</span>
                    <span>{addr.city}, {addr.state} {addr.zipCode}</span>
                    <span className="text-gray-500 mt-1 block">Phone: {addr.phone}</span>

                    {addr.id === selectedAddressId && (
                      <span className="text-[10px] text-green-700 font-bold mt-2 flex items-center gap-1">
                        <CheckCircle size={12} /> Default Active Shipping Address
                      </span>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 border-t pt-3 mt-4">
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-red-600 hover:text-red-800 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          /* TAB 3: Payments Saved credit cards */
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-bold font-display text-gray-900">Saved Payments & Cards</h2>
              <button
                onClick={() => setShowCardForm(!showCardForm)}
                className="bg-amazon-gold hover:bg-amazon-gold-hover border border-amazon-dark-gold py-1.5 px-4 font-bold rounded flex items-center gap-1 cursor-pointer transition text-[11px] shadow-sm"
              >
                <Plus size={14} /> Add Card
              </button>
            </div>

            {showCardForm && (
              <form onSubmit={handleAddCard} className="border p-4 bg-gray-50/50 rounded flex flex-col gap-3 max-w-md">
                <h3 className="font-bold text-gray-900 border-b pb-1">Add a new credit card</h3>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-700">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="amazon-input"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-700">Card Number (Last 4 digits saved)</label>
                  <input
                    type="text"
                    required
                    value={cardNum}
                    onChange={(e) => setCardNum(e.target.value)}
                    className="amazon-input"
                    maxLength={16}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-gray-700">Brand</label>
                    <select
                      value={cardBrand}
                      onChange={(e) => setCardBrand(e.target.value)}
                      className="amazon-input"
                    >
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="Discover">Discover</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-gray-700">Exp Month</label>
                    <select
                      value={cardExpMonth}
                      onChange={(e) => setCardExpMonth(e.target.value)}
                      className="amazon-input"
                    >
                      {Array.from({ length: 12 }).map((_, i) => (
                        <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-gray-700">Exp Year</label>
                    <select
                      value={cardExpYear}
                      onChange={(e) => setCardExpYear(e.target.value)}
                      className="amazon-input"
                    >
                      {Array.from({ length: 10 }).map((_, i) => (
                        <option key={i} value={2026 + i}>
                          {2026 + i}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setShowCardForm(false)}
                    className="amazon-btn-secondary px-4 py-1.5"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="amazon-btn-primary px-4 py-1.5 font-bold">
                    Save Card
                  </button>
                </div>
              </form>
            )}

            {/* List credit cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {currentUser.savedCards.map((card) => (
                <div key={card.id} className="border rounded p-4 relative flex flex-col justify-between hover:shadow bg-neutral-50/50">
                  <div className="flex gap-3 items-center">
                    <div className="bg-gray-100 border p-2 rounded shrink-0">
                      <CreditCard size={20} className="text-gray-600" />
                    </div>
                    <div className="flex flex-col text-xs text-gray-800">
                      <span className="font-bold text-gray-900 block">{card.brand} Ending in {card.last4}</span>
                      <span className="text-gray-500 font-semibold uppercase mt-0.5">{card.holderName}</span>
                      <span className="text-gray-400 mt-1 block">Exp: {card.expiryMonth}/{card.expiryYear}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t pt-3 mt-4">
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-red-600 hover:text-red-800 font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <Trash2 size={13} /> Delete Card
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'wishlist' && (
          /* TAB 4: Wishlist items */
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold font-display border-b pb-2 text-gray-900 flex items-center gap-1.5">
              <Heart size={16} className="text-red-600" /> Your Shopping Wishlist ({wishlistItems.length} items)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {wishlistItems.map((p) => (
                <div key={p.id} className="border rounded p-4 flex gap-3 bg-neutral-50/50 justify-between items-start">
                  <div className="flex gap-3">
                    <img src={p.thumbnail} alt={p.title} className="h-16 w-16 bg-white border p-1 rounded shrink-0 object-contain" />
                    <div className="flex flex-col text-xs">
                      <h4 className="font-bold text-gray-900 leading-tight line-clamp-1">{p.title}</h4>
                      <span className="text-[10px] text-gray-400 block mt-0.5">by {p.seller}</span>
                      <span className="text-red-700 font-bold mt-1.5 block">${p.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddWishToCart(p)}
                    className="amazon-btn-primary py-1 px-3 text-[10px] font-bold shrink-0 self-end shadow-sm"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
