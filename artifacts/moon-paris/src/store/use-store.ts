import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@workspace/api-client-react';

interface CartItem extends Product {
  cartQuantity: number;
}

interface AppState {
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;

  // Guest Mode
  isGuest: boolean;
  setGuestMode: (status: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      cart: [],
      isGuest: false,

      addToCart: (product, quantity = 1) => set((state) => {
        const existing = state.cart.find(item => item.id === product.id);
        if (existing) {
          return {
            cart: state.cart.map(item => 
              item.id === product.id 
                ? { ...item, cartQuantity: item.cartQuantity + quantity }
                : item
            )
          };
        }
        return { cart: [...state.cart, { ...product, cartQuantity: quantity }] };
      }),
      
      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter(item => item.id !== productId)
      })),
      
      updateQuantity: (productId, quantity) => set((state) => ({
        cart: state.cart.map(item => 
          item.id === productId ? { ...item, cartQuantity: Math.max(1, quantity) } : item
        )
      })),
      
      clearCart: () => set({ cart: [] }),
      
      cartTotal: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + (item.price * item.cartQuantity), 0);
      },

      setGuestMode: (status) => set({ isGuest: status }),
    }),
    {
      name: 'moon-paris-storage',
    }
  )
);
