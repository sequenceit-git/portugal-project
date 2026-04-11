import { createContext, useState, useEffect } from "react";

// Simple base64 encode/decode helpers
function encodeCart(cart) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(cart))));
}
function decodeCart(str) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(str))));
  } catch {
    return [];
  }
}

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage, fallback to empty array
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? decodeCart(savedCart) : [];
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error);
      return [];
    }
  });

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("cart", encodeCart(cart));
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error);
    }
  }, [cart]);

  const addToCart = (item) => {
    setCart([...cart, { ...item, id: Date.now() }]); // Add unique ID to each cart item
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const updateCartItem = (itemId, updatedData) => {
    setCart(
      cart.map((item) => (item.id === itemId ? { ...item, ...updatedData } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.price || 0) * (item.quantity || 1);
    }, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
