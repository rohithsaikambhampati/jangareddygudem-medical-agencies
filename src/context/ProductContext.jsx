import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

const ProductContext = createContext();

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Paracetamol 500mg',
    brand: 'PharmaCorp',
    price: 5.99,
    stockQuantity: 50,
    discountPercentage: 10,
    isOfferActive: true,
    offerText: '10 + 2',
    expiryDate: null
  },
  {
    id: 'prod-2',
    name: 'Amoxicillin 250mg',
    brand: 'HealthLife',
    price: 24.99,
    stockQuantity: 15,
    discountPercentage: 0,
    isOfferActive: false,
    offerText: '',
    expiryDate: null
  },
  {
    id: 'prod-3',
    name: 'Digital Thermometer',
    brand: 'MediTech',
    price: 19.99,
    stockQuantity: 8,
    discountPercentage: 15,
    isOfferActive: true,
    offerText: '5 + 1',
    expiryDate: null
  },
  {
    id: 'prod-4',
    name: 'Ibuprofen 400mg',
    brand: 'PharmaCorp',
    price: 7.49,
    stockQuantity: 4,
    discountPercentage: 5,
    isOfferActive: false,
    offerText: '',
    expiryDate: null
  },
  {
    id: 'prod-5',
    name: 'Omeprazole 20mg',
    brand: 'HealthLife',
    price: 18.50,
    stockQuantity: 20,
    discountPercentage: 12,
    isOfferActive: true,
    offerText: '15 + 3',
    expiryDate: null
  }
];

export const parseOffer = (offerText) => {
  if (!offerText) return null;
  const text = offerText.trim();

  // Format 1: '10 + 2' or '10+2'
  const plusMatch = text.match(/^(\d+)\s*\+\s*(\d+)$/);
  if (plusMatch) {
    return { buy: parseInt(plusMatch[1], 10), free: parseInt(plusMatch[2], 10) };
  }

  // Format 2: 'Buy 5 Get 1 Free' or 'buy 10 get 2 free'
  const buyGetMatch = text.match(/buy\s+(\d+)\s+get\s+(\d+)\s+free/i);
  if (buyGetMatch) {
    return { buy: parseInt(buyGetMatch[1], 10), free: parseInt(buyGetMatch[2], 10) };
  }

  return null;
};

export const getDispatchedQty = (product, baseQty) => {
  const offer = parseOffer(product.offerText);
  if (product.isOfferActive && offer) {
    const freeUnits = Math.floor(baseQty / offer.buy) * offer.free;
    return baseQty + freeUnits;
  }
  return baseQty;
};

// ── Model Mapping Helpers ──────────────────────────────────────────────────
const mapDbProductToReact = (dbProd) => ({
  id: dbProd.id,
  name: dbProd.name,
  brand: dbProd.brand,
  price: Number(dbProd.price),
  stockQuantity: dbProd.stock_quantity,
  discountPercentage: Number(dbProd.discount_percentage || 0),
  isOfferActive: dbProd.is_offer_active,
  offerText: dbProd.offer_text || '',
  expiryDate: dbProd.expiry_date || null
});

const mapReactProductToDb = (reactProd) => ({
  id: reactProd.id,
  name: reactProd.name,
  brand: reactProd.brand,
  price: reactProd.price,
  stock_quantity: reactProd.stockQuantity,
  discount_percentage: reactProd.discountPercentage,
  is_offer_active: reactProd.isOfferActive,
  offer_text: reactProd.offerText,
  expiry_date: reactProd.expiryDate || null
});

