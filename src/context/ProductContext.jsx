import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

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
    offerText: '10 + 2'
  },
  {
    id: 'prod-2',
    name: 'Amoxicillin 250mg',
    brand: 'HealthLife',
    price: 24.99,
    stockQuantity: 15,
    discountPercentage: 0,
    isOfferActive: false,
    offerText: ''
  },
  {
    id: 'prod-3',
    name: 'Digital Thermometer',
    brand: 'MediTech',
    price: 19.99,
    stockQuantity: 8,
    discountPercentage: 15,
    isOfferActive: true,
    offerText: '5 + 1'
  },
  {
    id: 'prod-4',
    name: 'Ibuprofen 400mg',
    brand: 'PharmaCorp',
    price: 7.49,
    stockQuantity: 4,
    discountPercentage: 5,
    isOfferActive: false,
    offerText: ''
  },
  {
    id: 'prod-5',
    name: 'Omeprazole 20mg',
    brand: 'HealthLife',
    price: 18.50,
    stockQuantity: 20,
    discountPercentage: 12,
    isOfferActive: true,
    offerText: '15 + 3'
  }
];

// Helper functions for promo schemes
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

// ─────────────────────────────────────────────────────
// ProductProvider accepts a userId so each user's cart
// is stored under a unique key: pharmacy_cart_{userId}
// Products (inventory) remain globally shared.
// ─────────────────────────────────────────────────────
export const ProductProvider = ({ children, userId }) => {
  // Derive the user-specific cart key
  const cartKey = userId ? `pharmacy_cart_${userId}` : 'pharmacy_cart_guest';

  // ── Shared global state ──────────────────────────
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('pharmacy_products_v4');
    let loaded = saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
    return loaded;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('pharmacy_orders_v4');
    return saved ? JSON.parse(saved) : [];
  });

  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem('pharmacy_payments_v4');
    return saved ? JSON.parse(saved) : [];
  });

  const DEFAULT_BRANDS = ['PharmaCorp', 'HealthLife', 'MediTech'];
  const [brands, setBrands] = useState(() => {
    const saved = localStorage.getItem('pharmacy_brands_v4');
    return saved ? JSON.parse(saved) : DEFAULT_BRANDS;
  });

  // ── Per-user cart state ───────────────────────────
  // We use a ref to track the previous cartKey so we can
  // reload the cart when the logged-in user changes.
  const cartKeyRef = useRef(cartKey);

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(cartKey);
    return saved ? JSON.parse(saved) : [];
  });

  // When userId changes (e.g. different user logs in on this tab),
  // save old cart and load the new user's cart from their own key.
  useEffect(() => {
    if (cartKeyRef.current !== cartKey) {
      cartKeyRef.current = cartKey;
      const saved = localStorage.getItem(cartKey);
      setCart(saved ? JSON.parse(saved) : []);
    }
  }, [cartKey]);

  // ── Persist to localStorage ───────────────────────
  useEffect(() => {
    localStorage.setItem('pharmacy_products_v4', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pharmacy_orders_v4', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('pharmacy_payments_v4', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('pharmacy_brands_v4', JSON.stringify(brands));
  }, [brands]);

  useEffect(() => {
    // Each user's cart saved under their own key
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey]);

  // ── Cross-tab sync (only for products, orders & payments) ───
  // Cart is NOT synced cross-tab — each user manages their own.
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'pharmacy_products_v4' && e.newValue) {
        setProducts(JSON.parse(e.newValue));
      }
      if (e.key === 'pharmacy_orders_v4' && e.newValue) {
        setOrders(JSON.parse(e.newValue));
      }
      if (e.key === 'pharmacy_payments_v4' && e.newValue) {
        setPayments(JSON.parse(e.newValue));
      }
      if (e.key === 'pharmacy_brands_v4' && e.newValue) {
        setBrands(JSON.parse(e.newValue));
      }
      // Only sync this user's cart if it was updated from another tab of the same user
      if (e.key === cartKey && e.newValue) {
        setCart(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [cartKey]);

  // ── Provider Functions ──────────────────────────
  const addBrand = (brandName) => {
    if (!brands.includes(brandName)) {
      setBrands(prev => [...prev, brandName]);
    }
  };

  const deleteBrand = (brandName) => {
    setBrands(prev => prev.filter(b => b !== brandName));
    setProducts(prev => prev.filter(p => p.brand !== brandName));
  };

  const updateBrand = (oldBrandName, newBrandName) => {
    const trimmedNew = newBrandName.trim();
    if (!trimmedNew || oldBrandName === trimmedNew) return;
    
    // Rename in brands list
    setBrands(prev => prev.map(b => b === oldBrandName ? trimmedNew : b));
    
    // Rename brand field of all products
    setProducts(prev => prev.map(p => p.brand === oldBrandName ? { ...p, brand: trimmedNew } : p));
  };
  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: `prod-${Date.now()}`,
      brand: product.brand || 'Unbranded'
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const updateProduct = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
  };

  const deleteProduct = (id) => {
    removeFromCart(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Cart operations — adjust global stock instantly
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

  const checkoutCart = (userInfo) => {
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
        // Order lifecycle tracking
        status: 'processing',
        statusHistory: [
          { status: 'processing', label: 'Order Received', date: dateStr, time: timeStr }
        ],
        orderDate: dateStr,
        orderTime: timeStr
      };
    });

    setOrders((prev) => [...newOrders, ...prev]);
    setCart([]);
    return { success: true, orderIds: newOrders.map(o => o.id) };
  };

  // Owner updates an order's delivery status
  const updateOrderStatus = (orderId, newStatus) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const labels = {
      processing: 'Order Received',
      confirmed:  'Order Confirmed',
      delivered:  'Delivered'
    };

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: newStatus,
              statusHistory: [
                ...o.statusHistory,
                { status: newStatus, label: labels[newStatus], date: dateStr, time: timeStr }
              ]
            }
          : o
      )
    );
  };

  const addPayment = (userId, amount, date) => {
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
    setPayments(prev => [newPayment, ...prev]);
    return newPayment;
  };

  const resetData = () => {
    setProducts(DEFAULT_PRODUCTS);
    setOrders([]);
    setPayments([]);
    setCart([]);
  };

  return (
    <ProductContext.Provider value={{
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
    }}>
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
