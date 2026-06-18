import React from 'react';
import { Link } from 'react-router-dom';
import { Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const footerLinks = [
    {
      title: 'Get to Know Us',
      links: ['Careers', 'Blog', 'About ShopMart', 'Investor Relations', 'ShopMart Devices', 'ShopMart Science'],
    },
    {
      title: 'Make Money with Us',
      links: [
        'Sell products on ShopMart',
        'Sell on ShopMart Business',
        'Sell apps on ShopMart',
        'Become an Affiliate',
        'Advertise Your Products',
        'Self-Publish with Us',
        'Host an ShopMart Hub',
      ],
    },
    {
      title: 'ShopMart Payment Products',
      links: [
        'ShopMart Business Card',
        'Shop with Points',
        'Reload Your Balance',
        'ShopMart Currency Converter',
      ],
    },
    {
      title: 'Let Us Help You',
      links: [
        'ShopMart and COVID-19',
        'Your Account',
        'Your Orders',
        'Shipping Rates & Policies',
        'Returns & Replacements',
        'Manage Your Content and Devices',
        'Assistant',
        'Help',
      ],
    },
  ];

  return (
    <footer className="bg-amazon-blue text-white font-sans text-xs w-full mt-12 select-none">
      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        className="w-full bg-[#37475a] hover:bg-[#485769] text-center py-4 font-semibold hover:underline cursor-pointer focus:outline-none transition"
      >
        Back to top
      </button>

      {/* Directory links */}
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center border-b border-[#3a4553]">
        {footerLinks.map((section) => (
          <div key={section.title} className="flex flex-col gap-2 max-w-[200px]">
            <h4 className="font-bold text-sm text-gray-100">{section.title}</h4>
            <ul className="flex flex-col gap-1.5 text-gray-300">
              {section.links.map((link) => (
                <li key={link}>
                  <Link to="/search?q=&cat=All" className="hover:underline hover:text-white transition">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Brand & Language select bar */}
      <div className="py-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-gray-300 bg-amazon-blue">
        <Link to="/" className="flex items-baseline font-display">
          <span className="text-lg font-extrabold text-white">Shop</span>
          <span className="text-lg font-bold text-amazon-yellow">Mart</span>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <div className="border border-gray-500 rounded px-3 py-1.5 flex items-center gap-2 hover:border-white cursor-pointer text-[11px]">
            <Globe size={13} />
            <span>English</span>
          </div>
          <div className="border border-gray-500 rounded px-3 py-1.5 flex items-center gap-1.5 hover:border-white cursor-pointer text-[11px]">
            <span>$ USD - U.S. Dollar</span>
          </div>
          <div className="border border-gray-500 rounded px-3 py-1.5 flex items-center gap-1.5 hover:border-white cursor-pointer text-[11px]">
            <span>United States</span>
          </div>
        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="bg-[#111] py-8 text-center text-[10px] text-gray-400 flex flex-col gap-3">
        <div className="flex flex-wrap justify-center gap-4">
          <a href="#" className="hover:underline">Conditions of Use</a>
          <a href="#" className="hover:underline">Privacy Notice</a>
          <a href="#" className="hover:underline">Consumer Health Data Privacy Disclosure</a>
          <a href="#" className="hover:underline">Your Ads Privacy Choices</a>
        </div>
        <p className="mt-1">
          &copy; 2026, ShopMart.com, Inc. or its affiliates. Custom brand demonstration application resembling Amazon layout.
        </p>
      </div>
    </footer>
  );
};