const mapDbOrderToReact = (dbOrd) => ({
  id: dbOrd.id,
  productId: dbOrd.product_id,
  productName: dbOrd.product_name,
  offerText: dbOrd.offer_text || '',
  discountPercentage: Number(dbOrd.discount_percentage || 0),
  quantity: dbOrd.quantity,
  totalDispatched: dbOrd.total_dispatched,
  freeUnits: dbOrd.free_units,
  unitPrice: Number(dbOrd.unit_price || 0),
  finalUnitPrice: Number(dbOrd.final_unit_price || 0),
  totalPrice: Number(dbOrd.total_price || 0),
  userId: dbOrd.user_id,
  userName: dbOrd.user_name || 'Retailer',
  deliveryAddress: dbOrd.delivery_address,
  status: dbOrd.status,
  statusHistory: dbOrd.status_history || [],
  orderDate: dbOrd.order_date,
  orderTime: dbOrd.order_time
});

const mapReactOrderToDb = (reactOrd) => ({
  id: reactOrd.id,
  product_id: reactOrd.productId,
  product_name: reactOrd.productName,
  offer_text: reactOrd.offerText,
  discount_percentage: reactOrd.discountPercentage,
  quantity: reactOrd.quantity,
  total_dispatched: reactOrd.totalDispatched,
  free_units: reactOrd.freeUnits,
  unit_price: reactOrd.unitPrice,
  final_unit_price: reactOrd.finalUnitPrice,
  total_price: reactOrd.totalPrice,
  user_id: reactOrd.userId,
  user_name: reactOrd.userName,
  delivery_address: reactOrd.deliveryAddress,
  status: reactOrd.status,
  status_history: reactOrd.statusHistory,
  order_date: reactOrd.orderDate,
  order_time: reactOrd.orderTime
});

const mapDbPaymentToReact = (dbPay) => ({
  id: dbPay.id,
  userId: dbPay.user_id,
  amount: Number(dbPay.amount),
  date: dbPay.date,
  time: dbPay.time
});

const mapReactPaymentToDb = (reactPay) => ({
  id: reactPay.id,
  user_id: reactPay.userId,
  amount: reactPay.amount,
  date: reactPay.date,
  time: reactPay.time
});

