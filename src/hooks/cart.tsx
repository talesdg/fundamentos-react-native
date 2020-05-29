import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const cart = await AsyncStorage.getItem('@GoMarket:cart');
      if (cart) setProducts(JSON.parse(cart));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      // TODO ADD A NEW ITEM TO THE CART
      const newCart: Product[] = [...products];
      const findItemCart = newCart.findIndex(item => item.id === product.id);
      if (findItemCart >= 0) {
        newCart[findItemCart].quantity += 1;
      } else {
        newCart.push({ ...product, quantity: 1 });
      }
      setProducts(newCart);
      await AsyncStorage.setItem('@GoMarket:cart', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const cartItens: Product[] = [...products];
      const findIndexItemCart = cartItens.findIndex(item => item.id === id);
      cartItens[findIndexItemCart].quantity += 1;

      setProducts(cartItens);
      await AsyncStorage.setItem('@GoMarket:cart', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const cartItens: Product[] = [...products];
      const findIndexItemCart = cartItens.findIndex(item => item.id === id);
      cartItens[findIndexItemCart].quantity -= 1;
      if (cartItens[findIndexItemCart].quantity <= 0) {
        cartItens.splice(findIndexItemCart, 1);
      }
      // const updateCart = products
      //   .map(product => {
      //     if (product.id !== id) return product;
      //     const updateProduct: Product = {
      //       ...product,
      //       quantity: product.quantity -= 1,
      //     };
      //     return updateProduct;
      //   })
      //   .filter(product => product.quantity > 0);
      setProducts(cartItens);
      await AsyncStorage.setItem('@GoMarket:cart', JSON.stringify(cartItens));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
