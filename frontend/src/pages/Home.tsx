import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { addToCart } from '../store/slices/cartSlice';
import { setProducts, sanitizeBanners } from '../store/slices/productsSlice';
import { Product } from '../../../shared/types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import { Star, ShieldAlert, BadgePercent, ChevronRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

// Swiper Styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: catalogProducts, customItems } = useAppSelector((state) => state.products);
  const rawBanners = useAppSelector((state) => state.products.banners);
  const banners = sanitizeBanners(rawBanners);

  // Combine custom admin-added items with base catalog items
  const allProducts = [...customItems, ...catalogProducts];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch from DummyJSON to seed local store if empty
  useEffect(() => {
    if (catalogProducts.length === 0) {
      const fetchCatalog = async () => {
        setLoading(true);
        try {
          const res = await axios.get('https://dummyjson.com/products?limit=100');
          // Add custom properties like "isPrime", "deliveryDays", "seller"
          const processed: Product[] = res.data.products.map((p: any) => ({
            ...p,
            isPrime: p.price > 20, // Mock prime eligibility
            deliveryDays: Math.floor(Math.random() * 3) + 1, // 1 to 3 days
            seller: p.brand || 'ShopMart Retail',
            specifications: {
              Brand: p.brand || 'Generic',
              Model: `SM-${p.id}`,
              Weight: `${p.weight || '1.2'} lbs`,
              Warranty: p.warrantyInformation || '1 Year ShopMart Warranty',
            },
            reviews: (p.reviews || []).map((r: any, idx: number) => ({
              id: r.id || `rev-${p.id}-${idx}`,
              productId: p.id,
              user: {
                id: r.reviewerEmail || `usr-${idx}`,
                name: r.reviewerName || 'Anonymous',
                avatar: r.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(r.reviewerName || 'Anonymous')}`,
              },
              rating: r.rating || 5,
              title: r.title || 'Verified purchase review',
              comment: r.comment || '',
              createdAt: r.date || r.createdAt || new Date().toISOString(),
              helpfulVotes: r.helpfulVotes || Math.floor(Math.random() * 10),
            })),
          }));
          dispatch(setProducts(processed));
          setError(null);
        } catch (err) {
          console.error('Failed to fetch product catalog', err);
          setError('Could not download product catalog. Working in offline sandbox mode.');
        } finally {
          setLoading(false);
        }
      };
      fetchCatalog();
    }
  }, [catalogProducts, dispatch]);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    dispatch(
      addToCart({
        product,
        quantity: 1,
      })
    );
    toast.success(`${product.title} added to cart!`, {
      position: 'bottom-right',
      style: {
        background: '#131921',
        color: '#fff',
        fontSize: '12px',
      },
    });
  };

  const getDiscountedPrice = (price: number, discount: number) => {
    return (price * (1 - discount / 100)).toFixed(2);
  };

  // Group items by tags/categories for landing boxes
  const deals = allProducts.filter((p) => p.discountPercentage > 15).slice(0, 8);
  const electronics = allProducts.filter((p) => p.category === 'smartphones' || p.category === 'laptops' || p.category === 'mobile-accessories').slice(0, 4);
  const fashion = allProducts.filter((p) => p.category === 'womens-clothing' || p.category === 'mens-shoes' || p.category === 'mens-shirts').slice(0, 4);
  const beauty = allProducts.filter((p) => p.category === 'beauty' || p.category === 'fragrances').slice(0, 4);

  return (
    <div className="bg-amazon-gray-bg min-h-screen pb-12 font-sans select-none relative">
      {/* Hero Swiper Banner Carousel */}
      <div className="relative w-full h-[220px] sm:h-[320px] md:h-[480px] lg:h-[550px] overflow-hidden">
        <Swiper
          modules={[Navigation, Autoplay, Pagination]}
          navigation
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          className="w-full h-full"
        >
          {banners.map((url, i) => (
            <SwiperSlide key={i} className="relative w-full h-full">
              <img
                src={url}
                alt={`Banner ${i}`}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-amazon-gray-bg via-transparent to-transparent pointer-events-none" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Main Grid Content Overlaying Hero */}
      <div className="max-w-7xl mx-auto px-4 relative -mt-[60px] sm:-mt-[150px] md:-mt-[220px] lg:-mt-[280px] z-10 flex flex-col gap-6">
        {/* Row 1: Overlapping Department Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Electronics */}
          <div className="amazon-card flex flex-col justify-between h-[360px]">
            <div>
              <h3 className="font-bold text-lg font-display text-gray-900 mb-3">Shop Electronics</h3>
              <div className="grid grid-cols-2 gap-2">
                {electronics.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/product/${p.id}`)}
                    className="flex flex-col items-center gap-1 cursor-pointer group"
                  >
                    <div className="h-20 w-20 flex items-center justify-center overflow-hidden bg-gray-50 border border-gray-100 p-1">
                      <img src={p.thumbnail} alt={p.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition" />
                    </div>
                    <span className="text-[10px] text-gray-600 font-semibold truncate w-full text-center capitalize">{p.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => navigate('/search?q=&cat=electronics')}
              className="text-blue-600 hover:text-orange-500 hover:underline text-xs font-semibold mt-4 text-left cursor-pointer flex items-center gap-0.5"
            >
              See more <ChevronRight size={14} />
            </button>
          </div>

          {/* Card 2: Beauty deals */}
          <div className="amazon-card flex flex-col justify-between h-[360px]">
            <div>
              <h3 className="font-bold text-lg font-display text-gray-900 mb-3">Beauty Products</h3>
              <div className="grid grid-cols-2 gap-2">
                {beauty.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/product/${p.id}`)}
                    className="flex flex-col items-center gap-1 cursor-pointer group"
                  >
                    <div className="h-20 w-20 flex items-center justify-center overflow-hidden bg-gray-50 border border-gray-100 p-1">
                      <img src={p.thumbnail} alt={p.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition" />
                    </div>
                    <span className="text-[10px] text-gray-600 font-semibold truncate w-full text-center capitalize">{p.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => navigate('/search?q=&cat=beauty')}
              className="text-blue-600 hover:text-orange-500 hover:underline text-xs font-semibold mt-4 text-left cursor-pointer flex items-center gap-0.5"
            >
              See all items <ChevronRight size={14} />
            </button>
          </div>

          {/* Card 3: Today's Deals Preview */}
          <div className="amazon-card flex flex-col justify-between h-[360px] bg-gradient-to-br from-white to-amber-50/20">
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <span className="bg-amazon-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Zap size={10} /> FLASH SALE
                </span>
                <h3 className="font-bold text-lg font-display text-gray-900">Today's Deals</h3>
              </div>
              {deals[0] ? (
                <div onClick={() => navigate(`/product/${deals[0].id}`)} className="cursor-pointer group flex flex-col items-center">
                  <div className="h-36 w-full flex items-center justify-center overflow-hidden bg-gray-50 p-2 border border-gray-100 rounded-sm mb-2">
                    <img
                      src={deals[0].thumbnail}
                      alt={deals[0].title}
                      className="max-h-full object-contain group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="flex items-center gap-2 self-start">
                    <span className="bg-red-700 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
                      Up to {deals[0].discountPercentage.toFixed(0)}% Off
                    </span>
                    <span className="text-red-700 font-bold text-xs">Deal of the Day</span>
                  </div>
                  <p className="text-xs text-gray-800 font-semibold truncate w-full mt-1.5">{deals[0].title}</p>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-12">No hot deals listed today.</div>
              )}
            </div>
            <button
              onClick={() => navigate('/search?q=deals&cat=All')}
              className="text-blue-600 hover:text-orange-500 hover:underline text-xs font-semibold text-left cursor-pointer flex items-center gap-0.5"
            >
              See all deals <ChevronRight size={14} />
            </button>
          </div>

          {/* Card 4: Sign-in Prompt or Books */}
          <div className="amazon-card flex flex-col justify-between h-[360px]">
            <div>
              <h3 className="font-bold text-lg font-display text-gray-900 mb-3">Fashion & Apparel</h3>
              <div className="grid grid-cols-2 gap-2">
                {fashion.length > 0 ? (
                  fashion.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/product/${p.id}`)}
                      className="flex flex-col items-center gap-1 cursor-pointer group"
                    >
                      <div className="h-20 w-20 flex items-center justify-center overflow-hidden bg-gray-50 border border-gray-100 p-1">
                        <img src={p.thumbnail} alt={p.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition" />
                      </div>
                      <span className="text-[10px] text-gray-600 font-semibold truncate w-full text-center capitalize">{p.title}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-gray-500 text-center py-12">No fashion items available.</div>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate('/search?q=&cat=womens-clothing')}
              className="text-blue-600 hover:text-orange-500 hover:underline text-xs font-semibold mt-4 text-left cursor-pointer flex items-center gap-0.5"
            >
              Shop Fashion <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Row 2: Horizontal Scroll Slider for Deals */}
        <div className="bg-white p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-lg font-display text-gray-900 flex items-center gap-1.5">
              <BadgePercent size={20} className="text-red-600" /> Hot Discounts & Offers
            </h3>
            <button
              onClick={() => navigate('/search?q=deals&cat=All')}
              className="text-blue-600 hover:text-orange-500 hover:underline text-xs font-bold flex items-center cursor-pointer"
            >
              See all items
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 py-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col gap-2">
                  <div className="h-28 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-yellow-700 bg-yellow-50 rounded flex items-center justify-center gap-1.5 text-xs font-semibold">
              <ShieldAlert size={16} /> {error}
            </div>
          ) : (
            <Swiper
              modules={[Navigation]}
              navigation
              slidesPerView={2}
              spaceBetween={12}
              breakpoints={{
                640: { slidesPerView: 3, spaceBetween: 16 },
                768: { slidesPerView: 4, spaceBetween: 16 },
                1024: { slidesPerView: 6, spaceBetween: 20 },
              }}
              className="w-full py-2"
            >
              {deals.map((p) => (
                <SwiperSlide
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="cursor-pointer group flex flex-col gap-1 text-left bg-neutral-50/50 p-2 rounded hover:shadow transition border border-transparent hover:border-gray-200"
                >
                  <div className="h-28 w-full flex items-center justify-center bg-white border border-gray-100 p-2 overflow-hidden rounded">
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="max-h-full object-contain group-hover:scale-105 transition"
                    />
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="bg-red-700 text-white text-[9px] font-bold px-1 py-0.5 rounded">
                      -{p.discountPercentage.toFixed(0)}%
                    </span>
                    <span className="text-red-700 text-[10px] font-bold">Limited time deal</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-sm font-bold text-gray-900">${getDiscountedPrice(p.price, p.discountPercentage)}</span>
                    <span className="text-[10px] text-gray-400 line-through">${p.price.toFixed(2)}</span>
                  </div>
                  <h4 className="text-[11px] text-gray-700 font-medium truncate mt-0.5 group-hover:underline">
                    {p.title}
                  </h4>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* Row 3: Infinite Product Grid */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-lg font-display text-gray-900 border-b border-gray-200 pb-2.5">
            Recommended Products For You
          </h3>

          {loading && catalogProducts.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white p-4 flex flex-col gap-3 h-80 border">
                  <div className="h-40 bg-gray-200"></div>
                  <div className="h-5 bg-gray-200 w-3/4"></div>
                  <div className="h-4 bg-gray-200 w-1/4"></div>
                  <div className="h-8 bg-gray-200 w-full mt-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="bg-white p-4 border border-gray-200 flex flex-col cursor-pointer hover:shadow-lg transition relative group"
                >
                  {/* Prime Eligible Badge */}
                  {p.isPrime && (
                    <span className="absolute top-2 left-2 bg-[#00a8e9] text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow-sm z-10">
                      PRIME
                    </span>
                  )}

                  {/* Thumbnail */}
                  <div className="h-44 w-full flex items-center justify-center overflow-hidden bg-gray-50 rounded p-3 mb-3 border border-gray-100">
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="max-h-full object-contain group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  {/* Details */}
                  <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-10 group-hover:text-amazon-orange transition leading-tight">
                    {p.title}
                  </h4>

                  {/* Seller info */}
                  <span className="text-[10px] text-gray-500 font-medium mt-0.5">by {p.seller}</span>

                  {/* Rating stars */}
                  <div className="flex items-center gap-1 mt-1.5">
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={13}
                          fill={i < Math.floor(p.rating) ? 'currentColor' : 'none'}
                          className="currentColor"
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-blue-600 font-bold">{(p.reviews?.length || 15) + 3}</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-lg font-bold text-gray-900">
                      ${getDiscountedPrice(p.price, p.discountPercentage)}
                    </span>
                    {p.discountPercentage > 0 && (
                      <>
                        <span className="text-xs text-gray-400 line-through">${p.price.toFixed(2)}</span>
                        <span className="text-xs text-green-700 font-bold">
                          ({p.discountPercentage.toFixed(0)}% Off)
                        </span>
                      </>
                    )}
                  </div>

                  {/* Delivery Speed info */}
                  <span className="text-[11px] text-gray-600 mt-1">
                    Get it in <span className="font-bold text-gray-800">{p.deliveryDays} days</span>
                  </span>

                  {/* Add to Cart button overlay */}
                  <button
                    onClick={(e) => handleAddToCart(e, p)}
                    className="w-full mt-4 bg-amazon-gold hover:bg-amazon-gold-hover border border-amazon-dark-gold py-1.5 rounded text-xs font-semibold text-gray-900 cursor-pointer shadow-sm active:bg-amber-600 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
