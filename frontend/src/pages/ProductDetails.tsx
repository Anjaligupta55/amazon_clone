import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { addToCart } from '../store/slices/cartSlice';
import { addProductReview } from '../store/slices/productsSlice';
import { Product, Review } from '../../../shared/types';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Plus,
  BadgeAlert,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { items: catalogProducts, customItems } = useAppSelector((state) => state.products);
  const allProducts = [...customItems, ...catalogProducts];

  // Find active product
  const productId = Number(id);
  const product = allProducts.find((p) => p.id === productId);

  // States
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [couponApplied, setCouponApplied] = useState(false);

  // Review Form States
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  // Bundle Items (Frequently Bought Together)
  const [bundleChecked, setBundleChecked] = useState([true, true, true]);
  const [bundleProducts, setBundleProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (product) {
      setActiveImage(product.thumbnail);
      // Default color/size selection if variants exist
      if (product.variants && product.variants.length > 0) {
        const uniqueColors = Array.from(
          new Set(product.variants.map((v) => v.color).filter(Boolean))
        );
        const uniqueSizes = Array.from(
          new Set(product.variants.map((v) => v.size).filter(Boolean))
        );
        if (uniqueColors[0]) setSelectedColor(uniqueColors[0] as string);
        if (uniqueSizes[0]) setSelectedSize(uniqueSizes[0] as string);
      }
    }
  }, [product]);

  // Load related items for bundle
  useEffect(() => {
    if (product) {
      const related = allProducts
        .filter((p) => p.category === product.category && p.id !== product.id)
        .slice(0, 2);
      setBundleProducts(related);
    }
  }, [product, allProducts]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-700">
        <BadgeAlert size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold font-display">Product Not Found</h2>
        <p className="text-sm text-gray-500 mt-2">The product you are looking for does not exist in our catalog.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 amazon-btn-primary px-6 py-2"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const getDiscountedPrice = (price: number, discount: number) => {
    return Number((price * (1 - discount / 100)).toFixed(2));
  };

  const finalPrice = getDiscountedPrice(product.price, product.discountPercentage);
  const savings = (product.price - finalPrice).toFixed(2);

  // Bundle calculations
  const bundleList = [product, ...bundleProducts];
  const activeBundleItems = bundleList.filter((_, idx) => bundleChecked[idx]);
  const bundleSubtotal = activeBundleItems.reduce(
    (acc, p) => acc + getDiscountedPrice(p.price, p.discountPercentage),
    0
  );
  // Apply a extra 5% bundle discount if all checked
  const isEligibleForBundleDiscount = bundleChecked.every(Boolean) && bundleList.length === 3;
  const bundleTotal = isEligibleForBundleDiscount
    ? Number((bundleSubtotal * 0.95).toFixed(2))
    : bundleSubtotal;

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        product,
        quantity,
        color: selectedColor || undefined,
        size: selectedSize || undefined,
      })
    );
    toast.success(`${product.title} added to cart!`, {
      position: 'bottom-right',
      style: { background: '#131921', color: '#fff', fontSize: '12px' },
    });
  };

  const handleAddBundleToCart = () => {
    activeBundleItems.forEach((p) => {
      dispatch(
        addToCart({
          product: p,
          quantity: 1,
        })
      );
    });
    toast.success(`Bundle items added to cart!`, {
      position: 'bottom-right',
      style: { background: '#131921', color: '#fff', fontSize: '12px' },
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      toast.error('Please enter your name and comments.');
      return;
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      user: {
        id: `usr-${Date.now()}`,
        name: reviewName,
        avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(reviewName)}`,
      },
      rating: reviewRating,
      title: reviewTitle || 'Verified purchase review',
      comment: reviewComment,
      createdAt: new Date().toISOString(),
      helpfulVotes: 0,
    };

    dispatch(addProductReview({ productId: product.id, review: newReview }));
    toast.success('Thank you for submitting your review!');

    // Reset Review fields
    setReviewName('');
    setReviewTitle('');
    setReviewComment('');
    setReviewRating(5);
  };

  // Review summaries
  const reviewsList = product.reviews || [];
  const totalReviewsCount = reviewsList.length + 15; // padding for design realism
  const averageRating = product.rating;

  // Star Distribution estimation based on rating
  const starDistribution = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1
  if (averageRating >= 4.5) {
    starDistribution[0] = 72;
    starDistribution[1] = 18;
    starDistribution[2] = 6;
    starDistribution[3] = 3;
    starDistribution[4] = 1;
  } else if (averageRating >= 4.0) {
    starDistribution[0] = 55;
    starDistribution[1] = 27;
    starDistribution[2] = 10;
    starDistribution[3] = 5;
    starDistribution[4] = 3;
  } else {
    starDistribution[0] = 40;
    starDistribution[1] = 30;
    starDistribution[2] = 15;
    starDistribution[3] = 10;
    starDistribution[4] = 5;
  }

  // Extract unique colors/sizes from variants
  const uniqueColors = Array.from(
    new Set(product.variants?.map((v) => v.color).filter(Boolean) || [])
  ) as string[];
  const uniqueSizes = Array.from(
    new Set(product.variants?.map((v) => v.size).filter(Boolean) || [])
  ) as string[];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-gray-800 font-sans select-none bg-white">
      {/* Category path bar */}
      <div className="text-xs text-gray-500 mb-6 capitalize">
        Departments &gt; {product.category.replace('-', ' ')} &gt; {product.brand}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Grid: Images Gallery & Hover zoom (5 columns) */}
        <div className="lg:col-span-5 flex flex-col md:flex-row gap-4">
          {/* Thumbnails array on the left side */}
          <div className="flex flex-row md:flex-col gap-2 order-2 md:order-1 overflow-x-auto">
            {[product.thumbnail, ...(product.images || [])].slice(0, 5).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`h-14 w-14 p-1 border rounded bg-white flex items-center justify-center overflow-hidden shrink-0 cursor-pointer ${
                  activeImage === img ? 'border-amazon-orange outline-2 outline-orange-100' : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <img src={img} alt={`thumbnail-${idx}`} className="max-h-full max-w-full object-contain" />
              </button>
            ))}
          </div>

          {/* Large image active container with zoom-on-hover class */}
          <div className="flex-grow order-1 md:order-2 bg-neutral-50 border border-gray-100 rounded-sm p-4 h-[350px] md:h-[450px] flex items-center justify-center zoom-container">
            <img
              src={activeImage}
              alt={product.title}
              className="max-h-full max-w-full object-contain zoom-image"
            />
          </div>
        </div>

        {/* Center Grid: Specifications, description (4 columns) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-xl md:text-2xl font-bold font-display text-gray-900 leading-tight">
              {product.title}
            </h1>
            <span className="text-xs text-blue-600 hover:underline hover:text-amazon-orange cursor-pointer font-semibold mt-1 block">
              Brand: {product.brand}
            </span>

            {/* Ratings summary banner */}
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="font-bold">{averageRating}</span>
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.floor(averageRating) ? 'currentColor' : 'none'}
                    className="currentColor"
                  />
                ))}
              </div>
              <span className="text-blue-600 hover:underline cursor-pointer font-semibold">
                {totalReviewsCount} ratings
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-blue-600 hover:underline cursor-pointer font-semibold">
                12 answered questions
              </span>
            </div>
          </div>

          {/* Prices, Discounts, Coupon details */}
          <div className="border-b border-gray-200 pb-4 flex flex-col gap-2">
            <div className="flex items-baseline gap-2 text-red-700">
              <span className="text-2xl md:text-3xl font-light">-</span>
              <span className="text-2xl md:text-3xl font-light">{product.discountPercentage.toFixed(0)}%</span>
              <span className="text-2xl md:text-3xl font-bold">${finalPrice}</span>
            </div>
            <div className="text-xs text-gray-500">
              List Price: <span className="line-through">${product.price.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-700">
              You Save: <span className="text-red-700 font-semibold">${savings} ({product.discountPercentage.toFixed(0)}%)</span>
            </div>

            {/* Coupons simulation */}
            <div className="bg-green-50 border border-green-200 p-2.5 rounded flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="apply-coupon"
                checked={couponApplied}
                onChange={() => setCouponApplied(!couponApplied)}
                className="accent-green-700 h-4 w-4 cursor-pointer"
              />
              <label htmlFor="apply-coupon" className="text-xs text-gray-800 font-semibold cursor-pointer">
                Apply coupon: <span className="bg-green-200 text-green-900 font-bold px-1.5 py-0.5 rounded text-[10px]">SHOPMART5</span> for an extra 5% off
              </label>
            </div>
          </div>

          {/* Options & Variants Selector */}
          {uniqueColors.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-gray-700">Color: {selectedColor}</span>
              <div className="flex gap-2">
                {uniqueColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1 border text-xs font-semibold rounded cursor-pointer ${
                      selectedColor === color ? 'border-amazon-orange bg-orange-50/30 outline-1 outline-orange-400' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {uniqueSizes.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-xs font-bold text-gray-700">Size: {selectedSize}</span>
              <div className="flex gap-2">
                {uniqueSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1 border text-xs font-semibold rounded cursor-pointer ${
                      selectedSize === size ? 'border-amazon-orange bg-orange-50/30 outline-1 outline-orange-400' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* About this item (Product description) */}
          <div className="mt-2 text-xs">
            <h4 className="font-bold text-sm text-gray-900 mb-2">About this item</h4>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Specifications Table */}
          <div className="mt-2">
            <h4 className="font-bold text-sm text-gray-900 mb-2 border-b pb-1">Product Specifications</h4>
            <table className="w-full text-xs text-gray-700">
              <tbody>
                {Object.entries(product.specifications || {}).map(([key, val]) => (
                  <tr key={key} className="border-b border-gray-100 last:border-0">
                    <td className="py-1.5 font-bold w-1/3 text-gray-600 capitalize">{key}</td>
                    <td className="py-1.5 w-2/3 text-gray-800">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Grid: Buy box panel (3 columns) */}
        <div className="lg:col-span-3 border border-gray-300 rounded p-4 flex flex-col gap-4 text-xs">
          <div>
            <div className="text-xl font-bold text-gray-900">
              ${couponApplied ? (finalPrice * 0.95).toFixed(2) : finalPrice}
            </div>
            {product.isPrime && (
              <span className="text-blue-600 font-extrabold text-[10px] tracking-wide block mt-0.5">
                FREE Delivery <span className="font-normal text-gray-700">with</span> ShopMart Prime
              </span>
            )}
            <span className="text-gray-600 block mt-1">
              Delivery by: <span className="font-bold text-gray-800">In {product.deliveryDays} Days</span>
            </span>
          </div>

          {/* Stock availability */}
          <div>
            {product.stock > 0 ? (
              <span className="text-green-700 text-sm font-bold block">In Stock</span>
            ) : (
              <span className="text-red-700 text-sm font-bold block">Temporarily Out of Stock</span>
            )}
            <span className="text-gray-600 block mt-0.5">Ships from and sold by {product.seller}.</span>
          </div>

          {/* Quantity selector */}
          {product.stock > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-700">Qty:</span>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border rounded bg-gray-50 p-1 font-semibold text-gray-800 cursor-pointer"
              >
                {Array.from({ length: Math.min(10, product.stock) }).map((_, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {idx + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Main Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-amazon-gold hover:bg-amazon-gold-hover border border-amazon-dark-gold py-2 rounded-md font-semibold text-gray-900 cursor-pointer shadow active:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-xs transition"
            >
              Add to Cart
            </button>
            <button
              onClick={() => {
                handleAddToCart();
                navigate('/cart');
              }}
              disabled={product.stock === 0}
              className="w-full bg-amazon-orange hover:bg-orange-500 border border-orange-600 py-2 rounded-md font-semibold text-white cursor-pointer shadow active:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs transition"
            >
              Buy Now
            </button>
          </div>

          {/* Secure transaction info */}
          <div className="flex flex-col gap-2 border-t pt-3 mt-1 text-gray-600 text-[11px]">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-gray-500 shrink-0" />
              <span>Secure transaction</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={14} className="text-gray-500 shrink-0" />
              <span>Tracked logistics courier</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw size={14} className="text-gray-500 shrink-0" />
              <span>Eligible for Return or Refund within 30 days of receipt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Bought Together Bundle widget */}
      {bundleProducts.length > 0 && (
        <div className="border-t border-gray-200 mt-12 pt-8">
          <h3 className="font-bold text-lg font-display text-gray-900 mb-4">Frequently Bought Together</h3>
          <div className="bg-neutral-50/50 border border-gray-200 p-5 rounded-md flex flex-col md:flex-row items-center gap-6 text-xs text-gray-700">
            {/* Products Row Images */}
            <div className="flex items-center gap-3 md:gap-4 flex-wrap">
              {bundleList.map((p, idx) => (
                <React.Fragment key={p.id}>
                  {idx > 0 && <Plus size={16} className="text-gray-400" />}
                  <div
                    onClick={() => navigate(`/product/${p.id}`)}
                    className={`h-24 w-24 p-2 bg-white border rounded flex items-center justify-center overflow-hidden cursor-pointer hover:border-amazon-orange transition ${
                      !bundleChecked[idx] && 'opacity-40'
                    }`}
                  >
                    <img src={p.thumbnail} alt={p.title} className="max-h-full object-contain" />
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Checklist Checkboxes */}
            <div className="flex flex-col gap-2 flex-grow">
              {bundleList.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-2 font-semibold">
                  <input
                    type="checkbox"
                    checked={bundleChecked[idx]}
                    onChange={(e) => {
                      const updated = [...bundleChecked];
                      updated[idx] = e.target.checked;
                      setBundleChecked(updated);
                    }}
                    className="accent-amazon-orange h-4 w-4 cursor-pointer"
                  />
                  <span>
                    {idx === 0 ? 'This item: ' : ''}
                    <span className="text-blue-600 hover:text-amazon-orange hover:underline cursor-pointer" onClick={() => navigate(`/product/${p.id}`)}>
                      {p.title}
                    </span>{' '}
                    - <span className="text-gray-900">${getDiscountedPrice(p.price, p.discountPercentage)}</span>
                  </span>
                </div>
              ))}

              {/* Price calculations */}
              <div className="mt-3 flex flex-col gap-1.5 border-t pt-3 border-gray-200">
                <div className="flex items-baseline gap-2">
                  <span className="text-gray-600">Total Price:</span>
                  <span className="text-lg font-bold text-red-700">${bundleTotal}</span>
                  {isEligibleForBundleDiscount && (
                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
                      <Sparkles size={11} /> 5% Bundle Savings Applied!
                    </span>
                  )}
                </div>
                <button
                  onClick={handleAddBundleToCart}
                  disabled={activeBundleItems.length === 0}
                  className="bg-amazon-gold hover:bg-amazon-gold-hover border border-amazon-dark-gold font-bold text-gray-900 px-4 py-1.5 rounded cursor-pointer max-w-xs transition text-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add all checked to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-gray-200 mt-12 pt-8">
        {/* Left Column: Summary and statistics (4 columns) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h3 className="font-bold text-lg font-display text-gray-900">Customer reviews</h3>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < Math.round(averageRating) ? 'currentColor' : 'none'}
                  className="currentColor"
                />
              ))}
            </div>
            <span className="font-bold text-gray-900">{averageRating} out of 5</span>
          </div>
          <span className="text-gray-500 text-xs">{totalReviewsCount} global ratings</span>

          {/* Horizontal Progress Bars */}
          <div className="flex flex-col gap-2 mt-2">
            {starDistribution.map((percentage, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs text-blue-600 font-semibold">
                <span className="w-10 hover:underline cursor-pointer">{5 - idx} star</span>
                <div className="flex-grow h-5 bg-gray-100 border border-gray-200 rounded overflow-hidden">
                  <div
                    className="h-full bg-amazon-yellow border-r border-yellow-500 rounded"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-gray-600 font-bold">{percentage}%</span>
              </div>
            ))}
          </div>

          {/* Write a review trigger */}
          <div className="border-t border-gray-200 pt-6 mt-2">
            <h4 className="font-bold text-sm text-gray-900 mb-1">Review this product</h4>
            <p className="text-xs text-gray-500 mb-4">Share your thoughts and feedback with other customers</p>
          </div>
        </div>

        {/* Right Column: Review list & Write Review Form (8 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <h3 className="font-bold text-base font-display text-gray-900 border-b pb-2">Top reviews from the United States</h3>

          {/* Reviews list */}
          {reviewsList.length > 0 ? (
            <div className="flex flex-col gap-6">
              {reviewsList.map((rev, idx) => {
                const userName = rev.user?.name || (rev as any).reviewerName || 'Anonymous';
                const userAvatar = rev.user?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(userName)}`;
                const reviewDate = rev.createdAt || (rev as any).date || new Date().toISOString();
                const reviewTitle = rev.title || 'Verified purchase review';
                return (
                  <div key={rev.id || `rev-${idx}`} className="border-b border-gray-100 pb-5 last:border-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <img src={userAvatar} alt="avatar" className="h-6 w-6 rounded-full bg-gray-200" />
                      <span className="text-xs font-bold text-gray-900">{userName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            fill={i < rev.rating ? 'currentColor' : 'none'}
                            className="currentColor"
                          />
                        ))}
                      </div>
                      <span className="font-bold text-gray-900">{reviewTitle}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mb-2">
                      Reviewed on {new Date(reviewDate).toLocaleDateString()}
                      <span className="text-amazon-orange font-bold ml-2">Verified Purchase</span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed font-medium">{rev.comment}</p>

                    <div className="flex items-center gap-3 mt-3.5 text-xs text-gray-500">
                      <button className="px-5 py-1 border border-gray-300 rounded-md hover:bg-gray-100 font-semibold cursor-pointer text-[11px] text-gray-800 transition flex items-center gap-1.5 shadow-sm">
                        <ThumbsUp size={12} /> Helpful
                      </button>
                      <span className="text-gray-300">|</span>
                      <span className="hover:underline cursor-pointer font-semibold">Report</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-500 italic text-center py-6 text-xs">
              No product feedback submitted yet. Be the first to review!
            </div>
          )}

          {/* Write Review Form */}
          <form onSubmit={handleReviewSubmit} className="bg-neutral-50/50 border border-gray-200 rounded p-5 flex flex-col gap-4 mt-4">
            <h4 className="font-bold text-sm text-gray-900 border-b pb-1.5 flex items-center gap-1.5">
              <MessageSquare size={16} /> Write a customer review
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Your Nickname</label>
                <input
                  type="text"
                  placeholder="e.g. HappyBuyer"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  className="amazon-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700">Star Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="amazon-input font-bold text-amber-500"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Good)</option>
                  <option value={3}>⭐⭐⭐ (3 - Average)</option>
                  <option value={2}>⭐⭐ (2 - Poor)</option>
                  <option value={1}>⭐ (1 - Terrible)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Review Title</label>
              <input
                type="text"
                placeholder="e.g. Outstanding quality, fast delivery!"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                className="amazon-input"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700">Written Review Comments</label>
              <textarea
                rows={4}
                placeholder="Write your review comments here. Your genuine comments are valued by other shoppers."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="amazon-input min-h-[80px]"
                required
              />
            </div>

            <button type="submit" className="amazon-btn-primary py-2 px-6 self-end text-xs font-bold">
              Submit Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
