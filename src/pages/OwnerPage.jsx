import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import {
 Plus, Trash2, AlertTriangle, ShieldCheck, ToggleLeft, ToggleRight,
 Package, Tag, ShoppingBag, X, Pencil, CheckCircle, Save, MapPin, Users, ArrowLeft, ArrowRight, IndianRupee, User, ChevronDown, ChevronUp, Clock, Truck, Search
} from 'lucide-react';

// ── Edit Product Modal ──────────────────────────────────────────────────────
function EditProductModal({ product, onClose, onSave }) {
 const { brands, categories } = useProducts();
 const [form, setForm] = useState({
 name: product.name,
 brand: product.brand || '',
 category: product.category && product.category !== 'Uncategorized' ? product.category : categories[0],
 price: String(product.price),
 stockQuantity: String(product.stockQuantity),
 discountPercentage: String(product.discountPercentage),
 offerText: product.offerText || '',
 isOfferActive: product.isOfferActive,
 expiryDate: product.expiryDate ? product.expiryDate.slice(0,10) : '',
 batch: product.batch || '',
 });
 const [error, setError] = useState('');
 const [saved, setSaved] = useState(false);

 const handleChange = (e) => {
 const { name, value, type, checked } = e.target;
 setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
 setError('');
 };

 const handleSave = async (e) => {
 e.preventDefault();
 setError('');

 const priceNum = parseFloat(form.price);
 const stockNum = parseInt(form.stockQuantity, 10);
 const discountNum = parseFloat(form.discountPercentage);

 if (!form.name.trim()) return setError('Product name is required.');
 if (!form.expiryDate) return setError('Expiry date is required.');
 if (isNaN(priceNum) || priceNum < 0) return setError('Price must be a positive number.');
 if (isNaN(stockNum) || stockNum < 0) return setError('Stock must be a positive number.');
 if (isNaN(discountNum) || discountNum < 0 || discountNum > 100)
 return setError('Discount must be between 0 and 100.');

 const res = await onSave({
 ...product,
 name: form.name.trim(),
 brand: form.brand.trim() || 'Unbranded',
 category: form.category,
 price: priceNum,
 stockQuantity: stockNum,
 discountPercentage: discountNum,
 offerText: form.offerText.trim(),
 isOfferActive: form.isOfferActive,
 expiryDate: form.expiryDate,
 batch: form.batch.trim(),
 });

 if (res && !res.success) {
 setError(res.message || 'Failed to save changes.');
 } else {
 setSaved(true);
 setTimeout(() => { setSaved(false); onClose(); }, 700);
 }
 };

 const inputCls = 'w-full px-3.5 py-2.5 rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition text-sm text-slate-100';

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 {/* Backdrop */}
 <div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="absolute inset-0 bg-[#18181b]/50 backdrop-blur-sm" 
 onClick={onClose} 
 />

 {/* Modal */}
 <div 
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="relative bg-[#111827] rounded-md shadow-sm w-full max-w-lg overflow-hidden"
 >

 {/* Header */}
 <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-gradient-to-r from-indigo-600 to-indigo-700">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 bg-[#111827] rounded-md flex items-center justify-center">
 <Pencil className="h-4.5 w-4.5 text-white" />
 </div>
 <div>
 <h2 className="text-base font-bold text-white">Edit Product</h2>
 <p className="text-indigo-200 text-xs font-medium truncate max-w-[220px]">{product.name}</p>
 </div>
 </div>
 <button onClick={onClose} className="text-white/70 hover:text-white p-1.5 rounded-md hover:bg-[#111827] transition">
 <X className="h-5 w-5" />
 </button>
 </div>

 {/* Body */}
 <form onSubmit={handleSave} className="p-4 space-y-4">

 {/* Name, Brand, Category */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Product Name</label>
 <input type="text" name="name" value={form.name} onChange={handleChange} className={inputCls} placeholder="e.g., Paracetamol" />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Brand</label>
 <select name="brand" value={form.brand} onChange={handleChange} className={`${inputCls} bg-[#111827]`}>
 {brands.map(b => <option className="bg-[#111827] text-slate-100" key={b} value={b}>{b}</option>)}
 </select>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
 <select name="category" value={form.category} onChange={handleChange} className={`${inputCls} bg-[#111827]`}>
 {categories.map(c => <option className="bg-[#111827] text-slate-100" key={c} value={c}>{c}</option>)}
 </select>
 </div>
 </div>

 {/* Price + Stock */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Price (₹)</label>
 <div className="relative">
 <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-semibold">₹</span>
 <input type="number" step="0.01" min="0" name="price" value={form.price} onChange={handleChange}
 className={`${inputCls} pl-7`} placeholder="0.00" />
 </div>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Stock Qty</label>
 <input type="number" min="0" name="stockQuantity" value={form.stockQuantity} onChange={handleChange}
 className={inputCls} placeholder="0" />
 </div>
 </div>

 {/* Divider: Offer & Discount Section */}
 <div className="border-t border-white/5 pt-4">
 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Offer & Discount Settings</p>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
 Discount (%)
 </label>
 <input type="number" min="0" max="100" name="discountPercentage" value={form.discountPercentage}
 onChange={handleChange} className={inputCls} placeholder="0" />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
 Deal Offer (e.g. 10+2)
 </label>
 <input type="text" name="offerText" value={form.offerText} onChange={handleChange}
 className={inputCls} placeholder="e.g. 10 + 2" />
 </div>
 </div>

 {/* Offer preview */}
 {form.offerText && (
 <div className="mt-2.5 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 flex items-center gap-2">
 <Tag className="h-4 w-4 text-amber-500 shrink-0" />
 <p className="text-xs font-bold text-amber-800">
 Deal Preview: Buy <span className="text-amber-600">{form.offerText.split('+')[0]?.trim()}</span> → Get <span className="text-amber-600">{form.offerText.split('+')[1]?.trim()}</span> extra free
 </p>
 </div>
 )}

 {/* Activate toggle */}
 <div
 onClick={() => setForm(p => ({ ...p, isOfferActive: !p.isOfferActive }))}
 className={`mt-3 flex items-center justify-between cursor-pointer px-4 py-3 rounded-md border transition ${
 form.isOfferActive
 ? 'bg-indigo-50 border-indigo-200'
 : 'bg-transparent border-white/10'
 }`}
 >
 <div>
 <p className={`text-sm font-bold ${form.isOfferActive ? 'text-indigo-800' : 'text-slate-400'}`}>
 {form.isOfferActive ? '✅ Offer is ACTIVE' : '⏸ Offer is INACTIVE'}
 </p>
 <p className="text-xs text-slate-500 mt-0.5">
 {form.isOfferActive
 ? 'Discount & deal are visible to retailers'
 : 'Click to activate this offer for retailers'}
 </p>
 </div>
 {form.isOfferActive
 ? <ToggleRight className="h-8 w-8 text-indigo-500 shrink-0" />
 : <ToggleLeft className="h-8 w-8 text-slate-500 shrink-0" />
 }
 </div>
 
 {/* Expiry Date Input */}
 <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Batch Number</label>
 <input type="text" name="batch" value={form.batch} onChange={handleChange} className={inputCls} placeholder="e.g. BATCH-001" />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Expiry Date *</label>
 <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} className={inputCls} required />
 </div>
 </div>
 </div>

 {/* Error */}
 {error && (
 <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm font-semibold px-4 py-2.5 rounded-md">
 {error}
 </div>
 )}

 {/* Actions */}
 <div className="flex gap-3 pt-2">
 <button type="button" onClick={onClose}
 className="flex-1 py-2.5 rounded-md border border-white/10 text-slate-400 font-semibold text-sm hover:bg-transparent transition">
 Cancel
 </button>
 <button type="submit"
 className={`flex-1 py-2.5 rounded-md font-bold text-sm flex items-center justify-center gap-2 transition ${
 saved
 ? 'bg-emerald-500 text-white'
 : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
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
 const { products, orders, payments, brands, categories, addBrand, deleteBrand, updateBrand, addProduct, updateProduct, deleteProduct, updateOrderStatus, addPayment } = useProducts();
 const { registeredUsers, deleteRetailer } = useAuth(); // All retailers
 
 const [view, setView] = useState('hub'); 
 const [selectedBrand, setSelectedBrand] = useState(null);
 const [selectedRetailer, setSelectedRetailer] = useState(null);
 const [activeQueueTab, setActiveQueueTab] = useState('processing');

 const [newBrandName, setNewBrandName] = useState('');
 const [productSearch, setProductSearch] = useState('');

 useEffect(() => {
 window.scrollTo(0, 0);
 setProductSearch('');
 }, [view]);

 // Brand edit state
 const [editingBrandName, setEditingBrandName] = useState(null);
 const [editBrandInput, setEditBrandInput] = useState('');
 
 // Payment modal state
 const [showPaymentModal, setShowPaymentModal] = useState(false);
 const [paymentAmount, setPaymentAmount] = useState('');
 const [paymentDate, setPaymentDate] = useState('');
 const [paymentError, setPaymentError] = useState('');
 const [showAllLedger, setShowAllLedger] = useState(false);

 // Edit Product Modal State
 const [editingProduct, setEditingProduct] = useState(null);

 const handleDeleteRetailer = async () => {
 if (!selectedRetailer) return;
 if (window.confirm(`Are you sure you want to completely remove ${selectedRetailer.name}? This action cannot be undone.`)) {
 const res = await deleteRetailer(selectedRetailer.id);
 if (res.success) {
 setView('hub');
 setSelectedRetailer(null);
 } else {
 alert(res.message);
 }
 }
 };

 const [newProduct, setNewProduct] = useState({
 name: '', category: categories[0] || 'Uncategorized', price: '', stockQuantity: '', discountPercentage: '0', offerText: '', isOfferActive: false, expiryDate: '', batch: ''
 });
 const [formError, setFormError] = useState('');

 const totalProducts = products.length;
 const activeOffers = products.filter(p => p.isOfferActive).length;
 const lowStockAlerts = products.filter(p => p.stockQuantity < 5).length;

 const handleInputChange = (e) => {
 const { name, value, type, checked } = e.target;
 setNewProduct(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
 };

 const handleSubmit = async (e) => {
 e.preventDefault();
 setFormError('');
 if (!newProduct.name.trim()) return setFormError('Product Name is required.');
 if (!newProduct.expiryDate) return setFormError('Expiry Date is required.');
 const priceNum = parseFloat(newProduct.price);
 if (isNaN(priceNum) || priceNum < 0) return setFormError('Price must be a positive number.');
 const stockNum = parseInt(newProduct.stockQuantity, 10);
 if (isNaN(stockNum) || stockNum < 0) return setFormError('Stock must be a positive integer.');
 const discountNum = parseFloat(newProduct.discountPercentage);
 if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) return setFormError('Discount must be between 0% and 100%.');

 const res = await addProduct({
 name: newProduct.name.trim(),
 brand: selectedBrand,
 category: newProduct.category,
 price: priceNum,
 stockQuantity: stockNum,
 discountPercentage: discountNum,
 offerText: newProduct.offerText.trim(),
 isOfferActive: newProduct.isOfferActive,
 expiryDate: newProduct.expiryDate,
 batch: newProduct.batch.trim()
 });

 if (res && !res.success) {
 setFormError(res.message || 'Failed to add product.');
 } else {
 setNewProduct({ name: '', category: categories[0] || 'Uncategorized', price: '', stockQuantity: '', discountPercentage: '0', offerText: '', isOfferActive: false, expiryDate: '', batch: '' });
 setFormError('');
 }
 };

 const handleUpdateStock = (product, newStockVal) => {
 const parsedStock = parseInt(newStockVal, 10);
 if (!isNaN(parsedStock) && parsedStock >= 0) {
 updateProduct({ ...product, stockQuantity: parsedStock });
 }
 };

 const inputCls = 'w-full px-4 py-2.5 rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm';

 const statusFlow = ['processing', 'confirmed', 'delivered'];
 const statusStyles = {
 processing: 'bg-[#f4f4f5] text-slate-400 border-white/10',
 confirmed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
 delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
 cancelled: 'bg-rose-100 text-rose-700 border-rose-200'
 };
 const nextBtnStyles = {
 confirmed: 'bg-indigo-600 hover:bg-indigo-700 text-white',
 delivered: 'bg-emerald-500 hover:bg-emerald-600 text-white'
 };
 const statusDisplayLabel = {
 processing: '⏳ Processing',
 confirmed: '✅ Confirmed',
 delivered: '📦 Delivered',
 cancelled: '❌ Cancelled'
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
 <div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-8"
 >
 {/* Header */}
 <div className="bg-[#111827] p-4 rounded-md shadow-sm border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h1 className="text-3xl font-bold text-slate-100 tracking-normal flex items-center gap-2">
 <ShieldCheck className="text-purple-600 h-8 w-8" />
 Agency Hub
 </h1>
 <p className="text-slate-400 mt-2 text-sm max-w-lg">
 Central command. Manage your brand catalogs and view retailer orders and pending payments.
 </p>
 </div>
 </div>

 {/* Fulfillment Queues */}
 <div>
 <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-4">
 <Package className="h-5 w-5 text-purple-600" /> Order Fulfillment Center
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div 
 onClick={() => { setActiveQueueTab('processing'); setView('orders_queue'); }}
 className="bg-[#111827] p-4 rounded-md border border-white/5 shadow-sm flex items-center justify-between group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:border-white/20 hover:border-amber-200 transition"
 >
 <div className="flex items-center gap-4">
 <div className="p-4 bg-amber-50 text-amber-600 rounded-md group-hover:scale-105 transition-transform duration-300">
 <Clock className="h-8 w-8" />
 </div>
 <div>
 <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">To Be Confirmed</p>
 <p className="text-3xl font-bold text-slate-850 mt-1">{orders.filter(o => o.status === 'processing').length} Orders</p>
 <p className="text-xs text-amber-600 mt-1 font-medium">Click to confirm newly placed orders →</p>
 </div>
 </div>
 <ArrowRight className="h-6 w-6 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1.5 transition-all" />
 </div>

 <div 
 onClick={() => { setActiveQueueTab('confirmed'); setView('orders_queue'); }}
 className="bg-[#111827] p-4 rounded-md border border-white/5 shadow-sm flex items-center justify-between group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:border-white/20 hover:border-indigo-200 transition"
 >
 <div className="flex items-center gap-4">
 <div className="p-4 bg-indigo-50 text-indigo-600 rounded-md group-hover:scale-105 transition-transform duration-300">
 <Truck className="h-8 w-8" />
 </div>
 <div>
 <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">To Be Delivered</p>
 <p className="text-3xl font-bold text-slate-850 mt-1">{orders.filter(o => o.status === 'confirmed').length} Orders</p>
 <p className="text-xs text-indigo-600 mt-1 font-medium">Click to ship or mark orders as delivered →</p>
 </div>
 </div>
 <ArrowRight className="h-6 w-6 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1.5 transition-all" />
 </div>
 </div>
 </div>

 {/* BRANDS SECTION */}
 <div>
 <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-4">
 <Tag className="h-5 w-5 text-purple-600" /> Manage Brands
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="bg-[#111827] p-4 rounded-md border-2 border-dashed border-white/10 shadow-sm flex flex-col justify-center">
 <h3 className="font-bold text-slate-200 flex items-center gap-2 mb-4">
 <Plus className="text-purple-500" /> Add New Brand
 </h3>
 <form onSubmit={handleAddBrand} className="flex flex-col gap-2">
 <input
 type="text"
 value={newBrandName}
 onChange={e => setNewBrandName(e.target.value)}
 placeholder="e.g., PharmaCorp"
 className="w-full px-4 py-2.5 rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition text-sm"
 />
 <button
 type="submit"
 disabled={!newBrandName.trim()}
 className="bg-slate-800 text-white font-bold px-5 py-2.5 rounded-md hover:bg-[#18181b] transition disabled:opacity-50"
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
 className="bg-[#111827] p-4 rounded-md border border-white/5 shadow-sm flex flex-col justify-between group cursor-pointer hover:shadow-md hover:border-purple-200 transition"
 >
 <div>
 <div className="flex justify-between items-start mb-4">
 <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-md flex items-center justify-center font-bold text-xl">
 {b.charAt(0)}
 </div>
 {editingBrandName !== b && (
 <button
 onClick={(e) => {
 e.stopPropagation();
 setEditingBrandName(b);
 setEditBrandInput(b);
 }}
 className="text-slate-500 hover:text-purple-600 p-1.5 rounded-md hover:bg-purple-50 opacity-0 group-hover:opacity-100 transition"
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
 className="w-full px-3 py-1.5 rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition text-sm font-semibold"
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
 className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-md transition"
 >
 Save
 </button>
 <button
 onClick={() => setEditingBrandName(null)}
 className="bg-[#f4f4f5] hover:bg-slate-200 text-slate-400 text-xs font-semibold px-3 py-1.5 rounded-md transition"
 >
 Cancel
 </button>
 </div>
 </div>
 ) : (
 <p className="font-bold text-slate-100 text-xl group-hover:text-purple-700 dark:text-purple-400 transition">{b}</p>
 )}
 </div>
 <div className="mt-6 flex justify-between items-center text-sm font-semibold text-slate-400">
 <span>Manage Catalog →</span>
 {editingBrandName !== b && (
 <button
 onClick={(e) => { e.stopPropagation(); deleteBrand(b); }}
 className="text-slate-500 hover:text-rose-500 transition p-2 rounded-md hover:bg-rose-50 opacity-0 group-hover:opacity-100"
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
 <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-4">
 <Users className="h-5 w-5 text-blue-600" /> Registered Retailers
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 {registeredUsers.map(user => {
 const userOrders = orders.filter(o => o.userId === user.id);
 return (
 <div 
 key={user.id} 
 onClick={() => { setSelectedRetailer(user); setView('retailer'); }}
 className="bg-[#111827] p-4 rounded-md border border-white/5 shadow-sm group cursor-pointer hover:shadow-md hover:border-blue-200 transition"
 >
 <div className="flex items-center gap-3 mb-4">
 <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-md flex items-center justify-center">
 <User className="h-5 w-5" />
 </div>
 <div>
 <p className="font-bold text-slate-100 leading-tight group-hover:text-blue-700 dark:text-blue-400 transition">{user.name}</p>
 <p className="text-xs text-slate-400">@{user.username}</p>
 </div>
 </div>
 <div className="flex justify-between items-center text-sm font-semibold">
 <span className="text-slate-400 bg-transparent px-2 py-1 rounded-md border border-white/5">{userOrders.length} Orders</span>
 <span className="text-blue-600 flex items-center gap-1">View Details <ArrowRight className="h-4 w-4"/></span>
 </div>
 </div>
 );
 })}
 {registeredUsers.length === 0 && (
 <div className="col-span-full py-8 text-center border border-dashed border-white/10 rounded-md bg-[#111827] text-slate-400">
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
 const filteredBrandProducts = brandProducts.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
 const brandActiveOffers = brandProducts.filter(p => p.isOfferActive).length;
 const brandLowStock = brandProducts.filter(p => p.stockQuantity < 5).length;

 return (
 <div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-8"
 >
 
 {editingProduct && (
 <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSave={updateProduct} />
 )}
 

 <div className="bg-[#111827] p-4 rounded-md shadow-sm border border-white/5 flex justify-between items-center gap-4">
 <div>
 <h1 className="text-3xl font-bold text-slate-100 tracking-normal flex items-center gap-3">
 <span className="bg-purple-100 text-purple-700 dark:text-purple-400 w-10 h-10 rounded-full flex items-center justify-center text-xl">{selectedBrand.charAt(0)}</span>
 {selectedBrand} Inventory
 </h1>
 </div>
 <button
 onClick={() => setView('hub')}
 className="bg-[#f4f4f5] hover:bg-slate-200 text-slate-200 font-bold py-2.5 px-5 rounded-md flex items-center gap-2 transition"
 >
 <ArrowLeft className="h-5 w-5" /> Back to Hub
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-md border border-blue-200/50 shadow-sm relative overflow-hidden">
 <p className="text-blue-800 text-sm font-semibold uppercase tracking-wider">Total Products</p>
 <h3 className="text-4xl font-bold text-blue-900 mt-2">{brandProducts.length}</h3>
 </div>
 <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-md border border-indigo-200/50 shadow-sm relative overflow-hidden">
 <p className="text-indigo-800 text-sm font-semibold uppercase tracking-wider">Active Offers</p>
 <h3 className="text-4xl font-bold text-indigo-900 mt-2">{brandActiveOffers}</h3>
 </div>
 <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-md border border-amber-200/50 shadow-sm relative overflow-hidden">
 <p className="text-amber-800 text-sm font-semibold uppercase tracking-wider">Low Stock Alerts</p>
 <h3 className="text-4xl font-bold text-amber-900 mt-2">{brandLowStock}</h3>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <div className="bg-[#111827] p-4 rounded-md border border-white/5 shadow-sm space-y-5 h-fit">
 <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
 <Plus className="text-indigo-600" /> Add to {selectedBrand}
 </h2>
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-slate-400 mb-1">Product Name</label>
 <input type="text" name="name" value={newProduct.name} onChange={handleInputChange} className={inputCls} placeholder="e.g., Aspirin 100mg" />
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
 <select name="category" value={newProduct.category} onChange={handleInputChange} className={`${inputCls} bg-[#111827]`}>
 {categories.map(c => <option className="bg-[#111827] text-slate-100" key={c} value={c}>{c}</option>)}
 </select>
 </div>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-slate-400 mb-1">Price (₹)</label>
 <div className="relative">
 <span className="absolute left-3 top-3 text-slate-500 text-sm">₹</span>
 <input type="number" step="0.01" name="price" value={newProduct.price} onChange={handleInputChange} className={`${inputCls} pl-7`} placeholder="0.00" />
 </div>
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-400 mb-1">Stock</label>
 <input type="number" name="stockQuantity" value={newProduct.stockQuantity} onChange={handleInputChange} className={inputCls} placeholder="0" />
 </div>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-slate-400 mb-1">Discount (%)</label>
 <input type="number" min="0" max="100" name="discountPercentage" value={newProduct.discountPercentage} onChange={handleInputChange} className={inputCls} placeholder="0" />
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-400 mb-1">Offer (e.g. 10+2)</label>
 <input type="text" name="offerText" value={newProduct.offerText} onChange={handleInputChange} className={inputCls} placeholder="e.g. 10 + 2" />
 </div>
 </div>
 <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-slate-400 mb-1">Batch Number</label>
 <input type="text" name="batch" value={newProduct.batch} onChange={handleInputChange} className={inputCls} placeholder="e.g. BATCH-001" />
 </div>
 <div>
 <label className="block text-sm font-medium text-slate-400 mb-1">Expiry Date *</label>
 <input type="date" name="expiryDate" value={newProduct.expiryDate} onChange={handleInputChange} className={inputCls} required />
 </div>
 </div>
 <div className="flex items-center gap-2 py-1">
 <input type="checkbox" id="isOfferActive" name="isOfferActive" checked={newProduct.isOfferActive} onChange={handleInputChange}
 className="w-4 h-4 text-indigo-600 border-zinc-400 dark:border-white/20 rounded focus:ring-indigo-500" />
 <label htmlFor="isOfferActive" className="text-sm font-medium text-slate-400 cursor-pointer">Activate Offer / Discount Now</label>
 </div>
 {formError && (
 <div className="text-sm text-rose-500 bg-rose-50 p-3 rounded-md border border-rose-100">{formError}</div>
 )}
 <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition shadow-sm flex justify-center items-center gap-2">
 <Plus className="h-5 w-5" /> Add to Catalog
 </button>
 </form>
 </div>

 <div className="bg-[#111827] p-4 rounded-md border border-white/5 shadow-sm lg:col-span-2 space-y-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <h2 className="text-xl font-bold text-slate-100">{selectedBrand} Products</h2>
 <div className="relative w-full sm:w-72">
 <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
 <input
 type="text"
 placeholder="Search products in brand..."
 value={productSearch}
 onChange={(e) => setProductSearch(e.target.value)}
 className="w-full pl-9 pr-4 py-2 rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition text-sm text-slate-200 bg-[#111827]"
 />
 </div>
 </div>
 <div className="overflow-x-auto rounded-md border border-white/5">
 <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
 <thead className="bg-transparent text-slate-400 font-semibold text-xs uppercase tracking-wider">
 <tr>
 <th className="px-5 py-3.5">Medicine</th>
 <th className="px-5 py-3.5">Price</th>
 <th className="px-5 py-3.5">Stock</th>
 <th className="px-5 py-3.5 text-center">Offer</th>
 <th className="px-5 py-3.5 text-center">Expiry</th>
 <th className="px-5 py-3.5 text-right">Delete</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-slate-200">
 {brandProducts.length === 0 ? (
 <tr><td colSpan="6" className="text-center py-10 text-slate-500">No products for this brand yet.</td></tr>
 ) : filteredBrandProducts.length === 0 ? (
 <tr><td colSpan="6" className="text-center py-10 text-slate-500">No products match your search.</td></tr>
 ) : (
 filteredBrandProducts.map((product) => {
 const isLowStock = product.stockQuantity < 5;
 const hasDiscount = product.isOfferActive && product.discountPercentage > 0;
 const finalPrice = hasDiscount ? product.price * (1 - product.discountPercentage / 100) : product.price;
 return (
 <tr key={product.id} onClick={() => setEditingProduct(product)} className="hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition cursor-pointer">
 <td className="px-5 py-4">
 <div className="font-semibold text-slate-100">{product.name}</div>
 {isLowStock && <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">Low Stock</span>}
 </td>
 <td className="px-5 py-4 font-mono">
 {hasDiscount ? (
 <div>
 <span className="font-bold text-slate-100">₹{finalPrice.toFixed(2)}</span>
 <span className="text-xs text-slate-500 line-through ml-1.5">₹{product.price.toFixed(2)}</span>
 </div>
 ) : (
 <span>₹{product.price.toFixed(2)}</span>
 )}
 </td>
 <td className="px-5 py-4 font-semibold text-slate-200">{product.stockQuantity}</td>
 <td className="px-5 py-4 text-center">
 {product.isOfferActive ? <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-md">Active</span> : <span className="text-xs bg-[#f4f4f5] text-slate-500 font-bold px-2 py-1 rounded-md">Inactive</span>}
 </td>
 <td className="px-5 py-4 text-center">
 {product.expiryDate ? <span className="text-xs text-slate-400">{new Date(product.expiryDate).toLocaleDateString()}</span> : <span className="text-xs text-slate-500">N/A</span>}
 </td>
 <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
 <button onClick={() => deleteProduct(product.id)} className="text-rose-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
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

 // ── Render ORDERS QUEUE View ───────────────────────────────────────────────
 if (view === 'orders_queue') {
 const filteredOrders = orders.filter(o => o.status === activeQueueTab);

 return (
 <div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-8"
 >
 {/* Header */}
 <div className="bg-[#111827] p-4 rounded-md shadow-sm border border-white/5 flex justify-between items-center gap-4 flex-wrap">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-md flex items-center justify-center border-4 border-white shadow-sm">
 <ShoppingBag className="h-7 w-7" />
 </div>
 <div>
 <h1 className="text-3xl font-bold text-slate-100 tracking-normal">Fulfillment Queue</h1>
 <p className="text-slate-400 font-semibold mt-0.5">Manage and track orders across all retailers</p>
 </div>
 </div>
 <button
 onClick={() => setView('hub')}
 className="bg-[#f4f4f5] hover:bg-slate-200 text-slate-200 font-bold py-2.5 px-5 rounded-md flex items-center gap-2 transition"
 >
 <ArrowLeft className="h-5 w-5" /> Back to Hub
 </button>
 </div>

 {/* Tab Switcher */}
 <div className="flex border-b border-slate-250 gap-4">
 <button
 onClick={() => setActiveQueueTab('processing')}
 className={`pb-4 text-sm font-bold flex items-center gap-2 transition-all relative ${
 activeQueueTab === 'processing'
 ? 'text-amber-600 border-b-2 border-amber-500'
 : 'text-slate-400 hover:text-slate-850'
 }`}
 >
 <Clock className="h-4 w-4" />
 Pending Confirmation
 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
 activeQueueTab === 'processing' ? 'bg-amber-100 text-amber-700' : 'bg-[#f4f4f5] text-slate-400'
 }`}>
 {orders.filter(o => o.status === 'processing').length}
 </span>
 </button>

 <button
 onClick={() => setActiveQueueTab('confirmed')}
 className={`pb-4 text-sm font-bold flex items-center gap-2 transition-all relative ${
 activeQueueTab === 'confirmed'
 ? 'text-indigo-600 border-b-2 border-indigo-500'
 : 'text-slate-400 hover:text-slate-850'
 }`}
 >
 <Truck className="h-4 w-4" />
 Pending Delivery
 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
 activeQueueTab === 'confirmed' ? 'bg-indigo-100 text-indigo-700' : 'bg-[#f4f4f5] text-slate-400'
 }`}>
 {orders.filter(o => o.status === 'confirmed').length}
 </span>
 </button>
 </div>

 {/* Orders List */}
 <div className="bg-[#111827] p-4 rounded-md border border-white/5 shadow-sm space-y-5">
 {filteredOrders.length === 0 ? (
 <div className="text-center py-16 text-slate-500 border border-dashed border-white/10 rounded-md">
 No orders found in this status queue.
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-4">
 {filteredOrders.map((order) => {
 const safeStatus = order.status || 'processing';
 const currentIdx = statusFlow.indexOf(safeStatus);
 const nextStatus = safeStatus === 'cancelled' ? null : statusFlow[currentIdx + 1];
 return (
 <div key={order.id} className="p-5 bg-transparent border border-white/5 rounded-md space-y-4 hover:bg-[#f4f4f5] transition">
 <div className="flex items-start justify-between gap-3 flex-wrap">
 <div>
 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-50 border border-purple-100 dark:border-purple-500/20 px-2.5 py-0.5 rounded-md">
 👤 {order.userName || 'Retailer'}
 </span>
 <span className="text-xs text-slate-500 font-mono">ID: {order.id}</span>
 </div>
 <p className="font-bold text-slate-100 mt-2 text-base">{order.productName}</p>
 <p className="text-xs text-slate-400 mt-0.5">{order.orderDate} {order.orderTime}</p>
 </div>
 <div className="flex items-center gap-2 flex-wrap">
 <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${statusStyles[safeStatus]}`}>
 {statusDisplayLabel[safeStatus] || safeStatus}
 </span>
 {nextStatus && (
 <button onClick={() => updateOrderStatus(order.id, nextStatus)}
 className={`text-xs font-bold px-3 py-1.5 rounded-md transition ${nextBtnStyles[nextStatus]}`}>
 {nextBtnLabel[nextStatus] || 'Update Status'}
 </button>
 )}
 {safeStatus === 'processing' && (
 <button onClick={() => updateOrderStatus(order.id, 'cancelled')}
 className="text-xs font-bold px-3 py-1.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200 transition">
 Cancel Order
 </button>
 )}
 </div>
 </div>

 {/* Order details */}
 <div className="grid grid-cols-3 gap-2 bg-[#f4f4f5]/40 p-3 rounded-md border border-white/5 dark:border-white/5 text-center">
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
 {order.freeUnits > 0 ? `+${order.freeUnits}` : '0'}
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
 Invoice
 </Link>
 )}
 </div>

 {order.deliveryAddress && typeof order.deliveryAddress === 'object' && (
 <div className="bg-[#111827] border border-white/5 rounded-md p-3 flex gap-3">
 <MapPin className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
 <div>
 <p className="text-xs font-bold text-slate-200">{order.deliveryAddress?.name} ({order.deliveryAddress?.phone})</p>
 <p className="text-xs text-slate-400 mt-0.5">
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

 // ── Render RETAILER View ───────────────────────────────────────────────────
 if (view === 'retailer') {
 const retailerOrders = orders.filter(o => o.userId === selectedRetailer.id);
 const retailerPayments = payments.filter(p => p.userId === selectedRetailer.id);
 
 // Calculate total lifetime due and total paid
 const totalLifetime = retailerOrders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
 const totalPaid = retailerPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
 const pendingAmount = totalLifetime - totalPaid;

 return (
 <div 
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="space-y-8"
 >
 {/* Record Payment Modal */}
 
 {showPaymentModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="absolute inset-0 bg-[#18181b]/50 backdrop-blur-sm" 
 onClick={() => setShowPaymentModal(false)} 
 />
 <div 
 initial={{ opacity: 0, scale: 0.95, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 20 }}
 className="relative bg-[#111827] rounded-md shadow-sm w-full max-w-md overflow-hidden"
 >
 <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
 <div>
 <h2 className="text-base font-bold">Record Payment</h2>
 <p className="text-indigo-100 text-xs">Log a manual payment received from {selectedRetailer.name}</p>
 </div>
 <button onClick={() => setShowPaymentModal(false)} className="text-white/70 hover:text-white p-1.5 rounded-md hover:bg-[#111827] transition">
 <X className="h-5 w-5" />
 </button>
 </div>

 <form onSubmit={handleRecordPayment} className="p-4 space-y-4">
 {/* Show current pending balance */}
 <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 flex items-center justify-between">
 <span className="text-xs font-bold text-amber-800">Pending Balance Due:</span>
 <span className="text-sm font-bold text-amber-900 font-mono">₹{pendingAmount.toFixed(2)}</span>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Amount Received (₹) *</label>
 <div className="relative">
 <span className="absolute left-3 top-2.5 text-slate-500 text-sm font-semibold">₹</span>
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
 <p className="text-[10px] text-slate-500 mt-1">Maximum allowed: ₹{pendingAmount.toFixed(2)}</p>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Payment Date (Optional)</label>
 <input
 type="date"
 value={paymentDate}
 onChange={(e) => setPaymentDate(e.target.value)}
 className={inputCls}
 />
 <p className="text-[10px] text-slate-500 mt-1">Leaves empty to automatically use the current date.</p>
 </div>

 {paymentError && (
 <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold px-4 py-2.5 rounded-md">
 {paymentError}
 </div>
 )}

 <div className="flex gap-3 pt-2">
 <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 py-2.5 rounded-md border border-white/10 text-slate-400 font-semibold text-sm hover:bg-transparent transition">
 Cancel
 </button>
 <button type="submit" className="flex-1 py-2.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition">
 Record Payment
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 

 <div className="bg-[#111827] p-4 rounded-md shadow-sm border border-white/5 flex justify-between items-center gap-4 flex-wrap">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-md flex items-center justify-center border-4 border-white shadow-sm">
 <User className="h-7 w-7" />
 </div>
 <div>
 <h1 className="text-3xl font-bold text-slate-100 tracking-normal">{selectedRetailer?.name || 'Retailer'}</h1>
 <p className="text-slate-400 font-semibold mt-0.5">@{selectedRetailer?.username} · 📞 {selectedRetailer?.phone}</p>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <button
 onClick={handleDeleteRetailer}
 className="bg-rose-100 hover:bg-rose-200 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 font-bold py-2.5 px-4 rounded-md flex items-center gap-2 transition"
 title="Remove Retailer"
 >
 <Trash2 className="h-5 w-5" />
 </button>
 <button
 onClick={() => setShowPaymentModal(true)}
 className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-md flex items-center gap-2 transition shadow-sm"
 >
 <IndianRupee className="h-5 w-5" /> Record Payment
 </button>
 <button
 onClick={() => setView('hub')}
 className="bg-[#f4f4f5] hover:bg-slate-200 text-slate-200 font-bold py-2.5 px-5 rounded-md flex items-center gap-2 transition"
 >
 <ArrowLeft className="h-5 w-5" /> Back to Hub
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-[#111827] p-4 rounded-md border border-rose-100 shadow-sm flex items-center gap-5">
 <div className="p-4 bg-rose-50 text-rose-500 rounded-md"><IndianRupee className="h-8 w-8" /></div>
 <div>
 <p className="text-rose-600 text-sm font-bold uppercase tracking-wider">Remaining Balance Due</p>
 <p className="text-4xl font-bold text-slate-100 mt-1">₹{pendingAmount.toFixed(2)}</p>
 <p className="text-xs text-slate-400 mt-1">Outstanding outstanding amount</p>
 </div>
 </div>
 <div className="bg-[#111827] p-4 rounded-md border border-indigo-100 dark:border-indigo-500/30 shadow-sm flex items-center gap-5">
 <div className="p-4 bg-indigo-50 text-indigo-500 rounded-md"><IndianRupee className="h-8 w-8" /></div>
 <div>
 <p className="text-indigo-600 text-sm font-bold uppercase tracking-wider">Total Amount Paid</p>
 <p className="text-4xl font-bold text-slate-100 mt-1">₹{totalPaid.toFixed(2)}</p>
 <p className="text-xs text-slate-400 mt-1">From {retailerPayments.length} logged payments</p>
 </div>
 </div>
 <div className="bg-[#111827] p-4 rounded-md border border-emerald-100 shadow-sm flex items-center gap-5">
 <div className="p-4 bg-emerald-50 text-emerald-500 rounded-md"><CheckCircle className="h-8 w-8" /></div>
 <div>
 <p className="text-emerald-600 text-sm font-bold uppercase tracking-wider">Lifetime Processed</p>
 <p className="text-4xl font-bold text-slate-100 mt-1">₹{totalLifetime.toFixed(2)}</p>
 <p className="text-xs text-slate-400 mt-1">Across {retailerOrders.length} total order(s)</p>
 </div>
 </div>
 </div>

 {/* Transaction History / Ledger */}
 <div className="bg-[#111827] p-4 rounded-md border border-white/5 shadow-sm space-y-5">
 <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
 <IndianRupee className="text-emerald-600" /> Transaction History (Ledger)
 </h2>
 {retailerPayments.length === 0 ? (
 <div className="text-center py-10 text-slate-500 border border-dashed border-white/10 rounded-md">
 No payments recorded yet.
 </div>
 ) : (
 <div className="overflow-x-auto rounded-md border border-white/5">
 <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
 <thead className="bg-transparent text-slate-400 font-semibold text-xs uppercase tracking-wider">
 <tr>
 <th className="px-5 py-3.5">Date & Time</th>
 <th className="px-5 py-3.5">Transaction ID</th>
 <th className="px-5 py-3.5 text-right">Amount Paid</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-slate-200 font-medium">
 {(showAllLedger ? retailerPayments : retailerPayments.slice(0, 3)).map((payment) => (
 <tr key={payment.id} className="hover:bg-transparent/50 transition">
 <td className="px-5 py-4">
 <div className="text-slate-100 font-bold">{payment.date}</div>
 <div className="text-xs text-slate-500 font-semibold">{payment.time || ''}</div>
 </td>
 <td className="px-5 py-4 font-mono text-xs text-slate-400">{payment.id}</td>
 <td className="px-5 py-4 text-right text-emerald-600 font-bold font-mono">
 +₹{Number(payment.amount).toFixed(2)}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 {retailerPayments.length > 3 && (
 <div className="border-t border-white/5 bg-transparent p-2 text-center">
 <button
 onClick={() => setShowAllLedger(!showAllLedger)}
 className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition flex items-center justify-center gap-1 w-full"
 >
 {showAllLedger ? (
 <><ChevronUp className="h-4 w-4" /> Show Less</>
 ) : (
 <><ChevronDown className="h-4 w-4" /> View All {retailerPayments.length} Transactions</>
 )}
 </button>
 </div>
 )}
 </div>
 )}
 </div>

 <div className="bg-[#111827] p-4 rounded-md border border-white/5 shadow-sm space-y-5">
 <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
 <ShoppingBag className="text-indigo-600" /> Order History
 </h2>
 
 {retailerOrders.length === 0 ? (
 <div className="text-center py-10 text-slate-500 border border-dashed border-white/10 rounded-md">
 No orders from this retailer yet.
 </div>
 ) : (
 <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
 {retailerOrders.map((order) => {
 const safeStatus = order.status || 'processing';
 const currentIdx = statusFlow.indexOf(safeStatus);
 const nextStatus = safeStatus === 'cancelled' ? null : statusFlow[currentIdx + 1];
 return (
 <div key={order.id} className="p-4 bg-transparent border border-white/5 rounded-md space-y-3 hover:bg-[#f4f4f5] transition">
 <div className="flex items-start justify-between gap-3 flex-wrap">
 <div>
 <p className="font-bold text-slate-100">{order.productName}</p>
 <p className="text-xs text-slate-400 mt-0.5">{order.orderDate} {order.orderTime}</p>
 <p className="text-xs text-slate-500 font-mono mt-0.5">{order.id}</p>
 </div>
 <div className="flex items-center gap-2 flex-wrap">
 <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${statusStyles[safeStatus]}`}>
 {statusDisplayLabel[safeStatus] || safeStatus}
 </span>
 {nextStatus && (
 <button onClick={() => updateOrderStatus(order.id, nextStatus)}
 className={`text-xs font-bold px-3 py-1.5 rounded-md transition ${nextBtnStyles[nextStatus]}`}>
 {nextBtnLabel[nextStatus] || 'Update Status'}
 </button>
 )}
 {safeStatus === 'processing' && (
 <button onClick={() => updateOrderStatus(order.id, 'cancelled')}
 className="text-xs font-bold px-3 py-1.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200 transition">
 Cancel Order
 </button>
 )}
 </div>
 </div>
 {/* Order details */}
 <div className="grid grid-cols-3 gap-2 bg-[#f4f4f5]/40 p-3 rounded-md border border-white/5 dark:border-white/5 text-center">
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
 {order.freeUnits > 0 ? `+${order.freeUnits}` : '0'}
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
 Invoice
 </Link>
 )}
 </div>

 {order.deliveryAddress && typeof order.deliveryAddress === 'object' && (
 <div className="bg-transparent border border-white/5 rounded-md p-3 flex gap-3">
 <MapPin className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
 <div>
 <p className="text-xs font-bold text-slate-200">{order.deliveryAddress?.name} ({order.deliveryAddress?.phone})</p>
 <p className="text-xs text-slate-400 mt-0.5">
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
