import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import {
  removeFromCart,
  updateQuantity,
  saveForLater,
  moveToCart,
  removeSavedForLater,
  applyCoupon,
  removeCoupon,
} from '../store/slices/cartSlice';
import { Trash2, Heart, BadgePercent, ShieldCheck, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { items: cartItems, savedForLater, couponCode, couponPercentage, discountValue } = useAppSelector(
    (state) => state.cart
  );

  const totalCartQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const [couponInput, setCouponInput] = useState('');

  const getDiscountedPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100);
  };

  // Calculations
  const subtotal = cartItems.reduce(
    (acc, item) => acc + getDiscountedPrice(item.product.price, item.product.discountPercentage) * item.quantity,
    0
  );

  // Free shipping threshold is $35
  const freeShippingLimit = 35;
  const isFreeShipping = subtotal >= freeShippingLimit;
  const amountNeededForFreeShipping = (freeShippingLimit - subtotal).toFixed(2);
  const shippingCost = isFreeShipping || cartItems.length === 0 ? 0 : 5.99;

  // Coupon Discount
  const couponDiscount =
    couponCode === 'SHOPMART20'
      ? subtotal * (couponPercentage / 100)
      : couponCode === 'SAVE10'
      ? Math.min(subtotal, discountValue)
      : 0;

  const tax = (subtotal - couponDiscount) * 0.08; // 8% sales tax
  const total = subtotal - couponDiscount + shippingCost + tax;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    dispatch(applyCoupon(couponInput));
    const normalizedInput = couponInput.toUpperCase();
    if (normalizedInput === 'SHOPMART20' || normalizedInput === 'SAVE10') {
      toast.success(`Coupon "${normalizedInput}" applied successfully!`);
    } else {
      toast.error('Invalid coupon code. Try "SHOPMART20" (20% Off) or "SAVE10" ($10 Off).');
    }
  };

  const handleQtyChange = (id: number, color: string | undefined, size: string | undefined, val: number) => {
    dispatch(updateQuantity({ id, color, size, quantity: val }));
  };

  const handleRemoveItem = (id: number, color: string | undefined, size: string | undefined) => {
    dispatch(removeFromCart({ id, color, size }));
    toast.success('Item removed from cart.');
  };

  const handleSaveForLater = (id: number, color: string | undefined, size: string | undefined) => {
    dispatch(saveForLater({ id, color, size }));
    toast.success('Item moved to Save For Later.');
  };

  const handleMoveToCart = (id: number, color: string | undefined, size: string | undefined) => {
    dispatch(moveToCart({ id, color, size }));
    toast.success('Item moved back to Cart.');
  };

  const handleRemoveSaved = (id: number, color: string | undefined, size: string | undefined) => {
    dispatch(removeSavedForLater({ id, color, size }));
    toast.success('Saved item deleted.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-gray-800 font-sans select-none bg-amazon-gray-bg min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Cart items list (9 columns) */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          <div className="bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 border-b pb-3 mb-4 font-display">Shopping Cart</h1>

            {cartItems.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center gap-4">
                <ShoppingCart size={64} className="text-gray-300" />
                <h2 className="text-lg font-bold text-gray-700">Your ShopMart Cart is empty.</h2>
                <p className="text-xs text-gray-500 max-w-xs">Your shopping cart lives to serve. Give it purpose — fill it with electronics, clothing, books, and deals!</p>
                <Link to="/" className="amazon-btn-primary px-6 py-2 text-xs font-semibold">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Free shipping banner */}
                {isFreeShipping ? (
                  <div className="text-xs text-green-700 font-semibold border-b border-gray-100 pb-3 flex items-center gap-1.5">
                    <span className="bg-green-700 text-white rounded-full p-0.5 text-[9px] font-bold h-4 w-4 flex items-center justify-center">✓</span>
                    Your order qualifies for FREE Shipping. Choose this option at checkout.
                  </div>
                ) : (
                  <div className="text-xs text-gray-600 border-b border-gray-100 pb-3">
                    Add <span className="text-red-700 font-bold">${amountNeededForFreeShipping}</span> more of eligible items to your order to qualify for <span className="font-bold">FREE Shipping</span>.
                  </div>
                )}

                {/* Items loop */}
                {cartItems.map((item, idx) => {
                  const itemPrice = getDiscountedPrice(item.product.price, item.product.discountPercentage);
                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row gap-4 py-4 border-b border-gray-200 last:border-b-0 text-xs text-gray-700"
                    >
                      {/* Image */}
                      <div
                        onClick={() => navigate(`/product/${item.product.id}`)}
                        className="h-28 w-28 p-1 bg-white border border-gray-200 rounded flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
                      >
                        <img src={item.product.thumbnail} alt={item.product.title} className="max-h-full object-contain" />
                      </div>

                      {/* Details */}
                      <div className="flex-grow flex flex-col gap-1">
                        <h3
                          onClick={() => navigate(`/product/${item.product.id}`)}
                          className="font-bold text-base text-gray-900 leading-tight hover:text-amazon-orange hover:underline cursor-pointer"
                        >
                          {item.product.title}
                        </h3>
                        <span className="text-[10px] text-gray-500 font-semibold">by {item.product.seller}</span>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {item.product.isPrime && (
                            <span className="bg-[#00a8e9] text-white font-extrabold text-[8px] px-1 py-0.5 rounded">PRIME</span>
                          )}
                          {item.product.stock < 5 && item.product.stock > 0 && (
                            <span className="text-red-700 font-bold">Only {item.product.stock} left in stock - order soon.</span>
                          )}
                        </div>

                        {/* Colors / Sizes chosen */}
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-gray-500">
                          {item.selectedColor && (
                            <span>Color: <span className="font-bold text-gray-800">{item.selectedColor}</span></span>
                          )}
                          {item.selectedSize && (
                            <span>Size: <span className="font-bold text-gray-800">{item.selectedSize}</span></span>
                          )}
                        </div>

                        {/* Controls line */}
                        <div className="flex items-center gap-4 mt-auto pt-4 text-blue-600 font-semibold">
                          <div className="flex items-center gap-1.5 bg-gray-100 border rounded px-1.5 py-0.5 text-gray-800">
                            <span className="text-[11px]">Qty:</span>
                            <select
                              value={item.quantity}
                              onChange={(e) => handleQtyChange(item.product.id, item.selectedColor, item.selectedSize, Number(e.target.value))}
                              className="bg-transparent font-bold cursor-pointer text-xs focus:outline-none"
                            >
                              {Array.from({ length: Math.min(10, item.product.stock || 10) }).map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1}
                                </option>
                              ))}
                            </select>
                          </div>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleRemoveItem(item.product.id, item.selectedColor, item.selectedSize)}
                            className="hover:underline cursor-pointer flex items-center gap-0.5 hover:text-red-600 transition"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleSaveForLater(item.product.id, item.selectedColor, item.selectedSize)}
                            className="hover:underline cursor-pointer flex items-center gap-0.5 hover:text-amazon-orange transition"
                          >
                            <Heart size={13} /> Save for later
                          </button>
                        </div>
                      </div>

                      {/* Item Price subtotal */}
                      <div className="text-right shrink-0">
                        <span className="text-lg font-bold text-gray-900">${(itemPrice * item.quantity).toFixed(2)}</span>
                        {item.product.discountPercentage > 0 && (
                          <div className="text-[10px] text-red-700 font-semibold">
                            Save ${( (item.product.price - itemPrice) * item.quantity ).toFixed(2)} (-{item.product.discountPercentage.toFixed(0)}%)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div className="border-t border-gray-200 pt-4 flex justify-end text-sm">
                  <span className="text-gray-700">
                    Subtotal ({totalCartQuantity} items):{' '}
                    <span className="text-lg font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Saved For Later Shelf */}
          {savedForLater.length > 0 && (
            <div className="bg-white p-6 shadow-sm mt-2">
              <h3 className="font-bold text-lg font-display text-gray-900 border-b pb-2.5 mb-4">Saved for Later ({savedForLater.length} items)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {savedForLater.map((item, idx) => (
                  <div key={idx} className="border border-gray-200 p-4 rounded flex flex-col justify-between bg-neutral-50/50">
                    <div className="flex gap-3">
                      <div className="h-16 w-16 p-1 bg-white border rounded shrink-0 overflow-hidden flex items-center justify-center">
                        <img src={item.product.thumbnail} alt={item.product.title} className="max-h-full object-contain" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-bold text-xs text-gray-900 truncate">{item.product.title}</h4>
                        <span className="text-[11px] font-bold text-gray-800 mt-1 block">
                          ${getDiscountedPrice(item.product.price, item.product.discountPercentage).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200/50">
                      <button
                        onClick={() => handleMoveToCart(item.product.id, item.selectedColor, item.selectedSize)}
                        className="amazon-btn-primary py-1 px-3 text-[10px] font-bold flex-1"
                      >
                        Move to Cart
                      </button>
                      <button
                        onClick={() => handleRemoveSaved(item.product.id, item.selectedColor, item.selectedSize)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded border border-transparent hover:border-red-200 transition shrink-0"
                        title="Delete saved item"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Checkout Widget summaries (3 columns) */}
        {cartItems.length > 0 && (
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="bg-white p-5 shadow-sm border border-gray-100 flex flex-col gap-4 text-xs">
              <div>
                <span className="text-sm text-gray-700">Subtotal:</span>
                <span className="text-xl font-bold text-gray-900 ml-1.5">${subtotal.toFixed(2)}</span>
              </div>

              {/* Coupon Application widget */}
              <form onSubmit={handleApplyCoupon} className="border-t border-b border-gray-100 py-3.5 flex flex-col gap-2">
                <span className="font-bold text-gray-700 flex items-center gap-1">
                  <BadgePercent size={14} className="text-amazon-orange" /> Have a Promo Coupon?
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="amazon-input flex-grow"
                  />
                  <button
                    type="submit"
                    className="amazon-btn-secondary py-1.5 px-3 font-semibold cursor-pointer shrink-0 text-xs"
                  >
                    Apply
                  </button>
                </div>
                {couponCode && (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 p-1.5 rounded text-[11px] font-semibold text-green-700 mt-1">
                    <span>Active: {couponCode} (-${couponDiscount.toFixed(2)})</span>
                    <button
                      type="button"
                      onClick={() => dispatch(removeCoupon())}
                      className="text-red-700 hover:text-red-900 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </form>

              {/* Order total list summary */}
              <div className="flex flex-col gap-2 border-b border-gray-100 pb-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {couponCode && (
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>Discount:</span>
                    <span>-${couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Cost:</span>
                  <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-red-700 border-t pt-2 mt-1">
                  <span>Order Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-amazon-gold hover:bg-amazon-gold-hover border border-amazon-dark-gold py-2 rounded-md font-bold text-gray-900 cursor-pointer shadow text-center active:bg-amber-600 transition text-xs"
              >
                Proceed to Checkout
              </button>

              <div className="flex items-center gap-1.5 text-gray-600 text-[10px] mt-1 border-t pt-3">
                <ShieldCheck size={14} className="text-gray-500 shrink-0" />
                <span>Security verified Stripe transaction.</span>
              </div>
            </div>

            {/* Help block */}
            <div className="bg-white p-4 border border-gray-200 text-xs">
              <span className="font-bold text-gray-900 block mb-1">Coupon codes to test:</span>
              <ul className="list-disc list-inside text-gray-600 flex flex-col gap-1">
                <li><span className="font-bold text-gray-800">SHOPMART20</span> - 20% discount</li>
                <li><span className="font-bold text-gray-800">SAVE10</span> - $10 flat discount</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
