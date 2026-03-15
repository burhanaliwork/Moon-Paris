import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  cartId: string; // unique: "product-{id}" or "sample-{id}-{size}"
  productId: number;
  sampleProductId?: number;
  nameAr: string;
  brand?: string;
  imageUrl?: string;
  price: number;
  cartQuantity: number;
  type: 'product' | 'sample';
  size?: '3ml' | '5ml' | '10ml';
}

interface AppState {
  cart: CartItem[];
  addProductToCart: (product: any, quantity?: number) => void;
  addSampleToCart: (sample: any, size: '3ml' | '5ml' | '10ml', price: number, quantity?: number) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  isGuest: boolean;
  setGuestMode: (status: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      cart: [],
      isGuest: false,

      addProductToCart: (product, quantity = 1) => set((state) => {
        const cartId = `product-${product.id}`;
        const existing = state.cart.find(item => item.cartId === cartId);
        if (existing) {
          return {
            cart: state.cart.map(item =>
              item.cartId === cartId
                ? { ...item, cartQuantity: item.cartQuantity + quantity }
                : item
            )
          };
        }
        const newItem: CartItem = {
          cartId,
          productId: product.id,
          nameAr: product.nameAr,
          brand: product.brand,
          imageUrl: product.imageUrl || product.images?.[0],
          price: product.price,
          cartQuantity: quantity,
          type: 'product',
        };
        return { cart: [...state.cart, newItem] };
      }),

      addSampleToCart: (sample, size, price, quantity = 1) => set((state) => {
        const cartId = `sample-${sample.id}-${size}`;
        const existing = state.cart.find(item => item.cartId === cartId);
        if (existing) {
          return {
            cart: state.cart.map(item =>
              item.cartId === cartId
                ? { ...item, cartQuantity: item.cartQuantity + quantity }
                : item
            )
          };
        }
        const newItem: CartItem = {
          cartId,
          productId: sample.id,
          sampleProductId: sample.id,
          nameAr: `${sample.nameAr} - ${size}`,
          brand: sample.brand,
          imageUrl: sample.imageUrl,
          price,
          cartQuantity: quantity,
          type: 'sample',
          size,
        };
        return { cart: [...state.cart, newItem] };
      }),

      removeFromCart: (cartId) => set((state) => ({
        cart: state.cart.filter(item => item.cartId !== cartId)
      })),

      updateQuantity: (cartId, quantity) => set((state) => ({
        cart: state.cart.map(item =>
          item.cartId === cartId ? { ...item, cartQuantity: Math.max(1, quantity) } : item
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
