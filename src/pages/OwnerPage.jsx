import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import {
  Plus, Trash2, AlertTriangle, ShieldCheck, ToggleLeft, ToggleRight,
  Package, Tag, ShoppingBag, X, Pencil, CheckCircle, Save, MapPin, Users, ArrowLeft, ArrowRight, IndianRupee, User
} from 'lucide-react';

// ── Edit Product Modal ──────────────────────────────────────────────────────
function EditProductModal({ product, onClose, onSave }) {
  const { brands } = useProducts();
  const [form, setForm] = useState({
    name:               product.name,
    brand:              product.brand || '',
    price:              String(product.price),
    stockQuantity:      String(product.stockQuantity),
    discountPercentage: String(product.discountPercentage),
    offerText:          product.offerText || '',
    isOfferActive:      product.isOfferActive,
    expiryDate:         product.expiryDate ? product.expiryDate.slice(0,10) : '',
  });
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    setError('');

    const priceNum    = parseFloat(form.price);
    const stockNum    = parseInt(form.stockQuantity, 10);
    const discountNum = parseFloat(form.discountPercentage);

    if (!form.name.trim())                             return setError('Product name is required.');
    if (isNaN(priceNum) || priceNum < 0)               return setError('Price must be a positive number.');
    if (isNaN(stockNum) || stockNum < 0)               return setError('Stock must be a positive number.');
    if (isNaN(discountNum) || discountNum < 0 || discountNum > 100)
      return setError('Discount must be between 0 and 100.');

    onSave({
      ...product,
      name:               form.name.trim(),
      brand:              form.brand.trim() || 'Unbranded',
      price:              priceNum,
      stockQuantity:      stockNum,
      discountPercentage: discountNum,
      offerText:          form.offerText.trim(),
      isOfferActive:      form.isOfferActive,
      expiryDate:         form.expiryDate,
    });

    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 700);
  };

  const inputCls = 'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500 transition text-sm text-slate-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-teal-600 to-teal-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Pencil className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Edit Product</h2>
              <p className="text-teal-200 text-xs font-medium truncate max-w-[220px]">{product.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">

          {/* Name & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Product Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className={inputCls} placeholder="e.g., Paracetamol 500mg" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Company / Brand</label>
              <select name="brand" value={form.brand} onChange={handleChange} className={inputCls}>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Price (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                <input type="number" step="0.01" min="0" name="price" value={form.price} onChange={handleChange}
                  className={`${inputCls} pl-7`} placeholder="0.00" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Stock Qty</label>
              <input type="number" min="0" name="stockQuantity" value={form.stockQuantity} onChange={handleChange}
                className={inputCls} placeholder="0" />
            </div>
          </div>

          {/* Divider: Offer & Discount Section */}
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Offer & Discount Settings</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Discount (%)
                </label>
                <input type="number" min="0" max="100" name="discountPercentage" value={form.discountPercentage}
                  onChange={handleChange} className={inputCls} placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Deal Offer (e.g. 10+2)
                </label>
                <input type="text" name="offerText" value={form.offerText} onChange={handleChange}
                  className={inputCls} placeholder="e.g. 10 + 2" />
              </div>
            </div>

            {/* Offer preview */}
            {form.offerText && (
              <div className="mt-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-2">
                <Tag className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-xs font-bold text-amber-800">
                  Deal Preview: Buy <span className="text-amber-600">{form.offerText.split('+')[0]?.trim()}</span> → Get <span className="text-amber-600">{form.offe/* Activate toggle */
            <div
              onClick={() => setForm(p => ({ ...p, isOfferActive: !p.isOfferActive }))}
              className={`mt-3 flex items-center justify-between cursor-pointer px-4 py-3 rounded-xl border transition ${
                form.isOfferActive
                  ? 'bg-teal-50 border-teal-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <p className={`text-sm font-bold ${form.isOfferActive ? 'text-teal-800' : 'text-slate-600'}`}>
                  {form.isOfferActive ? '✅ Offer is ACTIVE' : '⏸ Offer is INACTIVE'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {form.isOfferActive
                    ? 'Discount & deal are visible to retailers'
                    : 'Click to activate this offer for retailers'}
                </p>
              </div>
              {form.isOfferActive
                ? <ToggleRight className="h-8 w-8 text-teal-500 shrink-0" />
                : <ToggleLeft className="h-8 w-8 text-slate-400 shrink-0" />
              }
            </div>
            
            {/* Expiry Date Input */}
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Expiry Date</label>
              <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} className={inputCls} />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold px-4 py-2.5 rounded-xl">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">
              Cancel
            </button>
            <button type="submit"
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                saved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20'
              }`}>
              {saved
                ? <><CheckCircle className="h-4 w-4" /> Saved!</>
                : <><Save className="h-4 w-4" /> Save Changes</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── OwnerPage ───────────────────────────────────────────────────────────────
export default function OwnerPage() {
  const { products, orders, payments, brands, addBrand, deleteBrand, updateBrand, addProduct, updateProduct, deleteProduct, updateOrderStatus, addPayment } = useProducts();
  const { registeredUsers } = useAuth(); // All retailers
  
  const [view, setView] = useState('hub'); 
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedRetailer, setSelectedRetailer] = useState(null);

  const [newBrandName, setNewBrandName] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  // Brand edit state
  const [editingBrandName, setEditingBrandName] = useState(null);
  const [editBrandInput, setEditBrandInput] = useState('');
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentError, setPaymentError] = useState('');

  // Edit modal state
  const [editingProduct, setEditingProduct] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: '', price: '', stockQuantity: '', discountPercentage: '0', offerText: '', isOfferActive: false, expiryDate: ''
  });
  const [formError, setFormError] = useState('');

  const totalProducts  = products.length;
  const activeOffers   = products.filter(p => p.isOfferActive).length;
  const lowStockAlerts = products.filter(p => p.stockQuantity < 5).length;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!newProduct.name.trim())                                               return setFormError('Product Name is required.');
    const priceNum = parseFloat(newProduct.price);
    if (isNaN(priceNum) || priceNum < 0)                                       return setFormError('Price must be a positive number.');
    const stockNum = parseInt(newProduct.stockQuantity, 10);
    if (isNaN(stockNum) || stockNum < 0)                                       return setFormError('Stock must be a positive integer.');
    const discountNum = parseFloat(newProduct.discountPercentage);
    if (isNaN(discountNum) || discountNum < 0 || discountNum > 100)            return setFormError('Discount must be between 0% and 100%.');

    addProduct({ name: newProduct.name, brand: selectedBrand, price: priceNum, stockQuantity: stockNum, discountPercentage: discountNum, offerText: newProduct.offerText.trim(), isOfferActive: newProduct.isOfferActive, expiryDate: newProduct.expiryDate });
    setNewProduct({ name: '', price: '', stockQuantity: '', discountPercentage: '0', offerText: '', isOfferActive: false, expiryDate: '' });
  };

  const handleUpdateStock = (product, newStockVal) => {
    const parsedStock = parseInt(newStockVal, 10);
    if (!isNaN(parsedStock) && parsedStock >= 0) {
      updateProduct({ ...product, stockQuantity: parsedStock });
    }
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm';

  const statusFlow    = ['processing', 'confirmed', 'delivered'];
  const statusStyles  = {
    processing: 'bg-slate-100 text-slate-600 border-slate-200',
    confirmed:  'bg-teal-100 text-teal-700 border-teal-200',
    delivered:  'bg-emerald-100 text-emerald-700 border-emerald-200'
  };
  const nextBtnStyles = {
    confirmed: 'bg-teal-600 hover:bg-teal-700 text-white',
    delivered: 'bg-emerald-500 hover:bg-emerald-600 text-white'
  };
  const statusDisplayLabel = {
    processing: '⏳ Processing',
    confirmed:  '✅ Confirmed',
    delivered:  '📦 Delivered'
  };
  const nextBtnLabel = {
    confirmed: 'Confirm Order',
    delivered: 'Mark Delivered'
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setPaymentError('');
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      setPaymentError('Please enter a valid amount greater than 0.');
      return;
    }

    // Calculate current pending amount for this retailer
    const retailerOrds = orders.filter(o => o.userId === selectedRetailer.id);
    const retailerPays = payments.filter(p => p.userId === selectedRetailer.id);
    const totalDue = retailerOrds.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
    const totalAlreadyPaid = retailerPays.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const currentPending = totalDue - totalAlreadyPaid;

    if (currentPending <= 0) {
      setPaymentError('No pending balance. This retailer has no outstanding dues.');
      return;
    }

    if (amt > currentPending) {
      setPaymentError(`Amount exceeds pending balance! Maximum allowed: ₹${currentPending.toFixed(2)}`);
      return;
    }
    
    // Pass formatted date if provided
    let formattedDate = null;
    if (paymentDate) {
      const [year, month, day] = paymentDate.split('-');
      if (year && month && day) {
        const dObj = new Date(year, month - 1, day);
        formattedDate = dObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    }

    await addPayment(selectedRetailer.id, amt, formattedDate);
    
    setPaymentAmount('');
    setPaymentDate('');
    setShowPaymentModal(false);
  };

  const handleAddBrand = (e) => {
    e.preventDefault();
    if (newBrandName.trim()) {
      addBrand(newBrandName.trim());
      setNewBrandName('');
    }
  };

  // ── Render HUB View ─────────────────────────────────────────────
  if (view === 'hub') {
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-purple-600 h-8 w-8" />
              Agency Hub
            </h1>
            <p className="text-slate-500 mt-2 text-sm max-w-lg">
              Central command. Manage your brand catalogs and view retailer orders and pending payments.
            </p>
          </div>
        </div>

        {/* BRANDS SECTION */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Tag className="h-5 w-5 text-purple-600" /> Manage Brands
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-200 shadow-sm flex flex-col justify-center">
              <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
                <Plus className="text-purple-500" /> Add New Brand
              </h3>
              <form onSubmit={handleAddBrand} className="flex flex-col gap-2">
                <input
                  type="text"
                  value={newBrandName}
                  onChange={e => setNewBrandName(e.target.value)}
                  placeholder="e.g., PharmaCorp"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition text-sm"
                />
                <button
                  type="submit"
                  disabled={!newBrandName.trim()}
                  className="bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-slate-900 transition disabled:opacity-50"
                >
                  Add Brand
                </button>
              </form>
            </div>

            {brands.map(b => (
              <div 
                key={b} 
                onClick={() => {
                  if (editingBrandName !== b) {
                    setSelectedBrand(b);
                    setView('brand');
                  }
                }}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group cursor-pointer hover:shadow-md hover:border-purple-200 transition"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold text-xl">
                      {b.charAt(0)}
                    </div>
                    {editingBrandName !== b && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingBrandName(b);
                          setEditBrandInput(b);
                        }}
                        className="text-slate-400 hover:text-purple-600 p-1.5 rounded-lg hover:bg-purple-50 opacity-0 group-hover:opacity-100 transition"
                        title="Edit Brand Name"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {editingBrandName === b ? (
                    <div onClick={(e) => e.stopPropagation()} className="space-y-2 mt-2">
                      <input
                        type="text"
                        value={editBrandInput}
                        onChange={(e) => setEditBrandInput(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition text-sm font-semibold"
                        placeholder="Brand Name"
                        autoFocus
                      />
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            if (editBrandInput.trim() && editBrandInput.trim() !== b) {
                              updateBrand(b, editBrandInput.trim());
                            }
                            setEditingBrandName(null);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingBrandName(null)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="font-bold text-slate-800 text-xl group-hover:text-purple-700 transition">{b}</p>
                  )}
                </div>
                <div className="mt-6 flex justify-between items-center text-sm font-semibold text-slate-500">
                  <span>Manage Catalog →</span>
                  {editingBrandName !== b && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteBrand(b); }}
                      className="text-slate-400 hover:text-rose-500 transition p-2 rounded-xl hover:bg-rose-50 opacity-0 group-hover:opacity-100"
                      title="Delete Brand"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RETAILERS SECTION */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" /> Registered Retailers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {registeredUsers.map(user => {
              const userOrders = orders.filter(o => o.userId === user.id);
              return (
                <div 
                  key={user.id} 
                  onClick={() => { setSelectedRetailer(user); setView('retailer'); }}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group cursor-pointer hover:shadow-md hover:border-blue-200 transition"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 leading-tight group-hover:text-blue-700 transition">{user.name}</p>
                      <p className="text-xs text-slate-500">@{user.username}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span className="text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">{userOrders.length} Orders</span>
                    <span className="text-blue-600 flex items-center gap-1">View Details <ArrowRight className="h-4 w-4"/></span>
                  </div>
                </div>
              );
            })}
            {registeredUsers.length === 0 && (
              <div className="col-span-full py-8 text-center border border-dashed border-slate-200 rounded-2xl bg-white text-slate-500">
                No retailers registered yet.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Render BRAND View ──────────────────────────────────────────────────────
  if (view === 'brand') {
    const brandProducts = products.filter(p => (p.brand || 'Unbranded') === selectedBrand);
    const brandActiveOffers = brandProducts.filter(p => p.isOfferActive).length;
    const brandLowStock = brandProducts.filter(p => p.stockQuantity < 5).length;

    return (
      <div className="space-y-8 animate-fadeIn">
        {editingProduct && (
          <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSave={updateProduct} />
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
              <span className="bg-purple-100 text-purple-700 w-10 h-10 rounded-xl flex items-center justify-center text-xl">{selectedBrand.charAt(0)}</span>
              {selectedBrand} Inventory
            </h1>
          </div>
          <button
            onClick={() => setView('hub')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition"
          >
            <ArrowLeft className="h-5 w-5" /> Back to Hub
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200/50 shadow-sm relative overflow-hidden">
            <p className="text-blue-800 text-sm font-semibold uppercase tracking-wider">Total Products</p>
            <h3 className="text-4xl font-extrabold text-blue-900 mt-2">{brandProducts.length}</h3>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-2xl border border-teal-200/50 shadow-sm relative overflow-hidden">
            <p className="text-teal-800 text-sm font-semibold uppercase tracking-wider">Active Offers</p>
            <h3 className="text-4xl font-extrabold text-teal-900 mt-2">{brandActiveOffers}</h3>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-2xl border border-amber-200/50 shadow-sm relative overflow-hidden">
            <p className="text-amber-800 text-sm font-semibold uppercase tracking-wider">Low Stock Alerts</p>
            <h3 className="text-4xl font-extrabold text-amber-900 mt-2">{brandLowStock}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5 h-fit">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Plus className="text-teal-600" /> Add to {selectedBrand}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Product Name</label>
                <input type="text" name="name" value={newProduct.name} onChange={handleInputChange} className={inputCls} placeholder="e.g., Aspirin 100mg" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400 text-sm">₹</span>
                    <input type="number" step="0.01" name="price" value={newProduct.price} onChange={handleInputChange} className={`${inputCls} pl-7`} placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Stock</label>
                  <input type="number" name="stockQuantity" value={newProduct.stockQuantity} onChange={handleInputChange} className={inputCls} placeholder="0" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Discount (%)</label>
                  <input type="number" min="0" max="100" name="discountPercentage" value={newProduct.discountPercentage} onChange={handleInputChange} className={inputCls} placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Offer (e.g. 10+2)</label>
                  <input type="text" name="offerText" value={newProduct.offerText} onChange={handleInputChange} className={inputCls} placeholder="e.g. 10 + 2" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-600 mb-1">Expiry Date</label>
                <input type="date" name="expiryDate" value={newProduct.expiryDate} onChange={handleInputChange} className={inputCls} />
              </div>
              <div className="flex items-center gap-2 py-1">
                <input type="checkbox" id="isOfferActive" name="isOfferActive" checked={newProduct.isOfferActive} onChange={handleInputChange}
                  className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500" />
                <label htmlFor="isOfferActive" className="text-sm font-medium text-slate-600 cursor-pointer">Activate Offer / Discount Now</label>
              </div>
              {formError && (
                <div className="text-sm text-rose-500 bg-rose-50 p-3 rounded-lg border border-rose-100">{formError}</div>
              )}
              <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-xl transition shadow-sm flex justify-center items-center gap-2">
                <Plus className="h-5 w-5" /> Add to Catalog
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">{selectedBrand} Products</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Medicine</th>
                    <th className="px-5 py-3.5">Price</th>
                    <th className="px-5 py-3.5">Stock</th>
                    <th className="px-5 py-3.5 text-center">Offer</th>
                    <th className="px-5 py-3.5 text-center">Expiry</th>
                    <th className="px-5 py-3.5 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {brandProducts.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-10 text-slate-400">No products for this brand yet.</td></tr>
                  ) : (
                    brandProducts.map((product) => {
                      const isLowStock = product.stockQuantity < 5;
                      const hasDiscount = product.isOfferActive && product.discountPercentage > 0;
                      const finalPrice = hasDiscount ? product.price * (1 - product.discountPercentage / 100) : product.price;
                      return (
                        <tr key={product.id} onClick={() => setEditingProduct(product)} className="hover:bg-teal-50/40 transition cursor-pointer">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-800">{product.name}</div>
                            {isLowStock && <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">Low Stock</span>}
                          </td>
                          <td className="px-5 py-4 font-mono">
                            {hasDiscount ? (
                              <div>
                                <span className="font-bold text-slate-800">₹{finalPrice.toFixed(2)}</span>
                                <span className="text-xs text-slate-400 line-through ml-1.5">₹{product.price.toFixed(2)}</span>
                              </div>
                            ) : (
                              <span>₹{product.price.toFixed(2)}</span>
                            )}
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-700">{product.stockQuantity}</td>
                          <td className="px-5 py-4 text-center">
                            {product.isOfferActive ? <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-lg">Active</span> : <span className="text-xs bg-slate-100 text-slate-400 font-bold px-2 py-1 rounded-lg">Inactive</span>}
                          </td>
                          <td className="px-5 py-4 text-center">
                            {product.expiryDate ? <span className="text-xs text-slate-600">{new Date(product.expiryDate).toLocaleDateString()}</span> : <span className="text-xs text-slate-400">N/A</span>}
                          </td>
                          <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                            <button onClick={() => deleteProduct(product.id)} className="text-rose-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render RETAILER View ───────────────────────────────────────────────────
  if (view === 'retailer') {
    const retailerOrders = orders.filter(o => o.userId === selectedRetailer.id);
    const retailerPayments = payments.filter(p => p.userId === selectedRetailer.id);
    
    // Calculate total lifetime due and total paid
    const totalLifetime = retailerOrders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
    const totalPaid = retailerPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const pendingAmount = totalLifetime - totalPaid;

    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Record Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
                <div>
                  <h2 className="text-base font-bold">Record Payment</h2>
                  <p className="text-teal-100 text-xs">Log a manual payment received from {selectedRetailer.name}</p>
                </div>
                <button onClick={() => setShowPaymentModal(false)} className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
                {/* Show current pending balance */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800">Pending Balance Due:</span>
                  <span className="text-sm font-extrabold text-amber-900 font-mono">₹{pendingAmount.toFixed(2)}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Amount Received (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={pendingAmount.toFixed(2)}
                      required
                      placeholder="0.00"
                      value={paymentAmount}
                      onChange={(e) => { setPaymentAmount(e.target.value); setPaymentError(''); }}
                      className={`${inputCls} pl-7`}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Maximum allowed: ₹{pendingAmount.toFixed(2)}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Payment Date (Optional)</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className={inputCls}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Leaves empty to automatically use the current date.</p>
                </div>

                {paymentError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold px-4 py-2.5 rounded-xl">
                    {paymentError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-500/20 transition">
                    Record Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
              <User className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{selectedRetailer?.name || 'Retailer'}</h1>
              <p className="text-slate-500 font-semibold mt-0.5">@{selectedRetailer?.username} · 📞 {selectedRetailer?.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPaymentModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition shadow-md shadow-emerald-500/20"
            >
              <IndianRupee className="h-5 w-5" /> Record Payment
            </button>
            <button
              onClick={() => setView('hub')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 transition"
            >
              <ArrowLeft className="h-5 w-5" /> Back to Hub
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-rose-50 text-rose-500 rounded-2xl"><IndianRupee className="h-8 w-8" /></div>
            <div>
              <p className="text-rose-600 text-sm font-bold uppercase tracking-wider">Remaining Balance Due</p>
              <p className="text-4xl font-extrabold text-slate-800 mt-1">₹{pendingAmount.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">Outstanding outstanding amount</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-teal-50 text-teal-500 rounded-2xl"><IndianRupee className="h-8 w-8" /></div>
            <div>
              <p className="text-teal-600 text-sm font-bold uppercase tracking-wider">Total Amount Paid</p>
              <p className="text-4xl font-extrabold text-slate-800 mt-1">₹{totalPaid.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">From {retailerPayments.length} logged payments</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl"><CheckCircle className="h-8 w-8" /></div>
            <div>
              <p className="text-emerald-600 text-sm font-bold uppercase tracking-wider">Lifetime Processed (Due)</p>
              <p className="text-4xl font-extrabold text-slate-800 mt-1">₹{totalLifetime.toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">Across {retailerOrders.length} total order(s)</p>
            </div>
          </div>
        </div>

        {/* Transaction History / Ledger */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <IndianRupee className="text-emerald-600" /> Transaction History (Ledger)
          </h2>
          {retailerPayments.length === 0 ? (
            <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No payments recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Date & Time</th>
                    <th className="px-5 py-3.5">Transaction ID</th>
                    <th className="px-5 py-3.5 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {retailerPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-4">
                        <div className="text-slate-800 font-bold">{payment.date}</div>
                        <div className="text-xs text-slate-400 font-semibold">{payment.time || ''}</div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">{payment.id}</td>
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

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="text-teal-600" /> Order History
          </h2>
          
          {retailerOrders.length === 0 ? (
            <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No orders from this retailer yet.
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {retailerOrders.map((order) => {
                const safeStatus = order.status || 'processing';
                const currentIdx = statusFlow.indexOf(safeStatus);
                const nextStatus = statusFlow[currentIdx + 1];
                return (
                  <div key={order.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3 hover:bg-slate-100/50 transition">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-bold text-slate-800">{order.productName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{order.orderDate} {order.orderTime}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{order.id}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${statusStyles[safeStatus]}`}>
                          {statusDisplayLabel[safeStatus] || safeStatus}
                        </span>
                        {nextStatus && (
                          <button onClick={() => updateOrderStatus(order.id, nextStatus)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${nextBtnStyles[nextStatus]}`}>
                             {nextBtnLabel[nextStatus] || 'Update Status'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="bg-white rounded-xl p-2 border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-semibold">Billed Qty</p>
                        <p className="text-sm font-extrabold text-slate-800">{order.quantity}</p>
                      </div>
                      <div className="bg-white rounded-xl p-2 border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-semibold">Dispatched</p>
                        <p className="text-sm font-extrabold text-slate-800">{order.totalDispatched || order.quantity}</p>
                      </div>
                      {order.freeUnits > 0 && (
                        <div className="bg-emerald-50 rounded-xl p-2 border border-emerald-100">
                          <p className="text-[10px] text-emerald-600 font-semibold">Free Units</p>
                          <p className="text-sm font-extrabold text-emerald-700">+{order.freeUnits} 🎁</p>
                        </div>
                      )}
                      <div className="bg-teal-50 rounded-xl p-2 border border-teal-100">
                        <p className="text-[10px] text-teal-600 font-semibold">Invoice</p>
                        <p className="text-sm font-extrabold text-teal-700 font-mono">₹{order.totalPrice?.toFixed(2)}</p>
                      </div>
                    </div>

                    {order.deliveryAddress && typeof order.deliveryAddress === 'object' && (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex gap-3">
                        <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-700">{order.deliveryAddress?.name} ({order.deliveryAddress?.phone})</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {order.deliveryAddress?.line1}, {order.deliveryAddress?.city} {order.deliveryAddress?.state ? `, ${order.deliveryAddress.state}` : ''} - {order.deliveryAddress?.pin}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
