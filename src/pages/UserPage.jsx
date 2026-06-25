import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import {
  Search, ShoppingCart, CheckCircle, AlertCircle, Sparkles,
  Trash2, X, Minus, Plus, ArrowRight, Tag, ShoppingBag,
  Star, ClipboardList, ChevronDown, ChevronUp, Clock, MapPin, Save, IndianRupee, Phone, Mail
} from 'lucide-react';

// ── Order Status Stepper ───────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: 'processing', label: 'Order Placed',  icon: Clock,    color: 'slate'   },
  { key: 'confirmed',  label: 'Confirmed',      icon: CheckCircle, color: 'teal' },
  { key: 'delivered',  label: 'Delivered',      icon: Star,     color: 'emerald' },
];

const STATUS_ORDER = ['processing', 'confirmed', 'delivered'];

const colorMap = {
  slate:   { ring: 'ring-slate-400',   bg: 'bg-slate-400',   text: 'text-slate-400',   light: 'bg-transparent',   border: 'border-white/10'   },
  teal:    { ring: 'ring-indigo-500',    bg: 'bg-indigo-500',    text: 'text-indigo-600',    light: 'bg-indigo-50',    border: 'border-indigo-200'    },
  emerald: { ring: 'ring-emerald-500', bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200' },
  rose:    { ring: 'ring-rose-500',    bg: 'bg-rose-500',    text: 'text-rose-600',    light: 'bg-rose-50',    border: 'border-rose-200'    },
};

function OrderStatusStepper({ order }) {
  const [expanded, setExpanded] = useState(false);
  const currentIdx = STATUS_ORDER.indexOf(order.status);

  if (order.status === 'cancelled') {
    return (
      <div className="mt-3">
        <div className="bg-rose-50 border border-rose-100 text-rose-700 rounded-md px-3.5 py-2.5 flex items-center gap-2 text-xs font-medium">
          <X className="h-4 w-4 shrink-0" />
          <span>This order was cancelled by the owner.</span>
        </div>
        {/* Status history toggle */}
        {order.statusHistory?.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-400 font-medium transition"
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {expanded ? 'Hide' : 'View'} tracking history
            </button>
            {expanded && (
              <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-white/10">
                {order.statusHistory.map((h, i) => {
                  const step = STATUS_STEPS.find(s => s.key === h.status);
                  const c = step ? colorMap[step.color] : colorMap.rose;
                  return (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${c.bg}`} />
                      <div>
                        <p className={`text-xs font-bold ${c.text}`}>{h.label || 'Cancelled'}</p>
                        <p className="text-[10px] text-slate-500">{h.date} at {h.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3">
      {/* Step bubbles */}
      <div className="flex items-center gap-0">
        {STATUS_STEPS.map((step, idx) => {
          const isDone    = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          const c         = colorMap[step.color];
          const Icon      = step.icon;
          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-md flex items-center justify-center ring-2 transition-all duration-300 ${
                  isDone ? `${c.bg} ring-transparent shadow-sm` : 'bg-[#1E293B] ring-slate-200'
                }`}>
                  <Icon className={`h-4 w-4 ${isDone ? 'text-white' : 'text-slate-500'}`} />
                </div>
                <span className={`text-[10px] font-bold mt-1 ${isCurrent ? c.text : isDone ? 'text-slate-400' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
              {idx < STATUS_STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-1 rounded transition-all duration-500 mb-4 ${idx < currentIdx ? 'bg-gradient-to-r from-blue-400 to-amber-400' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Status history toggle */}
      {order.statusHistory?.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-400 font-medium transition"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? 'Hide' : 'View'} tracking history
          </button>
          {expanded && (
            <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-white/10">
              {order.statusHistory.map((h, i) => {
                const step = STATUS_STEPS.find(s => s.key === h.status);
                const c = step ? colorMap[step.color] : colorMap.blue;
                return (
                  <div key={i} className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${c.bg}`} />
                    <div>
                      <p className={`text-xs font-bold ${c.text}`}>{h.label}</p>
                      <p className="text-[10px] text-slate-500">{h.date} at {h.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── My Orders Panel ────────────────────────────────────────────────────────
function MyOrders({ userId }) {
  const { orders } = useProducts();
  const myOrders = orders.filter(o => o.userId === userId);

  if (myOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="w-20 h-20 bg-[#1E293B] rounded-md flex items-center justify-center">
          <ClipboardList className="h-10 w-10 text-slate-300" />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-200">No orders yet</p>
          <p className="text-sm text-slate-500 mt-1">Place an order from the store to track it here.</p>
        </div>
      </div>
    );
  }

  const statusBadge = (status) => {
    const map = {
      processing: 'bg-[#1E293B] text-slate-400 border-white/10',
      confirmed:  'bg-indigo-100 text-indigo-700 border-indigo-200',
      delivered:  'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled:  'bg-rose-100 text-rose-700 border-rose-200',
    };
    return map[status] || 'bg-[#1E293B] text-slate-400 border-white/10';
  };

  const statusLabel = (status) => {
    const map = {
      processing: '⏳ Order Placed — Awaiting Confirmation',
      confirmed:  '✅ Order Confirmed',
      delivered:  '📦 Delivered',
      cancelled:  '❌ Cancelled',
    };
    return map[status] || status;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">My Orders</h2>
        <span className="text-xs font-medium px-3 py-1 bg-[#1E293B] text-slate-400 rounded-md">{myOrders.length} order{myOrders.length !== 1 ? 's' : ''}</span>
      </div>

      {myOrders.map((order) => (
        <div key={order.id} className="bg-[#111827] rounded-md border border-white/5 shadow-sm p-4 space-y-4 hover:shadow-md transition">
          {/* Order header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-bold text-slate-100 text-base leading-snug">{order.productName}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">Order ID: {order.id}</p>
              <p className="text-xs text-slate-500">{order.orderDate} at {order.orderTime}</p>
            </div>
            <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-md border ${statusBadge(order.status)}`}>
              {statusLabel(order.status)}
            </span>
          </div>

          {/* Order details */}
          <div className="grid grid-cols-3 gap-2 bg-[#1E293B] p-3 rounded-md border border-white/5 text-center">
            <div className="p-1">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Billed</p>
              <p className="text-sm sm:text-base font-bold text-slate-100 mt-0.5">{order.quantity}</p>
            </div>
            <div className="p-1">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Dispatched</p>
              <p className="text-sm sm:text-base font-bold text-slate-100 mt-0.5">{order.totalDispatched || order.quantity}</p>
            </div>
            <div className="p-1">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Free</p>
              <p className={`text-sm sm:text-base font-bold mt-0.5 ${order.freeUnits > 0 ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}>
                {order.freeUnits > 0 ? `+${order.freeUnits} ` : '0'}
              </p>
            </div>
          </div>

          {/* Price & Invoice Action Row */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Invoice Total</p>
              <p className="text-base sm:text-lg font-bold text-indigo-700 font-mono mt-0.5">₹{order.totalPrice?.toFixed(2)}</p>
            </div>
            {order.status !== 'processing' && order.status !== 'cancelled' && (
              <Link to={`/invoice/${order.id}`} 
                 className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-md flex items-center gap-1.5 transition shadow-sm">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download Invoice
              </Link>
            )}
          </div>

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <div className="bg-transparent border border-white/5 rounded-md p-3 flex gap-3">
              <MapPin className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-200">{order.deliveryAddress.name} ({order.deliveryAddress.phone})</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {order.deliveryAddress.line1}, {order.deliveryAddress.city} {order.deliveryAddress.state ? `, ${order.deliveryAddress.state}` : ''} - {order.deliveryAddress.pin}
                </p>
              </div>
            </div>
          )}

          {/* Offer / discount info */}
          {(order.offerText || order.discountPercentage > 0) && (
            <div className="flex flex-wrap gap-2">
              {order.offerText && (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md">
                  <Tag className="h-3 w-3" /> Deal: {order.offerText}
                </span>
              )}
              {order.discountPercentage > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 px-2.5 py-1 rounded-md">
                  {order.discountPercentage}% Invoice Discount Applied
                </span>
              )}
            </div>
          )}

          {/* Status stepper */}
          <OrderStatusStepper order={order} />
        </div>
      ))}
    </div>
  );
}

// ── Address Modal ──────────────────────────────────────────────────────────
const EMPTY_ADDRESS = { line1: '', city: '', state: '', pin: '' };

function AddressModal({ currentUser, onConfirm, onCancel }) {
  const addrKey = `pharmacy_address_${currentUser?.id}`;
  const saved   = (() => { try { return JSON.parse(localStorage.getItem(addrKey)); } catch { return null; } })();

  const [form, setForm]         = useState(saved || EMPTY_ADDRESS);
  const [saveAddr, setSaveAddr] = useState(true);
  const [error, setError]       = useState('');
  const [usingSaved, setUsingSaved] = useState(!!saved);

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.line1.trim()) return setError('Address line is required.');
    if (!form.city.trim())  return setError('City is required.');
    if (!form.pin.trim())   return setError('PIN code is required.');

    if (saveAddr) localStorage.setItem(addrKey, JSON.stringify(form));
    
    // Merge with user's name and phone from login
    onConfirm({
      ...form,
      name: currentUser?.name || 'Retailer',
      phone: currentUser?.phone || 'N/A'
    });
  };

  const inputCls = 'w-full px-3.5 py-2.5 rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm text-slate-100';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#111827]/50 backdrop-blur-sm" 
        onClick={onCancel} 
      />

      {/* Modal Content */}
      <div className="relative bg-[#111827] rounded-md shadow-sm w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-gradient-to-r from-indigo-600 to-indigo-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#111827] rounded-md flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Delivery Address</h2>
              <p className="text-indigo-200 text-xs">
                {saved ? 'Using your saved address — edit if needed' : 'Enter where to deliver this order'}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="text-white/70 hover:text-white p-1.5 rounded-md transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Saved address banner */}
        {saved && usingSaved && (
          <div className="mx-6 mt-4 bg-indigo-50 border border-indigo-200 rounded-md px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-indigo-800">📍 Saved Address Loaded</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{saved.line1}, {saved.city} - {saved.pin}</p>
            </div>
            <button onClick={() => { setForm(EMPTY_ADDRESS); setUsingSaved(false); }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline shrink-0">
              Use new
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Address Line *</label>
            <input type="text" name="line1" value={form.line1} onChange={handleChange} className={inputCls} placeholder="Shop / Street / Colony name" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">City *</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} className={inputCls} placeholder="Chennai" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">State</label>
              <input type="text" name="state" value={form.state} onChange={handleChange} className={inputCls} placeholder="TN" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">PIN *</label>
              <input type="text" name="pin" value={form.pin} onChange={handleChange} className={inputCls} placeholder="600001" maxLength={6} />
            </div>
          </div>

          {/* Save checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer pt-1 select-none">
            <input type="checkbox" checked={saveAddr} onChange={e => setSaveAddr(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-zinc-400 rounded focus:ring-indigo-500" />
            <span className="text-xs font-medium text-slate-400">
              Save this address for future orders
            </span>
          </label>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium px-4 py-2.5 rounded-md">{error}</div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onCancel}
              className="flex-1 py-2.5 rounded-md border border-white/10 text-slate-400 font-medium text-sm transition">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition">
              <ArrowRight className="h-4 w-4" /> Confirm & Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main UserPage ──────────────────────────────────────────────────────────
export default function UserPage() {
  const { products, orders, payments, brands, categories, cart, addToCart, updateCartQty, removeFromCart, checkoutCart, notifications, subscribeToRestock } = useProducts();
  const { currentUser } = useAuth();

  const [search, setSearch]           = useState('');
  const [sortBy, setSortBy]           = useState('name-asc');
  const [brandFilter, setBrandFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dealsOnly, setDealsOnly]     = useState(false);
  const [isCartOpen, setIsCartOpen]   = useState(false);
  const [activeTab, setActiveTab]     = useState('store');
  const [toast, setToast]             = useState(null);
  const [showAddrModal, setShowAddrModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // Filter out products whose brand was deleted by the owner
  const validProducts = products.filter(p => brands.includes(p.brand));

  const uniqueBrands = ['All', ...new Set(validProducts.map(p => p.brand).filter(Boolean))];

  const filteredProducts = validProducts.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (brandFilter !== 'All' && (p.brand || 'Unbranded') !== brandFilter) return false;
    if (categoryFilter !== 'All' && (p.category || 'Uncategorized') !== categoryFilter) return false;
    if (dealsOnly && !(p.isOfferActive && (p.discountPercentage > 0 || p.offerText))) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
    
    const priceA = a.isOfferActive && a.discountPercentage > 0 ? a.price * (1 - a.discountPercentage / 100) : a.price;
    const priceB = b.isOfferActive && b.discountPercentage > 0 ? b.price * (1 - b.discountPercentage / 100) : b.price;
    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    return 0;
  });

  const activeOfferProducts = validProducts.filter(
    (p) => p.isOfferActive && (p.discountPercentage > 0 || p.offerText)
  );

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const handleAddToCart = (product) => {
    const res = addToCart(product.id);
    if (res && !res.success) {
      showToast(res.message, 'error');
    } else {
      showToast(`${product.name} added to cart!`, 'success');
    }
  };

  const handleUpdateQty = (productId, newQty) => {
    const res = updateCartQty(productId, newQty);
    if (res && !res.success) showToast(res.message, 'error');
  };

  // Open address modal first; actual checkout runs after address is confirmed
  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowAddrModal(true);
  };

  const handleConfirmAddress = async (address) => {
    setShowAddrModal(false);
    const res = await checkoutCart({ ...currentUser, deliveryAddress: address });
    if (res.success) {
      showToast('Order placed! Track it in My Orders.', 'success');
      setIsCartOpen(false);
      setActiveTab('orders');
    } else {
      showToast(res.message || 'Checkout failed.', 'error');
    }
  };

  const totalCartItemsPaid       = cart.reduce((s, i) => s + i.quantity, 0);
  const totalCartItemsDispatched = cart.reduce((s, i) => s + i.totalDispatched, 0);

  const cartSubtotal = cart.reduce((sum, item) => {
    const product   = products.find((p) => p.id === item.id) || item;
    const hasDisc   = product.isOfferActive && product.discountPercentage > 0;
    const finalPrice = hasDisc
      ? Number((product.price * (1 - product.discountPercentage / 100)).toFixed(2))
      : product.price;
    return sum + finalPrice * item.quantity;
  }, 0);

  const cartSavings = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id) || item;
    if (product.isOfferActive && product.discountPercentage > 0) {
      return sum + product.price * (product.discountPercentage / 100) * item.quantity;
    }
    return sum;
  }, 0);

  const myOrdersList = orders.filter(o => o.userId === currentUser?.id);
  const myPaymentsList = payments.filter(p => p.userId === currentUser?.id);
  const totalLifetimeDue = myOrdersList.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
  const totalLifetimePaid = myPaymentsList.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const remainingOutstanding = totalLifetimeDue - totalLifetimePaid;

  const myOrdersCount = myOrdersList.length;

  return (
    <div className="space-y-4 animate-fadeIn relative">

      {/* Address Modal */}
      {showAddrModal && (
        <AddressModal
          currentUser={currentUser}
          onConfirm={handleConfirmAddress}
          onCancel={() => setShowAddrModal(false)}
        />
      )}

      {/* Toast */}
        {toast && (
          <div 
            key="toast"
            className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-[#111827] text-white px-5 py-4 rounded-md shadow-sm border border-slate-800"
          >
            {toast.type === 'success'
              ? <CheckCircle className="text-emerald-400 h-6 w-6 shrink-0" />
              : <AlertCircle className="text-rose-400 h-6 w-6 shrink-0" />}
            <p className="text-sm font-semibold text-slate-100">{toast.message}</p>
          </div>
        )}

      {/* Floating Cart Button */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-md shadow-sm flex items-center justify-center transition-all duration-300 hover:scale-105"
      >
        <div className="relative">
          <ShoppingCart className="h-6 w-6" />
          {totalCartItemsPaid > 0 && (
            <span className="absolute -top-3.5 -right-3.5 bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-indigo-600 animate-bounce">
              {totalCartItemsPaid}
            </span>
          )}
        </div>
      </button>

      {/* Contact Owner Banner */}
      <div className="bg-[#111827] border border-white/10 px-5 py-3.5 rounded-md flex flex-wrap items-center justify-center sm:justify-start gap-4 shadow-sm">
        <span className="text-sm font-bold text-slate-200">Contact Owner:</span>
        <a href="tel:9440103869" className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100">
          <Phone className="h-4 w-4" /> 9440103869
        </a>
        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=himagiriprasadkambhampati@gmail.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100">
          <Mail className="h-4 w-4" /> himagiriprasadkambhampati@gmail.com
        </a>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 bg-[#111827] border border-white/5 shadow-sm p-1.5 rounded-md">
        <button
          onClick={() => setActiveTab('store')}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 rounded-md text-sm font-bold transition-all duration-200 ${
            activeTab === 'store'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-100 hover:bg-transparent'
          }`}
        >
          <ShoppingBag className="h-4 w-4 shrink-0" />
          <span>Store</span>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 rounded-md text-sm font-bold transition-all duration-200 ${
            activeTab === 'orders'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-100 hover:bg-transparent'
          }`}
        >
          <ClipboardList className="h-4 w-4 shrink-0" />
          <span><span className="hidden sm:inline">My </span>Orders</span>
          {myOrdersCount > 0 && (
            <span className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md ${
              activeTab === 'orders' ? 'bg-[#111827]/25 text-white' : 'bg-indigo-100 text-indigo-700'
            }`}>
              {myOrdersCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 rounded-md text-sm font-bold transition-all duration-200 ${
            activeTab === 'ledger'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-100 hover:bg-transparent'
          }`}
        >
          <IndianRupee className="h-4 w-4 shrink-0" />
          <span><span className="hidden sm:inline">My </span>Payments</span>
          {remainingOutstanding > 0 && (
            <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              activeTab === 'ledger' ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700'
            }`}>
              <span className="hidden sm:inline">Due: </span>₹{Math.round(remainingOutstanding)}
            </span>
          )}
        </button>
      </div>

      {/* ── STORE TAB ────────────────────────────────────────── */}
      {activeTab === 'store' && (
        <div className="space-y-4">


          {/* Search & Filters */}
          <div className="bg-[#111827] p-4 rounded-md border border-white/5 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search medicine catalog..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="flex-1 sm:flex-initial py-2.5 px-4 rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm text-slate-200 bg-[#111827] cursor-pointer"
                >
                  {uniqueBrands.map(b => <option className="bg-[#111827] text-slate-100" key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>)}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 sm:flex-initial py-2.5 px-4 rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm text-slate-200 bg-[#111827] cursor-pointer"
                >
                  <option className="bg-[#111827] text-slate-100" value="name-asc">A to Z</option>
                  <option className="bg-[#111827] text-slate-100" value="name-desc">Z to A</option>
                  <option className="bg-[#111827] text-slate-100" value="price-asc">Price: Low to High</option>
                  <option className="bg-[#111827] text-slate-100" value="price-desc">Price: High to Low</option>
                </select>

                <label className="flex-1 sm:flex-initial flex items-center justify-center gap-2 cursor-pointer py-2.5 px-4 rounded-md border border-white/10 hover:bg-transparent transition select-none bg-[#111827]">
                  <input type="checkbox" checked={dealsOnly} onChange={e => setDealsOnly(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-zinc-400 rounded focus:ring-indigo-500" />
                  <span className="text-sm font-bold text-slate-400">Deals</span>
                </label>

                {totalCartItemsPaid > 0 && (
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2.5 rounded-md text-sm font-bold transition shrink-0 sm:ml-auto"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Verify Order ({totalCartItemsPaid})
                  </button>
                )}
              </div>
            </div>
            
            {/* Category Pills */}
            <div className="flex overflow-x-auto gap-2 pt-2 pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
              <button
                onClick={() => setCategoryFilter('All')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  categoryFilter === 'All' ? 'bg-slate-800 text-white shadow-sm' : 'bg-[#111827] text-slate-400 border border-white/10 hover:bg-transparent'
                }`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${
                    categoryFilter === cat ? 'bg-slate-800 text-white shadow-sm' : 'bg-[#111827] text-slate-400 border border-white/10 hover:bg-transparent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-16 text-slate-500 bg-[#111827] rounded-md border border-dashed border-white/10">
                No products match your search.
              </div>
            ) : (
              filteredProducts.map((product) => {
                const hasDiscount   = product.isOfferActive && product.discountPercentage > 0;
                const finalPrice    = hasDiscount
                  ? Number((product.price * (1 - product.discountPercentage / 100)).toFixed(2))
                  : product.price;
                const isOutOfStock  = product.stockQuantity === 0;
                const hasOfferText  = product.isOfferActive && product.offerText;
                const cartItem      = cart.find((i) => i.id === product.id);
                const quantityInCart = cartItem ? cartItem.quantity : 0;
                const totalDispatched = cartItem ? cartItem.totalDispatched : 0;
                const freeQuantity   = totalDispatched - quantityInCart;

                return (
                  <div key={product.id} className="bg-[#111827] rounded-md border border-white/5 shadow-sm hover:shadow-md transition duration-200 overflow-hidden flex flex-col justify-between">
                    <div className="p-5 pb-2">
                      <div className="flex justify-between items-start gap-2">
                        {hasDiscount ? (
                          <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                            OFFER {product.discountPercentage}%
                          </span>
                        ) : <span />}
                        {hasOfferText && (
                          <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                            DEAL {product.offerText}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="px-5 py-2 flex-1">
                      <h3 className="text-lg font-bold text-slate-100 tracking-normal">{product.name}</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">{product.brand || 'Unbranded'}</p>
                      {hasOfferText && (
                        <div className="mt-1.5">
                          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md border border-indigo-100 uppercase">
                            Deal: {product.offerText}
                          </span>
                        </div>
                      )}
                      <div className="mt-3 flex items-baseline gap-2">
                        {hasDiscount ? (
                          <>
                            <span className="text-2xl font-bold text-slate-50">₹{finalPrice.toFixed(2)}</span>
                            <span className="text-sm font-medium text-slate-500 line-through">₹{product.price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-2xl font-bold text-slate-50">₹{product.price.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500">Available Stock:</span>
                        {isOutOfStock ? (
                          <span className="text-rose-500 bg-rose-50 px-2 py-0.5 rounded">Out of Stock</span>
                        ) : product.stockQuantity < 5 ? (
                          <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Only {product.stockQuantity} left</span>
                        ) : (
                          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{product.stockQuantity} in Stock</span>
                        )}
                      </div>
                      {quantityInCart > 0 && freeQuantity > 0 && (
                        <div className="mt-3.5 bg-emerald-50 border border-emerald-100 p-2.5 rounded-md text-center">
                          <p className="text-xs text-emerald-800 font-bold flex items-center justify-center gap-1.5">
                             DEAL APPLIED: +{freeQuantity} FREE Unit{freeQuantity > 1 ? 's' : ''}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            Receiving {totalDispatched} units total
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-5 pt-3">
                      {quantityInCart > 0 ? (
                        <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-md p-1">
                          <button onClick={() => handleUpdateQty(product.id, quantityInCart - 1)}
                            className="w-10 h-10 bg-[#111827] hover:bg-[#1E293B] rounded-md flex items-center justify-center text-indigo-700 font-bold transition shadow-sm border border-slate-150">
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-base font-bold text-indigo-900 w-10 text-center">{quantityInCart}</span>
                          <button onClick={() => handleUpdateQty(product.id, quantityInCart + 1)}
                            className="w-10 h-10 bg-[#111827] hover:bg-[#1E293B] rounded-md flex items-center justify-center text-indigo-700 font-bold transition shadow-sm border border-slate-150">
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ) : isOutOfStock ? (
                        (() => {
                          const isSubscribed = notifications.some(
                            n => n.user_id === currentUser?.id && n.title === 'Restock Subscription' && n.message === product.id
                          );
                          return (
                            <button
                              onClick={() => {
                                if (!isSubscribed) {
                                  subscribeToRestock(product.id, product.name);
                                  showToast('You will be notified when this item is restocked!', 'success');
                                }
                              }}
                              className={`w-full font-bold py-2.5 px-4 rounded-md transition duration-200 shadow-sm flex items-center justify-center gap-2 ${
                                isSubscribed
                                  ? 'bg-[#1E293B] text-slate-400 border border-white/10 cursor-default'
                                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                              }`}
                            >
                              {isSubscribed ? (
                                <span>Subscribed ✓</span>
                              ) : (
                                <span>Notify Me </span>
                              )}
                            </button>
                          );
                        })()
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full font-medium py-2.5 px-4 rounded-md transition duration-200 shadow-sm flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── MY ORDERS TAB ────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <MyOrders userId={currentUser?.id} />
      )}

      {/* ── MY PAYMENTS TAB ───────────────────────────────────── */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="bg-[#111827] p-4 rounded-md shadow-sm border border-white/5 flex justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100">My Payments</h2>
              <p className="text-xs text-slate-400 mt-1">Review your lifetime order totals, recorded payments, and outstanding balances.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#111827] p-4 rounded-md border border-rose-100 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-rose-50 text-rose-500 rounded-md"><IndianRupee className="h-8 w-8" /></div>
              <div>
                <p className="text-rose-600 text-sm font-bold uppercase tracking-wider">Outstanding Balance Due</p>
                <p className="text-3xl font-bold text-slate-100 mt-1">₹{remainingOutstanding.toFixed(2)}</p>
                <p className="text-xs text-slate-400 mt-1">Please pay to clear pending balance</p>
              </div>
            </div>
            <div className="bg-[#111827] p-4 rounded-md border border-indigo-100 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-indigo-50 text-indigo-500 rounded-md"><IndianRupee className="h-8 w-8" /></div>
              <div>
                <p className="text-indigo-600 text-sm font-bold uppercase tracking-wider">Total Paid to Date</p>
                <p className="text-3xl font-bold text-slate-100 mt-1">₹{totalLifetimePaid.toFixed(2)}</p>
                <p className="text-xs text-slate-400 mt-1">Manual payments confirmed by Owner</p>
              </div>
            </div>
            <div className="bg-[#111827] p-4 rounded-md border border-emerald-100 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-emerald-50 text-emerald-500 rounded-md"><CheckCircle className="h-8 w-8" /></div>
              <div>
                <p className="text-emerald-600 text-sm font-bold uppercase tracking-wider">Total Lifetime Purchases</p>
                <p className="text-3xl font-bold text-slate-100 mt-1">₹{totalLifetimeDue.toFixed(2)}</p>
                <p className="text-xs text-slate-400 mt-1">Lifetime total of placed orders</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] p-4 rounded-md border border-white/5 shadow-sm space-y-5">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <IndianRupee className="text-emerald-600" /> Transaction / Payment History
            </h2>
            {myPaymentsList.length === 0 ? (
              <div className="text-center py-10 text-slate-500 border border-dashed border-white/10 rounded-md">
                No payments have been recorded yet. Contact owner to record your payments.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border border-white/5">
                <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                  <thead className="bg-transparent text-slate-400 font-medium text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Date & Time</th>
                      <th className="px-5 py-3.5">Transaction ID</th>
                      <th className="px-5 py-3.5 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-200 font-medium">
                    {myPaymentsList.map((payment) => (
                      <tr key={payment.id} className="hover:bg-transparent transition">
                        <td className="px-5 py-4">
                          <div className="text-slate-100 font-bold">{payment.date}</div>
                          <div className="text-xs text-slate-500 font-medium">{payment.time || ''}</div>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-slate-400">{payment.id}</td>
                        <td className="px-5 py-4 text-right text-emerald-600 font-bold font-mono">
                          +₹{Number(payment.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CART DRAWER ──────────────────────────────────────── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-[#111827]/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
            <div className="w-screen max-w-md bg-[#111827] shadow-sm flex flex-col">

              {/* Drawer Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-transparent">
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="text-indigo-600 h-6 w-6" />
                  <h2 className="text-xl font-bold text-slate-50">Verify Order</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-1 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-400 transition">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Drawer Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 flex flex-col items-center gap-4">
                    <ShoppingBag className="h-16 w-16 text-slate-200" />
                    <div>
                      <p className="font-medium text-slate-400">Your cart is empty</p>
                      <p className="text-sm mt-1">Select items from the catalog.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => {
                      const hasDiscount = item.isOfferActive && item.discountPercentage > 0;
                      const finalUnitPrice = hasDiscount
                        ? Number((item.price * (1 - item.discountPercentage / 100)).toFixed(2))
                        : item.price;
                      const totalDispatched = item.totalDispatched || item.quantity;
                      const freeQuantity = totalDispatched - item.quantity;

                      return (
                        <div key={item.id} className="p-4 bg-transparent border border-white/5 rounded-md flex flex-col gap-3 hover:bg-transparent transition">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="font-bold text-slate-100">{item.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">Unit: ₹{item.price.toFixed(2)}</p>
                              {freeQuantity > 0 && (
                                <p className="text-xs text-emerald-600 font-bold mt-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-fit">
                                   +{freeQuantity} free unit{freeQuantity > 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-slate-500 hover:text-rose-500 p-1">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {item.isOfferActive && (item.offerText || item.discountPercentage > 0) && (
                            <div className="flex flex-col gap-1.5 bg-amber-50 border border-amber-200/50 p-2.5 rounded-md">
                              {item.offerText && (
                                <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                                  <span className="bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded text-[10px]">GIFT</span>
                                  DEAL: {item.offerText}
                                </div>
                              )}
                              {item.discountPercentage > 0 && (
                                <div className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
                                  <span className="bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px]">SAVE</span>
                                  {item.discountPercentage}% OFF Applied
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex justify-between items-center mt-1 pt-1.5 border-t border-white/5">
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                                className="w-7 h-7 bg-[#111827] hover:bg-[#1E293B] rounded-md border border-white/10 flex items-center justify-center text-slate-400 transition">
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-sm font-bold text-slate-100 w-6 text-center">{item.quantity}</span>
                              <button onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                                className="w-7 h-7 bg-[#111827] hover:bg-[#1E293B] rounded-md border border-white/10 flex items-center justify-center text-slate-400 transition">
                                <Plus className="h-3 w-3" />
                              </button>
                              {totalDispatched > item.quantity && (
                                <span className="text-xs text-slate-400 font-bold bg-[#1E293B] px-2 py-1 rounded">
                                  Total: {totalDispatched}
                                </span>
                              )}
                            </div>
                            <span className="font-mono font-bold text-slate-100">
                              ₹{(finalUnitPrice * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              {cart.length > 0 && (
                <div className="p-4 border-t border-white/5 bg-transparent space-y-4">
                  <div className="space-y-2 text-sm text-slate-400">
                    <div className="flex justify-between">
                      <span>Billed Units</span>
                      <span className="font-bold text-slate-100">{totalCartItemsPaid}</span>
                    </div>
                    {totalCartItemsDispatched > totalCartItemsPaid && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Total Shipped</span>
                        <span>{totalCartItemsDispatched} (+{totalCartItemsDispatched - totalCartItemsPaid} Free)</span>
                      </div>
                    )}
                    {cartSavings > 0 && (
                      <div className="flex justify-between text-indigo-600 font-semibold">
                        <span>Cash Discount</span>
                        <span>-₹{cartSavings.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold text-slate-100">
                      <span>Invoice Total</span>
                      <span className="font-mono text-indigo-700 text-xl">₹{cartSubtotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-md transition shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Place Distribution Order</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <p className="text-[10px] text-center text-slate-500 font-semibold">
                    After placing, track your order in the <strong>My Orders</strong> tab.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
