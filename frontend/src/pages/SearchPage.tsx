import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { addToCart } from '../store/slices/cartSlice';
import { Product } from '../../../shared/types';
import { Star, ShieldAlert, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('cat') || 'All';

  const { items: catalogProducts, customItems } = useAppSelector((state) => state.products);
  const allProducts = [...customItems, ...catalogProducts];

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [priceMax, setPriceMax] = useState<number | ''>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [minRating, setMinRating] = useState<number>(0);
  const [primeOnly, setPrimeOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  // Synchronize on parameter updates
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  const getDiscountedPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100);
  };

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
      style: { background: '#131921', color: '#fff', fontSize: '12px' },
    });
  };

  // Filter Logic
  const filteredProducts = allProducts.filter((p) => {
    const matchesQuery =
      !queryParam ||
      p.title.toLowerCase().includes(queryParam.toLowerCase()) ||
      p.description.toLowerCase().includes(queryParam.toLowerCase()) ||
      p.brand.toLowerCase().includes(queryParam.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();

    const finalPrice = getDiscountedPrice(p.price, p.discountPercentage);
    const matchesPrice = !priceMax || finalPrice <= priceMax;

    const matchesBrand = selectedBrand === 'All' || p.brand.toLowerCase() === selectedBrand.toLowerCase();

    const matchesRating = p.rating >= minRating;

    const matchesPrime = !primeOnly || p.isPrime;

    return matchesQuery && matchesCategory && matchesPrice && matchesBrand && matchesRating && matchesPrime;
  });

  // Sort Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aPrice = getDiscountedPrice(a.price, a.discountPercentage);
    const bPrice = getDiscountedPrice(b.price, b.discountPercentage);

    if (sortBy === 'price-asc') return aPrice - bPrice;
    if (sortBy === 'price-desc') return bPrice - aPrice;
    if (sortBy === 'reviews') return b.rating - a.rating;
    // Featured (default) - sorted by ID descending
    return b.id - a.id;
  });

  // Extract Categories and Brands for Sidebar
  const categories = ['All', ...Array.from(new Set(allProducts.map((p) => p.category)))];
  const brands = ['All', ...Array.from(new Set(allProducts.map((p) => p.brand).filter(Boolean)))];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-gray-800 font-sans select-none bg-white min-h-screen">
      {/* Top Banner showing search query */}
      <div className="border-b pb-3.5 mb-5 flex flex-col sm:flex-row items-baseline sm:justify-between gap-2 text-xs">
        <div>
          <span className="text-gray-500 font-semibold">
            Showing {sortedProducts.length} results for{' '}
            <span className="text-amazon-orange font-bold font-sans">
              "{queryParam || 'All Products'}"
            </span>
          </span>
          {categoryParam !== 'All' && (
            <span className="text-gray-400 ml-1.5 font-semibold">
              in <span className="capitalize font-bold text-gray-600">{categoryParam.replace('-', ' ')}</span>
            </span>
          )}
        </div>

        {/* Sort Select dropdown */}
        <div className="flex items-center gap-1.5 text-gray-700 font-semibold shrink-0">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border bg-gray-50 rounded p-1 font-semibold text-xs text-gray-800 cursor-pointer focus:outline-none"
          >
            <option value="featured">Featured Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="reviews">Avg. Customer Review</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Left Sidebar Filter Column */}
        <div className="md:col-span-1 border border-gray-200 rounded p-5 flex flex-col gap-5 text-xs text-gray-600">
          <div className="font-bold text-sm text-gray-900 border-b pb-1.5 flex items-center gap-1">
            <SlidersHorizontal size={14} className="text-amazon-orange" /> Filter Products
          </div>

          {/* Prime filter checkbox */}
          <div className="flex flex-col gap-1.5">
            <span className="font-bold text-gray-900">ShopMart Prime</span>
            <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={primeOnly}
                onChange={(e) => setPrimeOnly(e.target.checked)}
                className="accent-[#00a8e9] h-4 w-4"
              />
              <span className="bg-[#00a8e9] text-white text-[9px] font-extrabold px-1 rounded scale-90">PRIME</span> Eligible
            </label>
          </div>

          {/* Category Department filter */}
          <div className="flex flex-col gap-2">
            <span className="font-bold text-gray-900">Category Department</span>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left hover:underline capitalize py-0.5 font-semibold ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'text-amazon-orange font-bold'
                      : 'text-gray-600'
                  }`}
                >
                  {cat === 'All' ? 'All Departments' : cat.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Price max filter */}
          <div className="flex flex-col gap-2">
            <span className="font-bold text-gray-900">Price Threshold</span>
            <div className="flex items-center gap-2">
              <span className="font-bold">$</span>
              <input
                type="number"
                placeholder="Max Price"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value === '' ? '' : Number(e.target.value))}
                className="amazon-input"
              />
              {priceMax !== '' && (
                <button
                  onClick={() => setPriceMax('')}
                  className="text-red-600 hover:text-red-800 font-bold"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Brand Filter list */}
          <div className="flex flex-col gap-2">
            <span className="font-bold text-gray-900">Brands & Manufacturers</span>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`text-left hover:underline py-0.5 font-semibold ${
                    selectedBrand.toLowerCase() === brand.toLowerCase() ? 'text-amazon-orange font-bold' : 'text-gray-600'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Star rating filter lists */}
          <div className="flex flex-col gap-2">
            <span className="font-bold text-gray-900">Avg. Customer Review</span>
            <div className="flex flex-col gap-2 mt-1">
              {[4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={`flex items-center gap-1 hover:underline text-left font-semibold ${
                    minRating === rating ? 'text-amazon-orange font-bold font-sans' : 'text-gray-600'
                  }`}
                >
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < rating ? 'currentColor' : 'none'}
                        className="currentColor"
                      />
                    ))}
                  </div>
                  <span>& Up</span>
                </button>
              ))}
              {minRating > 0 && (
                <button
                  onClick={() => setMinRating(0)}
                  className="text-red-600 hover:text-red-800 hover:underline font-bold text-left self-start mt-1"
                >
                  Reset Rating Filter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Search Grid (3 columns) */}
        <div className="md:col-span-3 flex flex-col gap-4">
          {sortedProducts.length === 0 ? (
            <div className="border border-dashed border-gray-300 p-12 text-center rounded flex flex-col items-center gap-3">
              <ShieldAlert size={40} className="text-gray-300" />
              <h3 className="font-bold text-sm text-gray-700">No match found</h3>
              <p className="text-xs text-gray-400 max-w-xs">Double check your filters or search spelling. We couldn't find matches matching that criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedProducts.map((p) => {
                const finalPrice = getDiscountedPrice(p.price, p.discountPercentage);
                return (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/product/${p.id}`)}
                    className="bg-white border rounded p-4 flex flex-col cursor-pointer hover:shadow-lg transition relative group justify-between"
                  >
                    {/* Prime eligibility badge */}
                    {p.isPrime && (
                      <span className="absolute top-2 left-2 bg-[#00a8e9] text-white font-extrabold text-[8px] px-1 py-0.5 rounded shadow-sm z-10">
                        PRIME
                      </span>
                    )}

                    {/* Image */}
                    <div>
                      <div className="h-36 w-full bg-neutral-50 flex items-center justify-center overflow-hidden rounded p-2 mb-3 border border-gray-100/50">
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          className="max-h-full object-contain group-hover:scale-105 transition duration-300"
                        />
                      </div>

                      {/* Header details */}
                      <h4 className="font-bold text-gray-900 hover:text-amazon-orange transition line-clamp-2 leading-tight">
                        {p.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 block mt-0.5">by {p.seller}</span>

                      {/* Stars */}
                      <div className="flex items-center gap-1 mt-1.5">
                        <div className="flex text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              fill={i < Math.floor(p.rating) ? 'currentColor' : 'none'}
                              className="currentColor"
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-blue-600">{(p.reviews?.length || 15) + 3}</span>
                      </div>
                    </div>

                    {/* Pricing details */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-gray-900">${finalPrice.toFixed(2)}</span>
                        {p.discountPercentage > 0 && (
                          <>
                            <span className="text-[10px] text-gray-400 line-through">${p.price.toFixed(2)}</span>
                            <span className="text-[10px] text-green-700 font-bold">(-{p.discountPercentage.toFixed(0)}%)</span>
                          </>
                        )}
                      </div>

                      <span className="text-[10px] text-gray-600 block mt-0.5">
                        Get it in <span className="font-bold text-gray-800">{p.deliveryDays} days</span>
                      </span>

                      {/* CTA Add to Cart button */}
                      <button
                        onClick={(e) => handleAddToCart(e, p)}
                        className="w-full mt-3 bg-amazon-gold hover:bg-amazon-gold-hover border border-amazon-dark-gold py-1.5 rounded text-[11px] font-bold text-gray-900 cursor-pointer shadow-sm active:bg-amber-600 transition"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
