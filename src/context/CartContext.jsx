import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('tecnomundo_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('tecnomundo_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addItem = (product, quantity) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.id === product.id);
      
      if (existingItemIndex > -1) {
        // If product already in cart, update quantity ensuring we don't exceed stock
        const newItems = [...prevItems];
        const newQty = newItems[existingItemIndex].cantidad + quantity;
        newItems[existingItemIndex].cantidad = Math.min(product.stock, newQty);
        return newItems;
      } else {
        // Add new product
        return [...prevItems, { ...product, cantidad: Math.min(product.stock, quantity) }];
      }
    });
  };

  const removeItem = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, change) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
          const newQty = item.cantidad + change;
          return {
            ...item,
            cantidad: Math.max(1, Math.min(item.stock, newQty))
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.cantidad, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.precio * item.cantidad, 0);
  };

  const value = {
    cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