export const ProductProvider = ({ children, userId }) => {
  const cartKey = userId ? `pharmacy_cart_${userId}` : 'pharmacy_cart_guest';

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [brands, setBrands] = useState([]);

  const cartKeyRef = useRef(cartKey);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(cartKey);
    return saved ? JSON.parse(saved) : [];
  });

  // Reload cart when user session changes
  useEffect(() => {
    if (cartKeyRef.current !== cartKey) {
      cartKeyRef.current = cartKey;
      const saved = localStorage.getItem(cartKey);
      setCart(saved ? JSON.parse(saved) : []);
    }
  }, [cartKey]);

  // Persist cart locally
  useEffect(() => {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey]);

  // Load initial data from Supabase & adjust products stock based on local cart
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: dbProducts } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        const { data: dbOrders } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        const { data: dbPayments } = await supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false });

        const { data: dbBrands } = await supabase
          .from('brands')
          .select('*');

        if (dbBrands) setBrands(dbBrands.map((b) => b.name));
        if (dbOrders) setOrders(dbOrders.map(mapDbOrderToReact));
        if (dbPayments) setPayments(dbPayments.map(mapDbPaymentToReact));

        if (dbProducts) {
          const reactProducts = dbProducts.map(mapDbProductToReact);
          // Subtract quantities in current user's local cart from products stock
          const currentCart = JSON.parse(localStorage.getItem(cartKey)) || [];
          const adjustedProducts = reactProducts.map((p) => {
            const cartItem = currentCart.find((item) => item.id === p.id);
            if (cartItem) {
              return { ...p, stockQuantity: Math.max(0, p.stockQuantity - cartItem.totalDispatched) };
            }
            return p;
          });
          setProducts(adjustedProducts);
        }
      } catch (err) {
        console.error('Error fetching data from Supabase:', err);
      }
    };

    fetchData();
  }, [cartKey]);

  // Real-time Database Subscriptions
  useEffect(() => {
    const productsChannel = supabase
      .channel('products_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setProducts((prev) => {
            if (prev.some((p) => p.id === payload.new.id)) return prev;
            return [mapDbProductToReact(payload.new), ...prev];
          });
        } else if (payload.eventType === 'DELETE') {
          setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setProducts((prev) =>
            prev.map((p) => (p.id === payload.new.id ? mapDbProductToReact(payload.new) : p))
          );
        }
      })
      .subscribe();

    const ordersChannel = supabase
      .channel('orders_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders((prev) => {
            if (prev.some((o) => o.id === payload.new.id)) return prev;
            return [mapDbOrderToReact(payload.new), ...prev];
          });
        } else if (payload.eventType === 'DELETE') {
          setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setOrders((prev) =>
            prev.map((o) => (o.id === payload.new.id ? mapDbOrderToReact(payload.new) : o))
          );
        }
      })
      .subscribe();

    const paymentsChannel = supabase
      .channel('payments_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPayments((prev) => {
            if (prev.some((p) => p.id === payload.new.id)) return prev;
            return [mapDbPaymentToReact(payload.new), ...prev];
          });
        } else if (payload.eventType === 'DELETE') {
          setPayments((prev) => prev.filter((p) => p.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setPayments((prev) =>
            prev.map((p) => (p.id === payload.new.id ? mapDbPaymentToReact(payload.new) : p))
          );
        }
      })
      .subscribe();

    const brandsChannel = supabase
      .channel('brands_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'brands' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setBrands((prev) => {
            if (prev.includes(payload.new.name)) return prev;
            return [...prev, payload.new.name];
          });
        } else if (payload.eventType === 'DELETE') {
          setBrands((prev) => prev.filter((b) => b !== payload.old.name));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(brandsChannel);
    };
  }, []);

  // ── Provider Functions ──────────────────────────
  const addBrand = async (brandName) => {
    const trimmed = brandName.trim();
    if (!trimmed) return;
    try {
      const { error } = await supabase.from('brands').insert([{ name: trimmed }]);
      if (error) throw error;
      setBrands((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    } catch (err) {
      console.error('Error adding brand:', err);
    }
  };

  const deleteBrand = async (brandName) => {
    try {
      const { error: prodErr } = await supabase.from('products').delete().eq('brand', brandName);
      if (prodErr) throw prodErr;

      const { error: brandErr } = await supabase.from('brands').delete().eq('name', brandName);
      if (brandErr) throw brandErr;

      setBrands((prev) => prev.filter((b) => b !== brandName));
      setProducts((prev) => prev.filter((p) => p.brand !== brandName));
    } catch (err) {
      console.error('Error deleting brand:', err);
    }
  };

  const updateBrand = async (oldBrandName, newBrandName) => {
    const trimmedNew = newBrandName.trim();
    if (!trimmedNew || oldBrandName === trimmedNew) return;

    try {
      const { error: insertErr } = await supabase.from('brands').insert([{ name: trimmedNew }]);
      if (insertErr) throw insertErr;

      const { error: prodUpdateErr } = await supabase
        .from('products')
        .update({ brand: trimmedNew })
        .eq('brand', oldBrandName);
      if (prodUpdateErr) throw prodUpdateErr;

      const { error: deleteErr } = await supabase.from('brands').delete().eq('name', oldBrandName);
      if (deleteErr) throw deleteErr;

      setBrands((prev) =>
        prev
          .map((b) => (b === oldBrandName ? trimmedNew : b))
          .filter((v, i, a) => a.indexOf(v) === i)
      );
      setProducts((prev) =>
        prev.map((p) => (p.brand === oldBrandName ? { ...p, brand: trimmedNew } : p))
      );
    } catch (err) {
      console.error('Error updating brand:', err);
    }
  };

  const addProduct = async (product) => {
    const newProduct = {
      ...product,
      id: `prod-${Date.now()}`,
      brand: product.brand || 'Unbranded'
    };
    try {
      const { error } = await supabase.from('products').insert([mapReactProductToDb(newProduct)]);
      if (error) throw error;
      setProducts((prev) => {
        if (prev.some(p => p.id === newProduct.id)) return prev;
        return [newProduct, ...prev];
      });
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const updateProduct = async (updatedProduct) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(mapReactProductToDb(updatedProduct))
        .eq('id', updatedProduct.id);
      if (error) throw error;
      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const deleteProduct = async (id) => {
    try {
      removeFromCart(id);
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  // Cart operations (instant local state updates)
  const addToCart = (productId) => {
    let success = false;
    let errorMsg = '';

    setProducts((prevProducts) => {
      const product = prevProducts.find((p) => p.id === productId);
      if (!product) return prevProducts;

      const cartItem = cart.find((item) => item.id === productId);
      const currentBaseQty = cartItem ? cartItem.quantity : 0;
      const currentDispatched = cartItem ? cartItem.totalDispatched : 0;
      const newBaseQty = currentBaseQty + 1;

      const totalPhysicalStock = product.stockQuantity + currentDispatched;

      if (newBaseQty > totalPhysicalStock) {
        errorMsg = `Insufficient stock! Only ${totalPhysicalStock} units of ${product.name} available.`;
        return prevProducts;
      }

      const targetDispatched = getDispatchedQty(product, newBaseQty);
      const actualDispatched = Math.min(targetDispatched, totalPhysicalStock);
      const stockDiffNeeded = actualDispatched - currentDispatched;

      success = true;

      setCart((prevCart) => {
        const existing = prevCart.find((item) => item.id === productId);
        if (existing) {
          return prevCart.map((item) =>
            item.id === productId
              ? { ...item, quantity: newBaseQty, totalDispatched: actualDispatched }
              : item
          );
        }
        return [...prevCart, { ...product, quantity: 1, totalDispatched: actualDispatched }];
      });

      return prevProducts.map((p) =>
        p.id === productId ? { ...p, stockQuantity: p.stockQuantity - stockDiffNeeded } : p
      );
    });

    if (success) return { success: true };
    return { success: false, message: errorMsg };
  };

  const updateCartQty = (productId, newBaseQty) => {
    if (newBaseQty <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    let success = false;
    let errorMsg = '';

    setProducts((prevProducts) => {
      const product = prevProducts.find((p) => p.id === productId);
      if (!product) return prevProducts;

      const cartItem = cart.find((item) => item.id === productId);
      if (!cartItem) return prevProducts;

      const currentDispatched = cartItem.totalDispatched;
      const totalPhysicalStock = product.stockQuantity + currentDispatched;

      if (newBaseQty > totalPhysicalStock) {
        errorMsg = `Insufficient stock! Only ${totalPhysicalStock} units available.`;
        return prevProducts;
      }

      const targetDispatched = getDispatchedQty(product, newBaseQty);
      const actualDispatched = Math.min(targetDispatched, totalPhysicalStock);
      const stockDiffNeeded = actualDispatched - currentDispatched;

      success = true;

      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId
            ? { ...item, quantity: newBaseQty, totalDispatched: actualDispatched }
            : item
        )
      );

      return prevProducts.map((p) =>
        p.id === productId ? { ...p, stockQuantity: p.stockQuantity - stockDiffNeeded } : p
      );
    });

    if (success) return { success: true };
    return { success: false, message: errorMsg };
  };

  const removeFromCart = (productId) => {
    const cartItem = cart.find((item) => item.id === productId);
    if (!cartItem) return;

    setProducts((prevProducts) => {
      const product = prevProducts.find((p) => p.id === productId);
      if (!product) return prevProducts;

      const currentDispatched = cartItem.totalDispatched;
      return prevProducts.map((p) =>
        p.id === productId ? { ...p, stockQuantity: p.stockQuantity + currentDispatched } : p
      );
    });

    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const checkoutCart = async (userInfo) => {
    if (cart.length === 0) return { success: false };
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const newOrders = cart.map((cartItem) => {
      const product = products.find((p) => p.id === cartItem.id) || cartItem;
      const totalDispatched = cartItem.totalDispatched;
      const hasDiscount = product.isOfferActive && product.discountPercentage > 0;
      const finalUnitPrice = hasDiscount
        ? Number((product.price * (1 - product.discountPercentage / 100)).toFixed(2))
        : product.price;
      const finalTotalPrice = Number((finalUnitPrice * cartItem.quantity).toFixed(2));
      const freeUnits = totalDispatched - cartItem.quantity;

      return {
        id: `ord-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: cartItem.id,
        productName: product.name,
        offerText: product.offerText || '',
        discountPercentage: product.discountPercentage || 0,
        quantity: cartItem.quantity,
        totalDispatched,
        freeUnits,
        unitPrice: product.price,
        finalUnitPrice,
        totalPrice: finalTotalPrice,
        userId: userId || 'guest',
        userName: userInfo?.name || userInfo?.username || 'Retailer',
        deliveryAddress: userInfo?.deliveryAddress || null,
        status: 'processing',
        statusHistory: [
          { status: 'processing', label: 'Order Received', date: dateStr, time: timeStr }
        ],
        orderDate: dateStr,
        orderTime: timeStr
      };
    });

    try {
      // 1. Insert orders into database
      const { error: orderErr } = await supabase
        .from('orders')
        .insert(newOrders.map(mapReactOrderToDb));

      if (orderErr) throw orderErr;

      // 2. Decrement physical stock in database
      for (const cartItem of cart) {
        const { data: dbProd, error: fetchErr } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', cartItem.id)
          .single();

        if (!fetchErr && dbProd) {
          const newStock = Math.max(0, dbProd.stock_quantity - cartItem.totalDispatched);
          await supabase
            .from('products')
            .update({ stock_quantity: newStock })
            .eq('id', cartItem.id);
        }
      }

      setOrders((prev) => {
        const newUnique = newOrders.filter(n => !prev.some(p => p.id === n.id));
        return [...newUnique, ...prev];
      });
      setCart([]);
      return { success: true, orderIds: newOrders.map((o) => o.id) };
    } catch (err) {
      console.error('Checkout error:', err);
      return { success: false, message: 'Checkout failed. Database error.' };
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const labels = {
      processing: 'Order Received',
      confirmed:  'Order Confirmed',
      delivered:  'Delivered'
    };

    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const newHistory = [
      ...(order.statusHistory || []),
      { status: newStatus, label: labels[newStatus], date: dateStr, time: timeStr }
    ];

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          status_history: newHistory
        })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus, statusHistory: newHistory }
            : o
        )
      );
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const addPayment = async (userId, amount, date) => {
    const now = new Date();
    const dateStr = date || now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    const newPayment = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      amount: Number(amount),
      date: dateStr,
      time: timeStr
    };

    try {
      const { error } = await supabase
        .from('payments')
        .insert([mapReactPaymentToDb(newPayment)]);

      if (error) throw error;

      setPayments((prev) => {
        if (prev.some(p => p.id === newPayment.id)) return prev;
        return [newPayment, ...prev];
      });
      return { success: true };
    } catch (err) {
      console.error('Error adding payment:', err);
      return null;
    }
  };

  const resetData = async () => {
    try {
      await supabase.from('orders').delete().neq('id', '');
      await supabase.from('payments').delete().neq('id', '');
      await supabase.from('products').delete().neq('id', '');

      const dbSeedProducts = DEFAULT_PRODUCTS.map(mapReactProductToDb);
      await supabase.from('products').insert(dbSeedProducts);

      setOrders([]);
      setPayments([]);
      setCart([]);
      
      const { data } = await supabase.from('products').select('*');
      if (data) setProducts(data.map(mapDbProductToReact));
    } catch (err) {
      console.error('Error resetting data:', err);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        orders,
        payments,
        brands,
        cart,
        addProduct,
        updateProduct,
        deleteProduct,
        addBrand,
        deleteBrand,
        updateBrand,
        addToCart,
        updateCartQty,
        removeFromCart,
        checkoutCart,
        updateOrderStatus,
        addPayment,
        resetData
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
