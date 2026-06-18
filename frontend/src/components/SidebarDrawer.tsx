import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { login, logout } from '../store/slices/authSlice';
import { clearCart } from '../store/slices/cartSlice';
import { X, User, ChevronRight, Settings, Briefcase, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAppSelector((state) => state.auth);

  if (!isOpen) return null;

  const handleRoleSwitch = (role: 'customer' | 'admin') => {
    dispatch(login({ role }));
    onClose();
    navigate(role === 'admin' ? '/admin' : '/');
  };

  const sections = [
    {
      title: 'Digital Content & Devices',
      items: [
        { label: 'ShopMart Music', path: '/search?q=music&cat=All' },
        { label: 'Echo & Alexa', path: '/search?q=echo&cat=All' },
        { label: 'Fire Tablets', path: '/search?q=tablet&cat=All' },
      ],
    },
    {
      title: 'Shop By Department',
      items: [
        { label: 'Electronics', path: '/search?q=&cat=electronics' },
        { label: 'Fashion & Apparel', path: '/search?q=&cat=womens-clothing' },
        { label: 'Books', path: '/search?q=&cat=books' },
        { label: 'Gaming', path: '/search?q=&cat=gaming' },
        { label: 'Furniture', path: '/search?q=&cat=furniture' },
        { label: 'Beauty & Health', path: '/search?q=&cat=beauty' },
      ],
    },
    {
      title: 'Programs & Features',
      items: [
        { label: 'Gift Cards', path: '/search?q=gift&cat=All' },
        { label: 'ShopMart Live', path: '/search?q=live&cat=All' },
        { label: 'International Shopping', path: '/search?q=&cat=All' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex font-sans select-none">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 cursor-pointer"
      />

      {/* Drawer panel */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'tween', duration: 0.25 }}
        className="relative flex flex-col w-80 max-w-[85vw] h-full bg-white text-gray-800 shadow-2xl z-10 overflow-hidden"
      >
        {/* Header (Greeting User) */}
        <div className="bg-amazon-light text-white px-8 py-3.5 flex items-center gap-3 border-b border-gray-700">
          <div className="bg-gray-300 rounded-full p-1 border border-white">
            <User size={22} className="text-gray-700" />
          </div>
          <div>
            <span className="text-sm font-bold block">
              Hello, {currentUser ? currentUser.name : 'Sign In'}
            </span>
            <span className="text-[10px] text-gray-300 block">ShopMart Prime Customer</span>
          </div>
        </div>

        {/* Categories / Link blocks */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6 text-xs font-semibold">
          {sections.map((sec) => (
            <div key={sec.title} className="border-b border-gray-100 pb-4 last:border-b-0">
              <h3 className="text-gray-900 font-bold text-sm mb-2.5 font-display tracking-tight">
                {sec.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {sec.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className="flex items-center justify-between text-gray-600 hover:text-amazon-orange transition hover:bg-gray-50 py-1 px-2 rounded-sm"
                    >
                      <span>{item.label}</span>
                      <ChevronRight size={14} className="text-gray-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Help & Settings Section */}
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-gray-900 font-bold text-sm mb-2.5 font-display tracking-tight">
              Help & Settings
            </h3>
            <ul className="flex flex-col gap-2.5 text-gray-600">
              <li>
                <Link to="/profile" onClick={onClose} className="flex items-center gap-2 hover:text-amazon-orange py-1 px-2">
                  <Settings size={14} /> Your Account
                </Link>
              </li>
              <li>
                <div className="flex flex-col gap-1.5 px-2 py-1 bg-gray-50 rounded border border-gray-200 mt-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                    Switch Active Persona:
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRoleSwitch('customer')}
                      className={`text-[9px] font-bold py-1 px-2.5 rounded border flex-1 cursor-pointer transition ${
                        currentUser?.role === 'customer'
                          ? 'bg-orange-500 text-white border-orange-600'
                          : 'bg-white border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      Customer
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('admin')}
                      className={`text-[9px] font-bold py-1 px-2.5 rounded border flex-1 cursor-pointer transition ${
                        currentUser?.role === 'admin'
                          ? 'bg-orange-500 text-white border-orange-600'
                          : 'bg-white border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                </div>
              </li>
              {currentUser?.role === 'admin' && (
                <li>
                  <Link to="/admin" onClick={onClose} className="flex items-center gap-2 text-white bg-gray-900 hover:bg-gray-800 py-1.5 px-3 rounded-md font-bold text-[10px] justify-center mt-2 transition">
                    <Briefcase size={14} /> Access Admin Console
                  </Link>
                </li>
              )}
              {isAuthenticated && (
                <li className="mt-2">
                  <button
                    onClick={() => {
                      dispatch(logout());
                      dispatch(clearCart());
                      onClose();
                      navigate('/login');
                    }}
                    className="w-full text-left flex items-center gap-2 text-red-600 hover:bg-red-50 py-1 px-2 rounded-sm cursor-pointer transition"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Close Button Overlay */}
        <button
          onClick={onClose}
          className="absolute top-3 -right-12 text-white hover:text-gray-300 cursor-pointer focus:outline-none flex items-center gap-1 font-bold"
        >
          <X size={28} />
        </button>
      </motion.div>
    </div>
  );
};
