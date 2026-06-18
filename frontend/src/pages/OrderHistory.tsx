import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { cancelOrder, returnOrder } from '../store/slices/ordersSlice';
import { Order } from '../../../shared/types';
import {
  Package,
  FileText,
  Search,
  Truck,
  AlertCircle,
  X,
  Printer,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const OrderHistory: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const orders = useAppSelector((state) => state.orders.orders);

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeInvoice, setActiveInvoice] = useState<Order | null>(null);
  const [activeTracker, setActiveTracker] = useState<Order | null>(null);

  const handleCancelOrder = (id: string) => {
    dispatch(cancelOrder(id));
    toast.success('Your order has been cancelled.');
  };

  const handleReturnOrder = (id: string) => {
    dispatch(returnOrder(id));
    toast.success('Return request submitted successfully. Check your email for shipping labels.');
  };

  // Filter orders
  const filteredOrders = orders.filter((o) =>
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.items.some((item) => item.product.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'shipped':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'out_for_delivery':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'delivered':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'returned':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Step calculations for tracking bar
  const getTrackingStep = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 1;
      case 'shipped':
        return 2;
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0; // cancelled/returned
    }
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-gray-800 font-sans select-none bg-amazon-gray-bg min-h-screen">
      {/* Page Title & Search */}
      <div className="bg-white p-5 shadow-sm border border-gray-200 rounded-sm mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Your Orders</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track, cancel, return, or view invoice receipts.</p>
        </div>

        {/* Filter input */}
        <div className="relative max-w-sm w-full h-9">
          <input
            type="text"
            placeholder="Search all orders or items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="amazon-input pr-10 h-full"
          />
          <Search size={16} className="absolute right-3 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white text-center py-16 p-6 shadow-sm border border-gray-200 flex flex-col items-center gap-3">
          <Package size={56} className="text-gray-300" />
          <h3 className="font-bold text-lg text-gray-700">No orders found.</h3>
          <p className="text-xs text-gray-400 max-w-xs">If you recently placed an order, it may take a few seconds to process and show up here.</p>
          <button
            onClick={() => navigate('/')}
            className="amazon-btn-primary px-6 py-2 text-xs font-semibold mt-2"
          >
            Go to Store
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden text-xs text-gray-700">
              {/* Order Card Header */}
              <div className="bg-gray-100 border-b border-gray-200 px-5 py-3.5 grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] text-gray-600 font-semibold uppercase tracking-wider">
                <div>
                  <span className="block text-[9px] text-gray-500 font-bold mb-0.5">Order Placed</span>
                  <span className="text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-gray-500 font-bold mb-0.5">Total Price</span>
                  <span className="text-gray-800 font-bold">${order.total.toFixed(2)}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-gray-500 font-bold mb-0.5">Ship To</span>
                  <span className="text-blue-600 hover:underline cursor-pointer">{order.shippingAddress.name}</span>
                </div>
                <div className="text-left md:text-right flex flex-col">
                  <span className="block text-[9px] text-gray-500 font-bold mb-0.5">Order ID</span>
                  <span className="text-gray-800 font-mono tracking-wide">{order.id}</span>
                </div>
              </div>

              {/* Order Card Content */}
              <div className="p-5 flex flex-col md:flex-row gap-6 justify-between items-start">
                <div className="flex-1 flex flex-col gap-4 w-full">
                  {/* Status Banner */}
                  <div className={`border rounded px-3 py-1.5 font-bold self-start ${getStatusColor(order.status)}`}>
                    Status: <span className="capitalize">{order.status.replace(/_/g, ' ')}</span>
                  </div>

                  {/* Items list */}
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <img src={item.product.thumbnail} alt={item.product.title} className="h-16 w-16 bg-white border p-1 rounded shrink-0 object-contain" />
                      <div className="flex-grow min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.product.title}</h4>
                        <div className="text-gray-500 mt-1 flex flex-wrap items-center gap-3">
                          <span>Qty: <span className="font-bold text-gray-800">{item.quantity}</span></span>
                          {item.selectedColor && (
                            <span>Color: <span className="font-bold text-gray-800">{item.selectedColor}</span></span>
                          )}
                          {item.selectedSize && (
                            <span>Size: <span className="font-bold text-gray-800">{item.selectedSize}</span></span>
                          )}
                          <span>Price: <span className="font-bold text-gray-800">${item.product.price.toFixed(2)}</span></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions sidebar */}
                <div className="shrink-0 flex flex-col gap-2.5 w-full md:w-52 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                  <button
                    onClick={() => setActiveTracker(order)}
                    className="w-full amazon-btn-primary font-bold py-2 rounded text-center shadow-sm"
                  >
                    Track Package
                  </button>
                  <button
                    onClick={() => setActiveInvoice(order)}
                    className="w-full amazon-btn-secondary font-semibold py-2 rounded text-center flex items-center justify-center gap-1 shadow-sm"
                  >
                    <FileText size={13} /> View Invoice
                  </button>

                  {/* Cancel / Return triggers */}
                  {(order.status === 'pending' || order.status === 'shipped') && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="w-full py-2 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded cursor-pointer transition text-center mt-1 text-[11px]"
                    >
                      Cancel Order
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <button
                      onClick={() => handleReturnOrder(order.id)}
                      className="w-full py-2 border border-orange-200 text-orange-700 hover:bg-orange-50 font-bold rounded cursor-pointer transition text-center mt-1 text-[11px]"
                    >
                      Return Items
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Track Package Drawer Modal */}
      {activeTracker && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 text-xs text-gray-800">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-xl overflow-hidden animate-slide-up">
            <div className="bg-gray-100 border-b px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base font-display flex items-center gap-2">
                <Truck size={18} className="text-amazon-orange" /> Courier Logistics Tracker
              </h3>
              <button onClick={() => setActiveTracker(null)} className="text-gray-500 hover:text-gray-800 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
                <div>
                  <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px] mb-0.5">Tracking Number</span>
                  <span className="font-mono text-gray-900 font-bold text-sm tracking-wide">{activeTracker.trackingNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase tracking-wider block text-[9px] mb-0.5">Scheduled Delivery</span>
                  <span className="font-bold text-gray-900 text-sm">{new Date(activeTracker.deliveryDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Progress Bar steps */}
              {activeTracker.status === 'cancelled' || activeTracker.status === 'returned' ? (
                <div className="text-center py-6 text-red-600 font-bold text-sm bg-red-50 border border-red-200 rounded flex items-center justify-center gap-1.5">
                  <AlertCircle size={16} /> Order has been {activeTracker.status}
                </div>
              ) : (
                <div className="relative py-8 flex items-center justify-between px-6">
                  {/* Background Bar Line */}
                  <div className="absolute left-10 right-10 top-[48px] h-1 bg-gray-200 -z-10" />
                  {/* Active Bar Line */}
                  <div
                    className="absolute left-10 top-[48px] h-1 bg-green-600 -z-10 transition-all duration-500"
                    style={{
                      width: `${
                        getTrackingStep(activeTracker.status) === 1
                          ? 0
                          : getTrackingStep(activeTracker.status) === 2
                          ? 33
                          : getTrackingStep(activeTracker.status) === 3
                          ? 66
                          : 100
                      }%`,
                    }}
                  />

                  {/* Step Nodes */}
                  {['Ordered', 'Shipped', 'Out Delivery', 'Delivered'].map((step, idx) => {
                    const stepNum = idx + 1;
                    const isActive = stepNum <= getTrackingStep(activeTracker.status);
                    return (
                      <div key={step} className="flex flex-col items-center gap-2 text-center">
                        <div
                          className={`h-7 w-7 rounded-full flex items-center justify-center border-2 font-bold ${
                            isActive
                              ? 'bg-green-600 border-green-700 text-white shadow-sm'
                              : 'bg-white border-gray-300 text-gray-400'
                          }`}
                        >
                          {isActive ? '✓' : stepNum}
                        </div>
                        <span className={`font-bold mt-1 text-[10px] uppercase tracking-wider ${isActive ? 'text-green-700' : 'text-gray-400'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 flex justify-end">
                <button
                  onClick={() => setActiveTracker(null)}
                  className="amazon-btn-primary px-5 py-2 font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice modal */}
      {activeInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 text-xs text-gray-800 print:bg-white print:p-0">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-2xl overflow-hidden print:shadow-none print:w-full print:rounded-none">
            {/* Modal actions panel (hidden in prints) */}
            <div className="bg-gray-100 border-b px-6 py-4 flex justify-between items-center print:hidden">
              <h3 className="font-bold text-sm font-display flex items-center gap-1.5">
                <Printer size={16} /> Receipt Invoice Details
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={printInvoice}
                  className="bg-gray-800 text-white font-bold py-1 px-3.5 rounded hover:bg-black transition cursor-pointer flex items-center gap-1"
                >
                  <Printer size={12} /> Print
                </button>
                <button onClick={() => setActiveInvoice(null)} className="text-gray-500 hover:text-gray-800 cursor-pointer">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Print Body sheet */}
            <div className="p-8 flex flex-col gap-6 font-mono text-[11px]">
              <div className="flex justify-between border-b pb-4 border-gray-200">
                <div>
                  <h2 className="text-base font-extrabold tracking-tight font-sans text-gray-900">SHOPMART RETAIL, INC.</h2>
                  <span>410 Terry Ave N, Seattle, WA 98109</span>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-sm">INVOICE RECEIPT</h3>
                  <span>Date: {new Date(activeInvoice.createdAt).toLocaleDateString()}</span>
                  <span className="block mt-0.5">Order ID: {activeInvoice.id}</span>
                </div>
              </div>

              {/* Delivery and payment data */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 border rounded">
                <div>
                  <span className="font-bold block border-b pb-1 text-gray-600 mb-1">Delivered to:</span>
                  <span className="font-bold text-gray-900 block">{activeInvoice.shippingAddress.name}</span>
                  <span>{activeInvoice.shippingAddress.street}</span>
                  <span>{activeInvoice.shippingAddress.city}, {activeInvoice.shippingAddress.state} {activeInvoice.shippingAddress.zipCode}</span>
                  <span className="block mt-1">Phone: {activeInvoice.shippingAddress.phone}</span>
                </div>
                <div>
                  <span className="font-bold block border-b pb-1 text-gray-600 mb-1">Payment Method:</span>
                  <span className="capitalize font-bold text-gray-900 block">{activeInvoice.paymentMethod.replace(/_/g, ' ')}</span>
                  {activeInvoice.paymentDetails && (
                    <div className="mt-1">
                      <span>Card: {activeInvoice.paymentDetails.cardBrand} Ending {activeInvoice.paymentDetails.last4}</span>
                      <span className="block text-[9px] text-gray-500 mt-0.5">Transaction ID: {activeInvoice.paymentDetails.transactionId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items breakdown Table */}
              <div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-gray-300 font-bold uppercase text-[9px] text-gray-500">
                      <th className="pb-2">Product Description</th>
                      <th className="pb-2 text-center">Qty</th>
                      <th className="pb-2 text-right">Price</th>
                      <th className="pb-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeInvoice.items.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2.5 font-bold">
                          {item.product.title}
                          {item.selectedColor || item.selectedSize ? (
                            <span className="block font-normal text-[10px] text-gray-500 mt-0.5">
                              Options: {item.selectedColor ? `Color: ${item.selectedColor} ` : ''}{item.selectedSize ? `Size: ${item.selectedSize}` : ''}
                            </span>
                          ) : null}
                        </td>
                        <td className="py-2.5 text-center font-bold">{item.quantity}</td>
                        <td className="py-2.5 text-right font-bold">${item.product.price.toFixed(2)}</td>
                        <td className="py-2.5 text-right font-bold">${(item.product.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Table info */}
              <div className="flex flex-col items-end gap-1.5 border-t-2 pt-4 border-gray-200/50">
                <div className="flex justify-between w-48">
                  <span>Subtotal:</span>
                  <span className="font-bold">${activeInvoice.subtotal.toFixed(2)}</span>
                </div>
                {activeInvoice.discount > 0 && (
                  <div className="flex justify-between w-48 text-green-700">
                    <span>Discount:</span>
                    <span className="font-bold">-${activeInvoice.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between w-48">
                  <span>Shipping:</span>
                  <span className="font-bold">{activeInvoice.shippingCost === 0 ? 'FREE' : `$${activeInvoice.shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between w-48">
                  <span>Tax (8%):</span>
                  <span className="font-bold">${activeInvoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-48 border-t pt-2 text-sm text-red-700 font-extrabold">
                  <span>Order Total:</span>
                  <span>${activeInvoice.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-4 text-center text-gray-400 text-[10px]">
                Thank you for shopping at ShopMart. This is a computer-generated transaction receipt invoice.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
