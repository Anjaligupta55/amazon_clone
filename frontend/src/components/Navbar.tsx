import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { logout, login, setSelectedAddress } from '../store/slices/authSlice';
import { clearCart } from '../store/slices/cartSlice';
import {
  Search,
  ShoppingCart,
  Menu,
  MapPin,
  ChevronDown,
  Mic,
  X,
  User,
  LogOut,
  Briefcase,
  History,
  Heart,
  Globe,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface NavbarProps {
  onOpenSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, selectedAddressId } = useAppSelector(
    (state) => state.auth
  );
  const cartItems = useAppSelector((state) => state.cart.items);
  const products = useAppSelector((state) => state.products.items);
  const customProducts = useAppSelector((state) => state.products.customItems);

  // Combine products for search suggestions
  const allProducts = [...customProducts, ...products];

  const totalCartQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Address lookup
  const activeAddress = currentUser?.addresses.find((a) => a.id === selectedAddressId);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update Search Suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = allProducts
      .filter((p) => {
        const matchesQuery =
          p.title.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query);
        const matchesCategory =
          selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
        return matchesQuery && matchesCategory;
      })
      .map((p) => p.title)
      .slice(0, 8);

    // Remove duplicates
    setSuggestions(Array.from(new Set(filtered)));
  }, [searchQuery, selectedCategory]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery)}&cat=${selectedCategory}`);
  };

  const handleSuggestionClick = (title: string) => {
    setSearchQuery(title);
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(title)}&cat=${selectedCategory}`);
  };

  // Voice Search Simulation
  const triggerVoiceSearch = () => {
    setIsListening(true);
    // Simulating Voice Recognition typing something after 2.5 seconds
    setTimeout(() => {
      const phrases = ['iphone 15 pro', 'running shoes', 'mens casual shirts', 'gaming console'];
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      setSearchQuery(randomPhrase);
      setIsListening(false);
      navigate(`/search?q=${encodeURIComponent(randomPhrase)}&cat=All`);
    }, 2500);
  };

  // Category list extraction
  const categories = ['All', ...Array.from(new Set(allProducts.map((p) => p.category)))];

  const handleRoleSwitch = (role: 'customer' | 'admin') => {
    dispatch(login({ role }));
    setShowAccountMenu(false);
    navigate(role === 'admin' ? '/admin' : '/');
  };

  return (
    <header className="sticky top-0 z-40 w-full text-white font-sans text-xs select-none">
      {/* Voice listening overlay */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
          >
            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl flex flex-col items-center gap-4 max-w-sm text-center shadow-2xl">
              <div className="relative">
                <span className="absolute inline-flex h-16 w-16 rounded-full bg-orange-500 opacity-75 animate-ping"></span>
                <div className="relative bg-orange-600 p-4 rounded-full">
                  <Mic size={32} className="text-white" />
                </div>
              </div>
              <h2 className="text-lg font-bold font-display mt-2">Listening...</h2>
              <p className="text-neutral-400 text-sm">Speak the name of a product, brand, or category to search ShopMart.</p>
              <button
                onClick={() => setIsListening(false)}
                className="mt-4 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-md hover:bg-neutral-700 transition cursor-pointer text-xs"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Tier Nav */}
      <div className="bg-amazon-blue px-4 py-2 flex items-center gap-3 justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex flex-col items-start px-2 py-1 border border-transparent hover:border-white rounded-sm cursor-pointer">
          <div className="flex items-baseline font-display">
            <span className="text-lg font-extrabold tracking-tight">Shop</span>
            <span className="text-lg font-bold text-amazon-yellow tracking-tight">Mart</span>
          </div>
          <span className="text-[9px] text-gray-300 font-semibold -mt-1 tracking-wider leading-none">prime</span>
        </Link>

        {/* Location Selector */}
        <div
          onClick={() => setShowAddressModal(true)}
          className="hidden md:flex items-center gap-1 px-2 py-1.5 border border-transparent hover:border-white rounded-sm cursor-pointer text-left"
        >
          <MapPin size={18} className="mt-1" />
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-300 leading-none">Deliver to</span>
            <span className="text-sm font-bold leading-tight">
              {activeAddress ? `${activeAddress.city} ${activeAddress.zipCode}` : 'United States'}
            </span>
          </div>
        </div>

        {/* Search Bar Container */}
        <div ref={searchRef} className="flex-1 relative flex items-stretch h-10 max-w-3xl">
          {/* Category Dropdown */}
          <div className="relative flex items-center bg-gray-100 hover:bg-gray-200 border-r border-gray-300 rounded-l-md text-gray-800 text-[13px] px-3 cursor-pointer">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-transparent pr-4 font-sans cursor-pointer focus:outline-none capitalize text-xs"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="capitalize text-gray-900">
                  {cat === 'All' ? 'All Departments' : cat.replace('-', ' ')}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-1.5 text-gray-600" />
          </div>

          {/* Input */}
          <input
            type="text"
            placeholder="Search ShopMart..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            className="flex-grow bg-white text-gray-900 px-3 text-sm focus:outline-none"
          />

          {/* Voice Mic Trigger */}
          <button
            onClick={triggerVoiceSearch}
            type="button"
            className="bg-white hover:bg-gray-100 px-2.5 flex items-center justify-center text-gray-500 cursor-pointer transition border-r border-transparent hover:border-gray-200"
            title="Search with your voice"
          >
            <Mic size={18} />
          </button>

          {/* Search Action Button */}
          <button
            onClick={() => handleSearchSubmit()}
            className="bg-amazon-yellow hover:bg-amazon-orange px-6 flex items-center justify-center rounded-r-md text-gray-900 cursor-pointer transition"
          >
            <Search size={20} className="font-bold" />
          </button>

          {/* Search Autocomplete Recommendations */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-11 left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 text-gray-800 text-sm overflow-hidden"
              >
                {suggestions.map((sug) => (
                  <div
                    key={sug}
                    onClick={() => handleSuggestionClick(sug)}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-100 cursor-pointer transition"
                  >
                    <Search size={14} className="text-gray-400" />
                    <span className="font-medium">{sug}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Language Selection */}
        <div ref={langMenuRef} className="relative hidden lg:flex items-center gap-1 px-2 py-3 border border-transparent hover:border-white rounded-sm cursor-pointer">
          <span className="font-bold text-sm tracking-wide flex items-center gap-1">
            <Globe size={14} className="text-gray-300" /> {language}
          </span>
          <ChevronDown size={12} className="text-gray-400 mt-1" />
          {/* Dropdown Menu */}
          {showLangMenu && (
            <div className="absolute right-0 top-12 bg-white text-gray-800 rounded shadow-md border border-gray-200 p-3 w-36 z-50 flex flex-col gap-2">
              <span className="font-bold text-[11px] border-b pb-1 text-gray-500">Change Language</span>
              {['EN', 'ES', 'DE', 'FR'].map((lang) => (
                <div
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setShowLangMenu(false);
                  }}
                  className={`flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-100 text-xs font-semibold ${
                    language === lang ? 'text-amazon-orange bg-orange-50' : 'text-gray-700'
                  }`}
                >
                  {lang === 'EN' ? 'English' : lang === 'ES' ? 'Español' : lang === 'DE' ? 'Deutsch' : 'Français'}
                  {language === lang && <div className="h-1.5 w-1.5 bg-amazon-orange rounded-full" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Menu */}
        <div
          ref={accountMenuRef}
          onMouseEnter={() => setShowAccountMenu(true)}
          onMouseLeave={() => setShowAccountMenu(false)}
          className="relative flex flex-col justify-center px-2 py-1 border border-transparent hover:border-white rounded-sm cursor-pointer text-left"
        >
          <span className="text-[11px] text-gray-300 leading-none">Hello, {currentUser ? currentUser.name.split(' ')[0] : 'Sign in'}</span>
          <span className="text-sm font-bold leading-tight flex items-center gap-0.5">
            Account & Lists <ChevronDown size={12} className="text-gray-400 mt-0.5" />
          </span>

          {/* Account Dropdown Drawer */}
          <AnimatePresence>
            {showAccountMenu && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute right-0 top-[37px] bg-white border border-gray-200 rounded shadow-2xl p-5 w-64 z-50 text-gray-800 text-xs"
              >
                {!isAuthenticated ? (
                  <div className="flex flex-col items-center border-b pb-4 mb-4">
                    <Link
                      to="/login"
                      className="w-full text-center bg-amazon-yellow border border-amazon-dark-gold py-1.5 rounded-md hover:bg-amazon-gold font-semibold text-gray-900 cursor-pointer shadow-sm transition mb-2 text-sm"
                    >
                      Sign in
                    </Link>
                    <span>
                      New customer?{' '}
                      <Link to="/register" className="text-blue-600 hover:text-orange-500 hover:underline">
                        Start here.
                      </Link>
                    </span>
                  </div>
                ) : (
                  <div className="border-b pb-3 mb-3 flex flex-col gap-2">
                    <span className="font-bold text-gray-900 text-sm">Your Account</span>
                    <Link to="/profile" className="text-gray-600 hover:text-amazon-orange hover:underline font-semibold flex items-center gap-1.5 py-0.5">
                      <User size={13} /> Your Profile & Addresses
                    </Link>
                    <Link to="/orders" className="text-gray-600 hover:text-amazon-orange hover:underline font-semibold flex items-center gap-1.5 py-0.5">
                      <History size={13} /> Your Orders & Track
                    </Link>
                    <Link to="/profile?tab=wishlist" className="text-gray-600 hover:text-amazon-orange hover:underline font-semibold flex items-center gap-1.5 py-0.5">
                      <Heart size={13} /> Your Wishlist
                    </Link>
                  </div>
                )}

                {/* Switcher Role Simulator */}
                <div className="flex flex-col gap-2 border-b pb-3 mb-3">
                  <span className="font-bold text-gray-900 text-sm">Tester Sandbox Modes</span>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      onClick={() => handleRoleSwitch('customer')}
                      className={`py-1.5 px-2 rounded font-bold border transition text-center text-[10px] cursor-pointer ${
                        currentUser?.role === 'customer'
                          ? 'bg-orange-500 border-orange-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700'
                      }`}
                    >
                      Customer View
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('admin')}
                      className={`py-1.5 px-2 rounded font-bold border transition text-center text-[10px] cursor-pointer ${
                        currentUser?.role === 'admin'
                          ? 'bg-orange-500 border-orange-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700'
                      }`}
                    >
                      Admin Console
                    </button>
                  </div>
                </div>

                {/* Admin specific link */}
                {currentUser?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="w-full text-center bg-gray-900 text-white py-1.5 rounded-md hover:bg-neutral-800 font-bold flex items-center justify-center gap-1.5 mb-2.5 transition text-[11px]"
                  >
                    <Briefcase size={13} /> Enter Admin Panel
                  </Link>
                )}

                {/* Logout Action */}
                {isAuthenticated && (
                  <button
                    onClick={() => {
                      dispatch(logout());
                      dispatch(clearCart());
                      navigate('/login');
                    }}
                    className="w-full py-1.5 border border-red-200 text-red-600 font-semibold hover:bg-red-50 hover:border-red-300 rounded flex items-center justify-center gap-1 cursor-pointer transition text-[11px]"
                  >
                    <LogOut size={13} /> Sign Out
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Returns & Orders */}
        <Link
          to="/orders"
          className="hidden sm:flex flex-col justify-center px-2 py-1 border border-transparent hover:border-white rounded-sm cursor-pointer text-left"
        >
          <span className="text-[11px] text-gray-300 leading-none">Returns</span>
          <span className="text-sm font-bold leading-tight">& Orders</span>
        </Link>

        {/* Cart Trigger */}
        <Link
          to="/cart"
          className="flex items-center gap-1.5 px-2 py-1.5 border border-transparent hover:border-white rounded-sm cursor-pointer relative"
        >
          <div className="relative flex items-end">
            <span className="absolute -top-2 left-3 bg-amazon-orange text-white text-[11px] font-bold h-[19px] min-w-[19px] px-1 rounded-full flex items-center justify-center border-2 border-amazon-blue leading-none">
              {totalCartQuantity}
            </span>
            <ShoppingCart size={24} className="mt-1" />
          </div>
          <span className="text-sm font-bold self-end hidden md:inline">Cart</span>
        </Link>
      </div>

      {/* Bottom Tier Nav (Mega Menu Subnav) */}
      <div className="bg-amazon-light px-3 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          {/* Menu Hamburger Trigger */}
          <div
            onClick={onOpenSidebar}
            className="flex items-center gap-1 font-bold px-2 py-1.5 border border-transparent hover:border-white rounded-sm cursor-pointer leading-none"
          >
            <Menu size={16} /> All
          </div>

          {/* Links list */}
          <div className="hidden md:flex items-center gap-3 font-semibold text-xs">
            <Link to="/search?q=deals&cat=All" className="px-2 py-1.5 border border-transparent hover:border-white rounded-sm">Today's Deals</Link>
            <Link to="/search?q=&cat=All" className="px-2 py-1.5 border border-transparent hover:border-white rounded-sm">Registry</Link>
            <Link to="/search?q=&cat=All" className="px-2 py-1.5 border border-transparent hover:border-white rounded-sm">Gift Cards</Link>
            <Link to="/search?q=&cat=All" className="px-2 py-1.5 border border-transparent hover:border-white rounded-sm">Customer Service</Link>
            <Link to="/search?q=&cat=All" className="px-2 py-1.5 border border-transparent hover:border-white rounded-sm">Sell</Link>
          </div>
        </div>

        {/* Accent tagline or customer badge */}
        <span className="text-xs font-bold text-amazon-yellow pr-2 hidden sm:inline">
          ShopMart Prime: Free Shipping Over $35!
        </span>
      </div>

      {/* Address Switcher Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 text-gray-800 text-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-md shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-gray-100 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold text-base font-display">Choose your delivery location</h3>
                <button
                  onClick={() => setShowAddressModal(false)}
                  className="text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-4">
                <p className="text-xs text-gray-500">
                  Select a delivery address from your profile to update pricing, shipping speeds, and stock availability.
                </p>

                {/* Address list */}
                {currentUser?.addresses && currentUser.addresses.length > 0 ? (
                  <div className="flex flex-col gap-3 max-h-56 overflow-y-auto pr-1">
                    {currentUser.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => {
                          dispatch(setSelectedAddress(addr.id));
                          setShowAddressModal(false);
                        }}
                        className={`border rounded p-3 cursor-pointer hover:border-amazon-orange transition text-xs flex flex-col gap-0.5 ${
                          selectedAddressId === addr.id
                            ? 'border-amazon-orange bg-orange-50/50'
                            : 'border-gray-300'
                        }`}
                      >
                        <span className="font-bold text-gray-900">{addr.name}</span>
                        <span>{addr.street}</span>
                        <span>{addr.city}, {addr.state} {addr.zipCode}</span>
                        <span className="text-gray-500 mt-1">{addr.phone}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 font-semibold">
                    No addresses stored on this profile.
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4 flex justify-end gap-2">
                  <Link
                    to="/profile"
                    onClick={() => setShowAddressModal(false)}
                    className="amazon-btn-secondary text-xs px-4 py-2"
                  >
                    Manage Address Book
                  </Link>
                  <button
                    onClick={() => setShowAddressModal(false)}
                    className="amazon-btn-primary text-xs px-4 py-2"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
