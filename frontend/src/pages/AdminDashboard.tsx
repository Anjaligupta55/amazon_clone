import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { addProduct, updateProduct, deleteProduct, updateBanners, sanitizeBanners } from '../store/slices/productsSlice';
import { updateOrderStatus } from '../store/slices/ordersSlice';
import { Product, Order, Coupon } from '../../../shared/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line as LineChart, Doughnut as DoughnutChart } from 'react-chartjs-2';
import {
  Plus,
  Trash2,
  Edit,
  TrendingUp,
  Package,
  ShoppingCart,
  Briefcase,
  Image as ImageIcon,
  Percent,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { items: catalogProducts, customItems, banners: rawBanners } = useAppSelector((state) => state.products);
  const banners = sanitizeBanners(rawBanners);
  const orders = useAppSelector((state) => state.orders.orders);
  const { currentUser } = useAppSelector((state) => state.auth);

  // Validate admin permission
  if (currentUser?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-16 bg-white border border-red-200 p-6 rounded shadow text-center text-xs">
        <h2 className="text-red-700 font-bold text-base font-display">Access Denied</h2>
        <p className="text-gray-500 mt-2">You do not have administrative clearance to access this console.</p>
        <button onClick={() => navigate('/')} className="mt-4 amazon-btn-primary px-5 py-2 font-semibold">
          Return to Storefront
        </button>
      </div>
    );
  }

  // Active Tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'banners' | 'coupons'>('analytics');

  // Product CRUD Modal States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodTitle, setProdTitle] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodCat, setProdCat] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodDiscount, setProdDiscount] = useState(0);
  const [prodStock, setProdStock] = useState(10);
  const [prodThumb, setProdThumb] = useState('');
  const [prodDesc, setProdDesc] = useState('');

  // Banner CRUD States
  const [newBannerUrl, setNewBannerUrl] = useState('');

  // Coupon CRUD States
  const [coupons, setCoupons] = useState<Coupon[]>([
    { code: 'SHOPMART20', discountType: 'percentage', value: 20, expiryDate: '2026-12-31' },
    { code: 'SAVE10', discountType: 'fixed', value: 10, expiryDate: '2026-12-31' },
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponVal, setNewCouponVal] = useState(5);

  const allProducts = [...customItems, ...catalogProducts];

  // Calculations
  const totalRevenue = orders.reduce((acc, o) => (o.status !== 'cancelled' ? acc + o.total : acc), 0);
  const activeOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'shipped').length;

  // Chart configuration
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Monthly Revenue ($)',
        data: [12000, 19000, 32000, 5000, totalRevenue + 12000, totalRevenue + 18000],
        borderColor: '#f08804',
        backgroundColor: 'rgba(240, 136, 4, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const categoryShareData = {
    labels: ['Electronics', 'Beauty', 'Fashion', 'Home Decor'],
    datasets: [
      {
        data: [45, 15, 25, 15],
        backgroundColor: ['#131921', '#febd69', '#37475a', '#f08804'],
        hoverOffset: 4,
      },
    ],
  };

  // Product CRUD functions
  const openAddProduct = () => {
    setEditingProduct(null);
    setProdTitle('');
    setProdBrand('');
    setProdCat('smartphones');
    setProdPrice(9.99);
    setProdDiscount(5);
    setProdStock(25);
    setProdThumb('https://picsum.photos/600/600');
    setProdDesc('');
    setShowProductModal(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProdTitle(p.title);
    setProdBrand(p.brand);
    setProdCat(p.category);
    setProdPrice(p.price);
    setProdDiscount(p.discountPercentage);
    setProdStock(p.stock);
    setProdThumb(p.thumbnail);
    setProdDesc(p.description);
    setShowProductModal(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle.trim() || !prodBrand.trim() || !prodThumb.trim()) {
      toast.error('Please fill in required fields.');
      return;
    }

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        title: prodTitle,
        brand: prodBrand,
        category: prodCat,
        price: prodPrice,
        discountPercentage: prodDiscount,
        stock: prodStock,
        thumbnail: prodThumb,
        description: prodDesc,
      };
      dispatch(updateProduct(updated));
      toast.success('Product updated successfully.');
    } else {
      const added: Product = {
        id: Date.now() + 1000, // Custom range
        title: prodTitle,
        brand: prodBrand,
        category: prodCat,
        price: prodPrice,
        discountPercentage: prodDiscount,
        stock: prodStock,
        thumbnail: prodThumb,
        images: [prodThumb],
        reviews: [],
        rating: 5,
        isPrime: prodPrice > 20,
        deliveryDays: 3,
        seller: 'ShopMart retail',
        specifications: {
          Brand: prodBrand,
          Model: `SM-${Date.now()}`,
          Warranty: '1 Year ShopMart warranty',
        },
        description: prodDesc,
      };
      dispatch(addProduct(added));
      toast.success('Product added successfully.');
    }
    setShowProductModal(false);
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
      toast.success('Product deleted.');
    }
  };

  // Order status mutations
  const handleStatusChange = (orderId: string, status: Order['status']) => {
    dispatch(updateOrderStatus({ orderId, status }));
    toast.success(`Order status updated to: ${status}`);
  };

  // Banners updates
  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerUrl.trim()) return;

    dispatch(updateBanners([...banners, newBannerUrl]));
    toast.success('Store banner added.');
    setNewBannerUrl('');
  };

  const handleDeleteBanner = (idx: number) => {
    const updated = banners.filter((_, i) => i !== idx);
    dispatch(updateBanners(updated));
    toast.success('Store banner removed.');
  };

  // Coupon updates
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    const added: Coupon = {
      code: newCouponCode.toUpperCase().trim(),
      discountType: newCouponType,
      value: newCouponVal,
      expiryDate: '2026-12-31',
    };
    setCoupons([...coupons, added]);
    toast.success('Promo coupon generated.');
    setNewCouponCode('');
  };

  const handleDeleteCoupon = (code: string) => {
    setCoupons(coupons.filter((c) => c.code !== code));
    toast.success('Promo coupon deleted.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-gray-800 font-sans select-none bg-amazon-gray-bg min-h-screen flex flex-col md:flex-row gap-5 items-start">
      {/* Sidebar Controls tab (3 columns) */}
      <div className="w-full md:w-56 bg-white border rounded shadow-sm shrink-0 flex flex-col text-xs text-gray-600 overflow-hidden">
        <div className="bg-amazon-blue text-white p-4 font-bold flex items-center gap-2">
          <Briefcase size={15} /> Admin Console
        </div>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-3 border-b border-gray-100 font-bold hover:bg-gray-50 flex items-center gap-2 transition cursor-pointer text-left ${
            activeTab === 'analytics' ? 'text-amazon-orange bg-orange-50/20 border-r-4 border-r-amazon-orange' : ''
          }`}
        >
          <TrendingUp size={14} /> Analytics & Reports
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-3 border-b border-gray-100 font-bold hover:bg-gray-50 flex items-center gap-2 transition cursor-pointer text-left ${
            activeTab === 'products' ? 'text-amazon-orange bg-orange-50/20 border-r-4 border-r-amazon-orange' : ''
          }`}
        >
          <Package size={14} /> Products CRUD Database
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-3 border-b border-gray-100 font-bold hover:bg-gray-50 flex items-center gap-2 transition cursor-pointer text-left ${
            activeTab === 'orders' ? 'text-amazon-orange bg-orange-50/20 border-r-4 border-r-amazon-orange' : ''
          }`}
        >
          <ShoppingCart size={14} /> Placed Orders Flow
        </button>

        <button
          onClick={() => setActiveTab('banners')}
          className={`px-4 py-3 border-b border-gray-100 font-bold hover:bg-gray-50 flex items-center gap-2 transition cursor-pointer text-left ${
            activeTab === 'banners' ? 'text-amazon-orange bg-orange-50/20 border-r-4 border-r-amazon-orange' : ''
          }`}
        >
          <ImageIcon size={14} /> Store Banners
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-3 border-b border-gray-100 font-bold hover:bg-gray-50 flex items-center gap-2 transition cursor-pointer text-left ${
            activeTab === 'coupons' ? 'text-amazon-orange bg-orange-50/20 border-r-4 border-r-amazon-orange' : ''
          }`}
        >
          <Percent size={14} /> Promo Coupons
        </button>
      </div>

      {/* Main Panel Content (9 columns) */}
      <div className="flex-grow bg-white border rounded shadow-sm p-6 w-full text-xs text-gray-700 min-h-[500px]">
        {activeTab === 'analytics' && (
          /* TAB 1: Analytics */
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-bold font-display border-b pb-2 text-gray-900">Analytics Dashboard</h2>

            {/* Scoreboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border rounded p-4 bg-gradient-to-br from-neutral-50 to-amber-50/30 flex flex-col gap-1 shadow-sm">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Sales</span>
                <span className="text-xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</span>
              </div>
              <div className="border rounded p-4 bg-gradient-to-br from-neutral-50 to-orange-50/30 flex flex-col gap-1 shadow-sm">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Orders</span>
                <span className="text-xl font-bold text-gray-900">{activeOrdersCount}</span>
              </div>
              <div className="border rounded p-4 bg-gradient-to-br from-neutral-50 to-blue-50/30 flex flex-col gap-1 shadow-sm">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Customers</span>
                <span className="text-xl font-bold text-gray-900">12,482</span>
              </div>
              <div className="border rounded p-4 bg-gradient-to-br from-neutral-50 to-purple-50/30 flex flex-col gap-1 shadow-sm">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Products Count</span>
                <span className="text-xl font-bold text-gray-900">{allProducts.length}</span>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-4">
              <div className="lg:col-span-8 border rounded p-4 flex flex-col gap-3">
                <h3 className="font-bold text-gray-800">Monthly Sales Revenue</h3>
                <div className="h-64">
                  <LineChart data={salesData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
              <div className="lg:col-span-4 border rounded p-4 flex flex-col gap-3">
                <h3 className="font-bold text-gray-800">Sales By Category</h3>
                <div className="h-64 flex items-center justify-center">
                  <DoughnutChart data={categoryShareData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          /* TAB 2: Products Database CRUD */
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-lg font-bold font-display text-gray-900">Products Catalog CRUD</h2>
              <button
                onClick={openAddProduct}
                className="bg-amazon-gold hover:bg-amazon-gold-hover border border-amazon-dark-gold py-1.5 px-4 font-bold rounded flex items-center gap-1 cursor-pointer transition shadow-sm text-[11px]"
              >
                <Plus size={14} /> Add Product
              </button>
            </div>

            {/* Data Grid table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-700">
                <thead>
                  <tr className="bg-gray-100 font-bold text-gray-600 border-b uppercase text-[9px] tracking-wider">
                    <th className="py-2.5 px-3">Thumb</th>
                    <th className="py-2.5 px-3">Title & Brand</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-3 text-center">Stock</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allProducts.slice(0, 15).map((p) => (
                    <tr key={p.id} className="border-b hover:bg-neutral-50/50">
                      <td className="py-2 px-3">
                        <img src={p.thumbnail} alt={p.title} className="h-8 w-8 object-contain bg-white border p-0.5 rounded" />
                      </td>
                      <td className="py-2 px-3 font-semibold text-gray-900">
                        <span className="block font-bold">{p.title}</span>
                        <span className="text-[10px] text-gray-400 font-medium">Brand: {p.brand}</span>
                      </td>
                      <td className="py-2 px-3 capitalize text-gray-500 font-semibold">{p.category.replace('-', ' ')}</td>
                      <td className="py-2 px-3 text-right font-bold">${p.price.toFixed(2)}</td>
                      <td className={`py-2 px-3 text-center font-bold ${p.stock < 5 ? 'text-red-700' : 'text-gray-900'}`}>{p.stock}</td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-2.5 text-blue-600">
                          <button
                            onClick={() => openEditProduct(p)}
                            className="hover:text-amazon-orange cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allProducts.length > 15 && (
                <div className="text-center text-gray-400 py-3 mt-1 font-semibold italic">
                  Showing first 15 of {allProducts.length} items. Fetching next rows on pagination scroll.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          /* TAB 3: Placed Orders flow */
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold font-display border-b pb-2 text-gray-900">Placed Customer Orders</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-700">
                <thead>
                  <tr className="bg-gray-100 font-bold text-gray-600 border-b uppercase text-[9px] tracking-wider">
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3">Total Amount</th>
                    <th className="py-2.5 px-3">Active Status</th>
                    <th className="py-2.5 px-3 text-center">Transition Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b hover:bg-neutral-50/50">
                      <td className="py-3 px-3 font-mono font-bold text-gray-900">{o.id}</td>
                      <td className="py-3 px-3">
                        <span className="font-bold block">{o.shippingAddress.name}</span>
                        <span className="text-[10px] text-gray-400">{o.shippingAddress.city}, {o.shippingAddress.state}</span>
                      </td>
                      <td className="py-3 px-3 font-bold">${o.total.toFixed(2)}</td>
                      <td className="py-3 px-3 font-bold capitalize">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          o.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : o.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {o.status !== 'cancelled' && o.status !== 'delivered' && o.status !== 'returned' ? (
                          <select
                            value={o.status}
                            onChange={(e) => handleStatusChange(o.id, e.target.value as Order['status'])}
                            className="border bg-white rounded font-bold px-1.5 py-0.5 cursor-pointer text-gray-800 text-[10px]"
                          >
                            <option value="pending">Mark Pending</option>
                            <option value="shipped">Mark Shipped</option>
                            <option value="out_for_delivery">Mark Out Delivery</option>
                            <option value="delivered">Mark Delivered</option>
                          </select>
                        ) : (
                          <span className="text-gray-400 italic">No transitions available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'banners' && (
          /* TAB 4: Banners CRUD */
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold font-display border-b pb-2 text-gray-900 font-display">Manage Store Banners</h2>

            <form onSubmit={handleAddBanner} className="flex gap-2 max-w-xl">
              <input
                type="text"
                placeholder="Paste new banner image URL"
                value={newBannerUrl}
                onChange={(e) => setNewBannerUrl(e.target.value)}
                className="amazon-input flex-grow"
                required
              />
              <button type="submit" className="amazon-btn-primary px-5 py-1.5 shrink-0 font-bold">
                Add Banner
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {banners.map((url, idx) => (
                <div key={idx} className="border rounded p-3 relative bg-neutral-50/50 flex flex-col gap-2">
                  <img src={url} alt={`banner-${idx}`} className="h-32 object-cover object-center rounded border" />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-gray-400 font-mono truncate max-w-[180px]">{url}</span>
                    <button
                      onClick={() => handleDeleteBanner(idx)}
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

        {activeTab === 'coupons' && (
          /* TAB 5: Coupon CRUD */
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold font-display border-b pb-2 text-gray-900 font-display">Manage Promo Coupons</h2>

            <form onSubmit={handleAddCoupon} className="flex flex-wrap gap-3 items-end max-w-xl border p-4 rounded bg-gray-50/50">
              <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
                <label className="font-bold text-gray-700">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. EXTRA15"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  className="amazon-input"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-w-[100px]">
                <label className="font-bold text-gray-700">Discount Type</label>
                <select
                  value={newCouponType}
                  onChange={(e) => setNewCouponType(e.target.value as any)}
                  className="amazon-input"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed ($)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 w-24">
                <label className="font-bold text-gray-700">Value</label>
                <input
                  type="number"
                  value={newCouponVal}
                  onChange={(e) => setNewCouponVal(Number(e.target.value))}
                  className="amazon-input"
                  required
                />
              </div>

              <button type="submit" className="amazon-btn-primary py-2 px-5 font-bold shrink-0">
                Create Coupon
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {coupons.map((c) => (
                <div key={c.code} className="border p-4 rounded bg-white flex items-center justify-between shadow-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono font-bold text-sm text-amazon-orange tracking-wide">{c.code}</span>
                    <span className="text-gray-500 font-semibold">
                      Type: {c.discountType === 'percentage' ? `${c.value}% Off` : `$${c.value} Off`}
                    </span>
                    <span className="text-[10px] text-gray-400">Expires: {c.expiryDate}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCoupon(c.code)}
                    className="text-red-600 hover:text-red-800 font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product CRUD creation Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 text-xs text-gray-800">
          <div className="bg-white rounded-md shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            <form onSubmit={handleProductSubmit}>
              <div className="bg-gray-100 border-b px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold text-base font-display">
                  {editingProduct ? 'Edit Catalog Product' : 'Add New Catalog Product'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-gray-700">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={prodTitle}
                      onChange={(e) => setProdTitle(e.target.value)}
                      className="amazon-input"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-gray-700">Brand Name *</label>
                    <input
                      type="text"
                      required
                      value={prodBrand}
                      onChange={(e) => setProdBrand(e.target.value)}
                      className="amazon-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-gray-700">Category Department *</label>
                    <select
                      value={prodCat}
                      onChange={(e) => setProdCat(e.target.value)}
                      className="amazon-input capitalize"
                    >
                      <option value="smartphones">Smartphones</option>
                      <option value="laptops">Laptops</option>
                      <option value="womens-clothing">Womens Clothing</option>
                      <option value="mens-shoes">Mens Shoes</option>
                      <option value="beauty">Beauty Care</option>
                      <option value="groceries">Groceries</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-gray-700">Thumbnail URL *</label>
                    <input
                      type="text"
                      required
                      value={prodThumb}
                      onChange={(e) => setProdThumb(e.target.value)}
                      className="amazon-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-gray-700">Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      className="amazon-input text-right"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-gray-700">Discount (%)</label>
                    <input
                      type="number"
                      required
                      value={prodDiscount}
                      onChange={(e) => setProdDiscount(Number(e.target.value))}
                      className="amazon-input text-right"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-gray-700">Stock Count</label>
                    <input
                      type="number"
                      required
                      value={prodStock}
                      onChange={(e) => setProdStock(Number(e.target.value))}
                      className="amazon-input text-right"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-700">Product Description</label>
                  <textarea
                    rows={3}
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    className="amazon-input min-h-[60px]"
                  />
                </div>
              </div>

              <div className="bg-gray-100 border-t px-6 py-3.5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="amazon-btn-secondary px-4 py-1.5"
                >
                  Cancel
                </button>
                <button type="submit" className="amazon-btn-primary px-4 py-1.5 font-bold">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
