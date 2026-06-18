import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { clearCart } from '../store/slices/cartSlice';
import { addOrder } from '../store/slices/ordersSlice';
import { addAddress, setSelectedAddress } from '../store/slices/authSlice';
import { Address, Order, OrderItem } from '../../../shared/types';
import {
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentUser, selectedAddressId } = useAppSelector((state) => state.auth);
  const { items: cartItems, couponCode, couponPercentage, discountValue } = useAppSelector(
    (state) => state.cart
  );

  // Router check
  if (cartItems.length === 0) {
    navigate('/cart');
  }

  // Steps active state (1: Address, 2: Payment, 3: Review)
  const [activeStep, setActiveStep] = useState(1);

  // Address form fields
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressName, setAddressName] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressZip, setAddressZip] = useState('');
  const [addressPhone, setAddressPhone] = useState('');

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cod'>('stripe');

  // Simulated Stripe Elements
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Calculations
  const getDiscountedPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100);
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + getDiscountedPrice(item.product.price, item.product.discountPercentage) * item.quantity,
    0
  );

  const freeShippingLimit = 35;
  const isFreeShipping = subtotal >= freeShippingLimit;
  const shippingCost = isFreeShipping ? 0 : 5.99;

  const couponDiscount =
    couponCode === 'SHOPMART20'
      ? subtotal * (couponPercentage / 100)
      : couponCode === 'SAVE10'
      ? Math.min(subtotal, discountValue)
      : 0;

  const tax = (subtotal - couponDiscount) * 0.08;
  const total = subtotal - couponDiscount + shippingCost + tax;

  const activeAddress = currentUser?.addresses.find((a) => a.id === selectedAddressId);

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !addressName.trim() ||
      !addressStreet.trim() ||
      !addressCity.trim() ||
      !addressState.trim() ||
      !addressZip.trim() ||
      !addressPhone.trim()
    ) {
      toast.error('Please fill in all address details.');
      return;
    }

    const payload: Omit<Address, 'id'> = {
      name: addressName,
      street: addressStreet,
      city: addressCity,
      state: addressState,
      zipCode: addressZip,
      country: 'United States',
      phone: addressPhone,
      isDefault: currentUser?.addresses.length === 0,
    };

    dispatch(addAddress(payload));
    toast.success('Address added successfully!');
    setShowAddressForm(false);

    // Reset fields
    setAddressName('');
    setAddressStreet('');
    setAddressCity('');
    setAddressState('');
    setAddressZip('');
    setAddressPhone('');
  };

  const handlePlaceOrder = () => {
    if (!activeAddress) {
      toast.error('Please select a shipping address.');
      setActiveStep(1);
      return;
    }

    if (paymentMethod === 'stripe') {
      if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
        toast.error('Please complete your credit card information.');
        setActiveStep(2);
        return;
      }
    }

    const orderItems: OrderItem[] = cartItems.map((item) => ({
      product: {
        id: item.product.id,
        title: item.product.title,
        price: getDiscountedPrice(item.product.price, item.product.discountPercentage),
        thumbnail: item.product.thumbnail,
      },
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
    }));

    const trackingCode = `1Z${Math.random().toString(36).substring(2, 11).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now().toString().substring(6)}`,
      items: orderItems,
      shippingAddress: activeAddress,
      paymentMethod,
      paymentDetails:
        paymentMethod === 'stripe'
          ? {
              cardBrand: cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
              last4: cardNumber.substring(cardNumber.length - 4) || '4242',
              transactionId: `tx_${Math.random().toString(36).substring(2, 10)}`,
            }
          : undefined,
      subtotal,
      shippingCost,
      tax,
      discount: couponDiscount,
      total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days default delivery
      trackingNumber: trackingCode,
    };

    dispatch(addOrder(newOrder));
    dispatch(clearCart());
    toast.success('Thank you! Your order has been placed.', {
      duration: 5000,
    });
    navigate('/orders');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-gray-800 font-sans select-none bg-amazon-gray-bg min-h-screen">
      {/* Checkout Minimal Header */}
      <div className="bg-white p-4 shadow-sm border-b flex items-center justify-between mb-6 rounded-sm">
        <Link to="/" className="flex items-baseline font-display">
          <span className="text-xl font-extrabold text-amazon-blue">Shop</span>
          <span className="text-xl font-bold text-amazon-orange">Mart</span>
        </Link>
        <h1 className="text-lg md:text-xl font-bold text-gray-700 font-display">
          Checkout (<span className="text-amazon-orange">{cartItems.length} items</span>)
        </h1>
        <Link to="/cart" className="text-xs text-blue-600 hover:text-amazon-orange hover:underline font-semibold">
          Return to Cart
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Checkout steps (9 columns) */}
        <div className="lg:col-span-9 flex flex-col gap-3">
          {/* Step 1: Shipping Address */}
          <div className="bg-white p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-sm md:text-base font-bold text-gray-950 flex items-center gap-2">
                <span className="bg-gray-800 text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px]">1</span>
                Shipping Address
              </h2>
              {activeStep !== 1 && activeAddress && (
                <button
                  onClick={() => setActiveStep(1)}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Change
                </button>
              )}
            </div>

            {activeStep === 1 ? (
              <div className="flex flex-col gap-4 text-xs">
                {/* Select Address */}
                {currentUser?.addresses && currentUser.addresses.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentUser.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => dispatch(setSelectedAddress(addr.id))}
                        className={`border rounded p-3 cursor-pointer hover:border-amazon-orange transition flex flex-col gap-0.5 ${
                          selectedAddressId === addr.id
                            ? 'border-amazon-orange bg-orange-50/20'
                            : 'border-gray-300'
                        }`}
                      >
                        <span className="font-bold text-gray-900">{addr.name}</span>
                        <span>{addr.street}</span>
                        <span>{addr.city}, {addr.state} {addr.zipCode}</span>
                        <span className="text-gray-500 mt-1">{addr.phone}</span>
                        {selectedAddressId === addr.id && (
                          <span className="text-amazon-orange font-bold text-[9px] mt-1">✓ Selected Address</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new address accordion */}
                <div className="border-t border-gray-100 pt-3 mt-1">
                  {!showAddressForm ? (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="text-blue-600 hover:text-amazon-orange font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      <Plus size={14} /> Add a new delivery address
                    </button>
                  ) : (
                    <form onSubmit={handleAddNewAddress} className="flex flex-col gap-3 max-w-lg mt-2">
                      <h3 className="font-bold text-gray-900 border-b pb-1">Enter a new address</h3>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-gray-600">Full Name</label>
                        <input
                          type="text"
                          required
                          value={addressName}
                          onChange={(e) => setAddressName(e.target.value)}
                          className="amazon-input"
                          placeholder="e.g. John Doe"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-gray-600">Street Address</label>
                        <input
                          type="text"
                          required
                          value={addressStreet}
                          onChange={(e) => setAddressStreet(e.target.value)}
                          className="amazon-input"
                          placeholder="Street Address, Apt number"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="font-bold text-gray-600">City</label>
                          <input
                            type="text"
                            required
                            value={addressCity}
                            onChange={(e) => setAddressCity(e.target.value)}
                            className="amazon-input"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-bold text-gray-600">State</label>
                          <input
                            type="text"
                            required
                            value={addressState}
                            onChange={(e) => setAddressState(e.target.value)}
                            className="amazon-input"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="font-bold text-gray-600">ZIP Code</label>
                          <input
                            type="text"
                            required
                            value={addressZip}
                            onChange={(e) => setAddressZip(e.target.value)}
                            className="amazon-input"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-gray-600">Phone Number</label>
                        <input
                          type="text"
                          required
                          value={addressPhone}
                          onChange={(e) => setAddressPhone(e.target.value)}
                          className="amazon-input"
                          placeholder="For delivery updates"
                        />
                      </div>

                      <div className="flex gap-2 justify-end mt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
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
                </div>

                {/* Continue button */}
                <button
                  onClick={() => {
                    if (!selectedAddressId) {
                      toast.error('Please choose or enter a delivery address.');
                      return;
                    }
                    setActiveStep(2);
                  }}
                  className="mt-4 bg-amazon-gold hover:bg-amazon-gold-hover text-gray-900 border border-amazon-dark-gold py-1.5 px-6 font-bold rounded cursor-pointer self-start flex items-center gap-1 transition"
                >
                  Use this address <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="text-xs text-gray-700">
                {activeAddress ? (
                  <div>
                    <span className="font-bold text-gray-950 block">{activeAddress.name}</span>
                    <span>{activeAddress.street}, {activeAddress.city}, {activeAddress.state} {activeAddress.zipCode}</span>
                  </div>
                ) : (
                  <span className="italic text-gray-400">No address selected</span>
                )}
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white p-5 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-sm md:text-base font-bold text-gray-950 flex items-center gap-2">
                <span className="bg-gray-800 text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px]">2</span>
                Payment Method
              </h2>
              {activeStep !== 2 && activeStep > 2 && (
                <button
                  onClick={() => setActiveStep(2)}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Change
                </button>
              )}
            </div>

            {activeStep === 2 ? (
              <div className="flex flex-col gap-4 text-xs text-gray-800">
                {/* Method Radios */}
                <div className="flex flex-col gap-3">
                  <label className="flex items-start gap-2 border border-gray-200 p-3 rounded cursor-pointer hover:bg-gray-50 transition">
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === 'stripe'}
                      onChange={() => setPaymentMethod('stripe')}
                      className="accent-amazon-orange h-4 w-4 mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-gray-900 flex items-center gap-1.5">
                        <CreditCard size={14} className="text-gray-500" /> Credit/Debit Card (Stripe Test)
                      </span>
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        Test payments securely via Stripe gateway simulator. Use code "4242" repeatedly.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 border border-gray-200 p-3 rounded cursor-pointer hover:bg-gray-50 transition">
                    <input
                      type="radio"
                      name="payment-method"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-amazon-orange h-4 w-4 mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-gray-900">Cash on Delivery (COD)</span>
                      <span className="text-[10px] text-gray-500 block mt-0.5">
                        Pay in cash upon delivery to your doorstep.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Stripe Simulated Credit Card Form */}
                {paymentMethod === 'stripe' && (
                  <div className="bg-gray-50 border border-gray-200 rounded p-4 flex flex-col gap-3 max-w-md mt-2">
                    <h3 className="font-bold text-gray-900 border-b pb-1 flex items-center gap-1">
                      <CreditCard size={14} className="text-amazon-orange" /> Stripe Card Details
                    </h3>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-gray-600">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="amazon-input"
                        placeholder="e.g. JOHN DOE"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-gray-600">Card Number (Simulate)</label>
                      <input
                        type="text"
                        required
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => {
                          // Allow digits only
                          const cleanVal = e.target.value.replace(/\D/g, '');
                          // Format 4242 4242 4242 4242
                          const formatted = cleanVal.replace(/(.{4})/g, '$1 ').trim();
                          setCardNumber(formatted);
                        }}
                        className="amazon-input font-mono tracking-wider"
                        placeholder="4242 4242 4242 4242"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-gray-600">Expires (MM/YY)</label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => {
                            const clean = e.target.value.replace(/\D/g, '');
                            if (clean.length > 2) {
                              setCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2, 4)}`);
                            } else {
                              setCardExpiry(clean);
                            }
                          }}
                          className="amazon-input text-center"
                          placeholder="MM/YY"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-gray-600">CVV / CVC</label>
                        <input
                          type="text"
                          required
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                          className="amazon-input text-center font-mono password"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Continue button */}
                <button
                  onClick={() => {
                    if (paymentMethod === 'stripe' && (!cardNumber || !cardExpiry || !cardCvv || !cardName)) {
                      toast.error('Please enter complete credit card data.');
                      return;
                    }
                    setActiveStep(3);
                  }}
                  className="mt-4 bg-amazon-gold hover:bg-amazon-gold-hover text-gray-900 border border-amazon-dark-gold py-1.5 px-6 font-bold rounded cursor-pointer self-start flex items-center gap-1 transition"
                >
                  Use this payment method <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <div className="text-xs text-gray-700 font-semibold capitalize flex items-center gap-1.5">
                {paymentMethod === 'stripe' ? (
                  <>
                    <CreditCard size={13} className="text-gray-500" />
                    <span>Stripe Card ending in {cardNumber.slice(-4) || '4242'}</span>
                  </>
                ) : (
                  <span>Cash on Delivery (COD)</span>
                )}
              </div>
            )}
          </div>

          {/* Step 3: Items & Review */}
          <div className="bg-white p-5 shadow-sm border border-gray-200">
            <div className="flex items-center border-b pb-3 mb-4">
              <h2 className="text-sm md:text-base font-bold text-gray-950 flex items-center gap-2">
                <span className="bg-gray-800 text-white rounded-full h-5 w-5 flex items-center justify-center text-[10px]">3</span>
                Items and Delivery Details
              </h2>
            </div>

            {activeStep === 3 && (
              <div className="flex flex-col gap-4 text-xs">
                {/* List items */}
                <div className="flex flex-col gap-3">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                      <img src={item.product.thumbnail} alt={item.product.title} className="h-12 w-12 object-contain bg-white border p-0.5 rounded shrink-0" />
                      <div className="flex-grow min-w-0">
                        <span className="font-bold text-gray-900 block truncate">{item.product.title}</span>
                        <span className="text-[10px] text-gray-500 block">
                          Qty: {item.quantity} {item.selectedColor ? `| Color: ${item.selectedColor}` : ''} {item.selectedSize ? `| Size: ${item.selectedSize}` : ''}
                        </span>
                      </div>
                      <span className="font-bold text-gray-950 shrink-0">
                        ${(getDiscountedPrice(item.product.price, item.product.discountPercentage) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Estimate speed banner */}
                <div className="bg-orange-50 border border-orange-100 rounded p-3 flex flex-col gap-1">
                  <span className="text-amazon-orange font-bold text-sm font-display">Fast Delivery Estimated</span>
                  <span className="text-gray-600 leading-relaxed">
                    Logistics tracking shows courier delivery scheduled to take place in <span className="font-bold text-gray-800">3 Business Days</span>.
                  </span>
                </div>

                {/* Place Order CTA */}
                <button
                  onClick={handlePlaceOrder}
                  className="bg-amazon-orange hover:bg-orange-500 text-white border border-orange-600 py-2.5 px-8 font-bold rounded cursor-pointer self-start transition text-center shadow active:bg-orange-700"
                >
                  Place your order
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout Subtotal Summary Drawer (3 columns) */}
        <div className="lg:col-span-3 flex flex-col gap-4 sticky top-24">
          <div className="bg-white p-5 shadow-sm border border-gray-200 flex flex-col gap-4 text-xs">
            {/* Action Place Order Button (Only enabled when ready) */}
            <button
              onClick={handlePlaceOrder}
              className="w-full bg-amazon-orange hover:bg-orange-500 text-white border border-orange-600 py-2.5 rounded font-bold cursor-pointer transition text-center text-xs shadow"
            >
              Place your order
            </button>
            <p className="text-[10px] text-gray-500 text-center leading-relaxed">
              By placing your order, you agree to ShopMart's conditions of use and privacy notice.
            </p>

            <div className="border-t border-gray-200 pt-3 flex flex-col gap-2">
              <h3 className="font-bold text-gray-900 text-sm">Order Summary</h3>

              <div className="flex justify-between text-gray-600 mt-1">
                <span>Items Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {couponCode && (
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>Coupon Discount:</span>
                  <span>-${couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping & handling:</span>
                <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Tax (8%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-red-700 border-t pt-2 mt-2">
                <span>Order Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Delivery address display summary */}
            {activeAddress && (
              <div className="border-t border-gray-100 pt-3">
                <span className="font-bold text-gray-900 block mb-1">Shipping to:</span>
                <span className="text-gray-600 block">{activeAddress.name}</span>
                <span className="text-gray-600 block truncate">{activeAddress.street}</span>
                <span className="text-gray-600 block">{activeAddress.city}, {activeAddress.state}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-gray-600 text-[10px] mt-1 border-t pt-3.5">
              <ShieldCheck size={14} className="text-gray-500 shrink-0" />
              <span>Stripe Test Mode active.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
