import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { API, IMG } from '../config';

const CartContext = createContext();


// ─── Pending Cart: saved in sessionStorage so it survives the login redirect ───
const PENDING_KEY = 'ars_pending_cart_item';

export const savePendingCartItem   = (item) => sessionStorage.setItem(PENDING_KEY, JSON.stringify(item));
export const getPendingCartItem    = () => { try { const r = sessionStorage.getItem(PENDING_KEY); return r ? JSON.parse(r) : null; } catch { return null; } };
export const clearPendingCartItem  = () => sessionStorage.removeItem(PENDING_KEY);

export const CartProvider = ({ children }) => {
  const [cartItems,     setCartItems]     = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [customerId,    setCustomerId]    = useState(null);

  //  navigateRef: injected from App so CartContext can redirect to /login
  const navigateRef = useRef(null);
  const setNavigate = (fn) => { navigateRef.current = fn; };

  useEffect(() => {
    const saved = localStorage.getItem('customerData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.id) setCustomerId(parsed.id);
      } catch {}
    }
  }, []);

  const buildImg = (product) => {
    if (!product) return '/assets/placeholder.png';
    if (product.mainImage) return `${IMG}/${product.mainImage}`;
    return '/assets/placeholder.png';
  };

  const normalizeCartItem = (item) => {
    const p = item.product || {};
    const variants = p.variants || [];
    const computedStock = variants.length > 0
      ? variants.reduce((s, v) => s + Number(v.quantity || 0), 0) : 0;
    return {
      cartItemId: item.id,
      id: p.id,
      name: p.name,
      mainImage: p.mainImage,
      img: buildImg(p),
      price: Number(item.salesPrice),
      salesPrice: Number(item.salesPrice),
      mrpPrice: Number(p.mrpPrice) || Number(item.salesPrice),
      quantity: item.quantity,
      variants,
      totalStock: computedStock,
      category: p.category,
      description: p.description,
      variantId: item.variantId,
    };
  };

  const normalizeWishlistItem = (item) => {
    const p = item.product || {};
    const variants = p.variants || [];
    const computedStock = variants.length > 0
      ? variants.reduce((s, v) => s + Number(v.quantity || 0), 0) : 0;
    return {
      wishlistItemId: item.id,
      id: p.id,
      name: p.name,
      mainImage: p.mainImage,
      img: buildImg(p),
      price: Number(p.salesPrice) || 0,
      salesPrice: Number(p.salesPrice) || 0,
      mrpPrice: Number(p.mrpPrice) || 0,
      variants,
      totalStock: computedStock,
      category: p.category,
      description: p.description,
    };
  };

  const fetchCart = useCallback(async (cid) => {
    try {
      const res = await axios.get(`${API}/cart/${cid}`);
      setCartItems((res.data || []).map(normalizeCartItem));
    } catch (e) { console.error('Cart fetch error:', e); }
  }, []);

  const fetchWishlist = useCallback(async (cid) => {
    try {
      const res = await axios.get(`${API}/wishlist/${cid}`);
      setWishlistItems((res.data || []).map(normalizeWishlistItem));
    } catch (e) { console.error('Wishlist fetch error:', e); }
  }, []);

  useEffect(() => {
    if (customerId) {
      fetchCart(customerId);
      fetchWishlist(customerId);
    } else {
      setCartItems([]);
      setWishlistItems([]);
    }
  }, [customerId, fetchCart, fetchWishlist]);

  const onLogin  = (cid) => { setCustomerId(cid); };
  const onLogout = ()    => { setCustomerId(null); };

  const addPendingCartItem = async (cid) => {
    const pending = getPendingCartItem();
    if (!pending || !cid) return false;
    try {
      const res = await axios.post(`${API}/cart/add`, {
        customerId:  cid,
        productId:   pending.product.id,
        variantId:   pending.variantId,
        quantity:    pending.quantity,
        salesPrice:  pending.salesPrice,
        fromPending: true,         
      });
      clearPendingCartItem();
      await fetchCart(cid);
      const alreadyInCart = res.data?.alreadyInCart === true;
      return { added: true, alreadyInCart, productName: pending.product?.name };
    } catch (e) {
      console.error('Pending cart add error:', e);
      clearPendingCartItem();
      return false;
    }
  };


  const addToCart = async (product, quantity = 1) => {
    const salesPrice = Number(product.salesPrice || product.price || 0);
    const variantId  = product.selectedVariant?.id || null;

    if (customerId) {
      // Logged in — add to backend
      try {
        await axios.post(`${API}/cart/add`, {
          customerId,
          productId: product.id,
          variantId,
          quantity,
          salesPrice,
        });
        await fetchCart(customerId);
      } catch (e) { console.error('Add to cart error:', e); }

    } else {
      //  NOT logged in — save item & redirect to login
      savePendingCartItem({
        product: {
          id:              product.id,
          name:            product.name,
          mainImage:       product.mainImage,
          salesPrice:      product.salesPrice || product.price,
          mrpPrice:        product.mrpPrice,
          description:     product.description,
          category:        product.category,
          variants:        product.variants,
          totalStock:      product.totalStock,
          selectedVariant: product.selectedVariant,
        },
        quantity,
        salesPrice,
        variantId,
      });

      if (navigateRef.current) {
        const currentPath = window.location.pathname + window.location.search;
        navigateRef.current('/login', {
          state: {
            from: currentPath,         
            pendingCart: true,
            productName: product.name,
          },
        });
      }
    }
  };

  const removeFromCart = async (cartItemId, productId) => {
    if (customerId && cartItemId) {
      try {
        await axios.delete(`${API}/cart/remove/${cartItemId}`);
        await fetchCart(customerId);
      } catch (e) { console.error('Remove cart error:', e); }
    } else {
      setCartItems(prev => prev.filter(i => i.id !== (productId || cartItemId)));
    }
  };

  const updateQuantity = async (cartItemId, amount, productId) => {
    const item = cartItems.find(i => i.cartItemId === cartItemId || i.id === cartItemId);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + amount);

    if (customerId && item.cartItemId) {
      try {
        await axios.put(`${API}/cart/update/${item.cartItemId}`, { quantity: newQty });
        await fetchCart(customerId);
      } catch (e) { console.error('Update cart error:', e); }
    } else {
      setCartItems(prev => prev.map(i =>
        i.id === (productId || cartItemId) ? { ...i, quantity: newQty } : i
      ));
    }
  };

  const clearCart = async () => {
    if (customerId) {
      try {
        await axios.delete(`${API}/cart/clear/${customerId}`);
        setCartItems([]);
      } catch (e) { console.error('Clear cart error:', e); }
    } else {
      setCartItems([]);
    }
  };

  const addToWishlist = async (product) => {
    if (customerId) {
      try {
        await axios.post(`${API}/wishlist/toggle`, { customerId, productId: product.id });
        await fetchWishlist(customerId);
      } catch (e) { console.error('Wishlist toggle error:', e); }
    } else {
      const exists = wishlistItems.find(i => i.id === product.id);
      if (exists) {
        setWishlistItems(prev => prev.filter(i => i.id !== product.id));
      } else {
        setWishlistItems(prev => [...prev, { ...product, img: product.img || buildImg(product) }]);
      }
    }
  };

  const removeFromWishlist = async (wishlistItemId, productId) => {
    if (customerId && wishlistItemId) {
      try {
        await axios.delete(`${API}/wishlist/remove/${wishlistItemId}`);
        await fetchWishlist(customerId);
      } catch (e) { console.error('Remove wishlist error:', e); }
    } else {
      setWishlistItems(prev => prev.filter(i => i.id !== (productId || wishlistItemId)));
    }
  };

  const totalQuantity = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const totalPrice    = cartItems.reduce((acc, i) => acc + (Number(i.price) * i.quantity), 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
      totalQuantity, totalPrice,
      wishlistItems, addToWishlist, removeFromWishlist, wishlistCount,
      customerId, onLogin, onLogout,
      fetchCart, fetchWishlist,
      addPendingCartItem,
      setNavigate,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);