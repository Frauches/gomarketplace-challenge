import AsyncStorage from '@react-native-community/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

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
      // await AsyncStorage.clear();
      const response = await AsyncStorage.getItem('@GoMarketplace:products');

      if (response) {
        setProducts([...JSON.parse(response)]);
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const filterProducts = products.filter(product => product.id !== id);

      const newProduct = products.find(product => product.id === id);

      if (newProduct) {
        newProduct.quantity += 1;
        setProducts([...filterProducts, newProduct]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const filterProducts = products.filter(product => product.id !== id);

      const newProduct = products.find(product => product.id === id);

      if (newProduct) {
        if (newProduct.quantity <= 1) {
          setProducts([...filterProducts]);
        } else {
          newProduct.quantity -= 1;

          setProducts([...filterProducts, newProduct]);
        }
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const productExists = products.find(p => p.id === product.id);

      if (productExists) {
        increment(product.id);
      } else {
        setProducts(oldState => [...oldState, { ...product, quantity: 1 }]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
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
