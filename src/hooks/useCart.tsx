import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const respProduct = await api.get(`/products/${productId}`);
      const product = respProduct.data;
      const respStock = await api.get(`/stock/${productId}`);
      const stockAmount = respStock.data.amount;
      const productInCart = cart.find(
        (productIn) => productIn.id === productId
      );

      if (productInCart && productInCart.amount + 1 > stockAmount) {
        console.log(1);
        toast.error('Quantidade solicitada fora de estoque');
      } else if (productInCart) {
        console.log(1);
        console.log(`productId`, productId);
        const newCart = cart.reduce((acc, productObj) => {
          if (productObj.id === productId) {
            const updatedAmoutProduct = {
              ...productObj,
              amount: productObj.amount + 1,
            };
            acc.push(updatedAmoutProduct);
            return acc;
          }
          acc.push(productObj);
          return acc;
        }, [] as Product[]);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
        setCart(newCart);
      } else {
        const newCart = [...cart, { ...product, amount: 1 }];
        setCart(newCart);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
      }
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const product = cart.find(
        (productInCart) => productInCart.id === productId
      );
      if (!product) {
        return toast.error('Erro na remoção do produto');
      }
      const newCart = cart.filter(
        (productInCart) => productInCart.id !== productId
      );
      setCart(newCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount < 1) {
        return toast.error('Erro na alteração de quantidade do produto');
      }
      const respStock = await api.get(`/stock/${productId}`);
      const stockAmount = respStock.data.amount;
      const product = cart.find(
        (productInCart) => productInCart.id === productId
      );
      if (!product) {
        return toast.error('Erro na alteração de quantidade do produto');
      }

      if (product.amount + amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
      } else {
        const newCart = cart.reduce((acc, productObj) => {
          if (productObj.id === productId) {
            const updatedAmoutProduct = {
              ...productObj,
              amount: amount,
            };
            acc.push(updatedAmoutProduct);
            return acc;
          }
          acc.push(productObj);
          return acc;
        }, [] as Product[]);
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));
        setCart(newCart);
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
